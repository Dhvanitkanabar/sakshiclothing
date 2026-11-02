import { useEffect, useState } from 'react';

interface CounterBadgeProps {
  end: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
  className?: string;
}

export function CounterBadge({
  end,
  prefix = '',
  suffix = '',
  label,
  duration = 1800,
  className = ''
}: CounterBadgeProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out expo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [end, duration]);

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-3xl md:text-5xl font-sans text-white font-bold tracking-tight">
        {prefix}{count.toLocaleString('en-IN')}{suffix}
      </span>
      <span className="text-xs font-sans uppercase tracking-widest text-amber-300/80 mt-1">
        {label}
      </span>
    </div>
  );
}
