import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface ScrollSectionBridgeProps {
  sectionNumber: string;
  sectionTitle: string;
  theme?: 'light' | 'dark' | 'transition-to-dark' | 'transition-to-light';
  watermarkText?: string;
  badgeText?: string;
}

export const ScrollSectionBridge: React.FC<ScrollSectionBridgeProps> = ({
  sectionNumber,
  sectionTitle,
  theme = 'light',
  watermarkText = 'SAKSHI COUTURE • ATELIER JAIPUR',
  badgeText = 'HEIRLOOM CRAFT'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  });

  // Parallax translation for the large background watermark
  const watermarkX = useTransform(smoothProgress, [0, 1], ['-8%', '8%']);
  const lineWidth = useTransform(smoothProgress, [0, 0.5, 1], ['0%', '100%', '80%']);
  const emblemRotate = useTransform(smoothProgress, [0, 1], [0, 180]);
  const opacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);

  // Determine container styling based on theme
  const getContainerStyle = () => {
    switch (theme) {
      case 'dark':
        return 'bg-stone-950 text-stone-200 border-stone-900';
      case 'transition-to-dark':
        return 'bg-gradient-to-b from-[#FAF8F5] via-stone-900 to-[#141210] text-stone-200 border-none';
      case 'transition-to-light':
        return 'bg-gradient-to-b from-[#141210] via-stone-900 to-[#FAF8F5] text-stone-200 border-none';
      case 'light':
      default:
        return 'bg-[#FAF8F5] text-stone-800 border-stone-200/60';
    }
  };

  const isDark = theme === 'dark' || theme.includes('to-');

  return (
    <div
      ref={containerRef}
      className={`relative w-full py-8 sm:py-12 overflow-hidden select-none pointer-events-none ${getContainerStyle()}`}
    >
      {/* Parallax Watermark Text */}
      <motion.div
        style={{ x: watermarkX, opacity }}
        className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-sans font-black text-4xl sm:text-7xl lg:text-8xl tracking-[0.25em] uppercase text-stone-500/[0.07] pointer-events-none select-none z-0"
      >
        {watermarkText} • {watermarkText}
      </motion.div>

      {/* Center Interactive Needle Line & Section Pill */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
        {/* Left Expanding Line */}
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-amber-500/80 overflow-hidden">
          <motion.div
            style={{ width: lineWidth }}
            className="h-full bg-gradient-to-r from-transparent to-amber-400"
          />
        </div>

        {/* Center Section Emblem Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full border shadow-sm backdrop-blur-md ${
            isDark
              ? 'bg-stone-900/90 border-amber-400/40 text-amber-300'
              : 'bg-white/95 border-amber-300/60 text-stone-800'
          }`}
        >
          <motion.div style={{ rotate: emblemRotate }} className="shrink-0">
            <Sparkles size={12} className="text-amber-500" />
          </motion.div>

          <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-amber-600">
            {sectionNumber}
          </span>

          <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />

          <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.16em]">
            {sectionTitle}
          </span>

          {badgeText && (
            <span className="hidden sm:inline-block text-[8px] font-sans font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80 ml-1">
              {badgeText}
            </span>
          )}
        </motion.div>

        {/* Right Expanding Line */}
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-400/40 to-amber-500/80 overflow-hidden">
          <motion.div
            style={{ width: lineWidth }}
            className="h-full bg-gradient-to-l from-transparent to-amber-400"
          />
        </div>
      </div>
    </div>
  );
};

export default ScrollSectionBridge;
