import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ShimmerButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'gold' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function ShimmerButton({
  children,
  variant = 'gold',
  size = 'md',
  icon,
  className = '',
  ...props
}: ShimmerButtonProps) {
  const variantStyles = {
    gold: 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-black font-semibold shadow-[0_4px_20px_rgba(245,158,11,0.25)] border border-amber-300/40',
    primary: 'bg-white text-black font-semibold shadow-lg hover:bg-zinc-100 border border-white/20',
    secondary: 'bg-zinc-900 text-white font-medium border border-white/10 hover:border-white/20',
    outline: 'bg-transparent text-white border border-amber-400/40 hover:bg-amber-400/10 hover:border-amber-400',
  };

  const sizeStyles = {
    sm: 'text-xs py-2 px-4 gap-1.5 rounded-full',
    md: 'text-xs md:text-sm py-3 px-6 gap-2 rounded-full',
    lg: 'text-sm md:text-base py-3.5 px-8 gap-2.5 rounded-full',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative inline-flex items-center justify-center font-sans tracking-wide uppercase overflow-hidden cursor-pointer group transition-all duration-300 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {/* Light-sweep beam on hover */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
        aria-hidden="true"
      />
      {icon && <span className="relative z-10">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
