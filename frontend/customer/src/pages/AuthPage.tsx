// Reading this as: High-Fashion Patron Authentication Portal for Sakshi Clothing, with Clerk OAuth/OTP integration, cinematic editorial backdrop, and accessible mobile ergonomics. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useState } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { useSignIn, useSignUp, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  ChevronLeft,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const { isSignedIn: clerkSignedIn, isLoaded: clerkLoaded } = useUser();
  const { signIn, setActive: signInSetActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: signUpSetActive, isLoaded: signUpLoaded } = useSignUp();

  const [step, setStep] = useState<'start' | 'otp'>('start');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Destination to return after login
  const returnUrl = (location.state as any)?.from?.pathname || sessionStorage.getItem('authRedirectUrl') || '/';

  if (!clerkLoaded) {
    return (
      <div className="h-screen w-screen bg-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="text-[#C6A15B] animate-spin" size={32} />
      </div>
    );
  }

  if (clerkSignedIn) {
    return <Navigate to={returnUrl} replace />;
  }

  // Google OAuth
  const handleGoogle = async () => {
    if (!signInLoaded || !signIn) return;
    setError('');
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: returnUrl,
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'Google sign-in failed. Please try again.');
    }
  };

  // Apple OAuth
  const handleApple = async () => {
    if (!signInLoaded || !signIn) return;
    setError('');
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_apple',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: returnUrl,
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'Apple sign-in failed. Please try again.');
    }
  };

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded || !signIn || !signUpLoaded || !signUp) return;
    setIsLoading(true);
    setError('');
    try {
      await signIn.create({ strategy: 'email_code', identifier: email });
      setMode('signin');
      setStep('otp');
      toast.success(`Verification code sent to ${email}`);
    } catch (err: any) {
      const code = err.errors?.[0]?.code;
      if (code === 'form_identifier_not_found') {
        try {
          await signUp.create({ emailAddress: email });
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setMode('signup');
          setStep('otp');
          toast.success(`Verification code sent to ${email}`);
        } catch (signUpErr: any) {
          setError(signUpErr.errors?.[0]?.longMessage || 'Failed to send verification code.');
        }
      } else {
        setError(err.errors?.[0]?.longMessage || 'Failed to send verification code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        const result = await signIn!.attemptFirstFactor({ strategy: 'email_code', code: otp });
        if (result.status === 'complete') {
          await signInSetActive!({ session: result.createdSessionId });
          toast.success('Welcome back to Sakshi Clothing!');
          sessionStorage.removeItem('authRedirectUrl');
          window.location.href = returnUrl;
        }
      } else {
        const result = await signUp!.attemptEmailAddressVerification({ code: otp });
        if (result.status === 'complete') {
          await signUpSetActive!({ session: result.createdSessionId });
          toast.success('Welcome to Sakshi Clothing!');
          sessionStorage.removeItem('authRedirectUrl');
          window.location.href = returnUrl;
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1A1A1A] text-white relative flex flex-col justify-between p-6 sm:p-8 select-none">
      {/* Background with luxury vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#2D1627] via-[#1F141E] to-[#120F13]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,161,91,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-[#1A1A1A]/80" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-[#1A1A1A] text-xs font-semibold transition-all backdrop-blur-md border border-white/15 min-h-[44px]"
        >
          <ArrowLeft size={14} />
          <span>Back to Store</span>
        </Link>

        {/* Center Logo */}
        <Link to="/" className="flex flex-col items-center group">
          <span className="font-serif tracking-widest text-2xl font-normal text-white group-hover:text-[#C6A15B] transition-colors leading-none">
            SAKSHI
          </span>
          <span className="tracking-[0.3em] text-[8px] uppercase text-[#C6A15B] font-semibold mt-1">
            EST. SURAT
          </span>
        </Link>

        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold transition-all backdrop-blur-md border border-white/10 min-h-[44px]"
        >
          <span>Guest Browse</span>
          <ArrowRight size={13} />
        </Link>
      </header>

      {/* Centered Luxury Card */}
      <main className="relative z-10 max-w-[440px] w-full mx-auto my-auto py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#242120]/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl text-center text-white"
        >
          {/* Card Header */}
          <div className="mb-6">
            {step === 'otp' && (
              <button
                type="button"
                onClick={() => { setStep('start'); setOtp(''); setError(''); }}
                className="inline-flex items-center gap-1 text-xs text-[#C6A15B] hover:text-white transition-colors mb-3 font-semibold min-h-[44px]"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}

            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#C6A15B] font-bold mb-1.5">
              <Sparkles size={11} />
              <span>Patron Access</span>
            </div>

            <h1 className="text-3xl font-serif font-normal text-white tracking-tight">
              {step === 'start' ? 'Sign In or Join' : 'Verification Code'}
            </h1>
            <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
              {step === 'start'
                ? 'Sign in to access your saved wardrobe, order tracking, and privilege rewards.'
                : `Enter the 6-digit verification code sent to ${email}`}
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 p-3.5 bg-rose-950/80 border border-rose-800/60 rounded-xl text-rose-200 text-xs text-left"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Start (Google / Apple / Email) */}
          {step === 'start' && (
            <div className="space-y-3.5">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-stone-100 text-[#1A1A1A] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-[0.99] min-h-[44px]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={handleApple}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/15 transition-all active:scale-[0.99] min-h-[44px]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.32.07 2.23.73 2.98.75.98-.2 1.93-.78 2.96-.84 1.35.07 2.37.62 3.08 1.58-2.91 1.75-2.49 5.53.42 6.68-.51 1.38-1.15 2.72-1.44 4.71zM12.03 7.25c-.14-2.48 2.15-4.54 4.53-4.25.33 2.8-2.55 4.96-4.53 4.25z"/>
                </svg>
                <span>Continue with Apple</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-white/15" />
                <span className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">or with email</span>
                <div className="flex-1 h-px bg-white/15" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleSendOtp} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 focus:border-[#C6A15B] rounded-xl text-base sm:text-sm text-white placeholder-white/40 focus:outline-none transition-colors min-h-[44px]"
                />

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full py-3 px-4 bg-[#7B1E2B] hover:bg-[#621721] text-white border border-[#C6A15B]/30 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] min-h-[44px]"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Continue with Email</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-white/50 text-center pt-1 leading-relaxed">
                  By continuing, you agree to our{' '}
                  <Link to="/terms" target="_blank" className="text-[#C6A15B] underline hover:text-white transition-colors">Terms</Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" className="text-[#C6A15B] underline hover:text-white transition-colors">Privacy Policy</Link>.
                </p>
              </form>
            </div>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                autoFocus
                className="w-full px-4 py-3 bg-white/5 border border-white/20 focus:border-[#C6A15B] rounded-xl text-center text-2xl font-mono font-bold tracking-[0.4em] text-[#C6A15B] focus:outline-none transition-colors min-h-[44px]"
              />

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-3 px-4 bg-[#7B1E2B] hover:bg-[#621721] text-white border border-[#C6A15B]/30 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] min-h-[44px]"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep('start'); setOtp(''); setError(''); }}
                className="text-xs text-white/60 hover:text-white transition-colors min-h-[44px] py-1"
              >
                Use a different email
              </button>
            </form>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between text-[11px] text-white/50">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[#C6A15B]" />
          <span>256-Bit Encrypted Secure Sign-In</span>
        </span>

        <div className="flex items-center gap-3">
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <span>•</span>
          <Link to="/contact" className="hover:text-white transition-colors">
            Help
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
