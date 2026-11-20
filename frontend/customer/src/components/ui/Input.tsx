// Reading this as: Design System Input for Indian Luxury Fashion & Jewellery, with high legibility and iOS zoom-prevention, leaning toward clean editorial forms. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
          >
            {label}
            {props.required && <span className="text-[#B43E2B] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#6B7280]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              w-full min-h-[46px] rounded-xl bg-white border text-base text-[#1A1A1A] placeholder-[#9CA3AF]
              transition-colors duration-150
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${rightIcon ? 'pr-10' : 'pr-4'}
              py-2.5
              ${error ? 'border-[#B43E2B] focus:border-[#B43E2B] focus:ring-1 focus:ring-[#B43E2B]' : 'border-[#E8E5DF] focus:border-[#4A1D3F] focus:ring-1 focus:ring-[#4A1D3F]'}
              focus:outline-none
              disabled:bg-[#F7F5F0] disabled:text-[#9CA3AF] disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-[#6B7280]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[#B43E2B] font-medium" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#6B7280]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
