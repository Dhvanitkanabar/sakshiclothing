import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@clerk/clerk-react';

/**
 * Design Read: Luxury Atelier Floating Navbar for Sakshi Clothing
 * Aesthetic: Ultra-refined architectural capsule with absolute geometric 3-zone centering,
 * crisp typography, cohesive micro-action cluster, and bespoke patron account capsule.
 * Dials: VARIANCE 6 / MOTION 6 / DENSITY 5.
 */

// Bespoke Patron Account Pill & Dropdown
const UserDropdownMenu = ({ isTransparent }: { isTransparent: boolean }) => {
  const { user, isSignedIn, logout } = useAuth();
  const { user: clerkUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const rawName = user?.fullName || clerkUser?.fullName || clerkUser?.firstName || 'Patron';
  const firstName = rawName.split(' ')[0];
  const rawEmail = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';
  const displayAvatar = user?.avatar?.url || clerkUser?.imageUrl;
  const displayInitial = rawName.charAt(0).toUpperCase();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isSignedIn) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 p-1 pr-2.5 rounded-full transition-all duration-200 focus:outline-none ${
          isTransparent
            ? 'bg-white/10 hover:bg-white/20 border border-white/25 text-white'
            : 'bg-stone-100/90 hover:bg-stone-200/80 border border-stone-200/90 text-stone-900 shadow-2xs'
        }`}
        aria-label="User Account Menu"
        aria-expanded={isOpen}
      >
        {/* Luxury Avatar Seal */}
        <div className="w-7 h-7 rounded-full overflow-hidden bg-stone-900 text-amber-200 font-sans font-bold text-xs flex items-center justify-center ring-1 ring-stone-300/80 shadow-2xs shrink-0">
          {displayAvatar ? (
            <img src={displayAvatar} alt={rawName} className="w-full h-full object-cover" />
          ) : (
            <span>{displayInitial}</span>
          )}
        </div>

        {/* Patron First Name */}
        <span className="hidden sm:inline-block text-xs font-semibold max-w-[76px] truncate leading-none">
          {firstName}
        </span>

        {/* Micro Chevron */}
        <ChevronDown 
          size={11} 
          className={`transition-transform duration-200 opacity-60 group-hover:opacity-100 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-64 bg-white/98 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-stone-200/90 overflow-hidden flex flex-col z-50 origin-top-right text-stone-900"
          >
            {/* Header with verified badge */}
            <div className="p-4 border-b border-stone-100 bg-stone-50/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="font-bold text-stone-900 truncate text-xs">{rawName}</p>
              </div>
              <p className="text-[11px] text-stone-500 truncate mt-0.5 pl-4">{rawEmail}</p>
            </div>

            {/* Menu Links */}
            <div className="p-2 flex flex-col gap-0.5 text-xs">
              <button 
                onClick={() => { setIsOpen(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors font-medium"
              >
                <User size={14} className="text-stone-500" />
                <span>My Profile & Orders</span>
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/track-order'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors font-medium"
              >
                <Truck size={14} className="text-stone-500" />
                <span>Track Live Order</span>
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/wishlist'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors font-medium"
              >
                <Heart size={14} className="text-stone-500" />
                <span>Saved Items</span>
              </button>
              <button 
                onClick={() => { setIsOpen(false); logout(); navigate('/'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors mt-1 border-t border-stone-100 font-medium"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
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
    "Bespoke Handcrafted Orders · Strict No Return Policy",
    "Surat Atelier & Genuine Handcrafted Quality Guarantee",
    "Finest Fabrics & Contemporary Indian Couture"
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
      setIsScrolled(scrollPos > 20);
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
        { label: "Ethnic & Festive Sets", path: "/shop?category=Women&sub=Artisanal Sets" },
        { label: "Dresses & Indo-Western", path: "/shop?category=Women&sub=Couture Anarkalis" },
        { label: "Sarees & Drapes", path: "/shop?category=Women&sub=Heritage Sarees" },
        { label: "Suits & Kurtis", path: "/shop?category=Women&sub=Bridal Lehengas" },
        { label: "View All Women", path: "/shop?category=Women" },
      ]
    },
    {
      name: "Men",
      path: "/shop?category=Men",
      dropdown: [
        { label: "Kurtas & Kurta Sets", path: "/shop?category=Men&sub=Modern Kurtas" },
        { label: "Jackets & Blazers", path: "/shop?category=Men&sub=Suits & Jackets" },
        { label: "Ethnic & Festive Wear", path: "/shop?category=Men&sub=Heritage Sherwanis" },
        { label: "Shirts & Trousers", path: "/shop?category=Men" },
        { label: "View All Men", path: "/shop?category=Men" },
      ]
    },
    {
      name: "Kids",
      path: "/shop?category=Kids",
      dropdown: [
        { label: "Boys Clothing", path: "/shop?category=Kids&sub=Boys" },
        { label: "Girls Clothing", path: "/shop?category=Kids&sub=Girls" },
        { label: "Kids Festive & Ethnic Wear", path: "/shop?category=Kids&sub=Festive" },
        { label: "Casual & Party Wear", path: "/shop?category=Kids&sub=Casual" },
        { label: "View All Kids", path: "/shop?category=Kids" },
      ]
    },
    {
      name: "Jewellery",
      path: "/shop?category=Jewellery",
      dropdown: [
        { label: "Necklaces & Chokers", path: "/shop?category=Jewellery" },
        { label: "Earrings & Jhumkas", path: "/shop?category=Jewellery" },
        { label: "Bangles & Bracelets", path: "/shop?category=Jewellery" },
        { label: "Festive Jewellery Sets", path: "/shop?category=Jewellery" },
        { label: "View All Jewellery", path: "/shop?category=Jewellery" },
      ]
    }
  ];

  return (
    <>
      {/* ─── 1. VIEWPORT FIXED HEADER WRAPPER ─────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-300">
        
        {/* Luxury Announcement Bar (Collapses smoothly on scroll) */}
        <div 
          className={`pointer-events-auto px-4 text-xs transition-all duration-300 overflow-hidden ${
            isScrolled 
              ? 'max-h-0 opacity-0 py-0 border-transparent' 
              : isTransparent
                ? 'max-h-9 opacity-100 py-1.5 bg-black/65 backdrop-blur-md text-stone-200 border-b border-white/10'
                : 'max-h-9 opacity-100 py-1.5 bg-[#0F0E0C] text-stone-300 border-b border-stone-800/80'
          }`}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 text-[10px] tracking-[0.14em] uppercase font-medium">
            {/* Left Atelier Indicator */}
            <div className="hidden lg:flex items-center gap-2 text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Surat Atelier Direct</span>
            </div>

            {/* Center Animated Ticker */}
            <div className="flex-1 text-center relative h-4 overflow-hidden px-2 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={tickerIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className="text-amber-300 font-semibold flex items-center justify-center gap-1.5 tracking-wider text-[10.5px]"
                >
                  <Sparkles size={11} className="text-amber-400 shrink-0" />
                  <span>{announcements[tickerIndex]}</span>
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Right Quick Link */}
            <div className="hidden sm:flex items-center gap-3 text-stone-400">
              <Link to="/track-order" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                <span>Track Order</span>
                <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 2. FLOATING ARCHITECTURAL CAPSULE NAVBAR ─────────────────── */}
        <div className="w-full px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3 transition-all duration-300">
          <header 
            className={`pointer-events-auto mx-auto max-w-5xl xl:max-w-6xl rounded-full transition-all duration-300 ${
              isTransparent
                ? 'bg-black/45 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-white hover:bg-black/55 hover:border-white/30'
                : 'bg-white/94 backdrop-blur-2xl border border-stone-200/90 shadow-[0_10px_35px_-4px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.03] text-stone-900'
            }`}
          >
            {/* Absolute 3-Zone Geometric Architecture: Left Logo, Exact Center Nav, Right Cluster */}
            <div className="relative flex items-center justify-between h-14 sm:h-15 px-3.5 sm:px-6">
              
              {/* ZONE 1 (LEFT): Mobile Menu Trigger + Brand Logo */}
              <div className="flex-1 flex items-center justify-start gap-2 sm:gap-3.5 shrink-0 z-10">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className={`lg:hidden p-2 -ml-1 rounded-full transition-colors active:scale-95 ${
                    isTransparent 
                      ? 'text-white hover:bg-white/15' 
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                  aria-label="Open Navigation Menu"
                >
                  <Menu size={20} />
                </button>

                {/* SAKSHI Brand Wordmark */}
                <Link to="/" className="flex items-center gap-2 group select-none focus:outline-none">
                  <span className={`font-sans text-lg sm:text-xl font-black tracking-[0.22em] transition-opacity duration-200 leading-none ${
                    isTransparent ? 'text-white group-hover:opacity-85' : 'text-stone-950 group-hover:opacity-80'
                  }`}>
                    SAKSHI
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                  <span className={`hidden xl:inline-block text-[9px] font-bold tracking-[0.25em] uppercase pl-2 border-l transition-colors ${
                    isTransparent ? 'text-white/50 border-white/20' : 'text-stone-400 border-stone-200'
                  }`}>
                    Atelier
                  </span>
                </Link>
              </div>

              {/* ZONE 2 (CENTER): ABSOLUTELY CENTERED Navigation Tabs */}
              <nav 
                aria-label="Main Navigation"
                className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 absolute left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
              >
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
                        className={`group px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-200 flex items-center gap-1.5 select-none ${
                          isTransparent
                            ? isHovered
                              ? 'bg-white/20 text-white shadow-xs'
                              : 'text-white/85 hover:text-white hover:bg-white/10'
                            : isHovered
                              ? 'bg-stone-100 text-stone-950 shadow-2xs'
                              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/70'
                        }`}
                      >
                        <span>{link.name}</span>
                        {link.dropdown && (
                          <ChevronDown 
                            size={11} 
                            className={`transition-transform duration-200 opacity-60 group-hover:opacity-100 ${
                              isHovered ? 'rotate-180 text-amber-500' : ''
                            }`} 
                          />
                        )}
                      </Link>

                      {/* Frosted Glass Dropdown Menu */}
                      <AnimatePresence>
                        {link.dropdown && isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.97 }}
                            transition={{ duration: 0.16, ease: "easeOut" }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white/98 backdrop-blur-2xl border border-stone-200/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.16)] p-2.5 z-50 text-stone-900 origin-top"
                          >
                            <div className="px-3 py-1.5 mb-1 border-b border-stone-100 flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                                {link.name} Collection
                              </span>
                              <span className="text-[10px] text-amber-600 font-semibold tracking-wide">Handcrafted</span>
                            </div>
                            <ul className="space-y-0.5">
                              {link.dropdown.map((sub) => (
                                <li key={sub.label}>
                                  <Link
                                    to={sub.path}
                                    className="group flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-all"
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

              {/* ZONE 3 (RIGHT): Perfectly Balanced Action Cluster */}
              <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2 shrink-0 z-10">
                
                {/* Search Trigger */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className={`w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center relative focus:outline-none active:scale-95 ${
                    isTransparent
                      ? 'text-white/90 hover:text-white hover:bg-white/15'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                  aria-label="Search Collection"
                  title="Search (⌘K)"
                >
                  <Search size={17} strokeWidth={2} />
                </button>

                {/* Wishlist Link */}
                <Link
                  to="/wishlist"
                  className={`w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center relative focus:outline-none active:scale-95 ${
                    isTransparent 
                      ? 'text-white/90 hover:text-white hover:bg-white/15' 
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                  aria-label="Saved Items"
                  title="Saved items"
                >
                  <Heart size={17} strokeWidth={2} />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 bg-amber-500 text-stone-950 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                {/* Cart Trigger */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className={`w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center relative focus:outline-none active:scale-95 ${
                    isTransparent 
                      ? 'text-white/90 hover:text-white hover:bg-white/15' 
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                  aria-label="Shopping Bag"
                  title="Shopping bag"
                >
                  <ShoppingBag size={17} strokeWidth={2} />
                  {cartCount > 0 && (
                    <span className={`absolute top-1 right-1 text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs ring-2 ${
                      isTransparent 
                        ? 'bg-amber-400 text-stone-950 ring-stone-900 font-black' 
                        : 'bg-stone-950 text-amber-300 ring-white font-bold'
                    }`}>
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Elegant Subtle Divider */}
                <div className={`h-4 w-px mx-0.5 sm:mx-1 ${
                  isTransparent ? 'bg-white/20' : 'bg-stone-200'
                }`} />

                {/* User Patron Capsule / Sign In Button */}
                {isSignedIn ? (
                  <UserDropdownMenu isTransparent={isTransparent} />
                ) : (
                  <Link
                    to="/login"
                    className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-2xs ${
                      isTransparent
                        ? 'bg-white/15 hover:bg-white text-white hover:text-stone-950 border border-white/30 hover:border-transparent'
                        : 'bg-stone-950 hover:bg-stone-800 text-white'
                    }`}
                    aria-label="Sign In"
                  >
                    <User size={13} />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                )}
              </div>

            </div>
          </header>
        </div>
      </div>

      {/* ─── 3. FLOW SPACER FOR NON-HOME PAGES (Zero gap on Home) ─────── */}
      {!isHome && (
        <div className="w-full h-20 sm:h-24 shrink-0 pointer-events-none" aria-hidden="true" />
      )}

      {/* ─── 4. SEARCH MODAL PALETTE WITH KEYBOARD SHORTCUT ───────────── */}
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
              className="w-full max-w-xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 border-b border-stone-100 flex items-center gap-3">
                <Search size={19} className="text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search womenswear, mens kurtas, kids wear, jewellery..."
                  autoFocus
                  className="w-full bg-transparent text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </form>

              <div className="p-5 bg-stone-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Popular Searches
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Press ESC to exit</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Women's Collection",
                    "Men's Kurta Sets",
                    "Kids Festive Wear",
                    "Bandhgala Jackets",
                    "Sarees & Drapes",
                    "Polki Jewellery"
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

      {/* ─── 5. RESPONSIVE MOBILE SLIDE DRAWER ────────────────────────── */}
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
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans text-2xl font-black tracking-[0.2em] text-stone-950">
                      SAKSHI
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                    aria-label="Close Menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Search Bar in Mobile Drawer */}
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

                {/* Accordion Categories */}
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
                    <Truck size={14} className="text-stone-500" />
                    <span>Track Order</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors font-medium"
                  >
                    <Heart size={14} className="text-stone-500" />
                    <span>Wishlist ({wishlist.length})</span>
                  </Link>
                  <a
                    href="https://wa.me/919825440058"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors font-medium"
                  >
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Atelier WhatsApp Concierge</span>
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
                    <User size={14} />
                    <span>My Profile & Orders</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-2.5 bg-stone-950 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <User size={14} />
                    <span>Sign In / Register</span>
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
