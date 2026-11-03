import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  PackageCheck,
  MessageCircle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Design Read: Order Success & Confirmation for Sakshi Clothing couture patrons,
 * with refined editorial celebrating artisanal craftsmanship.
 * Dials: VARIANCE 7 / MOTION 6 / DENSITY 5.
 */
const OrderSuccess = () => {
  const location = useLocation();
  const stateData = location.state as { orderId: string; total: number } | null;
  const [copied, setCopied] = useState(false);

  // Persist order data in sessionStorage so refresh doesn't immediately lose context
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

  const handleCopyOrderId = () => {
    if (!orderData?.orderId) return;
    navigator.clipboard.writeText(orderData.orderId);
    setCopied(true);
    toast.success('Order Reference copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!orderData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-[#FAF8F5]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200/90 text-center shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-700">
            <PackageCheck size={28} />
          </div>
          <div>
            <h2 className="text-xl font-sans font-bold text-stone-900">No Recent Order Found</h2>
            <p className="text-stone-500 text-xs mt-2 leading-relaxed">
              If you just placed an order, you can review its status and invoice directly from your profile account.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/profile"
              className="w-full py-3 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderNumber = orderData.orderId || 'ORD-SAKSHI';
  const totalFormatted = typeof orderData.total === 'number' 
    ? orderData.total.toLocaleString('en-IN') 
    : orderData.total;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pt-8 sm:pt-14 pb-24 sm:pb-32 relative overflow-hidden">
      {/* Subtle luxury ambient glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-80 right-10 w-[450px] h-[350px] bg-rose-100/30 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── 1. CELEBRATORY CONFIRMATION HERO ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto space-y-4 mb-10 sm:mb-14"
        >
          {/* Animated Verification Seal */}
          <div className="relative inline-flex items-center justify-center mb-2">
            <motion.div
              initial={{ scale: 0.6, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 18 }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-900 rounded-full flex items-center justify-center text-amber-300 shadow-xl shadow-stone-900/15 ring-8 ring-stone-900/5"
            >
              <CheckCircle2 size={42} strokeWidth={2} className="text-emerald-400" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-3 border border-dashed border-amber-600/25 rounded-full pointer-events-none"
            />
          </div>

          {/* Sub-badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold uppercase tracking-widest">
            <Sparkles size={12} className="text-emerald-600" />
            <span>Order Confirmed &bull; Surat Atelier</span>
          </div>

          {/* Headline (Refined font scale, never wrapping into 4-6 lines) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-stone-900 tracking-tight leading-tight">
            Thank you for your order
          </h1>

          <p className="text-stone-600 font-sans text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
            Your payment has been received successfully. Our master artisans in Surat have begun preparing your handcrafted ensemble with the highest level of craftsmanship.
          </p>
        </motion.div>

        {/* ─── 2. TWO-COLUMN ASYMMETRIC ATELIER ORDER SPECIFICATIONS ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start mb-10 sm:mb-12">
          
          {/* Left Column: Order Details Card (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between pb-5 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                  Order Reference
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-stone-900 tracking-wider">
                  #{orderNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyOrderId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-xs font-medium text-stone-700 transition-colors"
                title="Copy Reference"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-5 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                  Total Paid
                </span>
                <span className="text-2xl font-serif font-bold text-stone-900">
                  ₹{totalFormatted}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                  Payment Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                  <ShieldCheck size={13} /> Paid (Razorpay)
                </span>
              </div>
            </div>

            {/* Delivery & Dispatch Highlights */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-start gap-3 text-xs text-stone-600">
                <Truck size={16} className="text-stone-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 font-bold">Free Express Delivery Across India</strong>
                  <p className="text-stone-500 text-[11px] mt-0.5">Dispatched within 2 to 4 business days with premium sealed packaging.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-stone-600">
                <FileText size={16} className="text-stone-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 font-bold">Invoice & Email Confirmation</strong>
                  <p className="text-stone-500 text-[11px] mt-0.5">A complete tax invoice and order summary has been sent to your registered email.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Atelier Fulfillment Journey (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="lg:col-span-5 bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-5">
                <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Clock size={15} /> Atelier Journey
                </h3>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                  Step 1 of 4
                </span>
              </div>

              {/* Progress Steps */}
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-white block">Order Placed & Confirmed</span>
                    <span className="text-stone-400 text-[11px]">Payment received securely via Razorpay</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 animate-pulse">
                    ✦
                  </div>
                  <div>
                    <span className="font-bold text-amber-200 block">Atelier Handcrafting & Prep</span>
                    <span className="text-stone-400 text-[11px]">Surat weaving, tailoring & quality inspection</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <div className="w-5 h-5 rounded-full border border-stone-700 text-stone-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-stone-300 block">Artisanal Packaging</span>
                    <span className="text-stone-500 text-[11px]">Eco garment bags & moisture-sealed</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <div className="w-5 h-5 rounded-full border border-stone-700 text-stone-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <span className="font-bold text-stone-300 block">Express Delivery</span>
                    <span className="text-stone-500 text-[11px]">Delivered directly to your door</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Live Tracking Link */}
            <div className="pt-4 border-t border-stone-800">
              <Link
                to={`/track-order?orderId=${encodeURIComponent(orderNumber)}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                <span>Track Order Live</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

        </div>

        {/* ─── 3. ACTION SUITE & CONCIERGE HELP ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-stone-200/80"
        >
          <Link
            to="/profile"
            className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-sm"
          >
            <span>View in My Orders</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} />
            <span>Continue Shopping</span>
          </Link>

          <a
            href={`https://wa.me/919825440058?text=${encodeURIComponent(`Hi Sakshi Clothing! I just placed order #${orderNumber} and wanted to confirm details.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-emerald-800 hover:text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/70 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle size={15} className="text-emerald-600" />
            <span>Atelier WhatsApp Support</span>
          </a>
        </motion.div>

      </div>
    </div>
  );
};

export default OrderSuccess;
