import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  
  const isLoginInitial = location.pathname === '/login';
  const [isLogin, setIsLogin] = useState(isLoginInitial);
  const [isLightOn, setIsLightOn] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const toggleLight = () => {
    if (!isLightOn) {
      setIsFlickering(true);
      setTimeout(() => {
        setIsFlickering(false);
        setIsLightOn(true);
      }, 300);
    } else {
      setIsLightOn(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (isLogin) {
      const success = await login(email, password);
      if (success) navigate('/');
    } else {
      const success = await signup(name, email, password);
      if (success) navigate('/login');
    }
    
    setIsSubmitting(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    navigate(!isLogin ? '/login' : '/signup');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Hanging Lamp Cord */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-32 bg-gradient-to-b from-transparent to-slate-800 z-20" />
      
      {/* Lamp Head */}
      <motion.div 
        onClick={toggleLight}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-32 left-1/2 -translate-x-1/2 z-30 cursor-pointer group"
      >
        {/* Lamp Base */}
        <div className="relative w-24 h-16 bg-slate-900 rounded-t-full border-b-4 border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden border border-white/5">
          {/* Internal Glow */}
          <AnimatePresence>
            {(isLightOn || isFlickering) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isFlickering ? [0, 1, 0.5, 1] : 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-yellow-400/20 blur-xl"
              />
            )}
          </AnimatePresence>
          
          {/* Pull Chain (Visual only) */}
          <div className="absolute bottom-0 right-4 w-[1px] h-4 bg-slate-700" />
          <div className="absolute bottom-[-4px] right-[14px] w-1.5 h-1.5 bg-slate-600 rounded-full" />
        </div>
        
        {/* Lamp Glow Effect */}
        <AnimatePresence>
          {(isLightOn || isFlickering) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: isFlickering ? [0, 0.8, 0.4, 1] : 1,
                scale: isFlickering ? [0.5, 1.1, 0.9, 1] : 1
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400/40 rounded-full blur-[40px] -z-10"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Spotlight Cone */}
      <AnimatePresence>
        {(isLightOn || isFlickering) && (
          <motion.div 
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ 
              opacity: isFlickering ? [0, 0.5, 0.2, 0.8] : 0.8,
              scaleY: isFlickering ? [0, 1.1, 0.9, 1] : 1
            }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ 
              originY: 0,
              clipPath: 'polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)'
            }}
            className="absolute top-[170px] left-1/2 -translate-x-1/2 w-[600px] h-screen bg-gradient-to-b from-yellow-400/20 via-yellow-400/5 to-transparent z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Auth Form Container */}
      <div className="relative z-20 mt-48 w-full max-w-md px-6">
        <AnimatePresence mode="wait">
          {isLightOn && (
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-black text-white mb-2">
                  {isLogin ? 'Welcome Back' : 'Join Us'}
                </h2>
                <p className="text-white/50 font-medium text-sm">
                  {isLogin ? 'Login to your SakshiClothing account' : 'Create your premium account today'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400/50 transition-all outline-none text-white font-medium"
                        placeholder="John Doe"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400/50 transition-all outline-none text-white font-medium"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Password</label>
                    {isLogin && (
                      <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/60 hover:text-yellow-400 transition-colors">Forgot?</button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400/50 transition-all outline-none text-white font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-yellow-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-yellow-400 text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-yellow-400/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {isLogin ? 'Authenticating...' : 'Creating...'}
                    </>
                  ) : (
                    isLogin ? 'Login' : 'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-white/40 text-sm font-medium">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={switchMode}
                    className="text-yellow-400 font-black hover:underline ml-1"
                  >
                    {isLogin ? 'Signup' : 'Login'}
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Back to Shop Link */}
      <Link 
        to="/" 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 hover:text-white/60 text-[10px] font-black uppercase tracking-[0.4em] transition-colors z-20"
      >
        Back to Shop
      </Link>

      {/* Hint for user */}
      <AnimatePresence>
        {!isLightOn && !isFlickering && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-[220px] left-1/2 -translate-x-1/2 text-white/20 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse"
          >
            Click the lamp to begin
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
    </div>
  );
};

export default AuthPage;
