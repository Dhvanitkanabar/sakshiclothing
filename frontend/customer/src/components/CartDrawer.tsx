import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-luxury-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ShoppingBag size={24} className="text-luxury-black" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-serif font-medium tracking-tight">Your Bag</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="p-2 hover:bg-gray-50 rounded-full transition-colors group"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200"
                  >
                    <ShoppingBag size={48} />
                  </motion.div>
                  <div className="space-y-2">
                    <p className="text-xl font-serif italic text-gray-400">Your bag is empty</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Discover our new collection</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/shop');
                    }}
                    className="bg-luxury-black text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {cart.map((item, index) => (
                    <motion.div 
                      key={`${item.id}-${item.selectedSize}`} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-6 group"
                    >
                      <Link 
                        to={`/product/${item.id}`}
                        onClick={() => setIsCartOpen(false)}
                        className="w-28 aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 luxury-shadow"
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                      </Link>
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-4">
                            <Link 
                              to={`/product/${item.id}`}
                              onClick={() => setIsCartOpen(false)}
                            >
                              <h3 className="text-base font-serif font-medium text-luxury-black transition-colors leading-tight">
                                {item.name}
                              </h3>
                            </Link>
                            <button 
                              onClick={() => removeFromCart(item.id, item.selectedSize)} 
                              className="text-gray-300 hover:text-black transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                            Size: {item.selectedSize} • ₹{item.price}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100">
                            <button 
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} 
                              className="p-1 text-gray-400 hover:text-luxury-black transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="mx-4 text-xs font-bold w-4 text-center text-luxury-black">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)} 
                              className="p-1 text-gray-400 hover:text-luxury-black transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="text-base font-sans font-semibold text-luxury-black">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t border-gray-100 bg-gray-50/50 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Subtotal</span>
                    <span className="text-2xl font-serif font-medium text-luxury-black">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Shipping</span>
                    <span className="text-[10px] text-luxury-black font-bold uppercase tracking-widest">Calculated at checkout</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-luxury-black text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black/90 transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-black/20"
                >
                  Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-[9px] text-center text-gray-400 uppercase tracking-[0.2em] font-medium">
                  Complimentary shipping on orders over ₹2000
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
