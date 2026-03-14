import React, { useState } from 'react';
import api from '../api/axios';

const Login = ({ onLoginSuccess, switchToSignup }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
          const response = await api.post('/api/auth/login/', {
          username: formData.username, 
        password: formData.password 
      });

      const token = response.data.access; 
      if (token) {
        onLoginSuccess(formData.username, token);
      }
    } catch (error) {
      alert("❌ Invalid credentials. Please check your username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      {/* Claymorphism Card: Soft 3D appearance with massive rounded corners and dual shadows */}
      <div className="w-full max-w-md p-10 bg-white/80 backdrop-blur-sm rounded-[40px] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] border border-white/20 transition-all duration-300">
        
        <h2 className="text-3xl font-black text-center mb-8 text-slate-800 tracking-tight">
          👋 Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Username Input: Inner shadows create an embossed/pressed effect */}
          <div className="flex flex-col">
            <input 
              placeholder="Username" 
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required 
              className="p-4 rounded-2xl bg-slate-50 border-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] focus:ring-4 ring-blue-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <input 
              type="password"
              placeholder="Password" 
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
              className="p-4 rounded-2xl bg-slate-50 border-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] focus:ring-4 ring-blue-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Login Button: Combined outer and inner shadows for a "squishy" feel */}
          <button 
            type="submit" 
            disabled={loading} 
            className="mt-4 p-4 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-[4px_4px_10px_rgba(37,99,235,0.3),inset_-4px_-4px_8px_rgba(0,0,0,0.2),inset_4px_4px_8px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] active:shadow-inner transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login to Indora'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 font-medium">
          New here?{' '}
          <span 
            onClick={switchToSignup} 
            className="text-blue-600 cursor-pointer font-bold hover:underline underline-offset-4"
          >
            Create an account
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;