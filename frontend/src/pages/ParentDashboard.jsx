import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

function ParentDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/adaptive/student/${user.student_id}/profile`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        setError('Could not fetch student profile. They might need to play a game first!');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  if (loading) return <div className="text-center mt-20"><span className="loader"></span></div>;

  return (
    <div className="w-full max-w-5xl px-8">
      <h2 className="text-3xl font-bold text-slate-700 mb-8">📊 Parent Dashboard</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-6 rounded-2xl mb-8 font-medium">
          {error}
        </div>
      )}

      {profile && (
        <div className="flex flex-col gap-8">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-5xl mb-4">🧒</span>
              <h3 className="text-xl text-slate-500 font-bold uppercase tracking-wider">Student</h3>
              <p className="text-3xl font-black text-slate-800">{profile.name}</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-5xl mb-4">⭐</span>
              <h3 className="text-xl text-slate-500 font-bold uppercase tracking-wider">Total XP</h3>
              <p className="text-4xl font-black text-yellow-500">{profile.total_xp}</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-5xl mb-4">🧠</span>
              <h3 className="text-xl text-slate-500 font-bold uppercase tracking-wider">Warmup</h3>
              <p className="text-2xl font-black text-indigo-500">
                {profile.warmup_complete ? "Complete!" : "In Progress"}
              </p>
            </div>
          </div>

          {/* Module Stats */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-700 mb-6 border-b pb-4">Subject Performance</h3>
            
            {Object.keys(profile.module_stats || {}).length === 0 ? (
              <p className="text-slate-500 italic text-lg">No games played yet. Have your child play the Learning Game!</p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {Object.values(profile.module_stats).map(stat => (
                  <div key={stat.module} className="flex flex-col md:flex-row items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-800 capitalize mb-2">
                        {stat.module}
                      </h4>
                      <div className="w-full bg-slate-200 rounded-full h-4 mb-2">
                        <div 
                          className="bg-green-500 h-4 rounded-full" 
                          style={{ width: `${stat.accuracy * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Accuracy: {Math.round(stat.accuracy * 100)}%</p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-12 flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-sm text-slate-500 font-bold uppercase">Questions</p>
                        <p className="text-2xl font-black text-slate-700">{stat.total_attempts}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-500 font-bold uppercase">Highest Lvl</p>
                        <p className="text-2xl font-black text-sky-600">{stat.max_difficulty_reached}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ParentDashboard;
