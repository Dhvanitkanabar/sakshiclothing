import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Grid, ShoppingBag, User, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';

export const BottomNav = () => {
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

  const isCheckout = location.pathname === '/checkout';
  if (isCheckout) return null;

  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#FAF8F5]/95 backdrop-blur-2xl border-t border-stone-200/90 px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl transition-all"
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
                className="relative flex flex-col items-center gap-1 group py-1 px-3 focus:outline-none"
                aria-label="Open Shopping Bag"
              >
                <div className="relative text-stone-700 group-hover:text-amber-800 transition-colors">
                  <Icon size={19} strokeWidth={2} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-stone-900 text-amber-300 text-[8px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-sans font-bold uppercase tracking-[0.16em] text-stone-600 group-hover:text-stone-950 transition-colors">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path || '/'}
              className="relative flex flex-col items-center gap-1 group py-1 px-3 focus:outline-none"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`relative transition-colors duration-200 ${
                  isActive ? 'text-amber-900' : 'text-stone-500 hover:text-stone-950'
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
              </motion.div>
              <span className={`text-[8px] font-sans font-bold uppercase tracking-[0.16em] transition-colors duration-200 ${
                isActive ? 'text-amber-950 font-black' : 'text-stone-500'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="active-bottom-nav-dot"
                  className="w-1 h-1 rounded-full bg-amber-800 absolute -bottom-1"
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
