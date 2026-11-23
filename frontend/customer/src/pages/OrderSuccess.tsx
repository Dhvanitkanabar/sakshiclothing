// Reading this as: Order Success Confirmation Page for Sakshi Clothing, with celebratory editorial typography, gateway polling sync, and instant tracking access. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  Copy, 
  Check, 
  Truck, 
  ShieldCheck, 
  Clock, 
  MessageCircle,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { BUSINESS_CONFIG } from '../config/business';

interface OrderSuccessState {
  orderId: string;
  orderDbId?: string;
  total: number;
  isPending?: boolean;
  isPolling?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state as OrderSuccessState | null;
  const [copied, setCopied] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'confirmed' | 'failed'>(
    stateData?.isPending ? 'pending' : 'confirmed'
  );

  const [orderData] = useState(() => {
    if (stateData?.orderId) {
      try {
        sessionStorage.setItem('last_successful_order', JSON.stringify(stateData));
      } catch {}
      return stateData;
    }
    try {
      const saved = sessionStorage.getItem('last_successful_order');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  useEffect(() => {
    if (!stateData?.isPolling || !orderData?.orderId) return;

    let attempts = 0;
    const maxAttempts = 15;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API_URL}/orders/track?orderId=${encodeURIComponent(orderData.orderId)}`);
        const json = await res.json();
        if (json.success && json.data) {
          const status = json.data.orderStatus;
          const payStatus = json.data.paymentStatus;
          if (payStatus === 'completed' || (status && status !== 'payment_pending')) {
            setOrderStatus('confirmed');
            clearInterval(interval);
            toast.success('Payment confirmed by gateway! Your order is active.');
          }
        }
      } catch (e) {
        console.warn('Order polling check error:', e);
      }
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [stateData, orderData]);

  const handleCopyOrderId = () => {
    if (!orderData?.orderId) return;
    navigator.clipboard.writeText(orderData.orderId);
    setCopied(true);
    toast.success('Order Reference copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!orderData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-[#FBF9F6]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E8E5DF] text-center shadow-xs space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-[#6B7280]">
            <ShoppingBag size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-medium text-[#1A1A1A]">No Active Order Found</h2>
            <p className="text-xs text-[#6B7280]">
              If you recently placed an order, you can check its status anytime on the live order tracking page.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link to="/track-order">
              <Button variant="primary" fullWidth>Track Your Order</Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" fullWidth>Browse Collections</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmed = orderStatus === 'confirmed';

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#1A1A1A] py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Main Success Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-10 shadow-xs text-center space-y-6"
        >
          {/* Animated Success Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#EBF7EE] text-[#15803D] flex items-center justify-center shadow-xs">
              <CheckCircle2 size={40} strokeWidth={2} />
            </div>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-1 -right-1 text-[#C6A15B]"
            >
              <Sparkles size={22} />
            </motion.div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7B1E2B] block">
              {isConfirmed ? 'Order Confirmed' : 'Verifying Payment…'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-medium tracking-tight">
              Thank You For Your Order
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
              We've received your order and our atelier team in Surat is preparing it with care.
            </p>
          </div>

          {/* Order Reference Box */}
          <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-[#E8E5DF] max-w-md mx-auto flex items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                Order Reference
              </span>
              <span className="font-mono text-base sm:text-lg font-bold text-[#1A1A1A] tracking-wider">
                #{orderData.orderId}
              </span>
            </div>
            <button
              onClick={handleCopyOrderId}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xs font-semibold text-[#7B1E2B] bg-white border border-[#E8E5DF] rounded-xl px-3 py-1.5 hover:bg-[#FAF8F5] transition-colors shadow-2xs gap-1.5"
              aria-label="Copy order reference"
            >
              {copied ? <Check size={14} className="text-[#15803D]" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Next Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left border-t border-[#F0ECE4]">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A]">
                <Truck size={14} className="text-[#7B1E2B]" />
                <span>Express Courier</span>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Dispatches within 24 hours. Estimated delivery in 2-4 business days.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A]">
                <RotateCcw size={14} className="text-[#7B1E2B]" />
                <span>Damage Guarantee</span>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                48-hour reporting window for transit breakage with unboxing video proof.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A]">
                <ShieldCheck size={14} className="text-[#C6A15B]" />
                <span>Safe Delivery</span>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Insured tamper-proof box with serialized invoice receipt.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <Link to={`/track-order?orderId=${encodeURIComponent(orderData.orderId)}`} className="w-full sm:flex-1">
              <Button variant="primary" size="lg" fullWidth rightIcon={<ArrowRight size={15} />}>
                Track Live Order
              </Button>
            </Link>
            <Link to="/shop" className="w-full sm:flex-1">
              <Button variant="outline" size="lg" fullWidth>
                Continue Shopping
              </Button>
            </Link>
          </div>

          <div className="pt-2 text-center">
            <a
              href={BUSINESS_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-[#25D366] font-semibold hover:underline min-h-[44px] py-1"
            >
              <MessageCircle size={15} />
              <span>Need help? Chat with WhatsApp Concierge ({BUSINESS_CONFIG.helplineDisplay})</span>
            </a>
          </div>

        </motion.div>

      </div>
    </div>
  );
};

export default OrderSuccess;
