import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Lock, User, Eye, EyeOff, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('sakshi');
  const [password, setPassword] = useState('sakshi');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginWithCreds = async (userToSubmit: string, passToSubmit: string) => {
    setIsSubmitting(true);
    try {
      const success = await login(userToSubmit.trim(), passToSubmit.trim());
      if (success) {
        toast.success('Admin login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials. Use username: sakshi, password: sakshi');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginWithCreds(email, password);
  };

  const handleQuickAutofill = () => {
    setEmail('sakshi');
    setPassword('sakshi');
    handleLoginWithCreds('sakshi', 'sakshi');
  };

  return (
    <div className="space-y-5">
      {/* Quick Autofill Helper Card */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 text-xs text-amber-900 flex items-start justify-between gap-3 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            <span>Default Admin Credentials</span>
          </div>
          <p className="text-[11px] text-amber-800">
            Username: <strong className="font-mono bg-amber-100 px-1 py-0.5 rounded">sakshi</strong> &bull; Password: <strong className="font-mono bg-amber-100 px-1 py-0.5 rounded">sakshi</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={handleQuickAutofill}
          disabled={isSubmitting}
          className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <CheckCircle2 size={13} />
          <span>Autofill & Login</span>
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Username / Email
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={16} />
            </span>
            <input 
              type="text" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 pr-3 py-2.5 w-full rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none transition-all shadow-2xs" 
              placeholder="sakshi" 
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-gray-500 hover:text-black flex items-center gap-1"
            >
              {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showPassword ? 'Hide' : 'Show'}</span>
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={16} />
            </span>
            <input 
              type={showPassword ? 'text' : 'password'} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-10 py-2.5 w-full rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none transition-all shadow-2xs" 
              placeholder="sakshi" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
        </button>
      </form>

      {/* Network Speed Reminder */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-[11px] text-stone-500 flex items-start gap-2">
        <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-stone-700">Speed tip:</span> If admin actions take too long, check Chrome DevTools <strong className="text-stone-800">Network</strong> tab and make sure <strong className="text-amber-700 font-mono">Throttling</strong> is set to <strong className="text-stone-800 font-mono">"No throttling"</strong> instead of <strong className="text-rose-600 font-mono">"Slow 4G"</strong>.
        </div>
      </div>
    </div>
  );
};

export default Login;
