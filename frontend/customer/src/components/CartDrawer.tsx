import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';

export const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#FAF8F5] shadow-2xl z-[111] flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-stone-200/90 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="relative text-stone-900">
                  <ShoppingBag size={22} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-stone-900 text-amber-300 text-[8px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {cart.length}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-sans font-bold text-stone-900 leading-tight">Your Atelier Bag</h2>
                  <p className="text-[9px] font-sans uppercase tracking-widest text-stone-400">Jaipur Haute Archive</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600"
                aria-label="Close Shopping Bag"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                  <div className="w-16 h-16 rounded-full bg-stone-200/60 flex items-center justify-center text-stone-400">
                    <ShoppingBag size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-sans font-light text-stone-700">Your bag is empty</p>
                    <p className="text-[10px] font-sans text-stone-400 uppercase tracking-widest">Discover our Spring/Summer '26 Runway Archive</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/shop');
                    }}
                    className="bg-stone-900 text-white px-7 py-3.5 rounded-2xl font-sans font-bold text-xs uppercase tracking-widest hover:bg-amber-800 transition-all shadow-md"
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {cart.map((item, index) => (
                    <motion.div 
                      key={`${item.id}-${item.selectedSize}`} 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex gap-4 p-3.5 bg-white rounded-2xl border border-stone-200/80 shadow-xs"
                    >
                      <Link 
                        to={`/product/${item.id}`}
                        onClick={() => {
                          setIsCartOpen(false);
                          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                        }}
                        className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 flex-shrink-0"
                      >
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = "https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=600&auto=format&fit=crop";
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                      </Link>
                      <div className="flex-grow flex flex-col justify-between py-0.5">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <Link 
                              to={`/product/${item.id}`}
                              onClick={() => {
                                setIsCartOpen(false);
                                window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                              }}
                            >
                              <h3 className="text-xs sm:text-sm font-sans font-bold text-stone-900 hover:text-amber-900 transition-colors line-clamp-1 leading-snug">
                                {item.name}
                              </h3>
                            </Link>
                            <button 
                              onClick={() => removeFromCart(item.id, item.selectedSize)} 
                              className="text-stone-300 hover:text-rose-600 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-[10px] font-sans text-stone-500">
                            Proportion: <span className="font-bold text-stone-800">{item.selectedSize}</span> · ₹{item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center bg-stone-100 rounded-xl px-2.5 py-1 border border-stone-200">
                            <button 
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} 
                              className="p-0.5 text-stone-500 hover:text-stone-900 transition-colors"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="mx-2.5 text-xs font-sans font-bold w-3 text-center text-stone-900">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)} 
                              className="p-0.5 text-stone-500 hover:text-stone-900 transition-colors"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <p className="text-sm font-sans font-bold text-stone-900">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Bottom Checkout Action */}
            {cart.length > 0 && (
              <div className="p-5 sm:p-6 border-t border-stone-200 bg-white space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-sans text-stone-400 uppercase tracking-widest font-bold">Subtotal</span>
                    <span className="text-xl sm:text-2xl font-sans font-bold text-stone-900">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-sans">
                    <span className="text-stone-400">White-Glove Courier</span>
                    <span className="text-emerald-700 font-bold uppercase tracking-wider">Complimentary</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-stone-900 text-white py-3.5 sm:py-4 rounded-2xl font-sans text-xs uppercase tracking-widest font-bold hover:bg-amber-800 transition-all flex items-center justify-center gap-2 shadow-xl group active:scale-98"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-sans text-stone-400 uppercase tracking-wider text-center">
                  <ShieldCheck size={12} className="text-amber-700" />
                  <span>Insured Shipping · Handcrafted Archival Keepsake Box</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
