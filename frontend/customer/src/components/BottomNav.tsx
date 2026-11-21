// Reading this as: Mobile Bottom Navigation Bar for Sakshi Clothing, with deep plum accenting, safe-area inset protection, and guaranteed 44px tap ergonomics. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Grid, ShoppingBag, User, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { cart, setIsCartOpen } = useCart();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navItems = [
    { icon: Sparkles, label: 'Home', path: '/' },
    { icon: Grid, label: 'Shop', path: '/shop' },
    { icon: ShoppingBag, label: 'Bag', isCartTrigger: true, badge: cartCount },
    { icon: Heart, label: 'Saved', path: '/wishlist' },
    { icon: User, label: 'Account', path: '/profile' },
  ];

  const shouldHideBottomNav = 
    location.pathname === '/checkout' ||
    location.pathname === '/cart' ||
    location.pathname === '/order-success' ||
    location.pathname.startsWith('/product/');

  if (shouldHideBottomNav) return null;

  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#FBF9F6]/95 backdrop-blur-md border-t border-[#E8E5DF] px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg transition-all"
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isCartTrigger) {
            return (
              <button
                key={item.label}
                onClick={() => setIsCartOpen(true)}
                className="relative flex flex-col items-center justify-center gap-1 min-w-[50px] min-h-[44px] py-1 px-2 focus:outline-none"
                aria-label="Open Shopping Bag"
              >
                <div className="relative text-[#6B7280] hover:text-[#4A1D3F] transition-colors">
                  <Icon size={20} strokeWidth={2} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#4A1D3F] text-white text-[9px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-sans font-semibold uppercase tracking-wider text-[#6B7280]">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path || '/'}
              className="relative flex flex-col items-center justify-center gap-1 min-w-[50px] min-h-[44px] py-1 px-2 focus:outline-none"
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                className={`relative transition-colors duration-200 ${
                  isActive ? 'text-[#4A1D3F]' : 'text-[#6B7280] hover:text-[#1A1A1A]'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              </motion.div>
              <span className={`text-[9px] font-sans font-semibold uppercase tracking-wider transition-colors duration-200 ${
                isActive ? 'text-[#4A1D3F] font-bold' : 'text-[#6B7280]'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="active-bottom-nav-dot"
                  className="w-1.5 h-1.5 rounded-full bg-[#4A1D3F] absolute -bottom-0.5"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
