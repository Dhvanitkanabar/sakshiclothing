// Reading this as: Header & Navigation for Sakshi Clothing Indian Fashion & Imitation Jewellery, with deep plum accents, champagne jewellery highlights, and responsive mobile ergonomics. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

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
  Package,
  RotateCcw,
  Banknote
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@clerk/clerk-react';
import { getCachedProducts, fetchProducts } from '../lib/api';
import type { Product } from '../types';

// Patron Account Pill & Dropdown
const UserDropdownMenu = () => {
  const { user, isSignedIn, logout } = useAuth();
  const { user: clerkUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const rawName = user?.fullName || clerkUser?.fullName || clerkUser?.firstName || 'Valued Patron';
  const firstName = rawName.split(' ')[0];
  const rawEmail = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';
  const displayAvatar = user?.avatar?.url || clerkUser?.imageUrl;
  const displayInitial = rawName.charAt(0).toUpperCase();

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
        className="group flex items-center gap-2 p-1.5 pr-3 rounded-full transition-all duration-200 focus:outline-none bg-white hover:bg-[#F6EFF4] border border-[#E8E5DF] text-[#1A1A1A] shadow-xs"
        aria-label="User Account Menu"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-full overflow-hidden bg-[#4A1D3F] text-white font-sans font-bold text-xs flex items-center justify-center shrink-0">
          {displayAvatar ? (
            <img src={displayAvatar} alt={rawName} className="w-full h-full object-cover" />
          ) : (
            <span>{displayInitial}</span>
          )}
        </div>
        <span className="hidden sm:inline-block text-xs font-semibold max-w-[85px] truncate leading-none">
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
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E5DF] overflow-hidden flex flex-col z-50 origin-top-right text-[#1A1A1A]"
          >
            <div className="p-4 border-b border-[#F0ECE4] bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                <p className="font-bold text-[#1A1A1A] truncate text-xs">{rawName}</p>
              </div>
              <p className="text-[11px] text-[#6B7280] truncate mt-0.5 pl-4">{rawEmail}</p>
            </div>

            <div className="p-2 flex flex-col gap-0.5 text-xs">
              <button 
                onClick={() => { setIsOpen(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[#4A1D3F] hover:bg-[#F6EFF4] rounded-xl transition-colors font-medium min-h-[44px]"
              >
                <User size={15} />
                <span>My Profile & Orders</span>
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/track-order'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[#1A1A1A] hover:bg-[#FAF8F5] rounded-xl transition-colors font-medium min-h-[44px]"
              >
                <Truck size={15} className="text-[#C6A15B]" />
                <span>Track Live Order</span>
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/wishlist'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[#1A1A1A] hover:bg-[#FAF8F5] rounded-xl transition-colors font-medium min-h-[44px]"
              >
                <Heart size={15} className="text-[#B43E2B]" />
                <span>Saved Wishlist</span>
              </button>
              <button 
                onClick={() => { setIsOpen(false); logout(); navigate('/'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[#B43E2B] hover:bg-[#FDF2F0] rounded-xl transition-colors mt-1 border-t border-[#F0ECE4] font-medium min-h-[44px]"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Navbar: React.FC = () => {
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
  const [mobileTab, setMobileTab] = useState<'clothing' | 'jewellery'>('clothing');
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const announcements = [
    { text: "Free Express Shipping on Orders Above ₹999 Across India", icon: Truck },
    { text: "Cash on Delivery (COD) Available Nationwide", icon: Banknote },
    { text: "7-Day Hassle-Free Returns & Exchanges", icon: RotateCcw },
    { text: "Curated Artificial Jewellery · Skin-Safe Brass & Plating", icon: Sparkles }
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
      setIsScrolled(scrollPos > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveResults([]);
      return;
    }

    const cleanQ = searchQuery.trim().toLowerCase();
    const terms = cleanQ.split(/\s+/).filter(Boolean);

    const matches = allProducts.filter((p) => {
      const text = `${p.name} ${p.category} ${p.subCategory || ''} ${p.description || ''}`.toLowerCase();
      return text.includes(cleanQ) || (terms.length > 0 && terms.every(t => text.includes(t)));
    });

    setLiveResults(matches.slice(0, 8));
  }, [searchQuery, allProducts]);

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

  const navCategories = [
    {
      name: "Clothing",
      path: "/shop?category=Women",
      isJewellery: false,
      badge: "Festive Edit",
      sections: [
        {
          title: "Traditional Drapes",
          items: [
            { label: "Sarees & Drapes", path: "/shop?category=Women&sub=Heritage Sarees" },
            { label: "Bridal & Party Lehengas", path: "/shop?category=Women&sub=Bridal Lehengas" },
          ]
        },
        {
          title: "Kurtis & Ensembles",
          items: [
            { label: "Kurtis & Suits", path: "/shop?category=Women&sub=Artisanal Sets" },
            { label: "Co-ord Sets & Tunics", path: "/shop?category=Women&sub=Modern Kurtas" },
            { label: "Indo-Western & Dresses", path: "/shop?category=Women&sub=Couture Anarkalis" },
          ]
        },
        {
          title: "Men & Occasion",
          items: [
            { label: "Men's Heritage Sherwanis", path: "/shop?category=Men&sub=Heritage Sherwanis" },
            { label: "Suits & Bandhgalas", path: "/shop?category=Men&sub=Suits & Jackets" },
            { label: "Explore All Clothing", path: "/shop?category=Women" },
          ]
        }
      ]
    },
    {
      name: "Imitation Jewellery",
      path: "/shop?category=Jewellery",
      isJewellery: true,
      badge: "Artificial / Fashion",
      sections: [
        {
          title: "Neckpieces & Sets",
          items: [
            { label: "Chokers & Statement Sets", path: "/shop?category=Jewellery" },
            { label: "Polki & Kundan Imitation Sets", path: "/shop?category=Jewellery" },
            { label: "Maang Tikka & Matha Patti", path: "/shop?category=Jewellery" },
          ]
        },
        {
          title: "Earrings & Bangles",
          items: [
            { label: "Jhumkas & Chandbalis", path: "/shop?category=Jewellery" },
            { label: "Bangles & Kada Sets", path: "/shop?category=Jewellery" },
            { label: "Cocktail Rings & Hathphool", path: "/shop?category=Jewellery" },
          ]
        },
        {
          title: "Craft & Quality Promise",
          items: [
            { label: "100% Skin-Friendly Brass", path: "/shop?category=Jewellery" },
            { label: "Anti-Tarnish Rhodium Plating", path: "/shop?category=Jewellery" },
            { label: "Explore All Jewellery", path: "/shop?category=Jewellery" },
          ]
        }
      ]
    },
    {
      name: "New Arrivals",
      path: "/shop?sort=newest",
      isJewellery: false,
    },
    {
      name: "Track Order",
      path: "/track-order",
      isJewellery: false,
    }
  ];

  const CurrentTickerIcon = announcements[tickerIndex].icon;

  return (
    <>
      {/* ─── 1. TOP ANNOUNCEMENT TICKER ───────────────────────────────── */}
      <div className="w-full bg-[#4A1D3F] text-white text-[11px] font-sans border-b border-[#3B1632] relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-8 sm:h-8.5 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-2 text-white/80 font-medium tracking-wider text-[10px] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-pulse inline-block" />
            <span>Sakshi Fashion & Imitation Jewels</span>
          </div>

          <div className="flex-1 text-center relative h-4 overflow-hidden px-2 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={tickerIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="text-white font-medium flex items-center justify-center gap-1.5 tracking-wide text-[11px]"
              >
                <CurrentTickerIcon size={12} className="text-[#C6A15B] shrink-0" />
                <span>{announcements[tickerIndex].text}</span>
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-white/80 text-[10.5px]">
            <Link to="/track-order" className="hover:text-[#C6A15B] transition-colors flex items-center gap-1 font-medium tracking-wide">
              <span>Track Order</span>
              <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. REFINED LUXURY STICKY NAVBAR ─────────────────────────── */}
      <header 
        className={`w-full sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FBF9F6]/98 backdrop-blur-md border-b border-[#E8E5DF] shadow-sm py-2'
            : 'bg-[#FBF9F6] border-b border-[#E8E5DF] py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          
          {/* ZONE 1 (LEFT): Mobile Menu Trigger + Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 -ml-1 rounded-full text-[#1A1A1A] hover:bg-[#F6EFF4] hover:text-[#4A1D3F] transition-colors active:scale-95"
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>

            {/* SAKSHI Brand Wordmark */}
            <Link to="/" className="flex flex-col group select-none focus:outline-none">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.16em] text-[#1A1A1A] group-hover:text-[#4A1D3F] transition-colors">
                  SAKSHI
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A1D3F] group-hover:bg-[#C6A15B] transition-colors" />
              </div>
              <span className="text-[9px] font-sans font-semibold tracking-[0.24em] uppercase text-[#6B7280] group-hover:text-[#4A1D3F] transition-colors">
                Clothing & Jewels
              </span>
            </Link>
          </div>

          {/* ZONE 2 (CENTER): Mega Menu & Category Links */}
          <nav 
            aria-label="Main Navigation"
            className="hidden lg:flex items-center justify-center gap-8 pointer-events-auto"
          >
            {navCategories.map((item) => {
              const isHovered = hoveredNav === item.name;
              return (
                <div
                  key={item.name}
                  className="relative py-2"
                  onMouseEnter={() => setHoveredNav(item.name)}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  <Link
                    to={item.path}
                    className={`text-[13px] font-semibold tracking-[0.12em] uppercase transition-colors duration-200 relative py-1 select-none flex items-center gap-1.5 ${
                      isHovered
                        ? item.isJewellery ? 'text-[#C6A15B]' : 'text-[#4A1D3F]'
                        : 'text-[#1A1A1A] hover:text-[#4A1D3F]'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.isJewellery
                          ? 'bg-[#F4EEDF] text-[#C6A15B] border border-[#C6A15B]/30'
                          : 'bg-[#F6EFF4] text-[#4A1D3F]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isHovered && (
                      <motion.div
                        layoutId="navHoverUnderline"
                        className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                          item.isJewellery ? 'bg-[#C6A15B]' : 'bg-[#4A1D3F]'
                        }`}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>

                  {/* Curated Mega Menu Dropdown */}
                  <AnimatePresence>
                    {item.sections && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[620px] bg-white border border-[#E8E5DF] rounded-3xl shadow-xl p-6 z-50 text-[#1A1A1A] origin-top"
                      >
                        {item.isJewellery && (
                          <div className="mb-4 pb-3 border-b border-[#F0ECE4] flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#C6A15B] tracking-wider uppercase flex items-center gap-1.5">
                              <Sparkles size={13} />
                              <span>100% Imitation / Artificial Jewellery · Hypoallergenic & Skin-Safe</span>
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-6">
                          {item.sections.map((sec) => (
                            <div key={sec.title} className="space-y-2">
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                                {sec.title}
                              </h4>
                              <ul className="space-y-1">
                                {sec.items.map((sub) => (
                                  <li key={sub.label}>
                                    <Link
                                      to={sub.path}
                                      className="group flex items-center justify-between py-1 text-xs font-medium text-[#1A1A1A] hover:text-[#4A1D3F] transition-colors"
                                    >
                                      <span>{sub.label}</span>
                                      <ChevronRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#4A1D3F]" />
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* ZONE 3 (RIGHT): Search, Wishlist, Cart & Profile */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Live Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="min-w-[44px] min-h-[44px] rounded-full transition-colors flex items-center justify-center text-[#1A1A1A] hover:text-[#4A1D3F] hover:bg-[#F6EFF4] active:scale-95"
              aria-label="Search Collection"
              title="Search collection (⌘K)"
            >
              <Search size={19} />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="min-w-[44px] min-h-[44px] rounded-full transition-colors flex items-center justify-center text-[#1A1A1A] hover:text-[#4A1D3F] hover:bg-[#F6EFF4] relative active:scale-95"
              aria-label="Saved Wishlist"
              title="Saved items"
            >
              <Heart size={19} />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#4A1D3F] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="min-w-[44px] min-h-[44px] rounded-full transition-colors flex items-center justify-center text-[#1A1A1A] hover:text-[#4A1D3F] hover:bg-[#F6EFF4] relative active:scale-95"
              aria-label="Shopping Bag"
              title="Shopping bag"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#4A1D3F] text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="h-4 w-px bg-[#E8E5DF] mx-1 hidden sm:block" />

            {/* User Profile / Sign In */}
            {isSignedIn ? (
              <UserDropdownMenu />
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 bg-[#4A1D3F] hover:bg-[#3B1632] text-white shadow-xs"
                aria-label="Sign In"
              >
                <User size={14} />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* ─── 3. REAL-TIME SEARCH MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {isSearchOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-4 overflow-y-auto"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white border border-[#E8E5DF] rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Search Input Bar */}
              <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 border-b border-[#F0ECE4] flex items-center gap-3 bg-[#FAF8F5]">
                <Search size={20} className="text-[#4A1D3F] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sarees, lehengas, kurtis, necklaces, earrings..."
                  autoFocus
                  className="w-full bg-transparent text-[#1A1A1A] text-base placeholder:text-[#9CA3AF] focus:outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-[#6B7280] hover:text-[#1A1A1A] rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Clear query"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 text-[#6B7280] hover:text-[#1A1A1A] rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Close search"
                >
                  <X size={20} />
                </button>
              </form>

              {/* Instant Search Results */}
              {searchQuery.trim() ? (
                <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-[#F0ECE4]">
                  <div className="px-2 py-2 flex items-center justify-between text-xs text-[#6B7280] font-medium">
                    <span>
                      {liveResults.length > 0 
                        ? `Found ${liveResults.length} match${liveResults.length > 1 ? 'es' : ''}`
                        : `No direct matches for "${searchQuery}"`
                      }
                    </span>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-[#4A1D3F] font-bold hover:underline flex items-center gap-1 min-h-[44px] py-1"
                    >
                      <span>Search All</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  {liveResults.length > 0 ? (
                    <div className="space-y-1.5 pt-2">
                      {liveResults.map((product) => {
                        const isJewel = (product.category || '').toLowerCase().includes('jewel');
                        return (
                          <div
                            key={product.id}
                            onClick={() => {
                              navigate(`/product/${product.id}`);
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                          >
                            <div className="w-14 h-18 rounded-xl overflow-hidden bg-[#F4EFEA] shrink-0 border border-[#E8E5DF]">
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                                isJewel ? 'text-[#C6A15B]' : 'text-[#4A1D3F]'
                              }`}>
                                {isJewel ? 'Imitation Jewellery' : (product.category || 'Apparel')}
                              </span>
                              <h4 className="text-sm font-serif font-medium text-[#1A1A1A] truncate group-hover:text-[#4A1D3F] transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-xs font-bold text-[#1A1A1A] mt-0.5">
                                ₹{product.price.toLocaleString('en-IN')}
                              </p>
                            </div>

                            <div className="p-2 text-[#9CA3AF] group-hover:text-[#4A1D3F] transition-colors">
                              <ChevronRight size={18} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-[#6B7280] text-xs">
                      <p className="font-semibold text-[#1A1A1A] text-sm">No items found matching "{searchQuery}"</p>
                      <p className="mt-1">Try searching for "Saree", "Lehenga", "Kurti", or "Jewellery".</p>
                    </div>
                  )}

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full min-h-[44px] py-2.5 px-4 bg-[#4A1D3F] hover:bg-[#3B1632] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <span>View all results in Shop</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-[#FAF8F5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Popular Categories
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] font-mono">Press ESC to exit</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Heritage Sarees",
                      "Bridal Lehengas",
                      "Kurtis & Suits",
                      "Co-ord Sets",
                      "Imitation Chokers",
                      "Jhumkas & Earrings",
                      "Bangles & Kada Sets"
                    ].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          navigate(`/shop?q=${encodeURIComponent(term)}`);
                          setIsSearchOpen(false);
                        }}
                        className="px-3.5 py-2 min-h-[40px] rounded-full bg-white hover:bg-[#4A1D3F] hover:text-white text-[#1A1A1A] text-xs font-medium border border-[#E8E5DF] transition-colors shadow-2xs"
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

      {/* ─── 4. RESPONSIVE MOBILE NAVIGATION DRAWER ──────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 lg:hidden"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 w-full max-w-[340px] bg-white z-50 p-6 flex flex-col justify-between text-[#1A1A1A] shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="space-y-5">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE4]">
                  <div className="flex flex-col">
                    <span className="font-serif text-2xl font-bold tracking-[0.16em] text-[#1A1A1A]">
                      SAKSHI
                    </span>
                    <span className="text-[9px] font-sans font-semibold tracking-[0.2em] uppercase text-[#6B7280]">
                      Clothing & Artificial Jewels
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A] rounded-full"
                    aria-label="Close navigation menu"
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Mobile Search Button */}
                <button
                  onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#FAF8F5] text-[#6B7280] text-xs font-medium min-h-[44px] border border-[#E8E5DF]"
                >
                  <Search size={16} className="text-[#4A1D3F]" />
                  <span>Search clothing & jewellery...</span>
                </button>

                {/* Mobile Tab Selector: Clothing vs Imitation Jewellery */}
                <div className="flex rounded-xl bg-[#FAF8F5] p-1 border border-[#E8E5DF]">
                  <button
                    onClick={() => setMobileTab('clothing')}
                    className={`flex-1 min-h-[40px] text-xs font-semibold rounded-lg transition-all ${
                      mobileTab === 'clothing'
                        ? 'bg-[#4A1D3F] text-white shadow-xs'
                        : 'text-[#6B7280] hover:text-[#1A1A1A]'
                    }`}
                  >
                    Clothing
                  </button>
                  <button
                    onClick={() => setMobileTab('jewellery')}
                    className={`flex-1 min-h-[40px] text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                      mobileTab === 'jewellery'
                        ? 'bg-[#C6A15B] text-white shadow-xs'
                        : 'text-[#6B7280] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <Sparkles size={12} />
                    <span>Jewellery</span>
                  </button>
                </div>

                {/* Category Links for Selected Tab */}
                <nav className="space-y-1">
                  {mobileTab === 'clothing' ? (
                    <>
                      {[
                        { label: "Sarees & Drapes", path: "/shop?category=Women&sub=Heritage Sarees" },
                        { label: "Kurtis & Suits", path: "/shop?category=Women&sub=Artisanal Sets" },
                        { label: "Bridal & Party Lehengas", path: "/shop?category=Women&sub=Bridal Lehengas" },
                        { label: "Co-ord Sets & Tunics", path: "/shop?category=Women" },
                        { label: "Indo-Western & Dresses", path: "/shop?category=Women&sub=Couture Anarkalis" },
                        { label: "Men's Collection", path: "/shop?category=Men" },
                        { label: "Explore All Clothing", path: "/shop?category=Women" }
                      ].map((cat) => (
                        <Link
                          key={cat.label}
                          to={cat.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-between py-2.5 px-2 text-sm font-medium text-[#1A1A1A] hover:text-[#4A1D3F] hover:bg-[#FAF8F5] rounded-xl transition-colors min-h-[44px]"
                        >
                          <span>{cat.label}</span>
                          <ChevronRight size={16} className="text-[#9CA3AF]" />
                        </Link>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="p-2.5 bg-[#F4EEDF] rounded-xl mb-2 text-[10px] text-[#A4813D] font-medium leading-relaxed">
                        ✨ 100% Imitation / Artificial Jewellery crafted in skin-friendly brass with anti-tarnish plating.
                      </div>
                      {[
                        { label: "Necklaces & Choker Sets", path: "/shop?category=Jewellery" },
                        { label: "Earrings & Jhumkas", path: "/shop?category=Jewellery" },
                        { label: "Bangles & Bracelet Kadas", path: "/shop?category=Jewellery" },
                        { label: "Rings & Hathphool", path: "/shop?category=Jewellery" },
                        { label: "Maang Tikka & Accessories", path: "/shop?category=Jewellery" },
                        { label: "Explore All Jewellery", path: "/shop?category=Jewellery" }
                      ].map((cat) => (
                        <Link
                          key={cat.label}
                          to={cat.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-between py-2.5 px-2 text-sm font-medium text-[#1A1A1A] hover:text-[#C6A15B] hover:bg-[#F4EEDF]/40 rounded-xl transition-colors min-h-[44px]"
                        >
                          <span>{cat.label}</span>
                          <ChevronRight size={16} className="text-[#C6A15B]" />
                        </Link>
                      ))}
                    </>
                  )}
                </nav>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-[#F0ECE4] space-y-3">
                <Link
                  to="/track-order"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] text-xs font-semibold text-[#1A1A1A] min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Truck size={16} className="text-[#4A1D3F]" />
                    <span>Track Live Order</span>
                  </span>
                  <ChevronRight size={16} className="text-[#9CA3AF]" />
                </Link>

                {isSignedIn ? (
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                    className="w-full py-3.5 bg-[#4A1D3F] text-white rounded-2xl text-xs font-bold uppercase tracking-wider min-h-[44px]"
                  >
                    My Profile & Orders
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center w-full py-3.5 bg-[#4A1D3F] text-white rounded-2xl text-xs font-bold uppercase tracking-wider min-h-[44px]"
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
