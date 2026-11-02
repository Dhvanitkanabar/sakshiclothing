import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Sparkles, ShieldCheck, Truck, Star } from 'lucide-react';

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let startTimestamp: number | null = null;
    const duration = 1600;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.floor(easeOut * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    const id = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(id);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

export const ScrollMetricBar: React.FC = () => {
  const metrics = [
    {
      icon: Sparkles,
      value: 240,
      suffix: '+',
      label: 'Artisan Hours',
      desc: 'Dedicated to every bridal masterpiece',
      color: 'text-amber-600',
      bg: 'bg-amber-500/10'
    },
    {
      icon: ShieldCheck,
      value: 100,
      suffix: '%',
      label: 'Pure Silk Mark',
      desc: 'Government certified authentic weaves',
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10'
    },
    {
      icon: Truck,
      value: 99.2,
      suffix: '%',
      label: 'On-Time Delivery',
      desc: 'Express courier across 45+ countries',
      color: 'text-blue-600',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Star,
      value: 4.96,
      suffix: ' ★',
      label: 'Patron Rating',
      desc: 'Over 1,800+ 5-star bridal reviews',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    }
  ];

  return (
    <section className="px-5 sm:px-8 max-w-7xl mx-auto my-12 sm:my-16">
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl bg-white border border-stone-200/90 shadow-xl p-6 sm:p-8"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-stone-100">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
                className={`flex flex-col items-center text-center ${idx > 0 ? 'pt-6 lg:pt-0 lg:pl-6' : ''}`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${m.bg} ${m.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-sans font-extrabold text-stone-900 tracking-tight">
                    {typeof m.value === 'number' && m.value % 1 === 0 ? (
                      <AnimatedNumber value={m.value} />
                    ) : (
                      m.value
                    )}
                  </span>
                  <span className="text-lg sm:text-xl font-sans font-bold text-amber-600">
                    {m.suffix}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-sans font-bold text-stone-900 mt-1">
                  {m.label}
                </h4>
                <p className="text-[11px] text-stone-500 font-sans mt-0.5 max-w-[190px]">
                  {m.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

export default ScrollMetricBar;
