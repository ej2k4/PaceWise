import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/adaptive/auth/login', {
        name: name,
        password: password
      });
      
      login(res.data.student);
      navigate('/daily-feelings');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16 p-10 rounded-[2.5rem] bg-white/80 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-tr from-sky-400 to-sky-600 rounded-[1.25rem] shadow-xl shadow-sky-200/50 flex items-center justify-center mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
          <span className="text-3xl text-white font-black font-serif italic">P</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">PaceWise</h2>
        <p className="text-sky-600 font-bold mt-2 tracking-wider uppercase text-[0.65rem]">Smart Lessons for Unique Learners</p>
      </div>
      
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <div className="relative group">
          <input 
            type="text" 
            id="login-name"
            className="w-full px-5 py-4 bg-white/50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all text-slate-700 font-medium placeholder-transparent peer"
            placeholder="Your Name"
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <label htmlFor="login-name" className="absolute left-5 -top-3 px-1 text-xs font-bold text-sky-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-4 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-sky-600 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-transparent before:-z-10 peer-focus:before:from-white peer-focus:before:to-white">
            Your Name
          </label>
        </div>
        
        <div className="relative group">
          <input 
            type="password" 
            id="login-password"
            className="w-full px-5 py-4 bg-white/50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all text-slate-700 font-medium placeholder-transparent peer"
            placeholder="Password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <label htmlFor="login-password" className="absolute left-5 -top-3 px-1 text-xs font-bold text-sky-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-4 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-sky-600 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-transparent before:-z-10 peer-focus:before:from-white peer-focus:before:to-white">
            Password
          </label>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 font-medium text-sm text-center py-3 rounded-xl border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <button type="submit" className="w-full py-4 mt-2 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-2" disabled={loading}>
          {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Sign In to Your Account"}
        </button>
      </form>
      
      <p className="text-center mt-8 text-sm text-slate-500 font-medium">
        Don't have an account? <Link to="/register" className="text-sky-600 font-bold hover:text-sky-700 transition-colors">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
