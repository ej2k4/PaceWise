import os
import sys
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
import torch
import base64
from io import BytesIO
from PIL import Image
import torchvision.transforms as transforms
import logging

# --------- BASE CONFIG ---------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(BASE_DIR)) # For majorProjectSem8 imports

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Unified AI Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ==========================================
# 1. CARTOON GAN INTEGRATION
# ==========================================
logger.info("Loading Cartoon GAN...")
try:
    from majorProjectSem8.cartoonImage_model.generator import Generator # type: ignore

    dataset_dir = os.path.join(BASE_DIR, "cartoonImage_model", "dataset")
    SCENARIO_MAP = {}
    scenario_idx = 0
    EMOTIONS = ["happy", "sad", "neutral", "surprised"]
    EMOTION_MAP = {e: i for i, e in enumerate(EMOTIONS)}
    
    if os.path.exists(dataset_dir):
        for folder_name in sorted(os.listdir(dataset_dir)):
            parts = folder_name.rsplit('_', 1)
            if len(parts) == 2 and parts[1] in EMOTION_MAP:
                scenario = parts[0]
                if scenario not in SCENARIO_MAP:
                    SCENARIO_MAP[scenario] = scenario_idx
                    scenario_idx += 1
    
    NUM_SCENARIOS = len(SCENARIO_MAP) if len(SCENARIO_MAP) > 0 else 23
    NUM_EMOTIONS = len(EMOTION_MAP)
    NOISE_DIM = 100
    
    G = Generator(NOISE_DIM, NUM_SCENARIOS, NUM_EMOTIONS).to(DEVICE)
    try:
        model_path = os.path.join(BASE_DIR, "cartoonImage_model", "best_generator.pth")
        G.load_state_dict(torch.load(model_path, map_location=DEVICE))
        G.eval()
        logger.info("Generator model loaded successfully")
    except Exception as e:
        logger.warning(f"Error loading cartoon generator model: {e}")

    class GenerateRequest(BaseModel):
        scenario: str
        emotion: str
        
        @validator('scenario')
        def validate_scenario(cls, v):
            if v not in SCENARIO_MAP:
                raise ValueError(f'Scenario must be one of {list(SCENARIO_MAP.keys())}')
            return v


    def tensor_to_base64(image_tensor):
        if image_tensor.dim() == 4:
            image_tensor = image_tensor.squeeze(0)
        image_tensor = torch.clamp(image_tensor, 0, 1)
        transform = transforms.ToPILImage()
        image = transform(image_tensor.cpu())
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()

    @app.post("/api/cartoon")
    def generate_image(request: GenerateRequest):
        try:
            emotion_val = request.emotion.strip().lower().replace(" ", "_")
            cartoon_map = {
                "angry": "sad",
                "excited": "happy",
                "nervous": "surprised",
                "overwhelmed": "surprised",
                "sad": "sad",
                "scared": "surprised",
                "shy": "neutral",
                "worried": "sad"
            }
            mapped_emotion = cartoon_map.get(emotion_val, emotion_val)
            if mapped_emotion not in EMOTION_MAP:
                mapped_emotion = "neutral"

            noise = torch.randn(1, NOISE_DIM, device=DEVICE)
            scenario_idx = torch.tensor([SCENARIO_MAP[request.scenario]], device=DEVICE)
            emotion_idx = torch.tensor([EMOTION_MAP[mapped_emotion]], device=DEVICE)
            
            with torch.no_grad():
                fake_image = G(noise, scenario_idx, emotion_idx)
            img_base64 = tensor_to_base64(fake_image)
            return {
                "image": img_base64,
                "scenario": request.scenario,
                "emotion": request.emotion,
                "mapped_emotion": mapped_emotion
            }
        except Exception as e:
            logger.error(f"Error generating image: {e}")
            raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")
except Exception as e:
    logger.error(f"Failed to setup Cartoon GAN API: {e}")

# ==========================================
# 2. TEXT MODEL (STORY GENERATION) INTEGRATION
# ==========================================
logger.info("Loading Text Model...")
TEXT_DIR = os.path.join(BASE_DIR, "text_model")
os.chdir(TEXT_DIR)
sys.path.insert(0, TEXT_DIR)
try:
    from generate import generate_with_context, clean_story, enrich_emotion, validate_input, log_generation # type: ignore
    logger.info("Text Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading Text Model: {e}")
sys.path.pop(0)
sys.modules.pop("model", None)
os.chdir(os.path.join(BASE_DIR, "backend")) # restore

class StoryRequest(BaseModel):
    scenario: str
    emotion: str
    name: str

@app.post("/api/story/generate")
def generate_story_api(request: StoryRequest):
    scenario = request.scenario.strip().lower().replace(" ", "_")
    if scenario == "dentist":
        scenario = "dentist_visit"
    emotion = request.emotion.strip().lower().replace(" ", "_")
    name = request.name.strip()
    
    valid, error_msg = validate_input(scenario, emotion)
    if not valid:
        raise HTTPException(status_code=400, detail=error_msg)

    try:
        os.chdir(TEXT_DIR) # Temporarily chdir to text_model for logging
        raw_tokens = generate_with_context(scenario, emotion)
        story = clean_story(raw_tokens, name)
        story = enrich_emotion(story, name, emotion)
        log_generation(name, scenario, emotion, story)
        os.chdir(os.path.join(BASE_DIR, "backend")) # restore
        return {"story": story}
    except Exception as e:
        os.chdir(os.path.join(BASE_DIR, "backend"))
        raise HTTPException(status_code=500, detail=f"Story generation failed: {str(e)}")

# ==========================================
# 3. SENTENCE PREDICTION INTEGRATION
# ==========================================
logger.info("Loading Sentence Prediction Model...")
SENTENCE_DIR = os.path.join(BASE_DIR, "sentence prediction")
os.chdir(SENTENCE_DIR)
sys.path.insert(0, SENTENCE_DIR)
try:
    import pickle
    with open("vocab.pkl", "rb") as f:
        sp_word2idx = pickle.load(f)
    sp_idx2word = {i: w for w, i in sp_word2idx.items()}
    sp_vocab_size = len(sp_word2idx)
    
    from model import Encoder, Decoder, Seq2Seq # type: ignore
    
    sp_encoder = Encoder(sp_vocab_size, 128, 256)
    sp_decoder = Decoder(sp_vocab_size, 128, 256)
    sp_model = Seq2Seq(sp_encoder, sp_decoder, DEVICE).to(DEVICE)
    sp_model.load_state_dict(torch.load("asd_model.pt", map_location=DEVICE))
    sp_model.eval()
    logger.info("Sentence Prediction Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading Sentence Prediction Model: {e}")
sys.path.pop(0)
sys.modules.pop("model", None)
os.chdir(os.path.join(BASE_DIR, "backend")) # restore

class SentenceRequest(BaseModel):
    sentence: str

def sp_numericalize(sentence):
    return [sp_word2idx.get(word, sp_word2idx.get("<unk>", 0)) for word in sentence.lower().split()]

def sp_predict(sentence, max_len=15):
    tokens = sp_numericalize(sentence)
    tokens = tokens[:max_len]
    pad_idx = sp_word2idx.get("<pad>", 0)
    tokens += [pad_idx] * (max_len - len(tokens))

    src_tensor = torch.tensor(tokens).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        hidden = sp_model.encoder(src_tensor)
        input_token = torch.tensor([sp_word2idx.get("<sos>", 1)]).to(DEVICE)
        result = []
        for _ in range(max_len):
            output, hidden = sp_model.decoder(input_token, hidden)
            top1 = output.argmax(1)
            if top1.item() == sp_word2idx.get("<eos>", 2):
                break
            result.append(sp_idx2word.get(top1.item(), ""))
            input_token = top1
    return " ".join(result).strip()

SP_PLACES = ["park", "school", "garden", "shop", "home"]

def sp_generate_variations(base_sentence):
    variations = [base_sentence]
    if "to the" in base_sentence:
        prefix = base_sentence.split("to the")[0]
        for place in SP_PLACES:
            variations.append(prefix + "to the " + place)
    variations = list(dict.fromkeys(variations))
    return variations[:3]

@app.post("/api/sentence/predict")
def predict_sentence_api(request: SentenceRequest):
    try:
        base_prediction = sp_predict(request.sentence)
        suggestions = sp_generate_variations(base_prediction)
        return {
            "prediction": base_prediction,
            "suggestions": suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentence prediction failed: {str(e)}")

# ==========================================
# 4. ADAPTIVE LEARNING INTEGRATION
# ==========================================
logger.info("Loading Adaptive Learning App...")
ADAPTIVE_DIR = os.path.join(BASE_DIR, "adaptive_learning")
os.chdir(ADAPTIVE_DIR)
sys.path.insert(0, ADAPTIVE_DIR)
try:
    from api.main import app as adaptive_app # type: ignore
    app.mount("/api/adaptive", adaptive_app)
    logger.info("Adaptive Learning App mounted successfully")
except Exception as e:
    logger.error(f"Error loading Adaptive Learning App: {e}")
sys.path.pop(0)
sys.modules.pop("model", None)
sys.modules.pop("data", None)
sys.modules.pop("engine", None)
os.chdir(os.path.join(BASE_DIR, "backend")) # restore

@app.get("/")
def home():
    return {"message": "Unified AI Platform API is running"}