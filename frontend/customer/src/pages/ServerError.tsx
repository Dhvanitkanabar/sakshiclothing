// Reading this as: High-End 500 Server Error Screen for Sakshi Clothing patrons, luxury calm messaging, error recovery button, and concierge escalation link. Dials: VARIANCE [6] / MOTION [3] / DENSITY [4].

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { RotateCcw, AlertTriangle, MessageCircle, Home } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { BUSINESS_CONFIG } from '../config/business';

export const ServerError: React.FC = () => {
  return (
    <div className="min-h-[80vh] bg-[#FBF9F6] text-[#1A1A1A] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="500 — Temporary Interruption | Sakshi Clothing"
        description="Our servers encountered a temporary issue. We are currently restoring the service."
        noIndex={true}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full text-center space-y-8"
      >
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle size={14} className="text-amber-600" />
            <span>Service Advisory</span>
          </div>
          
          <h1 className="font-serif text-6xl sm:text-7xl font-bold tracking-tight text-[#7B1E2B]">
            500
          </h1>
          
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A1A1A]">
            A momentary pause in our atelier.
          </h2>
          
          <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
            Our systems encountered a brief interruption while processing your request. Our technical artisans have been notified.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-[#7B1E2B] hover:bg-[#621721] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all min-h-[44px] shadow-sm active:scale-98"
          >
            <RotateCcw size={14} />
            <span>Refresh Page</span>
          </button>
          
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] border border-[#E8E5DF] rounded-full text-xs font-semibold uppercase tracking-wider transition-all min-h-[44px]"
          >
            <Home size={14} className="text-[#C6A15B]" />
            <span>Return to Homepage</span>
          </Link>
        </div>

        {/* WhatsApp Support fallback */}
        <div className="pt-6 border-t border-[#E8E5DF]">
          <p className="text-xs text-[#6B7280]">
            Need immediate assistance with an ongoing order?{' '}
            <a
              href={BUSINESS_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#16A34A] font-semibold underline inline-flex items-center gap-1"
            >
              <MessageCircle size={13} />
              <span>Chat with Concierge</span>
            </a>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default ServerError;
