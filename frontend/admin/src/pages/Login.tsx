import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input 
          type="text" 
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" 
          placeholder="sakshi" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input 
          type="password" 
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" 
          placeholder="••••••••" 
        />
      </div>
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default Login;
