import React from 'react';
import { motion } from 'motion/react';

interface MarqueeProps {
  items: string[];
  direction?: 'left' | 'right';
  speed?: number;
  className?: string;
  dark?: boolean;
}

const Marquee: React.FC<MarqueeProps> = ({
  items,
  direction = 'left',
  speed = 30,
  className = '',
  dark = false
}) => {
  // Duplicate array multiple times for seamless infinite loop
  const repeatedItems = [...items, ...items, ...items, ...items];

  return (
    <div className={`overflow-hidden whitespace-nowrap relative select-none ${dark ? 'bg-slate-950 text-white' : 'bg-slate-100/80 text-slate-900'} ${className}`}>
      <motion.div
        className="inline-flex gap-8 items-center py-4"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%']
        }}
        transition={{
          duration: speed,
          ease: 'linear',
          repeat: Infinity
        }}
      >
        {repeatedItems.map((item, index) => (
          <div key={index} className="inline-flex items-center gap-8 shrink-0">
            <span className="text-xs md:text-sm font-black uppercase tracking-[0.3em] font-sans">
              {item}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dark ? 'bg-amber-400' : 'bg-slate-400'}`} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;
