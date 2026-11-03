import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Lock, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Info } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('sakshi');
  const [password, setPassword] = useState('sakshi');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSpeedTip, setShowSpeedTip] = useState(false);
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
    <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
      {/* ─── 1. ATELIER BRAND CREST & TITLE ─────────────────────────────── */}
      <div className="text-center mb-5 sm:mb-6">
        {/* Luxury Crown Crest */}
        <div className="w-12 h-12 sm:w-13 sm:h-13 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-center shadow-inner relative">
          <span className="font-serif text-xl sm:text-2xl font-bold text-amber-400 select-none">
            S
          </span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900 shadow-sm" />
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="text-xs font-bold tracking-[0.24em] text-white uppercase font-sans">
            Sakshi
          </span>
          <span className="w-1 h-1 rounded-full bg-amber-400" />
          <span className="text-[10px] font-semibold tracking-[0.2em] text-amber-400/80 uppercase font-sans">
            Atelier
          </span>
        </div>

        <h1 className="text-lg sm:text-xl font-semibold text-slate-100 tracking-tight">
          Executive Portal
        </h1>
        <p className="text-[11px] text-slate-400 tracking-wide mt-0.5">
          Surat HQ &bull; Operations & Control Suite
        </p>
      </div>

      {/* ─── 2. QUICK DEMO AUTOFILL BAR ─────────────────────────────────── */}
      <div className="mb-4 bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Sparkles size={12} className="text-amber-400" />
          </div>
          <div className="truncate text-[11px] text-slate-300">
            <span className="text-slate-400">Default: </span>
            <code className="text-amber-300 font-mono font-medium">sakshi</code>
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickAutofill}
          disabled={isSubmitting}
          className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-[11px] font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
        >
          <span>1-Tap Sign In</span>
          <ArrowRight size={11} />
        </button>
      </div>

      {/* ─── 3. COMPACT ARCHITECTURAL LOGIN FORM ────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Username / Identifier
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <User size={14} />
            </span>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter username (sakshi)"
              className="w-full pl-8.5 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Passkey / Security Code
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
              <span>{showPassword ? 'Hide' : 'Show'}</span>
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Lock size={14} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passkey (sakshi)"
              className="w-full pl-8.5 pr-9 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
            />
          </div>
        </div>

        {/* Primary Sign In Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ShieldCheck size={14} className="text-slate-950" />
          <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
        </button>
      </form>

      {/* ─── 4. SUBTLE EXPANDABLE HELP ACCORDION ─────────────────────────── */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
        <button
          type="button"
          onClick={() => setShowSpeedTip(!showSpeedTip)}
          className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Info size={11} />
          <span>{showSpeedTip ? 'Hide Connection Tip' : 'Dev Network Tip'}</span>
        </button>

        {showSpeedTip && (
          <div className="mt-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400 text-left leading-relaxed">
            Ensure Chrome DevTools Network throttling is set to <strong className="text-amber-300 font-mono">"No throttling"</strong> for fast live data queries.
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
