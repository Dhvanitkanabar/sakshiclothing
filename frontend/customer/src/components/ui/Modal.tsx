// Reading this as: Modal Dialog for Indian Luxury Fashion & Jewellery, with accessible focus containment, dvh support, and smooth exit. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={`
          w-full ${maxWidths[maxWidth]} bg-white rounded-3xl border border-[#E8E5DF] shadow-2xl
          overflow-hidden max-h-[90dvh] flex flex-col transform transition-all
        `}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E8E5DF] bg-[#FAF8F5]">
            {title ? (
              <h3 className="font-serif text-lg md:text-xl font-medium text-[#1A1A1A]">
                {title}
              </h3>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#6B7280] hover:text-[#1A1A1A] hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
