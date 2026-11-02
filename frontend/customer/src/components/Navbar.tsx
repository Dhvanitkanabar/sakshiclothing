import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Heart, 
  Search, 
  ChevronDown, 
  ChevronRight,
  ArrowRight,
  Truck,
  Phone,
  Sparkles,
  Command
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@clerk/clerk-react';

// Patron Profile Dropdown Menu with Frosted Glass Elevation
const UserDropdownMenu = ({ isTransparent }: { isTransparent: boolean }) => {
  const { user, isSignedIn, logout } = useAuth();
  const { user: clerkUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const rawName = user?.fullName || clerkUser?.fullName || clerkUser?.firstName || 'Patron';
  const rawEmail = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';
  const displayAvatar = user?.avatar?.url || clerkUser?.imageUrl;
  const displayInitial = rawName.charAt(0).toUpperCase();

  if (!isSignedIn) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 240)}
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden transition-all flex items-center justify-center shrink-0 shadow-xs focus:outline-none hover:shadow-md ${
          isTransparent
            ? 'border border-white/40 bg-white/10 hover:border-white text-white'
            : 'border border-stone-300/80 bg-stone-100 hover:border-stone-900 text-stone-800'
        }`}
        aria-label="User Account"
      >
        {displayAvatar ? (
          <img src={displayAvatar} alt={rawName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold">{displayInitial}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2.5 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-stone-200/90 overflow-hidden flex flex-col z-50 origin-top-right text-stone-900"
          >
            <div className="p-4 border-b border-stone-100 bg-stone-50/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="font-semibold text-stone-900 truncate text-sm">{rawName}</p>
              </div>
              <p className="text-[11px] text-stone-500 truncate mt-0.5 pl-4">{rawEmail}</p>
            </div>
            <div className="p-2 flex flex-col gap-0.5 text-xs">
              <button 
                onClick={() => { setIsOpen(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 rounded-xl transition-colors font-medium"
              >
                <User size={14} className="text-stone-500" /> My Profile & Orders
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/track-order'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 rounded-xl transition-colors font-medium"
              >
                <Truck size={14} className="text-stone-500" /> Track Order
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/wishlist'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 rounded-xl transition-colors font-medium"
              >
                <Heart size={14} className="text-stone-500" /> Saved Items
              </button>
              <button 
                onClick={() => { setIsOpen(false); logout(); navigate('/'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors mt-1 border-t border-stone-100 font-medium"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Navbar = () => {
  const { isSignedIn } = useAuth();
  const { setIsCartOpen, cart } = useCart();
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !isScrolled;

  const announcements = [
    "Free Express Delivery Across India on All Orders",
    "Handcrafted by Master Artisans in Jaipur & Varanasi",
    "100% Pure Silk Mark Certified Authentic Weaves",
    "Easy 7-Day Exchange & 100% Authentic Quality Guarantee"
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(scrollPos > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global ⌘K / Ctrl+K search hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setHoveredNav(null);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    {
      name: "Women",
      path: "/shop?category=Women",
      dropdown: [
        { label: "Bridal Lehengas", path: "/shop?category=Women&sub=Bridal Lehengas" },
        { label: "Banarasi Sarees", path: "/shop?category=Women&sub=Heritage Sarees" },
        { label: "Anarkali Suits", path: "/shop?category=Women&sub=Couture Anarkalis" },
        { label: "Festive Kurta Sets", path: "/shop?category=Women&sub=Artisanal Sets" },
        { label: "View All Women", path: "/shop?category=Women" },
      ]
    },
    {
      name: "Men",
      path: "/shop?category=Men",
      dropdown: [
        { label: "Royal Sherwanis", path: "/shop?category=Men&sub=Heritage Sherwanis" },
        { label: "Bandhgala Jackets", path: "/shop?category=Men&sub=Suits & Jackets" },
        { label: "Silk & Khadi Kurtas", path: "/shop?category=Men&sub=Modern Kurtas" },
        { label: "Trousers & Stoles", path: "/shop?category=Men" },
        { label: "View All Men", path: "/shop?category=Men" },
      ]
    },
    {
      name: "Bridal",
      path: "/shop?category=Bridal",
      dropdown: [
        { label: "Red & Crimson Lehengas", path: "/shop?category=Women&sub=Bridal Lehengas" },
        { label: "Pastel & Blush Lehengas", path: "/shop?category=Women&sub=Bridal Lehengas" },
        { label: "Velvet Bridal Sets", path: "/shop?category=Women&sub=Bridal Lehengas" },
        { label: "Bridal Dupattas & Veils", path: "/shop?category=Women" },
        { label: "View Bridal Edit", path: "/shop?category=Bridal" },
      ]
    },
    {
      name: "Sarees",
      path: "/shop?sub=Heritage Sarees",
      dropdown: [
        { label: "Katan Silk Sarees", path: "/shop?sub=Heritage Sarees" },
        { label: "Kadwa Zari Banarasi", path: "/shop?sub=Heritage Sarees" },
        { label: "Organza Tissue Sarees", path: "/shop?sub=Heritage Sarees" },
        { label: "View All Sarees", path: "/shop?sub=Heritage Sarees" },
      ]
    },
    {
      name: "Jewellery",
      path: "/shop?category=Jewellery",
      dropdown: [
        { label: "Kundan Necklaces", path: "/shop?category=Jewellery" },
        { label: "Polki Earrings", path: "/shop?category=Jewellery" },
        { label: "Statement Chokers", path: "/shop?category=Jewellery" },
        { label: "View All Jewellery", path: "/shop?category=Jewellery" },
      ]
    },
    {
      name: "New In",
      path: "/shop?sortBy=newest"
    }
  ];

  return (
    <>
      {/* 1. Viewport Fixed Container */}
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-300">
        
        {/* Luxury Minimalist Single-Line Announcement Ticker */}
        <div 
          className={`pointer-events-auto px-4 text-xs transition-all duration-300 overflow-hidden ${
            isScrolled 
              ? 'max-h-0 opacity-0 py-0 border-transparent' 
              : isTransparent
                ? 'max-h-10 opacity-100 py-1.5 sm:py-2 bg-black/60 backdrop-blur-md text-stone-200 border-b border-white/10'
                : 'max-h-10 opacity-100 py-1.5 sm:py-2 bg-stone-950 text-stone-200 border-b border-stone-800/80'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden lg:flex items-center gap-2 text-[10px] text-stone-400 font-medium tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Jaipur Atelier</span>
            </div>

            <div className="flex-1 text-center relative h-4 overflow-hidden px-2 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={tickerIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.25 }}
                  className="text-[11px] text-amber-300/95 font-medium tracking-wide flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={11} className="text-amber-400 shrink-0" />
                  <span>{announcements[tickerIndex]}</span>
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-[10px] text-stone-400 tracking-wider uppercase font-medium">
              <Link to="/track-order" className="hover:text-stone-200 transition-colors">
                Track Order
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Transparent / Glassmorphism Capsule Island */}
        <div className="w-full px-2.5 sm:px-6 lg:px-8 pt-2 sm:pt-3 transition-all duration-300">
          <header 
            className={`pointer-events-auto mx-auto max-w-7xl rounded-2xl lg:rounded-full transition-all duration-300 ${
              isTransparent
                ? 'bg-black/35 backdrop-blur-2xl border border-white/20 shadow-none py-2 sm:py-2.5 px-4 sm:px-6 text-white hover:bg-black/45 hover:border-white/30'
                : 'bg-white/92 backdrop-blur-2xl border border-stone-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.03)] py-2 sm:py-2 px-3.5 sm:px-6 text-stone-900'
            }`}
          >
            <div className="flex items-center justify-between gap-2 sm:gap-6">
              
              {/* Left: Mobile Menu Trigger + Brand Logo */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className={`lg:hidden p-2 -ml-1 rounded-full transition-colors active:scale-95 ${
                    isTransparent 
                      ? 'text-white hover:bg-white/15' 
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/80'
                  }`}
                  aria-label="Open Navigation Menu"
                >
                  <Menu size={20} />
                </button>

                {/* Brand Logo - Pure, Iconic & Uncluttered */}
                <Link to="/" className="flex items-center gap-1.5 group focus:outline-none select-none">
                  <span className={`font-sans text-xl sm:text-2xl font-black tracking-[0.24em] transition-colors leading-none ${
                    isTransparent ? 'text-white group-hover:text-amber-200' : 'text-stone-950 group-hover:text-stone-700'
                  }`}>
                    SAKSHI
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
                </Link>
              </div>

              {/* Center: Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                {navLinks.map((link) => {
                  const isHovered = hoveredNav === link.name;
                  return (
                    <div
                      key={link.name}
                      className="relative"
                      onMouseEnter={() => setHoveredNav(link.name)}
                      onMouseLeave={() => setHoveredNav(null)}
                    >
                      <Link
                        to={link.path}
                        className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-medium tracking-wide transition-all duration-200 flex items-center gap-1 ${
                          isTransparent
                            ? isHovered
                              ? 'bg-white/20 text-white'
                              : 'text-white/85 hover:text-white hover:bg-white/10'
                            : isHovered
                              ? 'bg-stone-100 text-stone-950'
                              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/70'
                        }`}
                      >
                        <span>{link.name}</span>
                        {link.dropdown && (
                          <ChevronDown 
                            size={12} 
                            className={`transition-transform duration-200 opacity-60 ${
                              isHovered ? 'rotate-180 opacity-100 text-amber-400' : ''
                            }`} 
                          />
                        )}
                      </Link>

                      {/* Floating Dropdown Card */}
                      <AnimatePresence>
                        {link.dropdown && isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.97 }}
                            transition={{ duration: 0.16, ease: "easeOut" }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-60 bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.16)] p-2.5 z-50 text-stone-900 origin-top"
                          >
                            <div className="px-3 py-1.5 mb-1 border-b border-stone-100 flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                                {link.name} Edit
                              </span>
                              <span className="text-[10px] text-amber-600 font-semibold">Handcrafted</span>
                            </div>
                            <ul className="space-y-0.5">
                              {link.dropdown.map((sub) => (
                                <li key={sub.label}>
                                  <Link
                                    to={sub.path}
                                    className="group flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100/90 rounded-xl transition-all"
                                  >
                                    <span>{sub.label}</span>
                                    <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-600" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>

              {/* Right: Search, Wishlist, Cart, Sign In */}
              <div className="flex items-center gap-1 sm:gap-2">
                
                {/* Minimal Icon Search Button (Opens ⌘K Palette) */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 flex items-center justify-center relative focus:outline-none ${
                    isTransparent
                      ? 'text-white/85 hover:text-white hover:bg-white/15'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/80'
                  }`}
                  aria-label="Search Collection"
                  title="Search (⌘K)"
                >
                  <Search size={18} strokeWidth={1.8} />
                </button>

                {/* Wishlist Link */}
                <Link
                  to="/wishlist"
                  className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 relative ${
                    isTransparent 
                      ? 'text-white/85 hover:text-white hover:bg-white/15' 
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/80'
                  }`}
                  aria-label="Wishlist"
                  title="Saved items"
                >
                  <Heart size={18} strokeWidth={1.8} />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                {/* Cart Trigger */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 relative ${
                    isTransparent 
                      ? 'text-white/85 hover:text-white hover:bg-white/15' 
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/80'
                  }`}
                  aria-label="Shopping Bag"
                  title="Shopping bag"
                >
                  <ShoppingBag size={18} strokeWidth={1.8} />
                  {cartCount > 0 && (
                    <span className={`absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs border ${
                      isTransparent 
                        ? 'bg-amber-400 text-stone-950 border-stone-900 font-black' 
                        : 'bg-stone-950 text-amber-300 border-white font-bold'
                    }`}>
                      {cartCount}
                    </span>
                  )}
                </button>

                <div className={`h-4 w-px mx-0.5 ${
                  isTransparent ? 'bg-white/20' : 'bg-stone-200'
                }`} />

                {/* User Profile / Sign In */}
                {isSignedIn ? (
                  <UserDropdownMenu isTransparent={isTransparent} />
                ) : (
                  <Link
                    to="/login"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all active:scale-95 ${
                      isTransparent
                        ? 'bg-white/15 hover:bg-white text-white hover:text-stone-950 border border-white/30 hover:border-transparent'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                    aria-label="Sign In"
                  >
                    <User size={14} />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* 2. Flow Spacer ONLY for Non-Home Pages (Zero white gap on Home page!) */}
      {!isHome && (
        <div className="w-full h-24 sm:h-28 shrink-0 pointer-events-none" aria-hidden="true" />
      )}

      {/* 3. Search Palette Modal with Keyboard Support */}
      <AnimatePresence>
        {isSearchOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 border-b border-stone-100 flex items-center gap-3">
                <Search size={20} className="text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bridal lehengas, sarees, sherwanis, kurtas..."
                  autoFocus
                  className="w-full bg-transparent text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-800 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </form>

              <div className="p-5 bg-stone-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Popular Searches
                  </span>
                  <span className="text-[10px] text-stone-400">Press ESC to exit</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Bridal Lehenga",
                    "Banarasi Saree",
                    "Silk Sherwani",
                    "Bandhgala Jacket",
                    "Anarkali Suit",
                    "Kundan Jewellery"
                  ].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        navigate(`/shop?q=${encodeURIComponent(term)}`);
                        setIsSearchOpen(false);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-950 hover:text-white text-stone-700 text-xs font-medium border border-stone-200 transition-colors shadow-2xs"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Responsive Mobile Slide Drawer with Expandable Accordions */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 w-full max-w-[340px] bg-white z-50 p-6 flex flex-col justify-between text-stone-900 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="space-y-5">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center">
                    <span className="font-sans text-2xl font-black tracking-[0.2em] text-stone-950">
                      SAKSHI
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-1.5 mb-1" />
                  </div>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                    aria-label="Close Menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Instant Mobile Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search collection..."
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                  />
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </form>

                {/* Accordion Category Navigation */}
                <nav className="flex flex-col space-y-1 pt-1">
                  {navLinks.map((link) => {
                    const isExpanded = expandedMobileCategory === link.name;
                    return (
                      <div key={link.name} className="border-b border-stone-100/70 last:border-b-0 pb-1">
                        <div className="flex items-center justify-between">
                          <Link
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="px-2 py-2.5 text-sm font-semibold text-stone-900 hover:text-amber-800 transition-colors flex items-center gap-2 flex-grow"
                          >
                            <span>{link.name}</span>
                            {link.badge && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                                {link.badge}
                              </span>
                            )}
                            {link.isNew && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </Link>
                          {link.dropdown && (
                            <button
                              onClick={() => setExpandedMobileCategory(isExpanded ? null : link.name)}
                              className="p-2 text-stone-400 hover:text-stone-900 rounded-lg transition-colors"
                              aria-label={`Toggle ${link.name} subcategories`}
                            >
                              <ChevronRight 
                                size={16} 
                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-stone-900' : ''}`} 
                              />
                            </button>
                          )}
                        </div>

                        {/* Accordion Subcategories */}
                        {link.dropdown && isExpanded && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-3 pr-1 py-1 space-y-1 bg-stone-50/70 rounded-xl mb-1"
                          >
                            {link.dropdown.map((sub) => (
                              <li key={sub.label}>
                                <Link
                                  to={sub.path}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="block px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors"
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {/* Secondary Quick Links */}
                <div className="pt-3 border-t border-stone-100 space-y-1 text-xs">
                  <Link
                    to="/track-order"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors font-medium"
                  >
                    <Truck size={14} className="text-stone-500" /> Track Order
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors font-medium"
                  >
                    <Heart size={14} className="text-stone-500" /> Wishlist ({wishlist.length})
                  </Link>
                  <a
                    href="https://wa.me/919829012345"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors font-medium"
                  >
                    <Phone size={14} className="text-emerald-500" /> WhatsApp Support
                  </a>
                </div>
              </div>

              {/* Bottom Auth CTA in Mobile Drawer */}
              <div className="pt-5 border-t border-stone-100">
                {isSignedIn ? (
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                    className="w-full py-2.5 bg-stone-100 text-stone-900 rounded-xl text-xs font-semibold hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <User size={14} /> My Profile & Orders
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-2.5 bg-stone-950 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <User size={14} /> Sign In / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
