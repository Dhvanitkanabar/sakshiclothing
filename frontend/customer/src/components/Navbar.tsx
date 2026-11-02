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
  ArrowRight,
  Truck,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@clerk/clerk-react';

// Patron Profile Dropdown Menu
const UserDropdownMenu = () => {
  const { user, isSignedIn, logout } = useAuth();
  const { user: clerkUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const rawName = user?.fullName || clerkUser?.fullName || clerkUser?.firstName || 'User';
  const rawEmail = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';
  const displayAvatar = user?.avatar?.url || clerkUser?.imageUrl;
  const displayInitial = rawName.charAt(0).toUpperCase();

  if (!isSignedIn) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 240)}
        className="w-9 h-9 rounded-full border border-stone-300 overflow-hidden hover:border-stone-900 transition-colors bg-stone-100 flex items-center justify-center shrink-0 shadow-xs focus:outline-none"
        aria-label="User Account"
      >
        {displayAvatar ? (
          <img src={displayAvatar} alt={rawName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-stone-800">{displayInitial}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col z-50 origin-top-right text-stone-900"
          >
            <div className="p-4 border-b border-stone-100 bg-stone-50/50">
              <p className="font-medium text-stone-900 truncate text-sm">{rawName}</p>
              <p className="text-xs text-stone-500 truncate mt-0.5">{rawEmail}</p>
            </div>
            <div className="p-2 flex flex-col gap-0.5 text-xs">
              <button 
                onClick={() => { setIsOpen(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <User size={15} /> My Profile & Orders
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/track-order'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <Truck size={15} /> Track Order
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/wishlist'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <Heart size={15} /> Saved Items
              </button>
              <button 
                onClick={() => { setIsOpen(false); logout(); navigate('/'); }}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-1 border-t border-stone-100"
              >
                <LogOut size={15} /> Sign Out
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
  const navigate = useNavigate();
  const location = useLocation();

  const announcements = [
    "Free Express Delivery Across India on All Orders",
    "Handcrafted by Master Artisans in Jaipur & Varanasi",
    "100% Pure Silk Mark Certified Authentic Weaves",
    "Complimentary Custom Sizing & Alteration Service"
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Clean, simple navigation categories
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
      path: "/shop?sortBy=newest",
    }
  ];

  return (
    <>
      {/* 1. Clean Top Announcement Banner */}
      <div className="bg-stone-900 text-stone-200 py-2 px-4 text-xs border-b border-stone-800 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:block text-[11px] text-stone-400">
            Jaipur • New Delhi • Worldwide Delivery
          </div>

          <div className="flex-1 text-center relative h-4 overflow-hidden px-2 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={tickerIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-[11px] sm:text-xs text-amber-200 font-medium tracking-wide"
              >
                {announcements[tickerIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-stone-400">
            <Link to="/track-order" className="hover:text-white transition-colors">
              Track Order
            </Link>
            <span>•</span>
            <a 
              href="https://wa.me/919829012345" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Phone size={11} className="text-amber-400" />
              <span>Contact Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Clean Left-Logo, Center-Links, Right-Actions) */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs py-3.5' 
          : 'bg-white border-b border-stone-200/70 py-4 sm:py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Menu Trigger + Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-stone-800 hover:text-black rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-sans text-2xl sm:text-3xl font-black tracking-[0.14em] text-stone-900 group-hover:text-stone-700 transition-colors leading-none">
                SAKSHI
              </span>
            </Link>
          </div>

          {/* Center: Clean, Simple Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
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
                    className="py-2 text-sm font-medium tracking-wide text-stone-700 hover:text-stone-950 transition-colors flex items-center gap-1"
                  >
                    <span>{link.name}</span>
                    {link.dropdown && (
                      <ChevronDown 
                        size={13} 
                        className={`transition-transform duration-200 opacity-50 ${isHovered ? 'rotate-180 text-stone-900' : ''}`} 
                      />
                    )}
                  </Link>

                  {/* Clean Dropdown */}
                  {link.dropdown && isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-52 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 z-50 text-stone-900"
                    >
                      <ul className="space-y-0.5">
                        {link.dropdown.map((sub) => (
                          <li key={sub.label}>
                            <Link
                              to={sub.path}
                              className="block px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: Search, Wishlist, Cart, Sign In */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors"
              aria-label="Search"
              title="Search collection"
            >
              <Search size={19} />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors relative"
              aria-label="Wishlist"
              title="Saved items"
            >
              <Heart size={19} />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border border-white" />
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors relative"
              aria-label="Shopping Bag"
              title="Shopping bag"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs">
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
                className="hidden sm:inline-flex px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-medium tracking-wide transition-all shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 3. Search Palette Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 border-b border-stone-100 flex items-center gap-3">
                <Search size={20} className="text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lehengas, sarees, sherwanis, kurtas..."
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
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Popular Searches
                </span>
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
                      className="px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-900 hover:text-white text-stone-700 text-xs font-medium border border-stone-200 transition-colors shadow-xs"
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

      {/* 4. Simple Mobile Slide Drawer */}
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
              className="fixed inset-y-0 left-0 w-full max-w-[320px] bg-white z-50 p-6 flex flex-col justify-between text-stone-900 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <span className="font-sans text-2xl font-black tracking-[0.14em] text-stone-900">
                    SAKSHI
                  </span>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                    aria-label="Close Menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search collection..."
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs placeholder:text-stone-400 focus:outline-none focus:border-stone-400"
                  />
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </form>

                {/* Primary Category Links */}
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-2.5 rounded-xl text-base font-sans font-medium text-stone-800 hover:text-black hover:bg-stone-100 transition-colors flex items-center justify-between"
                    >
                      <span>{link.name}</span>
                      <ArrowRight size={14} className="text-stone-400" />
                    </Link>
                  ))}
                </nav>

                {/* Secondary Quick Links */}
                <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
                  <Link
                    to="/track-order"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-stone-600 hover:text-stone-900 rounded-lg transition-colors"
                  >
                    <Truck size={14} /> Track Order
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-stone-600 hover:text-stone-900 rounded-lg transition-colors"
                  >
                    <Heart size={14} /> Wishlist ({wishlist.length})
                  </Link>
                  <a
                    href="https://wa.me/919829012345"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 text-stone-600 hover:text-stone-900 rounded-lg transition-colors"
                  >
                    <Phone size={14} /> WhatsApp Support
                  </a>
                </div>
              </div>

              {/* Bottom Auth CTA */}
              <div className="pt-6 border-t border-stone-100">
                {isSignedIn ? (
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                    className="w-full py-3 bg-stone-100 text-stone-900 rounded-xl text-xs font-semibold hover:bg-stone-200 transition-colors"
                  >
                    View Account
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <User size={14} /> Sign In
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
