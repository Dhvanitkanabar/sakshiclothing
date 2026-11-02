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
const UserDropdownMenu = () => {
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
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300/80 overflow-hidden hover:border-stone-900 transition-all bg-stone-100 flex items-center justify-center shrink-0 shadow-xs focus:outline-none hover:shadow-md"
        aria-label="User Account"
      >
        {displayAvatar ? (
          <img src={displayAvatar} alt={rawName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-stone-800">{displayInitial}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2.5 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-stone-200/90 overflow-hidden flex flex-col z-50 origin-top-right text-stone-900"
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

  const announcements = [
    "Free Express Delivery Across India on All Orders",
    "Handcrafted by Master Artisans in Jaipur & Varanasi",
    "100% Pure Silk Mark Certified Authentic Weaves",
    "Complimentary Bespoke Sizing & Alteration Service"
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
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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
      badge: "Couture",
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
      path: "/shop?sortBy=newest",
      isNew: true
    }
  ];

  return (
    <>
      {/* 1. Fixed Viewport Container for True Sticky Floating Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-300">
        
        {/* Luxury Top Announcement Ticker (collapses smoothly on scroll) */}
        <div 
          className={`pointer-events-auto bg-stone-950 text-stone-200 px-3 sm:px-6 text-xs border-b border-stone-800/80 transition-all duration-300 overflow-hidden ${
            isScrolled 
              ? 'max-h-0 opacity-0 py-0 border-transparent' 
              : 'max-h-12 opacity-100 py-1.5 sm:py-2'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-stone-400 font-medium tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Jaipur Atelier</span>
              <span className="text-stone-700">•</span>
              <span>Worldwide Insured Shipping</span>
            </div>

            <div className="flex-1 text-center relative h-4 overflow-hidden px-2 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={tickerIndex}
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -7 }}
                  transition={{ duration: 0.28 }}
                  className="text-[11px] sm:text-xs text-amber-200/90 font-medium tracking-wide flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={11} className="text-amber-400 shrink-0 hidden sm:inline" />
                  <span>{announcements[tickerIndex]}</span>
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="hidden sm:flex items-center gap-3.5 text-[11px] text-stone-400 font-medium">
              <Link to="/track-order" className="hover:text-amber-200 transition-colors flex items-center gap-1">
                <Truck size={12} className="text-stone-400" />
                <span>Track Order</span>
              </Link>
              <span className="text-stone-700">•</span>
              <a 
                href="https://wa.me/919829012345" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-amber-200 transition-colors flex items-center gap-1"
              >
                <Phone size={11} className="text-emerald-400" />
                <span>Concierge</span>
              </a>
            </div>
          </div>
        </div>

        {/* Floating Sticky Glassmorphism Island Navbar */}
        <div className="w-full px-2.5 sm:px-6 lg:px-8 pt-2 sm:pt-3 transition-all duration-300">
          <header 
            className={`pointer-events-auto mx-auto max-w-7xl rounded-2xl lg:rounded-full transition-all duration-300 ${
              isScrolled
                ? 'bg-white/92 backdrop-blur-2xl border border-stone-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04)] py-2 sm:py-2.5 px-3.5 sm:px-6'
                : 'bg-white/85 backdrop-blur-xl border border-stone-200/75 shadow-[0_8px_32px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] py-2.5 sm:py-3.5 px-4 sm:px-7'
            }`}
          >
          <div className="flex items-center justify-between gap-2 sm:gap-6">
            
            {/* Left: Mobile Menu Trigger + Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3.5">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 -ml-1 text-stone-700 hover:text-stone-950 rounded-xl hover:bg-stone-100/80 transition-colors active:scale-95"
                aria-label="Open Navigation Menu"
              >
                <Menu size={20} />
              </button>

              {/* Brand Logo with Haute Couture Spark */}
              <Link to="/" className="flex items-center gap-2 group focus:outline-none select-none">
                <div className="relative flex items-center">
                  <span className="font-sans text-xl sm:text-2xl font-black tracking-[0.2em] text-stone-950 group-hover:text-stone-700 transition-colors leading-none">
                    SAKSHI
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-1.5 mb-1 group-hover:scale-125 transition-transform" />
                </div>
                <span className="hidden xl:inline-block text-[9px] uppercase tracking-[0.22em] text-stone-400 font-semibold pl-2.5 border-l border-stone-200">
                  Couture
                </span>
              </Link>
            </div>

            {/* Center: Desktop Nav Links with Floating Pills and Dropdowns */}
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
                      className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
                        isHovered
                          ? 'bg-stone-100 text-stone-950 shadow-2xs'
                          : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/70'
                      }`}
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
                      {link.dropdown && (
                        <ChevronDown 
                          size={12} 
                          className={`transition-transform duration-200 text-stone-400 ${isHovered ? 'rotate-180 text-stone-900' : ''}`} 
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
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-60 bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-2.5 z-50 text-stone-900 origin-top"
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
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              
              {/* Search Pill Trigger (Desktop) */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100/80 hover:bg-stone-100 text-stone-500 hover:text-stone-900 border border-stone-200/60 text-xs font-medium transition-all shadow-2xs group focus:outline-none"
                aria-label="Search Collection"
                title="Search collection (⌘K)"
              >
                <Search size={14} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                <span className="text-stone-600 group-hover:text-stone-900 transition-colors">Search...</span>
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-stone-400 bg-white px-1.5 py-0.5 rounded-md border border-stone-200 shadow-2xs">
                  <Command size={10} /> K
                </span>
              </button>

              {/* Mobile Search Icon Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 rounded-full transition-colors"
                aria-label="Search"
                title="Search collection"
              >
                <Search size={18} />
              </button>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 rounded-full transition-colors relative"
                aria-label="Wishlist"
                title="Saved items"
              >
                <Heart size={18} strokeWidth={2} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 rounded-full transition-colors relative"
                aria-label="Shopping Bag"
                title="Shopping bag"
              >
                <ShoppingBag size={18} strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-stone-950 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs border border-white/40">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="h-4 w-px bg-stone-200 hidden sm:block mx-0.5" />

              {/* User Profile / Sign In */}
              {isSignedIn ? (
                <UserDropdownMenu />
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 bg-stone-950 hover:bg-stone-800 text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md active:scale-95"
                >
                  <User size={13} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </header>
      </div>
    </div>

    {/* Flow Spacer so content is never obscured by the fixed floating navbar */}
    <div className="w-full h-24 sm:h-28 shrink-0 pointer-events-none" aria-hidden="true" />

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
                    <Phone size={14} className="text-emerald-500" /> WhatsApp Concierge
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
