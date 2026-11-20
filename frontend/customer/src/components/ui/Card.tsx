// Reading this as: Design System Card for Indian Luxury Fashion & Jewellery, featuring warm surfaces and delicate micro-borders. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'flat' | 'elevated' | 'glass';
  hoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-[#E8E5DF] rounded-2xl shadow-xs',
    flat: 'bg-[#FAF8F5] border border-[#E8E5DF] rounded-2xl',
    elevated: 'bg-white border border-[#E8E5DF] rounded-2xl shadow-md',
    glass: 'bg-white/85 backdrop-blur-md border border-[#E8E5DF]/70 rounded-2xl',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverEffect ? 'card-hover-effect cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
