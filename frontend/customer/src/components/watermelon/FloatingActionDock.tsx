import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

/**
 * Standard e-commerce floating scroll-to-top button.
 * Only displays when the shopper has scrolled down the product feed.
 */
export function FloatingActionDock() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100);
      }
      setShowScrollTop(currentScroll > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-5 md:right-8 z-40">
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="relative w-11 h-11 rounded-full bg-stone-900/90 text-white flex items-center justify-center border border-stone-700/60 backdrop-blur-xl shadow-xl transition-colors hover:border-amber-400 hover:bg-stone-900"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            {/* Circular SVG Scroll Depth Progress */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="19"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="2.5"
              />
              <circle
                cx="22"
                cy="22"
                r="19"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray={119.38}
                strokeDashoffset={119.38 - (119.38 * scrollProgress) / 100}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>
            <ArrowUp size={16} className="text-amber-300 relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FloatingActionDock;
