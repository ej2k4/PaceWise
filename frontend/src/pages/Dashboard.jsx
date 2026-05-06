import React from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="w-full max-w-5xl px-8 flex flex-col items-center gap-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-700 mb-4 tracking-tight">
          My Learning Space 🌟
        </h1>
        <p className="text-xl text-slate-500 font-medium">
          A safe, fun place to learn and explore stories!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
        <Link to="/social-scenario-explorer" className="block">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-full flex flex-col gap-4 transition-all hover:-translate-y-2 hover:shadow-md hover:border-sky-200">
            <h2 className="text-3xl font-bold text-sky-600">🗺️ Social Scenarios</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Create wonderful stories with beautiful cartoon drawings just for you!
            </p>
          </div>
        </Link>

        <Link to="/sentence-prediction" className="block">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-full flex flex-col gap-4 transition-all hover:-translate-y-2 hover:shadow-md hover:border-purple-200">
            <h2 className="text-3xl font-bold text-purple-600">🧩 Finish the Sentence</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Type the start of a sentence and let the magic robot help you finish it!
            </p>
          </div>
        </Link>

        <Link to="/adaptive-learning" className="block">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-full flex flex-col gap-4 transition-all hover:-translate-y-2 hover:shadow-md hover:border-green-200">
            <h2 className="text-3xl font-bold text-green-600">🎓 Learning Game</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Play a fun math game that learns with you as you play!
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
