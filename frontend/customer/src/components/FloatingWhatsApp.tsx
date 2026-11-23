// Reading this as: Floating WhatsApp Action Button for Sakshi Clothing Indian Fashion & Jewellery, providing instant customer support and order inquiries directly to our Surat team. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsappUrl = `${BUSINESS_CONFIG.whatsappUrl}?text=${encodeURIComponent(
    'Hello Sakshi Clothing team, I would like to inquire about your clothing and jewellery collection.'
  )}`;

  return (
    <aside aria-label="Quick Customer Support" className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Ambient Tooltip */}
      <div
        className={`hidden sm:flex items-center gap-1.5 bg-white text-[#111111] px-3.5 py-2 rounded-full shadow-lg border border-[#E8E5DF] text-xs font-medium transition-all duration-300 pointer-events-none ${
          showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        <span>Chat with us on WhatsApp</span>
      </div>

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Sakshi Clothing on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative group flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-[#25D366] text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
      >
        {/* Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none group-hover:hidden" />

        {/* WhatsApp Icon */}
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          stroke="currentColor"
          strokeWidth="0"
          fill="currentColor"
          className="w-7 h-7 shrink-0 drop-shadow-xs"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.16 7.39C8.94 7.39 8.58 7.47 8.28 7.8C7.98 8.13 7.13 8.92 7.13 10.54C7.13 12.16 8.31 13.72 8.48 13.94C8.65 14.16 10.77 17.43 14.02 18.84C14.79 19.17 15.4 19.37 15.86 19.52C16.64 19.77 17.35 19.73 17.91 19.65C18.54 19.55 19.84 18.86 20.11 18.09C20.38 17.32 20.38 16.66 20.3 16.52C20.22 16.38 20.02 16.3 19.72 16.15C19.42 16 17.94 15.27 17.67 15.17C17.4 15.07 17.2 15.02 17 15.32C16.8 15.62 16.23 16.3 16.05 16.5C15.87 16.7 15.7 16.72 15.4 16.57C15.1 16.42 14.14 16.11 13.01 15.1C12.13 14.31 11.53 13.34 11.36 13.04C11.19 12.74 11.34 12.58 11.49 12.43C11.62 12.3 11.78 12.09 11.93 11.92C12.08 11.75 12.13 11.62 12.23 11.42C12.33 11.22 12.28 11.05 12.21 10.9C12.13 10.75 11.53 9.28 11.28 8.68C11.04 8.09 10.79 8.17 10.61 8.16C10.44 8.15 10.24 8.15 10.04 8.15C9.84 8.15 9.52 8.22 9.25 8.52C8.98 8.82 8.23 9.52 8.23 10.95C8.23 12.38 9.27 13.76 9.42 13.96C9.57 14.16 11.49 17.13 14.43 18.4C17.37 19.67 17.37 19.27 17.9 19.22C18.43 19.17 19.61 18.52 19.85 17.82C20.09 17.12 20.09 16.52 20.02 16.4C19.95 16.27 19.78 16.2 19.51 16.07Z" />
        </svg>
      </a>
    </aside>
  );
};

export default FloatingWhatsApp;
