// Reading this as: Cart Slide-Over Drawer for Sakshi Clothing, with dynamic free-shipping threshold tracker (₹999) and responsive touch ergonomics. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { BUSINESS_CONFIG } from '../config/business';
import { formatPrice } from '../utils/format';

export const CartDrawer: React.FC = () => {
  const { cart, cartQuote, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  const threshold = cartQuote?.totals?.freeShippingThreshold || BUSINESS_CONFIG.policies.freeShippingThreshold || 300;
  const itemsTotal = cartQuote?.totals?.itemsTotal ?? totalPrice;
  const progressPercent = Math.min(100, Math.round((itemsTotal / threshold) * 100));
  const remainingForFreeShipping = cartQuote ? cartQuote.totals.amountNeededForFreeShipping : Math.max(0, threshold - itemsTotal);
  const isFreeShipping = cartQuote ? cartQuote.totals.isFreeShipping : (itemsTotal >= threshold);

  React.useEffect(() => {
    if (!isCartOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

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
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[110]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Bag Drawer"
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#FBF9F6] shadow-2xl z-[111] flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-[#E8E5DF] flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative text-[#7B1E2B]">
                  <ShoppingBag size={22} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#7B1E2B] text-white text-[8px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {cart.length}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-serif font-semibold text-[#1A1A1A] leading-tight">
                    Your Atelier Bag
                  </h2>
                  <p className="text-[10px] font-sans uppercase tracking-wider text-[#6B7280]">
                    Sakshi Clothing & Jewellery
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[#FDF4F5] hover:text-[#7B1E2B] rounded-full transition-colors text-[#6B7280]"
                aria-label="Close Shopping Bag"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            {cart.length > 0 && (
              <div className="bg-[#FAF8F5] px-5 py-3 border-b border-[#E8E5DF] shrink-0">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="flex items-center gap-1.5 text-[#1A1A1A]">
                    <Truck size={14} className="text-[#7B1E2B]" />
                    {remainingForFreeShipping > 0 ? (
                      <span>
                        Add <strong className="text-[#7B1E2B]">₹{remainingForFreeShipping.toLocaleString('en-IN')}</strong> more for <span className="text-[#15803D] font-bold">FREE Delivery</span>
                      </span>
                    ) : (
                      <span className="text-[#15803D] font-bold">
                        🎉 You've unlocked FREE Delivery across India!
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-bold text-[#6B7280]">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#E8E5DF] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#7B1E2B] transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-5 sm:p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                  <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E8E5DF] flex items-center justify-center text-[#9CA3AF]">
                    <ShoppingBag size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-serif text-[#1A1A1A]">Your bag is empty</p>
                    <p className="text-xs font-sans text-[#6B7280]">Explore our latest festive collections and imitation jewellery</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/shop');
                    }}
                    className="bg-[#7B1E2B] text-white px-7 py-3 rounded-full font-sans font-semibold text-xs uppercase tracking-wider hover:bg-[#621721] transition-all shadow-md min-h-[44px]"
                  >
                    Explore Collections
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {cart.map((item, index) => {
                    const isJewel = (item.category || '').toLowerCase().includes('jewel');
                    const quotedLine = cartQuote?.lineItems?.find(
                      li => li.productId.toString() === item.id.toString() && (!li.variantId || li.variantId.toString() === (item as any).variantId?.toString())
                    );
                    const effectivePrice = quotedLine ? quotedLine.price : item.price;
                    const itemSubtotal = quotedLine ? quotedLine.subtotal : (effectivePrice * item.quantity);
                    return (
                      <motion.div 
                        key={`${item.id}-${item.selectedSize}`} 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ delay: index * 0.04 }}
                        className="flex gap-4 p-3.5 bg-white rounded-2xl border border-[#E8E5DF] shadow-xs"
                      >
                        <Link 
                          to={`/product/${item.id}`}
                          onClick={() => {
                            setIsCartOpen(false);
                            window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                          }}
                          className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#E8E5DF]"
                        >
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallback = "/placeholder-product.svg";
                              if (target.src !== fallback) {
                                target.src = fallback;
                              }
                            }}
                          />
                        </Link>
                        <div className="flex-grow flex flex-col justify-between py-0.5 min-w-0">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <Link 
                                to={`/product/${item.id}`}
                                onClick={() => {
                                  setIsCartOpen(false);
                                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                                }}
                              >
                                <h3 className="text-xs sm:text-sm font-serif font-medium text-[#1A1A1A] hover:text-[#7B1E2B] transition-colors line-clamp-1 leading-snug">
                                  {item.name}
                                </h3>
                              </Link>
                              <button 
                                onClick={() => removeFromCart(item.id, item.selectedSize)} 
                                className="text-[#9CA3AF] hover:text-[#B43E2B] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                                aria-label="Remove item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                              <span>
                                {isJewel ? (
                                  <span className="text-[#C6A15B] font-semibold">Imitation Jewellery</span>
                                ) : (
                                  <>Size: <strong className="text-[#1A1A1A]">{item.selectedSize}</strong></>
                                )}
                              </span>
                              <span>·</span>
                              <span>{formatPrice(effectivePrice)}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center bg-[#FAF8F5] rounded-xl px-1 py-0.5 border border-[#E8E5DF]">
                              <button 
                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} 
                                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="mx-2 text-xs font-semibold w-4 text-center text-[#1A1A1A]">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)} 
                                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <p className="text-sm font-bold text-[#1A1A1A]">
                              {formatPrice(itemSubtotal)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Bottom Checkout Action */}
            {cart.length > 0 && (
              <div className="p-5 sm:p-6 border-t border-[#E8E5DF] bg-white space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shrink-0">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Subtotal</span>
                    <span className="text-xl font-bold text-[#1A1A1A]">
                      {formatPrice(itemsTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#6B7280]">Shipping</span>
                    <span className={`font-semibold ${isFreeShipping ? 'text-[#15803D]' : 'text-[#1A1A1A]'}`}>
                      {isFreeShipping ? 'FREE' : 'Calculated at checkout'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-[#7B1E2B] hover:bg-[#621721] text-white py-3.5 sm:py-4 min-h-[48px] rounded-full text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 shadow-md group active:scale-98"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6B7280] text-center">
                  <ShieldCheck size={14} className="text-[#C6A15B]" />
                  <span>No Returns (Damage Guaranteed) · Cash on Delivery Available</span>
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
