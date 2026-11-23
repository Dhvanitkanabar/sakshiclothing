// Reading this as: Design System Toast for Indian Fashion & Jewellery, featuring deep maroon notifications and crisp tactile alerts. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React from 'react';
import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'jewellery';
}

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'default',
}) => {
  const icons = {
    default: <Info className="w-5 h-5 text-[#7B1E2B] shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#B43E2B] shrink-0" />,
    jewellery: <Sparkles className="w-5 h-5 text-[#C6A15B] shrink-0" />,
  };

  const borders = {
    default: 'border-[#7B1E2B]/20 bg-white text-[#111111]',
    success: 'border-[#15803D]/20 bg-[#F4FBF5] text-[#111111]',
    error: 'border-[#B43E2B]/20 bg-[#FDF4F3] text-[#111111]',
    jewellery: 'border-[#C6A15B]/30 bg-[#FDFBF7] text-[#111111]',
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg ${borders[variant]}`}>
      {icons[variant]}
      <div className="flex flex-col">
        <span className="font-sans font-semibold text-sm leading-snug">{title}</span>
        {description && (
          <span className="text-xs text-[#5C5855] mt-0.5 leading-relaxed">{description}</span>
        )}
      </div>
    </div>
  );
};

export const showToast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),
  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),
  jewellery: (message: string, description?: string) =>
    sonnerToast.custom(() => (
      <Toast title={message} description={description} variant="jewellery" />
    )),
};

export { sonnerToast as toast, SonnerToaster as Toaster };
export default Toast;
