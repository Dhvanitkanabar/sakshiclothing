import React from 'react';
import { motion } from 'motion/react';

interface ScrollRibbonProps {
  items: string[];
  direction?: 'left' | 'right';
  speed?: number;
  dark?: boolean;
  className?: string;
}

export const ScrollRibbon: React.FC<ScrollRibbonProps> = ({
  items,
  direction = 'left',
  speed = 28,
  dark = true,
  className = '',
}) => {
  // Duplicate array for seamless infinite looping
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div
      className={`relative w-full overflow-hidden whitespace-nowrap select-none py-3.5 sm:py-4 border-y ${
        dark
          ? 'bg-stone-950 text-stone-200 border-amber-500/25 shadow-lg'
          : 'bg-[#faf6f0] text-stone-800 border-stone-200/90'
      } ${className}`}
    >
      {/* Edge gradient masks for smooth fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-stone-950 to-transparent z-10 pointer-events-none opacity-80" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-stone-950 to-transparent z-10 pointer-events-none opacity-80" />

      <motion.div
        className="inline-flex items-center gap-6 sm:gap-10"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          duration: speed,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {repeated.map((item, index) => (
          <div key={index} className="inline-flex items-center gap-6 sm:gap-10 shrink-0">
            <span
              className={`text-[11px] sm:text-xs md:text-sm font-sans font-bold tracking-[0.18em] uppercase ${
                dark ? 'text-amber-100/90' : 'text-stone-800'
              }`}
            >
              {item}
            </span>
            <span className="text-amber-400 text-xs sm:text-sm select-none">✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ScrollRibbon;
