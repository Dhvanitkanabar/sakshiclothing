// Reading this as: Statutory DPDP & Cookie Consent Preference Center for Sakshi Clothing patrons, non-intrusive floating banner, explicit opt-in for analytics, and persistent choice storage. Dials: VARIANCE [4] / MOTION [3] / DENSITY [4].

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Cookie, X, Check } from 'lucide-react';

const STORAGE_KEY = 'sakshi_cookie_consent_choice';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const savedChoice = localStorage.getItem(STORAGE_KEY);
      if (!savedChoice) {
        // Show after 1.2s to prevent layout shift during initial load
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage access restricted in private mode
    }
  }, []);

  const handleChoice = (preference: 'all' | 'essential') => {
    try {
      localStorage.setItem(STORAGE_KEY, preference);
      localStorage.setItem(`${STORAGE_KEY}_timestamp`, new Date().toISOString());
      
      // Dispatch custom event for analytics loaders to hook into
      window.dispatchEvent(new CustomEvent('sakshi-consent-updated', { detail: { preference } }));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        aria-label="Cookie and Privacy Consent Banner"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[999]"
      >
        <div className="bg-[#1C161D] text-[#E5E0D8] p-5 rounded-2xl border border-[#3E2B40] shadow-2xl space-y-3.5 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#4A1D3F] text-[#C6A15B] flex items-center justify-center shrink-0">
                <Cookie size={16} />
              </div>
              <h3 className="font-serif text-sm font-medium text-white">
                Cookie & Data Preferences
              </h3>
            </div>
            <button
              onClick={() => handleChoice('essential')}
              className="text-[#A89FA9] hover:text-white transition-colors p-1"
              aria-label="Close cookie consent banner"
            >
              <X size={15} />
            </button>
          </div>

          <p className="text-[11px] text-[#A89FA9] leading-relaxed">
            We employ essential cookies for secure cart management and sessions. With your permission, we also utilize anonymized performance metrics to optimize user experience under the <Link to="/privacy" className="text-[#C6A15B] underline hover:text-white">DPDP Act, 2023</Link>.
          </p>

          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={() => handleChoice('all')}
              className="flex-1 py-2 px-3 bg-[#4A1D3F] hover:bg-[#3B1632] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all min-h-[38px] flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Check size={13} />
              <span>Accept All</span>
            </button>
            <button
              onClick={() => handleChoice('essential')}
              className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-full text-xs font-semibold uppercase tracking-wider transition-all min-h-[38px] flex items-center justify-center"
            >
              <span>Essential Only</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

export default CookieConsent;
