// Reading this as: High-End 404 Not Found Screen for Sakshi Clothing patrons, with brand editorial styling, quick return routes, and helpful recovery paths. Dials: VARIANCE [7] / MOTION [4] / DENSITY [4].

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Compass, ShoppingBag, RotateCcw } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] bg-[#FBF9F6] text-[#1A1A1A] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="404 — Page Not Found | Sakshi Clothing"
        description="The requested page could not be located in the Sakshi Clothing catalog."
        noIndex={true}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full text-center space-y-8"
      >
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F6EFF4] text-[#4A1D3F] text-xs font-semibold uppercase tracking-wider">
            <Compass size={14} className="text-[#C6A15B]" />
            <span>Navigation Advisory</span>
          </div>
          
          <h1 className="font-serif text-6xl sm:text-7xl font-bold tracking-tight text-[#4A1D3F]">
            404
          </h1>
          
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A1A1A]">
            This creation is currently out of frame.
          </h2>
          
          <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
            The page you are looking for may have been retired, renamed, or temporarily relocated in our Surat atelier.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-[#4A1D3F] hover:bg-[#3B1632] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all min-h-[44px] shadow-sm active:scale-98"
          >
            <span>Return to Homepage</span>
            <ArrowRight size={14} />
          </Link>
          
          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] border border-[#E8E5DF] rounded-full text-xs font-semibold uppercase tracking-wider transition-all min-h-[44px]"
          >
            <ShoppingBag size={14} className="text-[#C6A15B]" />
            <span>Explore Collections</span>
          </Link>
        </div>

        {/* Popular Recovery Links */}
        <div className="pt-8 border-t border-[#E8E5DF] space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#4A1D3F]">
            <Link to="/shop?category=Women&sub=Heritage Sarees" className="px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8E5DF] hover:border-[#4A1D3F] transition-colors">
              Sarees
            </Link>
            <Link to="/shop?category=Women&sub=Bridal Lehengas" className="px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8E5DF] hover:border-[#4A1D3F] transition-colors">
              Lehengas
            </Link>
            <Link to="/shop?category=Jewellery" className="px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8E5DF] hover:border-[#4A1D3F] transition-colors">
              Imitation Jewellery
            </Link>
            <Link to="/track-order" className="px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8E5DF] hover:border-[#4A1D3F] transition-colors">
              Track Order
            </Link>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default NotFound;
