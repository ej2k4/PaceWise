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
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="widget-card bg-white mx-auto mt-10 max-w-md">
      <h2 className="widget-title text-sky-600 text-center">👋 Welcome Back!</h2>
      <p className="text-center text-slate-500 mb-6">Log in to continue your learning journey.</p>
      
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="input-label">Your Name</label>
          <input 
            type="text" 
            className="input-field" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label className="input-label">Password</label>
          <input 
            type="password" 
            className="input-field" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        {error && <p className="text-red-500 font-bold text-center mt-2">{error}</p>}

        <button type="submit" className="primary-btn mt-4" disabled={loading}>
          {loading ? <span className="loader"></span> : "Log In"}
        </button>
      </form>
      
      <p className="text-center mt-6 text-slate-600">
        Don't have an account? <Link to="/register" className="text-sky-600 font-bold hover:underline">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
