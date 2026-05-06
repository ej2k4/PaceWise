import React, { useState, useEffect, useContext } from "react";
import { generateStory, generateCartoon } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";

const SCENARIOS = [
  { id: "art_class", label: "Art Class" },
  { id: "assembly", label: "School Assembly" },
  { id: "bedtime", label: "Bedtime" },
  { id: "broken_routine", label: "Broken Routine" },
  { id: "cafeteria_noise", label: "Cafeteria Noise" },
  { id: "classroom_test", label: "Classroom Test" },
  { id: "dentist", label: "Dentist Visit" },
  { id: "fire_alarm", label: "Fire Alarm" },
  { id: "grocery_store", label: "Grocery Store" },
  { id: "group_activity", label: "Group Activity" },
  { id: "haircut", label: "Haircut" },
  { id: "library_visit", label: "Library Visit" },
  { id: "losing_game", label: "Losing a Game" },
  { id: "moving_house", label: "Moving House" },
  { id: "new_teacher", label: "New Teacher" },
  { id: "playground_conflict", label: "Playground Conflict" },
  { id: "sharing_toys", label: "Sharing Toys" },
  { id: "sports_day", label: "Sports Day" },
  { id: "substitute_teacher", label: "Substitute Teacher" },
  { id: "swimming_pool", label: "Swimming Pool" },
  { id: "vaccination", label: "Vaccination" },
  { id: "waiting_in_line", label: "Waiting in Line" }
];

const EMOTIONS = [
  { id: "angry", label: "Angry 😠" },
  { id: "excited", label: "Excited 😃" },
  { id: "nervous", label: "Nervous 😬" },
  { id: "overwhelmed", label: "Overwhelmed 😵" },
  { id: "sad", label: "Sad 😢" },
  { id: "scared", label: "Scared 😨" },
  { id: "shy", label: "Shy 😳" },
  { id: "worried", label: "Worried 😟" }
];

function SocialScenarioExplorer() {
  const { user } = useContext(AuthContext);
  const [scenario, setScenario] = useState("art_class");
  const [emotion, setEmotion] = useState("excited");
  const [name, setName] = useState(user ? user.name : "");
  
  const [story, setStory] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleGenerate = async () => {
    if (!name.trim()) return alert("Please enter your name!");
    setLoading(true);
    setStory("");
    setImage("");
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    
    try {
      const [storyRes, cartoonRes] = await Promise.all([
        generateStory({ scenario, emotion, name }),
        generateCartoon({ scenario, emotion })
      ]);
      
      setStory(storyRes.data.story);
      setImage(`data:image/png;base64,${cartoonRes.data.image}`);
    } catch (e) {
      alert("Oops! Something went wrong while making your story.");
      console.error(e);
    }
    setLoading(false);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(story);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="widget-card bg-white mx-auto mt-4 max-w-5xl">
      <h2 className="widget-title text-sky-600">🗺️ Social Scenario Explorer</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <label className="input-label">Where are we going?</label>
          <select className="input-field" value={scenario} onChange={(e) => setScenario(e.target.value)}>
            {SCENARIOS.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="input-label">How do you feel?</label>
          <select className="input-field" value={emotion} onChange={(e) => setEmotion(e.target.value)}>
            {EMOTIONS.map(e => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-6">
        <label className="input-label">What is your name?</label>
        <input 
          className="input-field" 
          placeholder="Type your name here..." 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          disabled={!!user}
        />
        {user && <p className="text-sm text-sky-600 mt-2 font-bold">Using your logged-in name!</p>}
      </div>
      
      <button className="primary-btn mt-8" onClick={handleGenerate} disabled={loading}>
        {loading ? <span className="loader"></span> : "Create My Story! ✨"}
      </button>
      
      {(story || image) && (
        <div className="mt-8 flex flex-col gap-8 items-center">
          {image && (
            <img 
              src={image} 
              alt="Story Illustration" 
              className="w-full max-w-3xl rounded-3xl shadow-md border-8 border-sky-50 object-cover" 
            />
          )}
          {story && (
            <div className="bg-sky-50 p-8 rounded-3xl border-2 border-sky-100 w-full max-w-3xl">
              <p className="text-2xl text-slate-700 leading-relaxed font-medium mb-6">
                {story}
              </p>
              <button 
                onClick={toggleSpeech}
                className={`py-3 px-6 rounded-2xl font-bold text-xl transition-all shadow-sm ${
                  isSpeaking 
                    ? "bg-red-200 text-red-800 hover:bg-red-300" 
                    : "bg-sky-200 text-sky-800 hover:bg-sky-300"
                }`}
              >
                {isSpeaking ? "🛑 Stop Reading" : "🗣️ Read Story"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SocialScenarioExplorer;
