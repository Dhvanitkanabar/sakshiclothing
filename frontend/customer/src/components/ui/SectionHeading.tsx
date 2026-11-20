// Reading this as: Section Heading for Indian Luxury Fashion & Jewellery, featuring editorial serif hierarchy and champagne accents. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  actionHref?: string;
  actionText?: string;
  className?: string;
  isJewellery?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  actionHref,
  actionText = 'View All',
  className = '',
  isJewellery = false,
}) => {
  const isCentered = align === 'center';

  return (
    <div
      className={`
        w-full mb-8 md:mb-14
        ${isCentered ? 'text-center flex flex-col items-center' : 'flex flex-col md:flex-row md:items-end md:justify-between'}
        ${className}
      `}
    >
      <div className={isCentered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}>
        {eyebrow && (
          <div className="flex items-center gap-2 mb-2 justify-start">
            {isCentered && <span className={`h-px w-6 ${isJewellery ? 'bg-[#C6A15B]' : 'bg-[#4A1D3F]'}`} />}
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
                isJewellery ? 'text-[#C6A15B]' : 'text-[#4A1D3F]'
              }`}
            >
              {eyebrow}
            </span>
            {isCentered && <span className={`h-px w-6 ${isJewellery ? 'bg-[#C6A15B]' : 'bg-[#4A1D3F]'}`} />}
          </div>
        )}
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1A1A1A] leading-tight tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2.5 text-sm sm:text-base text-[#6B7280] font-sans leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actionHref && (
        <div className={`mt-4 md:mt-0 ${isCentered ? 'pt-2' : ''}`}>
          <Link
            to={actionHref}
            className={`
              inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wide transition-colors duration-200
              ${isJewellery ? 'text-[#C6A15B] hover:text-[#A4813D]' : 'text-[#4A1D3F] hover:text-[#3B1632]'}
              group min-h-[44px] py-2
            `}
          >
            <span>{actionText}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
};
