import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface ShimmerBadgeProps {
  children: ReactNode;
  icon?: boolean;
  className?: string;
  variant?: 'gold' | 'emerald' | 'amber' | 'slate';
  size?: 'sm' | 'md' | 'lg';
}

export function ShimmerBadge({
  children,
  icon = true,
  className = '',
  variant = 'gold',
  size = 'md'
}: ShimmerBadgeProps) {
  const variantStyles = {
    gold: 'from-amber-400/30 via-yellow-200/50 to-amber-500/30 text-amber-200 border-amber-400/40 bg-black/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    emerald: 'from-emerald-400/30 via-emerald-200/50 to-emerald-500/30 text-emerald-300 border-emerald-400/40 bg-black/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    amber: 'from-orange-400/30 via-amber-200/50 to-orange-500/30 text-orange-200 border-orange-400/40 bg-black/60 shadow-[0_0_15px_rgba(249,115,22,0.15)]',
    slate: 'from-slate-400/30 via-slate-200/50 to-slate-500/30 text-slate-200 border-slate-400/40 bg-black/60 shadow-[0_0_15px_rgba(148,163,184,0.15)]',
  };

  const sizeStyles = {
    sm: 'text-[9px] px-2.5 py-0.5 gap-1',
    md: 'text-[11px] px-3.5 py-1 gap-1.5',
    lg: 'text-xs px-4 py-1.5 gap-2',
  };

  return (
    <div
      className={`relative inline-flex items-center font-sans tracking-widest uppercase rounded-full border backdrop-blur-md overflow-hidden transition-all duration-300 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {/* Animated shimmer sweep layer */}
      <span
        className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        aria-hidden="true"
      />
      {icon && <Sparkles size={size === 'sm' ? 10 : size === 'lg' ? 14 : 12} className="text-amber-300 animate-pulse shrink-0" />}
      <span className="relative z-10 font-medium tracking-wider">{children}</span>
    </div>
  );
}
