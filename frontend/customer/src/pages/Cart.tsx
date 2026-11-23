// Reading this as: Cart Page for Sakshi Clothing, with free shipping progress bar, tactile quantity controls, and responsive order summary. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Sparkles, Truck, ShieldCheck, Banknote, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import SEOHead from '../components/SEOHead';
import { BUSINESS_CONFIG } from '../config/business';

const FREE_SHIPPING_THRESHOLD = BUSINESS_CONFIG.policies.freeShippingThreshold;

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  const totalItems = cart.reduce((sum, it) => sum + it.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progressPercent = Math.min(100, Math.round((totalPrice / FREE_SHIPPING_THRESHOLD) * 100));

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-36 text-center">
        <SEOHead title="Your Bag is Empty | Sakshi Clothing" noIndex={true} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#9CA3AF] mx-auto border border-[#E8E5DF] shadow-xs">
            <ShoppingBag size={40} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#1A1A1A]">
              Your Shopping Bag is Empty
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              Explore our festive Indian wear and handcrafted imitation artificial jewellery to curate your celebratory look.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/shop">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={14} />}>
                Explore Collections
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF9F6] min-h-screen text-[#1A1A1A] pt-8 sm:pt-14 pb-36 lg:pb-16">
      <SEOHead title={`Shopping Bag (${totalItems}) | Sakshi Clothing`} noIndex={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-8 space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7B1E2B]">
            Your Bag
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-medium tracking-tight">
            Shopping Bag ({totalItems} {totalItems === 1 ? 'Item' : 'Items'})
          </h1>
        </header>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E5DF] mb-8 shadow-xs">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
            <span className="flex items-center gap-2 text-[#1A1A1A] font-medium">
              <Truck size={16} className="text-[#7B1E2B]" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add <strong className="text-[#7B1E2B]">₹{remainingForFreeShipping.toLocaleString('en-IN')}</strong> more for <strong className="text-[#15803D]">FREE Delivery</strong>
                </span>
              ) : (
                <span className="text-[#15803D] font-bold">
                  🎉 You have unlocked FREE Delivery across India!
                </span>
              )}
            </span>
            <span className="text-xs font-bold text-[#6B7280]">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-[#E8E5DF] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#7B1E2B] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Cart Item Cards List */}
          <div className="flex-1 w-full space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => {
                const isJewel = (item.category || '').toLowerCase().includes('jewel');
                return (
                  <motion.div
                    key={`${item.id}-${item.selectedSize}`}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8E5DF] shadow-xs flex gap-4 sm:gap-6 group"
                  >
                    <Link
                      to={`/product/${item.id}`}
                      className="w-20 sm:w-28 md:w-32 aspect-[3/4] overflow-hidden rounded-2xl bg-[#FAF8F5] border border-[#E8E5DF] shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <Link to={`/product/${item.id}`}>
                            <h3 className="font-serif text-sm sm:text-base font-medium text-[#1A1A1A] hover:text-[#7B1E2B] transition-colors truncate">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm sm:text-base font-bold text-[#1A1A1A] shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                          {isJewel ? (
                            <span className="text-[#C6A15B] font-semibold">Imitation Jewellery</span>
                          ) : (
                            <span>Size: <strong className="text-[#1A1A1A]">{item.selectedSize}</strong></span>
                          )}
                          <span>·</span>
                          <span>₹{item.price.toLocaleString('en-IN')} each</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#F0ECE4]">
                        {/* Quantity Counter */}
                        <div className="flex items-center bg-[#FAF8F5] rounded-xl px-2 py-1 border border-[#E8E5DF]">
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                            className="min-w-[32px] min-h-[32px] flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A]"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="mx-3 text-xs font-semibold w-4 text-center text-[#1A1A1A]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                            className="min-w-[32px] min-h-[32px] flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A]"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#9CA3AF] hover:text-[#B43E2B] transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E5DF] shadow-xs space-y-6 sticky top-20">
              <h2 className="font-serif text-xl font-medium text-[#1A1A1A]">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-[#6B7280]">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-[#1A1A1A]">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-[#6B7280]">
                  <span>Shipping</span>
                  <span className={`font-semibold ${totalPrice >= FREE_SHIPPING_THRESHOLD ? 'text-[#15803D]' : 'text-[#1A1A1A]'}`}>
                    {totalPrice >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Calculated at checkout'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#6B7280]">
                  <span>Cash on Delivery</span>
                  <span className="font-semibold text-[#15803D]">Available (No extra charge)</span>
                </div>
                <div className="border-t border-[#E8E5DF] pt-3 flex justify-between items-center text-base sm:text-lg font-bold text-[#1A1A1A]">
                  <span>Estimated Total</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate('/checkout')}
                className="font-semibold"
                rightIcon={<ArrowRight size={15} />}
              >
                Proceed to Checkout
              </Button>

              <div className="pt-2 border-t border-[#F0ECE4] space-y-2 text-[11px] text-[#6B7280]">
                <p className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#7B1E2B] shrink-0" />
                  <span>256-bit Encrypted SSL Checkout</span>
                </p>
                <p className="flex items-center gap-2">
                  <RotateCcw size={14} className="text-[#7B1E2B] shrink-0" />
                  <span>No returns (damaged or wrong items covered within 48h)</span>
                </p>
                <p className="flex items-center gap-2">
                  <Banknote size={14} className="text-[#7B1E2B] shrink-0" />
                  <span>Cash on Delivery & Razorpay UPI Available</span>
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
