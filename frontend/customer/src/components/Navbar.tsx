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
  ChevronRight,
  ArrowRight,
  Truck,
  Sparkles,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@clerk/clerk-react';
import { getCachedProducts, fetchProducts, Product } from '../lib/api';

/**
 * Design Read: Full-Width Luxury Editorial Navbar & Instant Live Search Modal for Sakshi Clothing
 * Aesthetic: Haute couture architectural balance, edge-to-edge quiet luxury, minimal precision,
 * and instant debounced real-time product search with thumbnail previews.
 * Dials: VARIANCE 7 / MOTION 6 / DENSITY 4.
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
        <div className="w-7 h-7 rounded-full overflow-hidden bg-stone-900 text-amber-300 font-sans font-bold text-xs flex items-center justify-center ring-1 ring-amber-500/40 shadow-2xs shrink-0">
          {displayAvatar ? (
            <img src={displayAvatar} alt={rawName} className="w-full h-full object-cover" />
          ) : (
            <span>{displayInitial}</span>
          )}
        </div>

        {/* Patron First Name */}
        <span className="hidden sm:inline-block text-xs font-semibold max-w-[80px] truncate leading-none">
          {firstName}
        </span>
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [liveResults, setLiveResults] = useState<Product[]>([]);
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
    "Finest Ahimsa Silks & Contemporary Indian Couture"
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  // Ticker timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(scrollPos > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pre-load products for instantaneous real-time search
  useEffect(() => {
    const cached = getCachedProducts();
    if (cached && cached.length > 0) {
      setAllProducts(cached);
    }
    fetchProducts().then((res) => {
      if (res && res.length > 0) {
        setAllProducts(res);
      }
    }).catch(() => {});
  }, []);

  // Real-time live search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveResults([]);
      return;
    }

    const cleanQ = searchQuery.trim().toLowerCase();
    const terms = cleanQ.split(/\s+/).filter(Boolean);

    const matches = allProducts.filter((p) => {
      const text = `${p.name} ${p.category} ${p.subCategory || ''} ${p.description || ''}`.toLowerCase();
      return text.includes(cleanQ) || (terms.length > 0 && terms.every(t => text.includes(t))) || (terms.length > 0 && terms.some(t => text.includes(t)));
    });

    setLiveResults(matches.slice(0, 8)); // Top 8 immediate matches
  }, [searchQuery, allProducts]);

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
        { label: "Festive Kids Sets", path: "/shop?category=Kids" },
        { label: "View All Kids", path: "/shop?category=Kids" },
      ]
    },
    {
      name: "Jewellery",
      path: "/shop?category=Jewellery",
      dropdown: [
        { label: "Fine Bangles & Kadas", path: "/shop?category=Jewellery" },
        { label: "Necklaces & Chokers", path: "/shop?category=Jewellery" },
        { label: "Handcrafted Earrings", path: "/shop?category=Jewellery" },
        { label: "View All Jewellery", path: "/shop?category=Jewellery" },
      ]
    }
  ];

  return (
    <>
      {/* ─── 1. TOP ANNOUNCEMENT TICKER ───────────────────────────────── */}
      <div className="w-full bg-[#0F0E0C] text-[#FAF7F2] text-[11px] font-sans border-b border-white/10 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-8 sm:h-8.5 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-2 text-stone-400 font-semibold tracking-wider text-[10px] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>Surat Atelier Direct</span>
          </div>

          <div className="flex-1 text-center relative h-4 overflow-hidden px-2 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={tickerIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="text-amber-300 font-medium flex items-center justify-center gap-1.5 tracking-wider text-[10.5px]"
              >
                <Sparkles size={11} className="text-amber-400 shrink-0" />
                <span>{announcements[tickerIndex]}</span>
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-stone-400 text-[10.5px]">
            <Link to="/track-order" className="hover:text-amber-300 transition-colors flex items-center gap-1 font-medium tracking-wide">
              <span>Track Order</span>
              <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. FULL-WIDTH ARCHITECTURAL LUXURY NAVBAR ────────────────── */}
      <header 
        className={`w-full sticky top-0 z-40 transition-all duration-300 ${
          isTransparent
            ? 'bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white border-b border-white/10 backdrop-blur-xs'
            : 'bg-[#FAF8F5]/96 backdrop-blur-xl border-b border-stone-200/90 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] text-stone-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-19 flex items-center justify-between">
          
          {/* ZONE 1 (LEFT): Mobile Menu Trigger + Brand Wordmark */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
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
              <span className={`font-sans text-xl sm:text-2xl font-bold tracking-[0.26em] transition-opacity duration-200 leading-none ${
                isTransparent ? 'text-white group-hover:opacity-85' : 'text-stone-950 group-hover:opacity-80'
              }`}>
                SAKSHI
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-xs group-hover:scale-125 transition-transform" />
              <span className={`text-[9px] font-semibold tracking-[0.25em] uppercase pl-1 transition-colors ${
                isTransparent ? 'text-white/60' : 'text-stone-400'
              }`}>
                Atelier
              </span>
            </Link>
          </div>

          {/* ZONE 2 (CENTER): Clean Luxury Category Navigation Tabs */}
          <nav 
            aria-label="Main Navigation"
            className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 pointer-events-auto"
          >
            {navLinks.map((link) => {
              const isHovered = hoveredNav === link.name;
              return (
                <div
                  key={link.name}
                  className="relative py-2"
                  onMouseEnter={() => setHoveredNav(link.name)}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  <Link
                    to={link.path}
                    className={`text-[12px] font-semibold tracking-[0.2em] uppercase transition-colors duration-200 relative py-1 select-none flex items-center gap-1 ${
                      isTransparent
                        ? isHovered ? 'text-amber-300' : 'text-white/85 hover:text-white'
                        : isHovered ? 'text-amber-700' : 'text-stone-700 hover:text-stone-950'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isHovered && (
                      <motion.div
                        layoutId="navHoverUnderline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-500 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>

                  {/* Curated Dropdown Flyout */}
                  <AnimatePresence>
                    {link.dropdown && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-white/98 backdrop-blur-2xl border border-stone-200/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.16)] p-3 z-50 text-stone-900 origin-top"
                      >
                        <div className="px-3 py-1.5 mb-1.5 border-b border-stone-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                            {link.name} Archive
                          </span>
                          <span className="text-[10px] text-amber-700 font-semibold tracking-wide">Couture</span>
                        </div>
                        <ul className="space-y-0.5">
                          {link.dropdown.map((sub) => (
                            <li key={sub.label}>
                              <Link
                                to={sub.path}
                                className="group flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-50 rounded-xl transition-all"
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

          {/* ZONE 3 (RIGHT): Action Suite (Live Search, Wishlist, Bag, Patron Account) */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            
            {/* Live Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 flex items-center justify-center relative focus:outline-none active:scale-95 ${
                isTransparent
                  ? 'text-white/90 hover:text-white hover:bg-white/15'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
              aria-label="Search Collection"
              title="Search collection (⌘K)"
            >
              <Search size={18} strokeWidth={2} />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 flex items-center justify-center relative focus:outline-none active:scale-95 ${
                isTransparent 
                  ? 'text-white/90 hover:text-white hover:bg-white/15' 
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
              aria-label="Saved Items"
              title="Saved items"
            >
              <Heart size={18} strokeWidth={2} />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-amber-500 text-stone-950 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 flex items-center justify-center relative focus:outline-none active:scale-95 ${
                isTransparent 
                  ? 'text-white/90 hover:text-white hover:bg-white/15' 
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
              aria-label="Shopping Bag"
              title="Shopping bag"
            >
              <ShoppingBag size={18} strokeWidth={2} />
              {cartCount > 0 && (
                <span className={`absolute top-1.5 right-1.5 text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs ring-2 ${
                  isTransparent 
                    ? 'bg-amber-400 text-stone-950 ring-stone-900 font-black' 
                    : 'bg-stone-950 text-amber-300 ring-white font-bold'
                }`}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Subtle Divider */}
            <div className={`h-4 w-px mx-1 ${
              isTransparent ? 'bg-white/20' : 'bg-stone-200'
            }`} />

            {/* Patron Profile / Sign In */}
            {isSignedIn ? (
              <UserDropdownMenu isTransparent={isTransparent} />
            ) : (
              <Link
                to="/login"
                className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-2xs ${
                  isTransparent
                    ? 'bg-white/15 hover:bg-white text-white hover:text-stone-950 border border-white/30'
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

      {/* ─── 3. REAL-TIME INSTANT SEARCH COMMAND MODAL ─────────────────── */}
      <AnimatePresence>
        {isSearchOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-12 sm:pt-20 px-4 overflow-y-auto"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Search Form Header */}
              <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 border-b border-stone-100 flex items-center gap-3 bg-[#FAF8F5]/60">
                <Search size={20} className="text-amber-700 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name, category, or style (e.g. Dhvanit kanabar, Anarkali, Silk)..."
                  autoFocus
                  className="w-full bg-transparent text-stone-900 text-sm sm:text-base placeholder:text-stone-400 focus:outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
                    title="Clear input"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full transition-colors"
                  title="Close search"
                >
                  <X size={18} />
                </button>
              </form>

              {/* Live Search Instant Results List */}
              {searchQuery.trim() ? (
                <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4 divide-y divide-stone-100">
                  <div className="px-3 py-2 flex items-center justify-between text-xs text-stone-500 font-medium">
                    <span>
                      {liveResults.length > 0 
                        ? `Found ${liveResults.length} instant match${liveResults.length > 1 ? 'es' : ''}`
                        : `No direct matches for "${searchQuery}"`
                      }
                    </span>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-amber-800 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Explore all in Shop</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>

                  {liveResults.length > 0 ? (
                    <div className="space-y-1.5 pt-2">
                      {liveResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            navigate(`/product/${product.id}`);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-stone-50 transition-colors cursor-pointer group"
                        >
                          {/* Product Thumbnail */}
                          <div className="w-13 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-300">
                                <Package size={20} />
                              </div>
                            )}
                          </div>

                          {/* Product Meta */}
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block">
                              {product.category || 'Couture'}
                            </span>
                            <h4 className="text-sm font-semibold text-stone-900 truncate group-hover:text-amber-800 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-xs font-bold text-stone-900 mt-0.5">
                              ₹{product.price.toLocaleString('en-IN')}
                            </p>
                          </div>

                          {/* Quick Arrow */}
                          <div className="p-2 text-stone-300 group-hover:text-amber-600 transition-colors">
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-stone-500 text-xs">
                      <p className="font-semibold text-stone-700 text-sm">No creations found matching "{searchQuery}"</p>
                      <p className="mt-1">Press Enter to run a broader search across all atelier collections.</p>
                    </div>
                  )}

                  {/* Bottom View All CTA */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <span>View all results for "{searchQuery}" in Shop</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty query state: Popular Suggested Terms */
                <div className="p-5 bg-stone-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Popular Searches
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">Press ESC to exit</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Dhvanit kanabar",
                      "Women's Collection",
                      "Men's Kurta Sets",
                      "Bangles",
                      "Kids Festive Wear",
                      "Bandhgala Jackets",
                      "Sarees & Drapes"
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
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 4. RESPONSIVE MOBILE SLIDE DRAWER ────────────────────────── */}
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
                    <span className="font-sans text-2xl font-bold tracking-[0.2em] text-stone-950">
                      SAKSHI
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 text-stone-400 hover:text-stone-950 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mobile Search Button */}
                <button
                  onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-stone-100 text-stone-600 text-xs font-medium"
                >
                  <Search size={15} className="text-amber-700" />
                  <span>Search all atelier creations...</span>
                </button>

                {/* Mobile Navigation Links */}
                <nav className="space-y-1">
                  {navLinks.map((link) => {
                    const isExpanded = expandedMobileCategory === link.name;
                    return (
                      <div key={link.name} className="border-b border-stone-50 py-1">
                        <div className="flex items-center justify-between py-2">
                          <Link
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="font-sans text-sm font-bold uppercase tracking-wider text-stone-900 hover:text-amber-800"
                          >
                            {link.name}
                          </Link>
                          {link.dropdown && (
                            <button
                              onClick={() => setExpandedMobileCategory(isExpanded ? null : link.name)}
                              className="p-1 text-stone-400"
                            >
                              <ChevronRight size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                          )}
                        </div>

                        {link.dropdown && isExpanded && (
                          <div className="pl-3 pb-2 space-y-1.5 text-xs text-stone-600">
                            {link.dropdown.map((sub) => (
                              <Link
                                key={sub.label}
                                to={sub.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="block py-1 hover:text-stone-950"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer */}
              <div className="pt-6 border-t border-stone-100 space-y-3">
                <Link
                  to="/track-order"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 text-xs font-semibold text-stone-800"
                >
                  <span className="flex items-center gap-2">
                    <Truck size={14} className="text-amber-600" />
                    <span>Track Live Order</span>
                  </span>
                  <ChevronRight size={14} className="text-stone-400" />
                </Link>

                {isSignedIn ? (
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                    className="w-full py-3 bg-stone-900 text-white rounded-2xl text-xs font-bold uppercase tracking-wider"
                  >
                    My Profile & Orders
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center w-full py-3 bg-stone-900 text-white rounded-2xl text-xs font-bold uppercase tracking-wider"
                  >
                    Sign In
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
