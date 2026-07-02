import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingBag, User, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';

const BottomNav = () => {
  const location = useLocation();
  const { cart } = useCart();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Grid, label: 'Shop', path: '/shop' },
    { icon: ShoppingBag, label: 'Bag', path: '/cart', badge: cartCount },
    { icon: Heart, label: 'Saved', path: '/wishlist' },
    { icon: User, label: 'Me', path: '/profile' },
  ];

  const isCheckout = location.pathname === '/checkout';

  if (isCheckout) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-luxury-white/80 backdrop-blur-xl border-t border-black/5 px-6 py-4 pb-safe">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.path}
              className="relative flex flex-col items-center gap-1.5 group"
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                className={`transition-colors duration-300 ${
                  isActive ? 'text-black' : 'text-muted hover:text-black'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </motion.div>
              <span className={`text-[8px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                isActive ? 'text-black' : 'text-muted'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
