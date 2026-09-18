import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, Heart, Search, ChevronDown, ArrowRight, Globe, Bell, Home, Grid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@clerk/clerk-react';

import { useLanguage, Language } from '../context/LanguageContext';

const SUBCATEGORY_IMAGES: Record<string, string> = {
  // Clothing
  'dresses': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
  'tops & shirts': 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=800&q=80',
  'tops': 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=800&q=80',
  'sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
  'kurtas': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
  'lehengas': 'https://images.unsplash.com/photo-1583391733975-0e7195821c9a?w=800&q=80',
  'jackets': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
  'bottoms': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',

  // Jewellery
  'necklaces': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
  'earrings': 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80',
  'bangles': 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=800&q=80',
  'bracelets': 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=800&q=80',
  'rings': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
  'pendants': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',

  // Accessories
  'handbags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
  'bags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
  'sunglasses': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
  'scarves': 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
  'belts': 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80',

  // Footwear
  'heels': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
  'flats': 'https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=800&q=80',
  'sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  'boots': 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80',
};

const getSubCategoryImage = (subName: string, subSlug: string, parentSlug?: string) => {
  const nameKey = (subName || '').toLowerCase().trim();
  const slugKey = (subSlug || '').toLowerCase().trim();
  if (SUBCATEGORY_IMAGES[nameKey]) return SUBCATEGORY_IMAGES[nameKey];
  if (SUBCATEGORY_IMAGES[slugKey]) return SUBCATEGORY_IMAGES[slugKey];
  if (parentSlug === 'jewellery') return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80';
  if (parentSlug === 'accessories') return 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80';
  if (parentSlug === 'footwear') return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80';
  return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80';
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const TopBar = () => {
  const { language, setLanguage, t } = useLanguage();
  const [announcements, setAnnouncements] = useState<string[]>([
    "Free Shipping on all orders" // Default fallback
  ]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/cms/homepage`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.announcements && data.data.announcements.length > 0) {
          const activeAnnouncements = data.data.announcements.filter((a: any) => a.isActive).map((a: any) => a.text);
          if (activeAnnouncements.length > 0) {
            setAnnouncements(activeAnnouncements);
          }
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements]);

  return (
    <div className="bg-slate-900 text-white py-2 text-[10px] font-bold uppercase tracking-[0.2em] overflow-hidden relative h-8 flex items-center">
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full hover:bg-white/20 transition-colors">
            <Globe size={11} className="text-gray-300 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-white text-[10px] font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-white">EN - English</option>
              <option value="hi" className="bg-slate-900 text-white">हिं - हिन्दी</option>
              <option value="gu" className="bg-slate-900 text-white">ગુજ - ગુજરાતી</option>
            </select>
          </div>
          <span className="hidden sm:flex items-center gap-1 opacity-60">{t('nav.currency')}</span>
        </div>

        <div className="flex-grow text-center relative h-full flex items-center justify-center px-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute truncate max-w-[200px] sm:max-w-none"
            >
              {announcements[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="hidden md:flex items-center gap-4 opacity-60">
          <Link to="/track-order" className="hover:text-accent transition-colors">{t('nav.trackOrder')}</Link>
          <Link to="/stores" className="hover:text-accent transition-colors">{t('nav.findStore')}</Link>
        </div>
      </div>
    </div>
  );
};

const CustomUserMenu = () => {
  const { user, isSignedIn, logout } = useAuth();
  const { user: clerkUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Use MongoDB user data if available, otherwise fall back to Clerk user data
  const rawName = user?.fullName || clerkUser?.fullName || clerkUser?.firstName || '';
  const rawEmail = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';
  
  // Apple hides real email behind a private relay
  const isAppleRelay = rawEmail.endsWith('@privaterelay.appleid.com');
  const displayName = rawName || (isAppleRelay ? 'Apple User' : 'User');
  const displayEmail = isAppleRelay ? 'Apple Account (private email)' : rawEmail;
  const displayAvatar = user?.avatar?.url || clerkUser?.imageUrl;
  const displayInitial = displayName.charAt(0).toUpperCase();

  if (!isSignedIn) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="w-9 h-9 rounded-full border-2 border-black/10 overflow-hidden hover:opacity-80 transition-all hover:border-black/30 hover:scale-105 bg-gray-100 flex items-center justify-center shrink-0"
      >
        {displayAvatar ? (
          <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-black">{displayInitial}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden flex flex-col z-50 origin-top-right"
          >
            <div className="p-4 border-b border-black/5 bg-gray-50/50">
              <p className="font-serif font-bold text-black truncate">{displayName}</p>
              <p className="text-[10px] text-gray-500 truncate mt-0.5 font-medium">{displayEmail}</p>
            </div>
            <div className="p-2 flex flex-col gap-1">
              <button 
                onClick={() => { setIsOpen(false); navigate('/profile'); }}
                className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl transition-colors"
              >
                <User size={14} /> My Profile
              </button>
              <button 
                onClick={() => { setIsOpen(false); logout(); navigate('/'); }}
                className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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


const Navbar = () => {
  const { user, isSignedIn, logout } = useAuth();
  const { setIsCartOpen, cart } = useCart();
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState<any[]>([{ name: 'Shop', path: '/shop' }]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const cats = data.data;
          const parents = cats.filter((c: any) => !c.parentCategory && c.isActive).sort((a: any, b: any) => a.displayOrder - b.displayOrder);
          const builtLinks = parents.map((p: any) => {
            const subcats = cats.filter((c: any) => (c.parentCategory === p._id || c.parentCategory?._id === p._id) && c.isActive).sort((a: any, b: any) => a.displayOrder - b.displayOrder);
            return {
              name: p.name,
              path: `/category/${p.slug}`,
              mega: subcats.length > 0 ? subcats.map((sub: any) => ({
                title: sub.name,
                path: `/category/${p.slug}?sub=${sub.slug}`,
                image: sub.image?.url || getSubCategoryImage(sub.name, sub.slug, p.slug)
              })) : undefined
            };
          });
          
          builtLinks.push({ name: 'Shop', path: '/shop' });
          setNavLinks(builtLinks);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${searchQuery}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <TopBar />
      <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-500 ${isScrolled ? 'bg-white shadow-md' : 'pt-6 md:pt-8'}`}>
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto flex items-center justify-between px-6 md:px-10 h-16 md:h-20 transition-all duration-700 ease-in-out w-full max-w-7xl ${isScrolled ? 'bg-transparent' : 'bg-transparent'}`}
        >
          {/* Left Side: Logo & Mobile Menu */}
          <div className="flex items-center gap-4 flex-1">
            <button
              className="lg:hidden p-2 text-luxury-black/70 hover:text-black transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="flex flex-col items-center group pointer-events-auto transition-transform hover:scale-105 active:scale-95">
              <span className="text-xl md:text-2xl font-serif font-black tracking-tighter text-black">
                SAKSHI
              </span>
              <span className="text-[7px] font-bold tracking-[0.5em] text-gray-400 -mt-1 group-hover:text-black transition-colors">
                CLOTHING
              </span>
            </Link>
          </div>

          {/* Center: Desktop Nav Pill */}
          <div className="hidden lg:flex items-center relative bg-white/90 backdrop-blur-xl shadow-xl border border-gray-200/80 rounded-full p-1.5 shadow-black/10">
            {navLinks.map((link) => (
              <div
                key={link.name}
                onMouseEnter={() => {
                  setActiveDropdown(link.name);
                  setHoveredLink(link.name);
                }}
                onMouseLeave={() => {
                  setActiveDropdown(null);
                  setHoveredLink(null);
                }}
                className="relative"
              >
                <Link
                  to={link.path}
                  className={`relative z-10 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 ${hoveredLink === link.name ? 'text-white' : 'text-slate-900 hover:text-black'
                    }`}
                >
                  {link.name}
                  {link.mega && <ChevronDown size={10} className={`transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />}
                </Link>

                {/* Sliding Highlight Pill */}
                <AnimatePresence>
                  {hoveredLink === link.name && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-black rounded-full z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </AnimatePresence>

                {/* Mega Menu */}
                <AnimatePresence>
                  {activeDropdown === link.name && link.mega && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[850px] bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden p-10"
                    >
                      <div className="grid grid-cols-4 gap-10">
                        {link.mega.map((section) => (
                          <div key={section.title} className="space-y-6">
                            <div className="aspect-[4/5] rounded-[24px] overflow-hidden relative group cursor-pointer">
                              <img src={section.image} alt={section.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              <div className="absolute bottom-5 left-5">
                                <p className="text-white text-[11px] font-bold uppercase tracking-widest">{section.title}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center px-2">
                              <Link to={section.path || "/shop"} className="text-[13px] font-bold text-gray-800 hover:text-black transition-colors flex items-center group">
                                View Collection
                                <ArrowRight size={12} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                              </Link>
                            </div>
                          </div>
                        ))}
                        <div className="col-span-1 bg-gray-50 rounded-[32px] p-8 flex flex-col justify-between border border-gray-100">
                          <div className="space-y-4">
                            <h4 className="text-lg font-serif font-bold text-black leading-tight">Seasonal<br />Curations</h4>
                            <p className="text-[12px] text-gray-400 leading-relaxed font-medium">Explore the latest trends handpicked for your unique style.</p>
                          </div>
                          <Link to="/shop" className="group text-[11px] font-bold uppercase tracking-widest bg-black text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-accent transition-all duration-300">
                            Shop Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right Side: Icons & Auth */}
          <div className="flex items-center justify-end gap-2 md:gap-5 flex-1 shrink-0">
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 text-luxury-black/70 hover:text-black transition-colors"
              >
                <Search size={20} strokeWidth={2} />
              </motion.button>

              <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }} className="hidden sm:block">
                <Link to="/wishlist" className="p-2.5 text-luxury-black/70 hover:text-black transition-colors relative block">
                  <Heart size={20} strokeWidth={2} />
                  {wishlist.length > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </Link>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(true)}
                className="p-2.5 text-luxury-black/70 hover:text-black transition-colors relative"
              >
                <ShoppingBag size={20} strokeWidth={2} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1.5 right-1.5 bg-black text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <div className="h-4 w-px bg-black/10 mx-1 hidden lg:block" />

            <div className="hidden lg:block">
              {isSignedIn ? (
                <div className="flex items-center">
                  <CustomUserMenu />
                </div>
              ) : (
                <Link to="/login">
                  <button className="px-5 py-2.5 bg-black text-white rounded-full text-[11px] font-black uppercase tracking-[0.15em] hover:bg-accent transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-accent/20">
                    {t('nav.login')}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white lg:hidden"
          >
            <div className="flex flex-col h-full p-8">
              <div className="flex justify-between items-center mb-12">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-start group">
                  <span className="text-2xl font-serif font-bold tracking-tighter text-black">
                    SAKSHI
                  </span>
                  <span className="text-[7px] font-bold tracking-[0.5em] text-muted -mt-1 group-hover:text-black transition-colors">
                    CLOTHING
                  </span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow space-y-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border-b border-gray-100 pb-4"
                  >
                    <div className="flex justify-between items-center">
                      <Link
                        to={link.path}
                        className="text-3xl md:text-4xl font-serif font-bold text-black hover:text-gray-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                      {link.mega && link.mega.length > 0 && (
                        <button 
                          onClick={() => setMobileExpanded(mobileExpanded === link.name ? null : link.name)}
                          className="p-2 bg-gray-50 rounded-full"
                        >
                          <ChevronDown size={24} className={`transition-transform duration-300 ${mobileExpanded === link.name ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                    
                    {/* Mobile Subcategories Accordion */}
                    <AnimatePresence>
                      {mobileExpanded === link.name && link.mega && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4 pl-4 space-y-4 border-l-2 border-black/10"
                        >
                          {link.mega.map((sub: any) => (
                            <Link 
                              key={sub.title} 
                              to={sub.path} 
                              onClick={() => setIsMenuOpen(false)}
                              className="block text-lg font-bold text-gray-600 hover:text-black transition-colors"
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              <div className="pt-8 border-t border-gray-100">
                {!isSignedIn ? (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <button className="block w-full bg-luxury-black text-white text-center py-5 rounded-2xl font-bold uppercase tracking-widest">
                      Login
                    </button>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center overflow-hidden">
                         {user?.avatar?.url ? <img src={user.avatar.url} className="w-full h-full object-cover" /> : <span className="font-bold">{user?.fullName?.charAt(0)}</span>}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-black">{user?.fullName}</p>
                        <p className="text-[10px] text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 hover:text-black bg-white rounded-full shadow-sm"><User size={16} /></Link>
                      <button onClick={() => { logout(); setIsMenuOpen(false); }} className="p-2 text-red-500 hover:text-red-600 bg-white rounded-full shadow-sm"><LogOut size={16} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col p-8"
          >
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex justify-between items-center mb-20">
                <Link to="/" onClick={() => setIsSearchOpen(false)} className="flex flex-col items-start group">
                  <span className="text-2xl font-serif font-bold tracking-tighter text-black">
                    SAKSHI
                  </span>
                  <span className="text-[7px] font-bold tracking-[0.5em] text-muted -mt-1 group-hover:text-black transition-colors">
                    CLOTHING
                  </span>
                </Link>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-4 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={32} />
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-luxury-black py-6 text-4xl md:text-6xl font-serif focus:outline-none placeholder:text-gray-200"
                />
                <button type="submit" className="absolute right-0 bottom-6 text-luxury-black hover:text-accent transition-colors">
                  <Search size={48} />
                </button>
              </form>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-luxury-black/40">Trending Searches</h4>
                  <div className="flex flex-wrap gap-3">
                    {['Summer Edit', 'Silk Sarees', 'Linen', 'Wedding Guest'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                          navigate(`/shop?q=${tag}`);
                          setIsSearchOpen(false);
                        }}
                        className="px-6 py-3 bg-gray-50 hover:bg-luxury-black hover:text-white rounded-full text-xs font-bold transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
