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
            <h1 className="text-5xl font-serif font-medium tracking-tight text-luxury-black">Your Shopping Bag is Empty</h1>
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
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-32">
      <header className="mb-24 space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-rose-600">Shopping Bag</span>
        <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter text-luxury-black">
          Review <span className="italic">Selection</span>
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 pb-32 lg:pb-0">
        <div className="flex-grow space-y-6 md:space-y-12">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                key={`${item.id}-${item.selectedSize}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 md:gap-8 pb-6 md:pb-12 border-b border-gray-100 group"
              >
                <div className="w-24 md:w-40 aspect-[3/4] overflow-hidden rounded-2xl md:rounded-[2rem] bg-gray-50 border border-gray-100 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between py-1 md:py-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 md:space-y-2">
                      <h3 className="text-sm md:text-xl font-serif font-medium text-luxury-black tracking-tight line-clamp-1">{item.name}</h3>
                      <p className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        {item.category} <span className="mx-1 md:mx-2">•</span> Size: {item.selectedSize}
                      </p>
                    </div>
                    <p className="text-sm md:text-lg font-serif font-medium text-luxury-black italic">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center bg-gray-50 rounded-full px-3 md:px-6 py-2 md:py-3 border border-gray-100">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                        className="p-1 text-gray-400 hover:text-luxury-black transition-colors"
                      >
                        <Minus size={12} className="md:w-3.5 md:h-3.5" />
                      </button>
                      <span className="mx-4 md:mx-8 font-bold text-[10px] md:text-xs w-4 text-center text-luxury-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                        className="p-1 text-gray-400 hover:text-luxury-black transition-colors"
                      >
                        <Plus size={12} className="md:w-3.5 md:h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-500"
                    >
                      <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <aside className="lg:w-[450px]">
          <div className="bg-white border border-gray-100 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 space-y-8 md:space-y-12 sticky top-32 shadow-2xl shadow-black/5">
            <h2 className="text-xl md:text-2xl font-serif font-medium tracking-tight text-luxury-black">Order Summary</h2>
            
            <div className="space-y-4 md:space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Subtotal</span>
                <span className="text-xs md:text-sm font-bold text-luxury-black">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Shipping</span>
                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${totalPrice > 2000 ? 'text-green-600' : 'text-luxury-black'}`}>
                  {totalPrice > 2000 ? 'Complimentary' : '₹100'}
                </span>
              </div>
              <div className="pt-4 md:pt-6 border-t border-gray-100 flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Amount</span>
                  <p className="text-[8px] md:text-[9px] text-gray-300 uppercase tracking-widest font-bold">Including all taxes</p>
                </div>
                <span className="text-2xl md:text-3xl font-serif font-medium text-luxury-black">₹{(totalPrice > 2000 ? totalPrice : totalPrice + 100).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="hidden lg:flex w-full bg-luxury-black text-white py-6 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-rose-600 transition-all duration-700 items-center justify-center gap-4 shadow-2xl shadow-black/10 group"
            >
              Proceed to Checkout <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>

            <div className="bg-gray-50 rounded-2xl p-4 md:p-6">
              <p className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-loose text-center">
                Complimentary returns within 30 days. <br />
                Free shipping on orders above ₹2,000.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Sticky Checkout */}
      <div className="lg:hidden fixed bottom-20 left-0 right-0 z-[90] bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="space-y-0.5">
            <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Total Amount</span>
            <p className="text-lg font-serif font-bold text-luxury-black tracking-tight">₹{(totalPrice > 2000 ? totalPrice : totalPrice + 100).toLocaleString()}</p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="bg-luxury-black text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-black/10 flex items-center gap-2"
          >
            Checkout <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
