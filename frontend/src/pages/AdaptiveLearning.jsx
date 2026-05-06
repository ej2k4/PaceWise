import React, { useState, useContext } from "react";
import { startAdaptiveSession, submitAdaptiveAnswer } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function AdaptiveLearning() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState("");
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleStart = async (moduleName) => {
    if (!user) {
      alert("Please log in to play the learning game!");
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await startAdaptiveSession({
        student_id: user.student_id,
        module: moduleName,
        name: user.name,
        age: user.age
      });
      setSessionId(res.data.session_id);
      setQuestion(res.data.question);
      setFeedback("");
    } catch (e) {
      alert("Oops! Could not start the learning session.");
      console.error(e);
    }
    setLoading(false);
  };

  const handleAnswer = async (key, val) => {
    if (!question) return;
    setLoading(true);
    try {
      // Fix: Compare the actual text value (val) with the correct_answer text
      const isCorrect = val === question.correct_answer;
      
      const res = await submitAdaptiveAnswer({
        session_id: sessionId,
        student_id: user.student_id,
        question_id: question.question_id,
        module: question.module,
        topic: question.topic,
        difficulty: question.difficulty,
        answer_given: key, // Keep the key (A,B,C,D) or text depending on backend, backend just uses it for logs
        is_correct: isCorrect,
        response_time_sec: 5.0,
        attempt_number: 1
      });
      
      setFeedback(isCorrect ? "✅ Great job!" : "❌ Let's try another one!");
      
      if (res.data.next_question) {
        setTimeout(() => {
          setQuestion(res.data.next_question);
          setFeedback("");
        }, 1500);
      } else {
        setTimeout(() => {
          setQuestion(null);
        }, 1500);
      }
    } catch (e) {
      alert("Oops! Could not submit your answer.");
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="widget-card bg-white mx-auto mt-4 max-w-4xl">
      <h2 className="widget-title text-green-600">🎓 Learning Game</h2>
      
      {!sessionId ? (
        <div className="mt-4 flex flex-col gap-6">
          {!user && (
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-xl text-center font-bold">
              Please log in to save your progress!
            </div>
          )}
          
          <div>
            <label className="input-label text-center block mb-4">Choose a Subject</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => handleStart("math")} 
                disabled={loading}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-6 rounded-2xl shadow-sm text-xl border-4 border-blue-200 hover:border-blue-300 transition-all active:scale-95 disabled:opacity-50"
              >
                Math 🔢
              </button>
              <button 
                onClick={() => handleStart("science")} 
                disabled={loading}
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold py-6 rounded-2xl shadow-sm text-xl border-4 border-purple-200 hover:border-purple-300 transition-all active:scale-95 disabled:opacity-50"
              >
                Science 🔭
              </button>
              <button 
                onClick={() => handleStart("social")} 
                disabled={loading}
                className="bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold py-6 rounded-2xl shadow-sm text-xl border-4 border-orange-200 hover:border-orange-300 transition-all active:scale-95 disabled:opacity-50"
              >
                Social Studies 🤝
              </button>
            </div>
          </div>
          
          {loading && <div className="flex justify-center mt-4"><span className="loader border-t-green-900"></span></div>}
        </div>
      ) : (
        <div className="mt-8 p-8 bg-green-50 rounded-3xl border-2 border-green-100">
          {question ? (
            <>
              <div className="text-green-600 font-bold mb-4 text-xl flex justify-between">
                <span>Level: {question.difficulty}</span>
                <span className="capitalize">Subject: {question.module}</span>
              </div>
              <p className="text-3xl text-slate-800 font-bold mb-10 leading-tight">
                {question.question_text}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {question.answer_options && Object.entries(question.answer_options).map(([key, val]) => (
                  <button 
                    key={key}
                    onClick={() => handleAnswer(key, val)}
                    disabled={loading || feedback !== ""}
                    className="bg-white border-4 border-green-200 hover:border-green-400 hover:bg-green-50 text-2xl font-bold text-slate-700 py-8 rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-3xl text-slate-700 text-center font-bold my-12">You finished the game! 🎉</p>
          )}
          
          {feedback && (
            <div className={`mt-8 text-center text-3xl font-bold p-6 rounded-2xl ${feedback.includes('✅') ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-600'}`}>
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdaptiveLearning;
