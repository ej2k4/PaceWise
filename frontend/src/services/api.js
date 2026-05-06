import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const generateStory = (data) => API.post("/story/generate", data);
export const predictSentence = (data) => API.post("/sentence/predict", data);
export const generateCartoon = (data) => API.post("/cartoon", data);

// Adaptive Learning endpoints
export const startAdaptiveSession = (data) => API.post("/adaptive/session/start", data);
export const submitAdaptiveAnswer = (data) => API.post("/adaptive/session/answer", data);
export const endAdaptiveSession = (data) => API.post("/adaptive/session/end", data);
export const getNextQuestion = (module, difficulty) => 
  API.get(`/adaptive/question/next?module=${module}&difficulty=${difficulty}`);