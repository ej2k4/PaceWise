import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

function Register() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState(5);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/adaptive/auth/register', {
        name: name,
        password: password,
        age: parseInt(age)
      });
      
      login(res.data.student);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="widget-card bg-white mx-auto mt-10 max-w-md">
      <h2 className="widget-title text-green-600 text-center">🌟 Join the Fun!</h2>
      <p className="text-center text-slate-500 mb-6">Create a new account to start learning.</p>
      
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
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

        <div>
          <label className="input-label">Age</label>
          <input 
            type="number" 
            min="3"
            max="12"
            className="input-field" 
            value={age} 
            onChange={(e) => setAge(e.target.value)} 
            required 
          />
        </div>

        {error && <p className="text-red-500 font-bold text-center mt-2">{error}</p>}

        <button type="submit" className="primary-btn mt-4 !bg-green-500 hover:!bg-green-600">
          {loading ? <span className="loader"></span> : "Sign Up"}
        </button>
      </form>
      
      <p className="text-center mt-6 text-slate-600">
        Already have an account? <Link to="/login" className="text-green-600 font-bold hover:underline">Log in here</Link>
      </p>
    </div>
  );
}

export default Register;
