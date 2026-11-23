// Reading this as: Header & Navigation for Sakshi Clothing Indian Fashion & Imitation Jewellery, with deep maroon accents (#7B1E2B), clean white canvas, champagne jewellery highlights, and interactive postal PIN check. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

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
  ChevronDown,
  ArrowRight,
  Truck,
  Sparkles,
  Package,
  RotateCcw,
  Banknote,
  MapPin,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { useUser } from '@clerk/clerk-react';
import { getCachedProducts, fetchProducts } from '../lib/api';
import type { Product } from '../types';
import { BUSINESS_CONFIG } from '../config/business';
import { getSavedPincode, checkPincodeDelivery, PincodeResult } from '../utils/pincode';
import PincodeModal from './PincodeModal';

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
        className="group flex items-center gap-2 p-1.5 pr-3 rounded-full transition-all duration-200 focus:outline-none bg-white hover:bg-[#FDF4F5] border border-[#E8E5DF] text-[#111111] shadow-2xs"
        aria-label="User Account Menu"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-full overflow-hidden bg-[#7B1E2B] text-white font-sans font-bold text-xs flex items-center justify-center shrink-0">
          {displayAvatar ? (
            <img src={displayAvatar} alt={rawName} className="w-full h-full object-cover" />
          ) : (
            <span>{displayInitial}</span>
          )}
        </div>
        <span className="hidden sm:inline-block text-xs font-semibold max-w-[85px] truncate leading-none text-[#111111]">
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
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E5DF] overflow-hidden flex flex-col z-50 origin-top-right text-[#111111]"
          >
            <div className="p-4 border-b border-[#E8E5DF] bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                <p className="font-bold text-[#111111] truncate text-xs">{rawName}</p>
              </div>
              <p className="text-[11px] text-[#5C5855] truncate mt-0.5 pl-4">{rawEmail}</p>
            </div>

            <div className="p-2 flex flex-col gap-0.5 text-xs">
              <button 
                onClick={() => { setIsOpen(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[#7B1E2B] hover:bg-[#FDF4F5] rounded-xl transition-colors font-medium min-h-[44px]"
              >
                <User size={15} />
                <span>My Profile & Orders</span>
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/track-order'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[#111111] hover:bg-[#FAF8F5] rounded-xl transition-colors font-medium min-h-[44px]"
              >
                <Truck size={15} className="text-[#C6A15B]" />
                <span>Track Live Order</span>
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/wishlist'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[#111111] hover:bg-[#FAF8F5] rounded-xl transition-colors font-medium min-h-[44px]"
              >
                <Heart size={15} className="text-[#B43E2B]" />
                <span>Saved Wishlist</span>
              </button>
              <button 
                onClick={() => { setIsOpen(false); logout(); navigate('/'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[#B43E2B] hover:bg-[#FDF2F0] rounded-xl transition-colors mt-1 border-t border-[#E8E5DF] font-medium min-h-[44px]"
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
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState<string>('');
  const [pinResult, setPinResult] = useState<PincodeResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Load saved PIN on mount
  useEffect(() => {
    const saved = getSavedPincode();
    if (saved) {
      setCurrentPin(saved);
      setPinResult(checkPincodeDelivery(saved));
    }
  }, []);

  const announcements = [
    { text: `Free Pan-India Delivery on Orders Above ₹${BUSINESS_CONFIG.policies.freeShippingThreshold}`, icon: Truck },
    { text: "Cash on Delivery (COD) Available Across India", icon: Banknote },
    { text: "No Returns — 48h Transit Damage Guarantee with Unboxing Video", icon: RotateCcw },
    { text: "Imitation & Fashion Jewellery · Brass & Copper Alloy with Gold Finish", icon: Sparkles }
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

  // Nav categories matching exact spec: Women, Men, Kids, Imitation Jewellery, New In, Sale
  const navCategories = [
    {
      name: "Women",
      path: "/shop?category=Women",
      isJewellery: false,
      sections: [
        {
          title: "Sarees & Lehengas",
          items: [
            { label: "Sarees & Drapes", path: "/shop?category=Women&sub=Heritage Sarees" },
            { label: "Bridal & Party Lehengas", path: "/shop?category=Women&sub=Bridal Lehengas" },
          ]
        },
        {
          title: "Suits & Ensembles",
          items: [
            { label: "Kurtis & Suits", path: "/shop?category=Women&sub=Artisanal Sets" },
            { label: "Co-ord Sets", path: "/shop?category=Women" },
            { label: "Anarkalis & Indo-Western", path: "/shop?category=Women&sub=Couture Anarkalis" },
          ]
        },
        {
          title: "Explore",
          items: [
            { label: "Everyday Kurtas", path: "/shop?category=Women" },
            { label: "View All Women's Wear", path: "/shop?category=Women" },
          ]
        }
      ]
    },
    {
      name: "Men",
      path: "/shop?category=Men",
      isJewellery: false,
      sections: [
        {
          title: "Ethnic & Festive",
          items: [
            { label: "Kurta Pajama Sets", path: "/shop?category=Men&sub=Heritage Sherwanis" },
            { label: "Nehru Jackets & Vests", path: "/shop?category=Men&sub=Suits & Jackets" },
          ]
        },
        {
          title: "Occasion Wear",
          items: [
            { label: "Bandhgalas & Sherwanis", path: "/shop?category=Men&sub=Heritage Sherwanis" },
            { label: "Formal Blazers & Suits", path: "/shop?category=Men&sub=Suits & Jackets" },
          ]
        },
        {
          title: "Explore",
          items: [
            { label: "Festive Silk Kurtas", path: "/shop?category=Men" },
            { label: "View All Men's Wear", path: "/shop?category=Men" },
          ]
        }
      ]
    },
    {
      name: "Kids",
      path: "/shop?category=Kids",
      isJewellery: false,
      sections: [
        {
          title: "Girls Collection",
          items: [
            { label: "Girls Lehengas & Frocks", path: "/shop?category=Kids" },
            { label: "Ethnic Kurti Sets", path: "/shop?category=Kids" },
          ]
        },
        {
          title: "Boys Collection",
          items: [
            { label: "Boys Kurta Pajama Sets", path: "/shop?category=Kids" },
            { label: "Festive Dhoti & Sherwani", path: "/shop?category=Kids" },
          ]
        },
        {
          title: "Daily Comfort",
          items: [
            { label: "Cotton Festive Basics", path: "/shop?category=Kids" },
            { label: "View All Kids Wear", path: "/shop?category=Kids" },
          ]
        }
      ]
    },
    {
      name: "Imitation Jewellery",
      path: "/shop?category=Jewellery",
      isJewellery: true,
      badge: "Jewellery",
      sections: [
        {
          title: "Neckpieces & Chokers",
          items: [
            { label: "Choker & Collar Sets", path: "/shop?category=Jewellery" },
            { label: "Polki & Kundan Imitation Sets", path: "/shop?category=Jewellery" },
            { label: "Layered Haar & Rani Haar", path: "/shop?category=Jewellery" },
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
          title: "Headwear & Sets",
          items: [
            { label: "Maang Tikka & Matha Patti", path: "/shop?category=Jewellery" },
            { label: "Complete Bridal Sets", path: "/shop?category=Jewellery" },
            { label: "View All Imitation Jewellery", path: "/shop?category=Jewellery" },
          ]
        }
      ]
    },
    {
      name: "New In",
      path: "/shop?sort=newest",
      isJewellery: false,
    },
    {
      name: "Sale",
      path: "/shop?sort=discount",
      isJewellery: false,
      badge: "Offers",
    }
  ];

  const CurrentTickerIcon = announcements[tickerIndex].icon;

  return (
    <>
      {/* ─── SCROLL PROGRESS INDICATOR ─────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#7B1E2B] via-[#C6A15B] to-[#7B1E2B] origin-left z-50 pointer-events-none"
        style={{ scaleX }}
      />

      {/* ─── 1. TOP ANNOUNCEMENT TICKER WITH WORKING PIN CHECK ───────────── */}
      <div className="w-full bg-[#7B1E2B] text-white text-[11px] font-sans border-b border-[#621721] relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-8 sm:h-9 flex items-center justify-between gap-2">
          {/* Working PIN Code Delivery Check Button */}
          <button
            type="button"
            onClick={() => setIsPincodeModalOpen(true)}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-black/20 hover:bg-black/35 text-white/95 text-[10.5px] font-medium transition-colors shrink-0 max-w-[210px] sm:max-w-none truncate"
            title="Check delivery timelines to your PIN code"
          >
            <MapPin size={12} className="text-[#C6A15B] shrink-0" />
            <span className="truncate">
              {currentPin && pinResult?.isServiceable 
                ? `PIN ${currentPin} (${pinResult.estimatedDays})`
                : 'Check Delivery PIN'}
            </span>
            <span className="text-white/60 text-[9px] underline">Change</span>
          </button>

          {/* Announcement Ticker */}
          <div className="flex-1 text-center relative h-4 overflow-hidden px-2 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={tickerIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="text-white font-medium flex items-center justify-center gap-1.5 tracking-wide text-[11px] truncate"
              >
                <CurrentTickerIcon size={12} className="text-[#C6A15B] shrink-0" />
                <span className="truncate">{announcements[tickerIndex].text}</span>
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Track Order Link */}
          <div className="hidden md:flex items-center gap-3 text-white/90 text-[10.5px] shrink-0">
            <Link to="/track-order" className="hover:text-[#C6A15B] transition-colors flex items-center gap-1 font-medium tracking-wide">
              <span>Track Order</span>
              <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. CLEAN WHITE STICKY NAVBAR THAT SHRINKS ON SCROLL ───────── */}
      <header 
        className={`w-full sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/98 backdrop-blur-md border-b border-[#E8E5DF] shadow-xs py-2'
            : 'bg-white border-b border-[#E8E5DF] py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          
          {/* ZONE 1 (LEFT): Mobile Menu Trigger + Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 -ml-1 rounded-full text-[#111111] hover:bg-[#FDF4F5] hover:text-[#7B1E2B] transition-colors active:scale-95"
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>

            {/* SAKSHI Brand Wordmark */}
            <Link to="/" className="flex flex-col group select-none focus:outline-none">
              <div className="flex items-center gap-1.5">
                <span className={`font-serif font-bold tracking-[0.16em] text-[#111111] group-hover:text-[#7B1E2B] transition-all duration-300 ${
                  isScrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                }`}>
                  SAKSHI
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B1E2B] group-hover:bg-[#C6A15B] transition-colors" />
              </div>
              <span className="text-[9px] font-sans font-semibold tracking-[0.22em] uppercase text-[#5C5855] group-hover:text-[#7B1E2B] transition-colors">
                Fashion & Imitation Jewels
              </span>
            </Link>
          </div>

          {/* ZONE 2 (CENTER): Desktop Navigation (Women, Men, Kids, Imitation Jewellery, New In, Sale) */}
          <nav 
            aria-label="Main Navigation"
            className="hidden lg:flex items-center justify-center gap-7 pointer-events-auto"
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
                    className={`text-[12.5px] font-semibold tracking-[0.1em] uppercase transition-colors duration-200 relative py-1 select-none flex items-center gap-1.5 ${
                      isHovered
                        ? item.isJewellery ? 'text-[#C6A15B]' : 'text-[#7B1E2B]'
                        : 'text-[#111111] hover:text-[#7B1E2B]'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.badge === 'Offers'
                          ? 'bg-[#FDF2F0] text-[#B43E2B] border border-[#F8D7DA]'
                          : 'bg-[#F4EEDF] text-[#C6A15B] border border-[#C6A15B]/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isHovered && (
                      <motion.div
                        layoutId="navHoverUnderline"
                        className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                          item.isJewellery ? 'bg-[#C6A15B]' : 'bg-[#7B1E2B]'
                        }`}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  <AnimatePresence>
                    {item.sections && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[620px] bg-white border border-[#E8E5DF] rounded-3xl shadow-xl p-6 z-50 text-[#111111] origin-top"
                      >
                        {item.isJewellery && (
                          <div className="mb-4 pb-3 border-b border-[#E8E5DF] flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#C6A15B] tracking-wider uppercase flex items-center gap-1.5">
                              <Sparkles size={13} />
                              <span>Imitation & Fashion Jewellery · Brass & Copper Alloy with Lacquer Finish</span>
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-6">
                          {item.sections.map((sec) => (
                            <div key={sec.title} className="space-y-2">
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5C5855]">
                                {sec.title}
                              </h4>
                              <ul className="space-y-1">
                                {sec.items.map((sub) => (
                                  <li key={sub.label}>
                                    <Link
                                      to={sub.path}
                                      className="group flex items-center justify-between py-1 text-xs font-medium text-[#111111] hover:text-[#7B1E2B] transition-colors"
                                    >
                                      <span>{sub.label}</span>
                                      <ChevronRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#7B1E2B]" />
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
              className="min-w-[44px] min-h-[44px] rounded-full transition-colors flex items-center justify-center text-[#111111] hover:text-[#7B1E2B] hover:bg-[#FDF4F5] active:scale-95"
              aria-label="Search Collection"
              title="Search collection (⌘K)"
            >
              <Search size={19} />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="min-w-[44px] min-h-[44px] rounded-full transition-colors flex items-center justify-center text-[#111111] hover:text-[#7B1E2B] hover:bg-[#FDF4F5] relative active:scale-95"
              aria-label="Saved Wishlist"
              title="Saved items"
            >
              <Heart size={19} />
              {wishlist.length > 0 && (
                <motion.span 
                  key={`wish-${wishlist.length}`}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute top-1.5 right-1.5 bg-[#7B1E2B] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
                >
                  {wishlist.length}
                </motion.span>
              )}
            </Link>

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="min-w-[44px] min-h-[44px] rounded-full transition-colors flex items-center justify-center text-[#111111] hover:text-[#7B1E2B] hover:bg-[#FDF4F5] relative active:scale-95"
              aria-label="Shopping Bag"
              title="Shopping bag"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <motion.span 
                  key={`cart-${cartCount}`}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute top-1.5 right-1.5 bg-[#7B1E2B] text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            <div className="h-4 w-px bg-[#E8E5DF] mx-1 hidden sm:block" />

            {/* User Profile / Sign In */}
            {isSignedIn ? (
              <UserDropdownMenu />
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 bg-[#7B1E2B] hover:bg-[#621721] text-white shadow-xs"
                aria-label="Sign In"
              >
                <User size={14} />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* ─── 3. REAL-TIME SEARCH MODAL WITH LIVE SUGGESTIONS ───────────── */}
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
              <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 border-b border-[#E8E5DF] flex items-center gap-3 bg-[#FAF8F5]">
                <Search size={20} className="text-[#7B1E2B] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sarees, lehengas, kurtis, necklaces, earrings..."
                  autoFocus
                  className="w-full bg-transparent text-[#111111] text-base placeholder:text-[#9CA3AF] focus:outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-[#5C5855] hover:text-[#111111] rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Clear query"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 text-[#5C5855] hover:text-[#111111] rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Close search"
                >
                  <X size={20} />
                </button>
              </form>

              {/* Instant Search Results */}
              {searchQuery.trim() ? (
                <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-[#E8E5DF]">
                  <div className="px-2 py-2 flex items-center justify-between text-xs text-[#5C5855] font-medium">
                    <span>
                      {liveResults.length > 0 
                        ? `Found ${liveResults.length} match${liveResults.length > 1 ? 'es' : ''}`
                        : `No direct matches for "${searchQuery}"`
                      }
                    </span>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-[#7B1E2B] font-bold hover:underline flex items-center gap-1 min-h-[44px] py-1"
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
                            <div className="w-14 h-18 rounded-xl overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#E8E5DF]">
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
                                isJewel ? 'text-[#C6A15B]' : 'text-[#7B1E2B]'
                              }`}>
                                {isJewel ? 'Imitation Jewellery' : (product.category || 'Apparel')}
                              </span>
                              <h4 className="text-sm font-serif font-medium text-[#111111] truncate group-hover:text-[#7B1E2B] transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-xs font-bold text-[#111111] mt-0.5">
                                ₹{product.price.toLocaleString('en-IN')}
                              </p>
                            </div>

                            <div className="p-2 text-[#9CA3AF] group-hover:text-[#7B1E2B] transition-colors">
                              <ChevronRight size={18} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-[#5C5855] text-xs">
                      <p className="font-semibold text-[#111111] text-sm">No items found matching "{searchQuery}"</p>
                      <p className="mt-1">Try searching for "Saree", "Lehenga", "Kurti", or "Jewellery".</p>
                    </div>
                  )}

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full min-h-[44px] py-2.5 px-4 bg-[#7B1E2B] hover:bg-[#621721] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <span>View all results in Shop</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-[#FAF8F5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5855]">
                      Popular Searches
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] font-mono">Press ESC to exit</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Heritage Sarees",
                      "Bridal Lehengas",
                      "Kurtis & Suits",
                      "Men's Kurta Sets",
                      "Kids Ethnic",
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
                        className="px-3.5 py-2 min-h-[40px] rounded-full bg-white hover:bg-[#7B1E2B] hover:text-white text-[#111111] text-xs font-medium border border-[#E8E5DF] transition-colors shadow-2xs"
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

      {/* ─── 4. RESPONSIVE MOBILE NAVIGATION DRAWER (PARITY WITH DESKTOP) ── */}
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
              className="fixed inset-y-0 left-0 w-full max-w-[340px] bg-white z-50 p-6 flex flex-col justify-between text-[#111111] shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="space-y-4">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E5DF]">
                  <div className="flex flex-col">
                    <span className="font-serif text-2xl font-bold tracking-[0.16em] text-[#111111]">
                      SAKSHI
                    </span>
                    <span className="text-[9px] font-sans font-semibold tracking-[0.2em] uppercase text-[#5C5855]">
                      Surat Fashion & Artificial Jewels
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#5C5855] hover:text-[#111111] rounded-full"
                    aria-label="Close navigation menu"
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* PIN Code Delivery Quick Check in Drawer */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsPincodeModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E5DF] text-xs font-medium text-[#111111]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin size={15} className="text-[#7B1E2B] shrink-0" />
                    <span className="truncate">
                      {currentPin && pinResult?.isServiceable
                        ? `Delivery to PIN ${currentPin}`
                        : 'Check Delivery Timelines'}
                    </span>
                  </div>
                  <span className="text-[#7B1E2B] font-semibold text-[11px] shrink-0">
                    {currentPin ? 'Change' : 'Check'}
                  </span>
                </button>

                {/* Mobile Search Input */}
                <button
                  onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#FAF8F5] text-[#5C5855] text-xs font-medium min-h-[44px] border border-[#E8E5DF]"
                >
                  <Search size={16} className="text-[#7B1E2B]" />
                  <span>Search clothing & jewellery...</span>
                </button>

                {/* All 6 Categories Navigation Accordion */}
                <nav className="space-y-1 pt-2">
                  {navCategories.map((cat) => {
                    const isExpanded = expandedMobileCategory === cat.name;
                    return (
                      <div key={cat.name} className="border-b border-[#F2EFEA] last:border-b-0 pb-1">
                        <div className="flex items-center justify-between">
                          <Link
                            to={cat.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex-1 py-2.5 px-2 text-sm font-semibold text-[#111111] hover:text-[#7B1E2B] flex items-center gap-2 min-h-[44px]"
                          >
                            <span>{cat.name}</span>
                            {cat.badge && (
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                cat.badge === 'Offers'
                                  ? 'bg-[#FDF2F0] text-[#B43E2B]'
                                  : 'bg-[#F4EEDF] text-[#C6A15B]'
                              }`}>
                                {cat.badge}
                              </span>
                            )}
                          </Link>
                          {cat.sections && (
                            <button
                              type="button"
                              onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.name)}
                              className="p-2 text-[#5C5855] hover:text-[#111111] min-h-[44px] min-w-[44px] flex items-center justify-center"
                              aria-label={`Toggle ${cat.name} subcategories`}
                            >
                              <ChevronDown size={18} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#7B1E2B]' : ''}`} />
                            </button>
                          )}
                        </div>

                        {/* Collapsible Subcategories */}
                        {cat.sections && isExpanded && (
                          <div className="pl-4 pr-2 pb-2 space-y-3 bg-[#FAF8F5] rounded-xl p-2.5 mt-1">
                            {cat.sections.map((sec) => (
                              <div key={sec.title} className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C5855]">
                                  {sec.title}
                                </span>
                                <div className="space-y-0.5">
                                  {sec.items.map((sub) => (
                                    <Link
                                      key={sub.label}
                                      to={sub.path}
                                      onClick={() => setIsMenuOpen(false)}
                                      className="block py-1.5 text-xs text-[#111111] hover:text-[#7B1E2B] font-medium"
                                    >
                                      {sub.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-[#E8E5DF] space-y-2.5">
                <Link
                  to="/track-order"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] text-xs font-semibold text-[#111111] min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Truck size={16} className="text-[#7B1E2B]" />
                    <span>Track Live Order</span>
                  </span>
                  <ChevronRight size={16} className="text-[#5C5855]" />
                </Link>

                {isSignedIn ? (
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                    className="w-full py-3.5 bg-[#7B1E2B] text-white rounded-2xl text-xs font-bold uppercase tracking-wider min-h-[44px] shadow-xs active:scale-98 transition-transform"
                  >
                    My Profile & Orders
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center w-full py-3.5 bg-[#7B1E2B] text-white rounded-2xl text-xs font-bold uppercase tracking-wider min-h-[44px] shadow-xs active:scale-98 transition-transform"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── 5. INTERACTIVE PIN CODE DELIVERY MODAL ────────────────────── */}
      <PincodeModal
        isOpen={isPincodeModalOpen}
        onClose={() => setIsPincodeModalOpen(false)}
        onSelectPincode={(pin) => {
          setCurrentPin(pin);
          if (pin) {
            setPinResult(checkPincodeDelivery(pin));
          } else {
            setPinResult(null);
          }
        }}
      />
    </>
  );
};

export default Navbar;
