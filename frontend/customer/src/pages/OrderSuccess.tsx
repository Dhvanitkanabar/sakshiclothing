import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const orderData = location.state as { orderId: string; total: number } | null;

  if (!orderData) {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-48 text-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-50/30 rounded-full blur-[120px] -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-16"
      >
        <div className="relative inline-flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="w-32 h-32 bg-luxury-black rounded-full flex items-center justify-center text-white shadow-2xl shadow-black/20"
          >
            <CheckCircle size={48} strokeWidth={1.5} />
          </motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border border-dashed border-gray-200 rounded-full"
          />
        </div>

        <div className="space-y-6">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-[10px] font-bold uppercase tracking-[0.5em] text-rose-600 flex items-center justify-center gap-3"
          >
            <Sparkles size={12} /> Transaction Confirmed
          </motion.span>
          <h1 className="text-7xl md:text-9xl font-serif font-medium tracking-tighter text-luxury-black">
            Welcome to <br />
            <span className="italic">the Maison</span>
          </h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
            Your order has been received and is being prepared with the utmost care.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="max-w-md mx-auto bg-white border border-gray-100 rounded-[3rem] p-12 space-y-8 shadow-2xl shadow-black/5"
        >
          <div className="flex justify-between items-center pb-6 border-b border-gray-50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order Reference</span>
            <span className="text-sm font-bold text-luxury-black tracking-widest">{orderData.orderId}</span>
          </div>
          <div className="flex justify-between items-center pb-6 border-b border-gray-50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Investment</span>
            <span className="text-lg font-serif font-medium text-luxury-black">₹{orderData.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-4 py-1.5 rounded-full">
              In Preparation
            </span>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-center gap-8 pt-8">
          <Link
            to="/profile"
            className="group bg-luxury-black text-white px-12 py-6 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-rose-600 transition-all duration-700 flex items-center justify-center gap-4 shadow-2xl shadow-black/10"
          >
            Track Order <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/shop"
            className="group bg-transparent border border-gray-200 text-luxury-black px-12 py-6 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:border-luxury-black transition-all duration-700 flex items-center justify-center gap-4"
          >
            Continue Exploring <ShoppingBag size={14} className="transition-transform group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
