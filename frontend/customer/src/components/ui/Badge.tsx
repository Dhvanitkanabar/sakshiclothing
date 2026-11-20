// Reading this as: Design System Badge for Indian Luxury Fashion & Jewellery, with editorial typography and deliberate accenting. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'sale' | 'plum' | 'jewellery' | 'neutral' | 'success' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  pill?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  pill = true,
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium uppercase tracking-wider select-none shrink-0';

  const variants = {
    sale: 'bg-[#B43E2B] text-white font-semibold shadow-xs',
    plum: 'bg-[#4A1D3F] text-white font-semibold shadow-xs',
    jewellery: 'bg-[#C6A15B] text-white font-semibold shadow-xs',
    neutral: 'bg-[#F2EFE9] text-[#1A1A1A] border border-[#E8E5DF]',
    success: 'bg-[#EBF7EE] text-[#15803D] border border-[#C6E8CD]',
    outline: 'bg-transparent text-[#4A1D3F] border border-[#4A1D3F]',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 leading-none',
    md: 'text-xs px-2.5 py-1 leading-none',
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${pill ? 'rounded-full' : 'rounded-md'}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
