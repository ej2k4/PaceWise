import React, { useState } from "react";
import { predictSentence } from "../services/api";

function SentencePrediction() {
  const [sentence, setSentence] = useState("");
  const [prediction, setPrediction] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!sentence.trim()) return;
    setLoading(true);
    try {
      const res = await predictSentence({ sentence });
      setPrediction(res.data.prediction);
      setSuggestions(res.data.suggestions || []);
    } catch (e) {
      alert("Oops! Could not predict the sentence.");
    }
    setLoading(false);
  };

  return (
    <div className="widget-card bg-white mx-auto mt-4 max-w-4xl">
      <h2 className="widget-title text-purple-600">🧩 Finish the Sentence</h2>
      
      <div className="mt-4">
        <label className="input-label">Type the beginning of a sentence:</label>
        <textarea 
          className="input-field"
          rows="3" 
          placeholder="I want to go to the..." 
          value={sentence} 
          onChange={(e) => setSentence(e.target.value)} 
        />
      </div>
      
      <button className="primary-btn mt-6 !bg-purple-200 hover:!bg-purple-300 !text-purple-900" onClick={handlePredict} disabled={loading}>
        {loading ? <span className="loader border-t-purple-900"></span> : "Complete It! 🚀"}
      </button>
      
      {prediction && (
        <div className="mt-8 p-8 bg-purple-50 rounded-2xl border-2 border-purple-100">
          <p className="text-2xl text-slate-600 mb-4 font-medium">
            Did you mean: <strong className="text-purple-800 font-bold">{prediction}</strong>?
          </p>
          {suggestions.length > 0 && (
            <div className="mt-6">
              <p className="text-xl font-medium text-slate-500 mb-4">Or maybe:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, idx) => (
                  <span 
                    key={idx} 
                    className="suggestion-pill !text-xl !py-4 !px-6"
                    onClick={() => setSentence(s)}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SentencePrediction;
