// Reading this as: Design System Component for Indian Luxury Fashion & Jewellery, with a refined, tactile, accessible language, leaning toward contemporary luxury editorial. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'champagne' | 'outline' | 'ghost' | 'sale';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans tracking-wide transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

    const variants = {
      primary:
        'bg-[#7B1E2B] text-white hover:bg-[#621721] shadow-xs hover:shadow focus-visible:ring-[#7B1E2B]',
      secondary:
        'bg-transparent text-[#7B1E2B] border border-[#7B1E2B] hover:bg-[#FDF4F5] focus-visible:ring-[#7B1E2B]',
      champagne:
        'bg-[#C6A15B] text-white hover:bg-[#A4813D] shadow-xs hover:shadow focus-visible:ring-[#C6A15B]',
      outline:
        'bg-white text-[#111111] border border-[#E8E5DF] hover:border-[#111111] hover:bg-[#FAF8F5] focus-visible:ring-[#111111]',
      ghost:
        'bg-transparent text-[#111111] hover:text-[#7B1E2B] hover:bg-[#FDF4F5] focus-visible:ring-[#7B1E2B]',
      sale:
        'bg-[#B43E2B] text-white hover:bg-[#9B3222] shadow-xs focus-visible:ring-[#B43E2B]',
    };

    const sizes = {
      sm: 'min-h-[40px] px-3.5 py-1.5 text-xs font-medium rounded-full gap-1.5',
      md: 'min-h-[44px] px-5 py-2.5 text-sm font-medium rounded-full gap-2',
      lg: 'min-h-[50px] px-7 py-3 text-base font-semibold rounded-full gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
