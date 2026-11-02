import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-48 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="relative inline-flex items-center justify-center">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
              <ShoppingBag size={48} strokeWidth={1} />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-2 -right-2 text-rose-200"
            >
              <Sparkles size={24} />
            </motion.div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-sans font-medium tracking-tight text-luxury-black">Your Shopping Bag is Empty</h1>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
              Discover our latest collections and find the perfect pieces to elevate your style.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-4 bg-luxury-black text-white px-12 py-6 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-rose-600 transition-all duration-700 shadow-2xl shadow-black/10 group"
          >
            Start Exploring <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-900 selection:bg-amber-400 selection:text-black pt-8 sm:pt-14 pb-36 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-12 space-y-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-amber-800">
            Order Sanctuary
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold text-stone-900 tracking-tight">
            Shopping Bag ({cart.reduce((sum, it) => sum + it.quantity, 0)} Items)
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Cart Item Cards */}
          <div className="flex-1 w-full space-y-4 sm:space-y-6">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={`${item.id}-${item.selectedSize}`}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs flex gap-4 sm:gap-6 group"
                >
                  <div className="w-20 sm:w-28 md:w-32 aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100 border border-stone-200 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm sm:text-base md:text-lg font-sans font-bold text-stone-900 tracking-tight truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm sm:text-base font-sans font-bold text-amber-900 shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <p className="text-[10px] sm:text-xs text-stone-500 font-sans uppercase tracking-wider font-semibold">
                        {item.category} <span className="mx-1.5 text-stone-300">•</span> Size: {item.selectedSize}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-stone-100 mt-3">
                      <div className="flex items-center bg-stone-50 rounded-xl px-2.5 sm:px-3 py-1.5 border border-stone-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="p-1 text-stone-400 hover:text-stone-950 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="mx-3 font-sans font-bold text-xs sm:text-sm w-4 text-center text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="p-1 text-stone-400 hover:text-stone-950 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                        className="w-9 h-9 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors border border-stone-200/80"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Desktop Summary Sidebar */}
          <aside className="w-full lg:w-96 shrink-0">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 space-y-6 lg:sticky lg:top-24 shadow-sm">
              <h2 className="text-lg sm:text-xl font-sans font-bold text-stone-900">Order Summary</h2>
              
              <div className="space-y-3.5 text-xs sm:text-sm font-sans">
                <div className="flex justify-between items-center text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-900">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-stone-600">
                  <span>Express Courier</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 text-xs">
                    Complimentary
                  </span>
                </div>
                <div className="flex justify-between items-center text-stone-600">
                  <span>Tax & Packaging</span>
                  <span className="text-stone-500">Included</span>
                </div>
                <div className="pt-4 border-t border-stone-100 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-stone-900 block">Total Amount</span>
                    <span className="text-[10px] text-stone-400">All Taxes Included</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-sans font-bold text-amber-900">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-stone-900 hover:bg-amber-800 text-white py-4 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>

              <div className="bg-stone-50 rounded-2xl p-4 text-center border border-stone-100">
                <p className="text-[10px] text-stone-500 font-sans leading-relaxed">
                  ✦ 100% Insured Delivery across India<br />
                  ✦ Complimentary 7-Day Exchange Window
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="lg:hidden fixed bottom-[max(3.8rem,env(safe-area-inset-bottom))] left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-stone-200 px-4 py-3 shadow-xl">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-stone-400 block">
              Total Amount
            </span>
            <p className="text-base sm:text-lg font-sans font-bold text-amber-900">
              ₹{totalPrice.toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 max-w-[200px] bg-stone-900 active:bg-amber-800 text-white py-3 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Checkout</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
