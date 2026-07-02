import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, Heart, Search, ChevronDown, ArrowRight, Globe, Bell, Home, Grid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'motion/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const TopBar = () => {
  const [announcements, setAnnouncements] = useState<string[]>([
    "Free Shipping on orders over ₹2999" // Default fallback
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
        <div className="hidden md:flex items-center gap-4 opacity-60">
          <span className="flex items-center gap-1"><Globe size={10} /> IN / EN</span>
          <span className="flex items-center gap-1">INR ₹</span>
        </div>

        <div className="flex-grow text-center relative h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute"
            >
              {announcements[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="hidden md:flex items-center gap-4 opacity-60">
          <Link to="/track-order" className="hover:text-accent transition-colors">Track Order</Link>
          <Link to="/stores" className="hover:text-accent transition-colors">Find a Store</Link>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { setIsCartOpen, cart } = useCart();
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    {
      name: 'Women',
      path: '/category/Women',
      mega: [
        {
          title: 'Ethnic Wear',
          items: ['Sarees', 'Kurtas', 'Lehengas'],
          image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=500&auto=format&fit=crop'
        },
        {
          title: 'Western Wear',
          items: ['Dresses', 'Tops', 'Jeans'],
          image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=500&auto=format&fit=crop'
        },
        {
          title: 'Accessories',
          items: ['Handbags', 'Jewelry', 'Footwear'],
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=500&auto=format&fit=crop'
        }
      ]
    },
    {
      name: 'Men',
      path: '/category/Men',
      mega: [
        {
          title: 'Topwear',
          items: ['Shirts', 'T-Shirts', 'Jackets'],
          image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=500&auto=format&fit=crop'
        },
        {
          title: 'Bottomwear',
          items: ['Jeans', 'Trousers', 'Shorts'],
          image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=500&auto=format&fit=crop'
        },
        {
          title: 'Footwear',
          items: ['Sneakers', 'Formal Shoes', 'Loafers'],
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=500&auto=format&fit=crop'
        }
      ]
    },
    {
      name: 'Kids',
      path: '/category/Kids',
      mega: [
        {
          title: 'Boys',
          items: ['T-Shirts', 'Shirts', 'Jeans'],
          image: 'https://images.unsplash.com/photo-1519457431-7571f0182746?q=80&w=500&auto=format&fit=crop'
        },
        {
          title: 'Girls',
          items: ['Dresses', 'Tops', 'Skirts'],
          image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=500&auto=format&fit=crop'
        }
      ]
    },
    {
      name: 'Shop',
      path: '/shop'
    }
  ];

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
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none pt-6 md:pt-8">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto flex items-center justify-between px-6 md:px-10 h-16 md:h-20 rounded-full transition-all duration-700 ease-in-out ${isScrolled
              ? 'w-[95%] md:w-[85%] max-w-6xl bg-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] border border-black/5'
              : 'w-full max-w-7xl bg-transparent'
            } ${isScrolled ? 'glassmorphism' : ''}`}
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
          <div className="hidden lg:flex items-center relative bg-black/5 backdrop-blur-md rounded-full p-1.5 border border-black/5">
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
                  className={`relative z-10 px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 ${hoveredLink === link.name ? 'text-white' : 'text-luxury-black/70'
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
                            <ul className="space-y-4">
                              {section.items.map((item) => (
                                <li key={item}>
                                  <Link to="/shop" className="text-[13px] text-gray-500 hover:text-black transition-colors flex items-center group">
                                    {item}
                                    <ArrowRight size={12} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
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
              {user ? (
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                      {user.name[0]}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-black">{user.name.split(' ')[0]}</span>
                  </motion.button>
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-[32px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.15)] border border-gray-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                    <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Account</p>
                      <p className="text-sm font-serif font-black text-black truncate">{user.name}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-3.5 text-[12px] font-bold text-gray-600 hover:bg-gray-50 hover:text-black rounded-2xl transition-all">
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-3.5 text-[12px] font-bold text-gray-600 hover:bg-gray-50 hover:text-black rounded-2xl transition-all">
                        <ShoppingBag size={16} /> My Orders
                      </Link>
                      <div className="h-px bg-gray-100 mx-4 my-1" />
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-[12px] font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="px-7 py-3 bg-black text-white rounded-full text-[11px] font-black uppercase tracking-[0.15em] hover:bg-accent transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-accent/20">
                  Login
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
                  >
                    <Link
                      to={link.path}
                      className="text-4xl font-serif font-bold text-luxury-black hover:text-accent transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="pt-8 border-t border-gray-100">
                {!user ? (
                  <Link
                    to="/login"
                    className="block w-full bg-luxury-black text-white text-center py-5 rounded-2xl font-bold uppercase tracking-widest"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login / Sign Up
                  </Link>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-luxury-black">{user.name}</p>
                        <button onClick={logout} className="text-xs font-bold text-red-500">Logout</button>
                      </div>
                    </div>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="p-3 bg-gray-100 rounded-full">
                      <User size={20} />
                    </Link>
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
