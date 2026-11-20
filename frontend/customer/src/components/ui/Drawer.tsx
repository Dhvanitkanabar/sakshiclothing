// Reading this as: Slide-over Drawer / Bottom Sheet for Indian Luxury Fashion & Jewellery, featuring smooth mobile transitions and safe-area ergonomics. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'right' | 'left' | 'bottom';
  maxWidth?: string;
  showCloseButton?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  maxWidth = 'max-w-md',
  showCloseButton = true,
}) => {
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

  const positionStyles = {
    right: `fixed inset-y-0 right-0 w-full ${maxWidth} bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300`,
    left: `fixed inset-y-0 left-0 w-full ${maxWidth} bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300`,
    bottom:
      'fixed inset-x-0 bottom-0 w-full max-h-[88dvh] bg-white rounded-t-3xl shadow-2xl z-50 flex flex-col transform transition-transform duration-300 pb-safe',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className={positionStyles[position]}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5DF] bg-[#FAF8F5] shrink-0">
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
              aria-label="Close panel"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#6B7280] hover:text-[#1A1A1A] hover:bg-black/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">{children}</div>
      </div>
    </div>
  );
};
