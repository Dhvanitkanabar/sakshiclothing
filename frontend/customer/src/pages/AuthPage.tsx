import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { useSignIn, useSignUp, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

// ─── Auth Page (Unified Login + Signup) ───────────────────────────────────────
const AuthPage = () => {
  const navigate = useNavigate();
  const { isSignedIn: clerkSignedIn, isLoaded: clerkLoaded } = useUser();
  const { signIn, setActive: signInSetActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: signUpSetActive, isLoaded: signUpLoaded } = useSignUp();

  const [step, setStep] = useState<'start' | 'otp'>('start');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Already signed in → go home immediately ──
  if (!clerkLoaded) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="text-white animate-spin" size={32} />
    </div>
  );
  if (clerkSignedIn) return <Navigate to="/" replace />;

  // ── Google OAuth ──
  const handleGoogle = async () => {
    if (!signInLoaded || !signIn) return;
    setError('');
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: '/',
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'Google sign-in failed.');
    }
  };

  // ── Apple OAuth ──
  const handleApple = async () => {
    if (!signInLoaded || !signIn) return;
    setError('');
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_apple',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: '/',
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'Apple sign-in failed.');
    }
  };

  // ── Send OTP: try sign-in first; if user not found, auto sign-up ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded || !signIn || !signUpLoaded || !signUp) return;
    setIsLoading(true);
    setError('');
    try {
      // Attempt sign-in
      await signIn.create({ strategy: 'email_code', identifier: email });
      setMode('signin');
      setStep('otp');
      toast.success(`Verification code sent to ${email}`);
    } catch (err: any) {
      const code = err.errors?.[0]?.code;
      if (code === 'form_identifier_not_found') {
        // User doesn't exist — create account automatically
        try {
          await signUp.create({ emailAddress: email });
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setMode('signup');
          setStep('otp');
          toast.success(`Verification code sent to ${email}`);
        } catch (signUpErr: any) {
          setError(signUpErr.errors?.[0]?.longMessage || 'Failed to send code. Please try again.');
        }
      } else {
        setError(err.errors?.[0]?.longMessage || 'Failed to send code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        const result = await signIn!.attemptFirstFactor({ strategy: 'email_code', code: otp });
        if (result.status === 'complete') {
          await signInSetActive!({ session: result.createdSessionId });
          toast.success('Welcome back!');
          window.location.href = '/';
        }
      } else {
        const result = await signUp!.attemptEmailAddressVerification({ code: otp });
        if (result.status === 'complete') {
          await signUpSetActive!({ session: result.createdSessionId });
          toast.success('Account created! Welcome to Sakshi Clothing 🎉');
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-gray-800/40 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-gray-800/30 to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex flex-col items-center mb-10 group">
          <span className="text-3xl font-serif font-black tracking-tighter text-white">SAKSHI</span>
          <span className="text-[8px] font-bold tracking-[0.6em] text-gray-500 -mt-1 group-hover:text-gray-300 transition-colors">CLOTHING</span>
        </Link>

        <div className="bg-white rounded-[2rem] p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8">
            {step === 'otp' && (
              <button
                onClick={() => { setStep('start'); setOtp(''); setError(''); }}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-4"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-2">
              {step === 'start' ? 'Welcome' : mode === 'signin' ? 'Sign In' : 'New Account'}
            </p>
            <h1 className="text-3xl font-sans font-black text-black">
              {step === 'start' ? 'Continue to Sakshi' : 'Enter Your Code'}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              {step === 'start'
                ? 'Sign in or create your account in one step.'
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Step 1: Start ── */}
          {step === 'start' && (
            <div className="space-y-4">
              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-gray-100 rounded-2xl font-bold text-[12px] text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Apple */}
              <button
                onClick={handleApple}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-black text-white rounded-2xl font-bold text-[12px] hover:bg-gray-900 transition-all duration-200 disabled:opacity-50"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.32.07 2.23.73 2.98.75.98-.2 1.93-.78 2.96-.84 1.35.07 2.37.62 3.08 1.58-2.91 1.75-2.49 5.53.42 6.68-.51 1.38-1.15 2.72-1.44 4.71zM12.03 7.25c-.14-2.48 2.15-4.54 4.53-4.25.33 2.8-2.55 4.96-4.53 4.25z"/>
                </svg>
                Continue with Apple
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Email */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <><span>Continue with Email</span><ArrowRight size={14} /></>
                  }
                </button>
              </form>

              <p className="text-center text-[11px] text-gray-400 pt-2">
                By continuing you agree to our{' '}
                <span className="font-bold text-black">Terms of Service</span>{' '}
                and{' '}
                <span className="font-bold text-black">Privacy Policy</span>.
              </p>
            </div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-2xl font-mono font-bold tracking-[0.5em] focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-4 bg-black text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading
                  ? <Loader2 size={16} className="animate-spin" />
                  : <><span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span><ArrowRight size={14} /></>
                }
              </button>
              <button
                type="button"
                onClick={() => { setStep('start'); setOtp(''); setError(''); }}
                className="w-full text-center text-[11px] text-gray-400 hover:text-black font-bold uppercase tracking-widest transition-colors"
              >
                Try a different email
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
