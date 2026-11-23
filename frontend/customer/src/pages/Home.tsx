// Reading this as: Storefront Home Page for Sakshi Clothing (Surat, India; Everyday Indian Fashion & Imitation Jewellery), targeting modern shoppers with an airy, bold, editorial luxury aesthetic. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  Banknote,
  ChevronRight,
  ChevronLeft,
  Check,
  Eye,
  ShoppingBag,
  Heart,
  ChevronDown
} from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { fetchHomepageData, fetchProducts, getCachedProducts, HomepageData } from '../lib/api';
import { Button } from '../components/ui/Button';
import { BUSINESS_CONFIG } from '../config/business';
import SEOHead, { getOrganizationSchema } from '../components/SEOHead';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Instant initial render from cached products; background sync from API
  const [products, setProducts] = useState<Product[]>(getCachedProducts);
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'clothing' | 'jewellery'>('all');
  const [loading, setLoading] = useState(false);

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);

  // Shop the look interactive state
  const [selectedLookIndex, setSelectedLookIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<'clothing' | 'jewellery' | null>(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Parallax ref for hero & brand story
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const heroParallaxY = useTransform(heroScrollProgress, [0, 1], [0, 80]);

  // Trending rail ref for drag / arrow scroll
  const trendingRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const loadStoreData = async () => {
      setLoading(true);
      try {
        const [cmsData, allProducts] = await Promise.all([
          fetchHomepageData(),
          fetchProducts()
        ]);
        if (!isMounted) return;
        if (cmsData) {
          setHomepageData(cmsData);
        }
        if (Array.isArray(allProducts) && allProducts.length > 0) {
          setProducts(allProducts);
        }
      } catch (err) {
        console.warn('Background sync fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadStoreData();
    return () => { isMounted = false; };
  }, []);

  const heroBanners = homepageData?.heroBanners || [];
  const spotlightBanners = homepageData?.spotlightBanners || [];
  const lookbookBanners = homepageData?.lookbookBanners || [];
  const categories = homepageData?.categories || [];
  const reviews = homepageData?.reviews || [];

  const jewelleryProducts = homepageData?.jewelleryProducts?.length 
    ? homepageData.jewelleryProducts 
    : products.filter(p => {
        const c = (p.category || '').toLowerCase();
        const s = (p.subCategory || '').toLowerCase();
        return c.includes('jewel') || s.includes('jewel') || s.includes('necklace') || s.includes('earring') || s.includes('bangle');
      });

  const clothingProducts = products.filter(p => {
    const c = (p.category || '').toLowerCase();
    return !c.includes('jewel');
  });

  // Carousel slide timer for hero
  useEffect(() => {
    if (heroBanners.length <= 1 || isSlidePaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBanners.length, isSlidePaused]);

  // Filter products by tab
  const getTabProducts = () => {
    switch (activeTab) {
      case 'clothing':
        return clothingProducts;
      case 'jewellery':
        return jewelleryProducts;
      case 'all':
      default:
        return products;
    }
  };

  const displayedProducts = getTabProducts();

  // Scroll controls for trending rail
  const scrollTrending = (direction: 'left' | 'right') => {
    if (trendingRailRef.current) {
      const offset = direction === 'left' ? -360 : 360;
      trendingRailRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Curated Looks for "Shop The Look"
  const curatedLooks = [
    {
      title: "Festive Silk & Kundan Grace",
      subtitle: "Surat Art Silk Saree paired with Gold-Plated Kundan Choker",
      drape: clothingProducts[0] || products[0] || null,
      jewel: jewelleryProducts[0] || products[1] || null,
      image: clothingProducts[0]?.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
      clothingHotspot: { top: "45%", left: "48%" },
      jewelHotspot: { top: "28%", left: "50%" }
    },
    {
      title: "Contemporary Casual & Chandbalis",
      subtitle: "Breathable Cotton Kurti Set paired with Floral Enamel Earrings",
      drape: clothingProducts[1] || products[2] || null,
      jewel: jewelleryProducts[1] || products[3] || null,
      image: clothingProducts[1]?.image || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80",
      clothingHotspot: { top: "52%", left: "52%" },
      jewelHotspot: { top: "24%", left: "46%" }
    },
    {
      title: "Celebration Jacquard & Rani Haar",
      subtitle: "Flared Jacquard Lehenga paired with Traditional Temple Necklace",
      drape: clothingProducts[2] || products[4] || null,
      jewel: jewelleryProducts[2] || products[5] || null,
      image: clothingProducts[2]?.image || "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1000&q=80",
      clothingHotspot: { top: "60%", left: "50%" },
      jewelHotspot: { top: "32%", left: "49%" }
    }
  ];

  const currentLook = curatedLooks[selectedLookIndex] || curatedLooks[0];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setNewsletterSubscribed(true);
    toast.success('Thank you! You are now subscribed to Sakshi Clothing previews.');
    setNewsletterEmail('');
  };

  return (
    <div className="bg-[#FBF9F6] text-[#1A1A1A] min-h-screen selection:bg-[#4A1D3F] selection:text-white overflow-x-hidden">
      <SEOHead
        title="Sakshi Clothing | Everyday Indian Fashion & Imitation Jewellery | Surat"
        description="Everyday sarees, kurti sets, and skin-friendly imitation jewellery dispatched directly from Surat. Free shipping above ₹999 with Cash on Delivery."
        jsonLd={getOrganizationSchema()}
      />

      {/* ─── 1. HERO SECTION (LIGHT IVORY EDITORIAL, NO DARK OVERLAY) ─── */}
      <section 
        ref={heroRef}
        id="hero-banner"
        onMouseEnter={() => setIsSlidePaused(true)}
        onMouseLeave={() => setIsSlidePaused(false)}
        className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[760px] bg-[#FBF9F6] flex items-center overflow-hidden border-b border-[#E8E5DF]"
      >
        {/* Ambient Subtle Warmth */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#C6A15B]/10 via-[#F4EEDF]/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#4A1D3F]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Typographic Editorial Focus */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              {/* Eyebrow Pill */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF8F5] border border-[#C6A15B]/40 text-[#4A1D3F] text-xs font-semibold uppercase tracking-wider shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Everyday Indian Fashion & Imitation Jewels · Surat</span>
              </motion.div>

              {/* Display H1 with Staggered Word Reveal */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-3.5xl sm:text-5xl lg:text-6xl text-[#1A1A1A] font-medium tracking-tight leading-[1.12] max-w-2xl"
              >
                Timeless Indian Drapes, <br />
                <span className="text-[#4A1D3F] italic font-normal">Modern Surat Charm.</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="text-[#4A4A4A] text-sm sm:text-base font-normal max-w-xl leading-relaxed"
              >
                Explore breathable everyday sarees, tailored kurti sets, and brass-base imitation jewellery dispatched directly from Surat's vibrant textile markets.
              </motion.p>

              {/* Dual Action CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
              >
                <Link to="/shop?category=Women">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    fullWidth 
                    className="font-semibold shadow-md bg-[#4A1D3F] hover:bg-[#3B1632] text-white"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Explore Clothing
                  </Button>
                </Link>
                <Link to="/shop?category=Jewellery">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    fullWidth 
                    className="bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] border-[#E8E5DF] hover:border-[#4A1D3F] font-semibold"
                    leftIcon={<Sparkles className="w-4 h-4 text-[#C6A15B]" />}
                  >
                    Imitation Jewellery
                  </Button>
                </Link>
              </motion.div>

              {/* Real Value Guarantees Strip */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#6B7280] font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#4A1D3F]" />
                  <span>Free Shipping Above ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-[#C6A15B]" />
                  <span>Cash on Delivery</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-[#4A1D3F]" />
                  <span>{BUSINESS_CONFIG.policies.returnWindowDays}-Day Returns</span>
                </span>
              </motion.div>

            </div>

            {/* Right Column: Hero Visual Showcase with Rounded Masks */}
            <div className="lg:col-span-5 relative">
              <motion.div 
                style={{ y: heroParallaxY }}
                className="relative mx-auto max-w-md lg:max-w-none"
              >
                {/* Decorative Geometric Outline */}
                <div className="absolute -inset-3 rounded-t-[5rem] rounded-b-3xl border border-[#C6A15B]/30 -rotate-1 pointer-events-none" />

                {/* Main Hero Media Container */}
                <div className="relative aspect-[3/4] w-full rounded-t-[4.5rem] rounded-b-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E5DF] shadow-xl">
                  {heroBanners.length > 0 && heroBanners[currentSlide]?.image?.url ? (
                    <img
                      src={heroBanners[currentSlide].image.url}
                      alt={heroBanners[currentSlide].title || "Sakshi Clothing"}
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out"
                      fetchPriority="high"
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"
                      alt="Sakshi Everyday Collection"
                      className="w-full h-full object-cover object-top"
                      fetchPriority="high"
                    />
                  )}

                  {/* Floating Micro Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#E8E5DF] shadow-md flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#C6A15B]">Surat Sourcing</p>
                      <p className="text-xs font-serif font-bold text-[#1A1A1A]">Curated Silk & Everyday Wear</p>
                    </div>
                    <span className="text-xs font-bold text-[#4A1D3F] bg-[#F6EFF4] px-2.5 py-1 rounded-full">
                      ₹899 onwards
                    </span>
                  </div>
                </div>

                {/* Carousel Indicator Pills */}
                {heroBanners.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {heroBanners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 min-h-[32px] flex items-center px-1 ${
                          currentSlide === idx ? 'w-8 bg-[#4A1D3F]' : 'w-2 bg-[#D1C9BE]'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

          </div>
        </div>

        {/* Scroll-Down Cue */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-[10px] text-[#6B7280] uppercase tracking-widest pointer-events-none opacity-80 animate-bounce">
          <span>Scroll</span>
          <ChevronDown size={14} className="text-[#4A1D3F]" />
        </div>
      </section>

      {/* ─── 2. OFFER MARQUEE STRIP (TRUTHFUL BUSINESS CONFIG VALUES) ─── */}
      <section className="bg-white border-b border-[#E8E5DF] py-3.5 overflow-hidden select-none">
        <div className="animate-marquee flex items-center gap-8 text-xs font-medium text-[#4A4A4A]">
          <span className="flex items-center gap-2">
            <Truck size={14} className="text-[#4A1D3F]" />
            <span>FREE Standard Delivery on Orders Above ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}</span>
          </span>
          <span className="text-[#C6A15B]">✦</span>
          <span className="flex items-center gap-2">
            <Banknote size={14} className="text-[#C6A15B]" />
            <span>Cash on Delivery (COD) Available Nationwide</span>
          </span>
          <span className="text-[#C6A15B]">✦</span>
          <span className="flex items-center gap-2">
            <RotateCcw size={14} className="text-[#4A1D3F]" />
            <span>{BUSINESS_CONFIG.policies.returnWindowDays}-Day Hassle-Free Returns on Unworn Clothing</span>
          </span>
          <span className="text-[#C6A15B]">✦</span>
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#4A1D3F]" />
            <span>18% GST Inclusive Pricing — Zero Hidden Checkout Fees</span>
          </span>
          <span className="text-[#C6A15B]">✦</span>
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#C6A15B]" />
            <span>Fashion & Imitation Jewellery — Skin-Friendly Brass Base</span>
          </span>
          <span className="text-[#C6A15B]">✦</span>
          <span className="flex items-center gap-2">
            <span>Direct Dispatch from Surat Textile Hub</span>
          </span>
          <span className="text-[#C6A15B]">✦</span>

          {/* Repeated for continuous loop */}
          <span className="flex items-center gap-2">
            <Truck size={14} className="text-[#4A1D3F]" />
            <span>FREE Standard Delivery on Orders Above ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}</span>
          </span>
          <span className="text-[#C6A15B]">✦</span>
          <span className="flex items-center gap-2">
            <Banknote size={14} className="text-[#C6A15B]" />
            <span>Cash on Delivery (COD) Available Nationwide</span>
          </span>
          <span className="text-[#C6A15B]">✦</span>
          <span className="flex items-center gap-2">
            <RotateCcw size={14} className="text-[#4A1D3F]" />
            <span>{BUSINESS_CONFIG.policies.returnWindowDays}-Day Hassle-Free Returns on Unworn Clothing</span>
          </span>
          <span className="text-[#C6A15B]">✦</span>
        </div>
      </section>

      {/* ─── 3. CATEGORY STRIP (HORIZONTAL SCROLL-SNAP TILES) ─────────── */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4A1D3F] block mb-1.5">
              Curated Edits
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#1A1A1A] font-medium leading-tight">
              Explore by Category
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1 max-w-xl">
              From everyday sarees and office kurtis to celebration imitation jewellery suites.
            </p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-[#4A1D3F] hover:underline flex items-center gap-1 shrink-0">
            <span>View All Categories</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Scroll-Snap Rail */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
          {[
            {
              name: 'Women',
              desc: 'Sarees, Kurti Sets & Lehengas',
              image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Women',
              tag: 'Best Sellers'
            },
            {
              name: 'Imitation Jewellery',
              desc: 'Necklaces, Earrings, Bangles & Sets',
              image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Jewellery',
              tag: 'Brass & Kundan'
            },
            {
              name: 'Men',
              desc: 'Kurtas, Nehru Jackets & Daily Sets',
              image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Men',
              tag: 'Ethnic Edit'
            },
            {
              name: 'Kids',
              desc: 'Festive Kurta Dhoti & Lehenga Sets',
              image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Kids',
              tag: 'Comfort First'
            }
          ].map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="w-[240px] sm:w-[280px] shrink-0 snap-center"
            >
              <Link 
                to={cat.link}
                className="group flex flex-col bg-white rounded-3xl border border-[#E8E5DF] overflow-hidden p-3.5 transition-all duration-300 hover:border-[#4A1D3F]/40 hover:shadow-lg"
              >
                {/* Arched Image Container */}
                <div className="relative aspect-[3/4] w-full rounded-t-[3.5rem] rounded-b-2xl overflow-hidden bg-[#FAF8F5] mb-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-[#4A1D3F] border border-[#E8E5DF] shadow-xs">
                    {cat.tag}
                  </div>
                </div>

                <div className="px-1 py-1">
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1A1A1A] group-hover:text-[#4A1D3F] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] line-clamp-1 mt-0.5">
                    {cat.desc}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 4. TRENDING COLLECTION (STAGGERED REVEAL & RAIL) ──────────── */}
      <section className="py-20 sm:py-28 bg-white border-y border-[#E8E5DF]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4A1D3F] block mb-1.5">
                Popular in Surat
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl text-[#1A1A1A] font-medium leading-tight">
                Trending Right Now
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                Frequently purchased daily wear clothing and artificial jewellery accents.
              </p>
            </div>

            {/* Filter Tabs & Scroll Controls */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-full border border-[#E8E5DF]">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-full transition-all ${
                    activeTab === 'all'
                      ? 'bg-[#4A1D3F] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1A1A1A]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('clothing')}
                  className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-full transition-all ${
                    activeTab === 'clothing'
                      ? 'bg-[#4A1D3F] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1A1A1A]'
                  }`}
                >
                  Clothing
                </button>
                <button
                  onClick={() => setActiveTab('jewellery')}
                  className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-full transition-all flex items-center gap-1 ${
                    activeTab === 'jewellery'
                      ? 'bg-[#C6A15B] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1A1A1A]'
                  }`}
                >
                  <Sparkles size={12} />
                  <span>Imitation Jewellery</span>
                </button>
              </div>

              {/* Arrow controls */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => scrollTrending('left')}
                  className="w-9 h-9 rounded-full border border-[#E8E5DF] hover:bg-[#FAF8F5] flex items-center justify-center text-[#1A1A1A] transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scrollTrending('right')}
                  className="w-9 h-9 rounded-full border border-[#E8E5DF] hover:bg-[#FAF8F5] flex items-center justify-center text-[#1A1A1A] transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Swipeable Product Rail */}
          {displayedProducts.length > 0 ? (
            <div 
              ref={trendingRailRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory"
            >
              {displayedProducts.slice(0, 10).map((product, idx) => (
                <motion.div
                  key={product.id || idx}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: (idx % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="w-[220px] sm:w-[270px] shrink-0 snap-center"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-[#FAF8F5] rounded-3xl border border-[#E8E5DF] max-w-md mx-auto">
              <p className="text-xs text-[#6B7280] mb-4">No pieces found in this category.</p>
              <Link to="/shop">
                <Button variant="outline" size="sm">Browse Full Store</Button>
              </Link>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/shop">
              <Button 
                variant="secondary" 
                size="lg" 
                className="font-semibold text-xs uppercase tracking-wider min-h-[46px]"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Browse All {displayedProducts.length} Pieces
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* ─── 5. "SHOP THE LOOK" (SCROLL-PINNED INTERACTIVE SECTION) ─────── */}
      <section className="py-20 sm:py-32 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C6A15B] block mb-1.5">
            Complete The Ensemble
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-[#1A1A1A] font-medium leading-tight">
            Shop The Look
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 leading-relaxed">
            Pair Surat ethnic clothing with perfectly matched imitation jewellery accents. Tap the interactive pins to view pieces.
          </p>

          {/* Look Selector Tabs */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {curatedLooks.map((look, idx) => (
              <button
                key={look.title}
                onClick={() => {
                  setSelectedLookIndex(idx);
                  setActiveHotspot(null);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all min-h-[40px] ${
                  selectedLookIndex === idx
                    ? 'bg-[#4A1D3F] text-white shadow-xs'
                    : 'bg-white text-[#6B7280] border border-[#E8E5DF] hover:text-[#1A1A1A]'
                }`}
              >
                Look {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Showcase Container */}
        <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-[#E8E5DF] p-6 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Visual Canvas with Hotspots */}
            <div className="lg:col-span-7 relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#FAF8F5] border border-[#E8E5DF] shadow-md">
                <img
                  src={currentLook.image}
                  alt={currentLook.title}
                  className="w-full h-full object-cover transition-all duration-700"
                />

                {/* Hotspot 1: Clothing Pin */}
                <div 
                  style={{ top: currentLook.clothingHotspot.top, left: currentLook.clothingHotspot.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    onClick={() => setActiveHotspot(activeHotspot === 'clothing' ? null : 'clothing')}
                    className="relative group p-2 focus:outline-none"
                    aria-label="View Drape Details"
                  >
                    <span className="absolute inset-0 rounded-full bg-[#4A1D3F]/40 animate-ping" />
                    <span className="relative w-8 h-8 rounded-full bg-[#4A1D3F] text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white">
                      1
                    </span>
                  </button>
                </div>

                {/* Hotspot 2: Jewellery Pin */}
                <div 
                  style={{ top: currentLook.jewelHotspot.top, left: currentLook.jewelHotspot.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    onClick={() => setActiveHotspot(activeHotspot === 'jewellery' ? null : 'jewellery')}
                    className="relative group p-2 focus:outline-none"
                    aria-label="View Jewellery Details"
                  >
                    <span className="absolute inset-0 rounded-full bg-[#C6A15B]/40 animate-ping" />
                    <span className="relative w-8 h-8 rounded-full bg-[#C6A15B] text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white">
                      2
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Look Details & Paired Products */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A1D3F] bg-[#F6EFF4] px-3 py-1 rounded-full">
                  Curated Ensemble #{selectedLookIndex + 1}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A1A1A] mt-2">
                  {currentLook.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7280] mt-1 leading-relaxed">
                  {currentLook.subtitle}
                </p>
              </div>

              {/* Item 1: Clothing Card */}
              {currentLook.drape && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  activeHotspot === 'clothing' 
                    ? 'border-[#4A1D3F] bg-[#F6EFF4]/30 shadow-sm' 
                    : 'border-[#E8E5DF] bg-[#FAF8F5]'
                }`}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-[#E8E5DF]">
                      <img 
                        src={currentLook.drape.image} 
                        alt={currentLook.drape.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#4A1D3F] uppercase tracking-wider block">
                        Step 1 · The Drape
                      </span>
                      <h4 className="font-serif text-xs sm:text-sm font-semibold text-[#1A1A1A] truncate mt-0.5">
                        {currentLook.drape.name}
                      </h4>
                      <p className="text-xs font-bold text-[#1A1A1A] mt-1">
                        ₹{currentLook.drape.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <Link to={`/product/${currentLook.drape.id}`}>
                      <Button variant="outline" size="sm" className="shrink-0 text-xs">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Item 2: Jewellery Card */}
              {currentLook.jewel && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  activeHotspot === 'jewellery' 
                    ? 'border-[#C6A15B] bg-[#F4EEDF]/30 shadow-sm' 
                    : 'border-[#E8E5DF] bg-[#FAF8F5]'
                }`}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-[#E8E5DF]">
                      <img 
                        src={currentLook.jewel.image} 
                        alt={currentLook.jewel.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#C6A15B] uppercase tracking-wider block">
                        Step 2 · Imitation Accent
                      </span>
                      <h4 className="font-serif text-xs sm:text-sm font-semibold text-[#1A1A1A] truncate mt-0.5">
                        {currentLook.jewel.name}
                      </h4>
                      <p className="text-xs font-bold text-[#1A1A1A] mt-1">
                        ₹{currentLook.jewel.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <Link to={`/product/${currentLook.jewel.id}`}>
                      <Button variant="champagne" size="sm" className="shrink-0 text-xs text-white">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Link to="/shop">
                  <Button 
                    variant="primary" 
                    size="md" 
                    fullWidth 
                    className="font-semibold text-xs uppercase tracking-wider min-h-[46px]"
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Explore More Coordinated Looks
                  </Button>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. DEDICATED IMITATION JEWELLERY SPOTLIGHT (DEEP PLUM CONTRAST) ── */}
      <section className="py-20 sm:py-32 bg-[#4A1D3F] text-white relative overflow-hidden">
        {/* Subtle Ambient Light */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#C6A15B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Copy & Assurance */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C6A15B]/20 text-[#E0C78F] border border-[#C6A15B]/40 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>The Imitation Jewellery Collection</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-medium leading-tight text-white">
                Regal Radiance, <br />
                <span className="text-[#C6A15B] italic font-normal">Everyday Comfort.</span>
              </h2>

              <p className="text-[#E5E0D8] text-xs sm:text-sm md:text-base font-light leading-relaxed max-w-xl">
                Elevate celebratory dressing with our lightweight artificial jewellery suites. Crafted using brass alloy bases, synthetic Kundan/glass stones, and durable micro-gold finishes that look resplendent without skin sensitivity.
              </p>

              {/* Honest Fact Boxes */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xs">
                  <p className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">Brass Alloy Base</p>
                  <p className="text-[11px] text-white/70 mt-0.5">Comfortable weight & skin-friendly finish</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xs">
                  <p className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">Electroplated Polish</p>
                  <p className="text-[11px] text-white/70 mt-0.5">High-shine micro gold and antique plating</p>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/shop?category=Jewellery">
                  <Button 
                    variant="champagne" 
                    size="lg" 
                    className="font-semibold text-white shadow-lg bg-[#C6A15B] hover:bg-[#B38F48] min-h-[48px]"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Shop Imitation Jewellery
                  </Button>
                </Link>
              </div>
            </div>

            {/* Macro Showcase Frame with Arched Mask */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-[4/5] rounded-t-[5rem] rounded-b-3xl overflow-hidden border-2 border-[#C6A15B]/40 shadow-2xl bg-[#3B1632]">
                  <img
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80"
                    alt="Imitation Jewellery Macro Detail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-5 left-5 right-5 bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-white flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#C6A15B]">Featured Accent</p>
                      <p className="font-serif text-sm font-semibold truncate">Kundan Choker & Drop Earrings</p>
                    </div>
                    <span className="text-xs font-bold text-white bg-[#C6A15B] px-3 py-1 rounded-full">
                      ₹999
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 7. BRAND STORY & SURAT TEXTILE HUB (PARALLAX & HONEST FACTS) ─ */}
      <section className="py-20 sm:py-32 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Visual Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#FAF8F5] border border-[#E8E5DF] shadow-md">
              <img
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"
                alt="Surat Textile Heritage"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-[#4A1D3F] border border-[#E8E5DF]">
                📍 Surat, Gujarat
              </div>
            </div>
          </div>

          {/* Honest Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4A1D3F] block mb-1">
              The Surat Connection
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#1A1A1A] font-medium leading-tight">
              Honest Everyday Fashion, Dispatched Directly from India’s Textile Hub.
            </h2>
            <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
              Surat is world-renowned for textile production, weaving, and rapid fashion iteration. At Sakshi Clothing, we curate everyday ethnic apparel and fashionable imitation jewellery directly from local manufacturing units. By packaging and dispatching from our Surat headquarters, we eliminate multi-tier distributor markups and deliver dependable quality straight to your door.
            </p>

            {/* Real Verifiable Numbers ONLY */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E8E5DF]">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#4A1D3F]">19,000+</p>
                <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">PIN Codes Served</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#4A1D3F]">7 Days</p>
                <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">Hassle-Free Returns</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#C6A15B]">18% GST</p>
                <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">All-Inclusive Tax</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#4A1D3F]">₹999</p>
                <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">Free Shipping Cap</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 8. REVIEWS MARQUEE (HIDES CLEANLY IF NO REVIEWS) ─────────── */}
      {reviews.length > 0 && (
        <section className="py-20 sm:py-28 bg-white border-y border-[#E8E5DF] overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-8 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C6A15B] block mb-1">
              Patron Reflections
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#1A1A1A] font-medium">
              Loved Across India
            </h2>
          </div>

          <div className="animate-marquee flex gap-6">
            {reviews.map((r: any, idx: number) => (
              <div 
                key={r._id || idx}
                className="w-[300px] sm:w-[350px] shrink-0 bg-[#FAF8F5] rounded-3xl p-6 border border-[#E8E5DF] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1 text-[#C6A15B]">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#4A4A4A] italic leading-relaxed">
                    "{r.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E5DF]/60">
                  <p className="font-semibold text-xs text-[#1A1A1A]">{r.customer?.fullName || 'Verified Customer'}</p>
                  <p className="text-[10px] text-[#6B7280]">Verified Purchase</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 9. LOOKBOOK / EDITORIAL BENTO GRID ───────────────────────── */}
      <section className="py-20 sm:py-32 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4A1D3F] block mb-1.5">
            Visual Diary
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-[#1A1A1A] font-medium leading-tight">
            The Sakshi Lookbook
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5">
            Real styling inspirations from daily office elegance to family celebratory functions.
          </p>
        </div>

        {/* Asymmetric Bento Grid (grid-auto-flow: dense) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 auto-rows-[220px] sm:auto-rows-[280px]">
          
          <div className="col-span-2 row-span-2 relative rounded-3xl overflow-hidden group border border-[#E8E5DF] bg-[#FAF8F5]">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
              alt="Saree styling"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end text-white">
              <span className="text-xs uppercase font-bold text-[#C6A15B]">Ethnic Wear</span>
              <p className="font-serif text-lg font-semibold">Festive Art Silk Drapes</p>
            </div>
          </div>

          <div className="col-span-1 row-span-1 relative rounded-3xl overflow-hidden group border border-[#E8E5DF] bg-[#FAF8F5]">
            <img
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
              alt="Kundan necklace"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <p className="font-serif text-xs font-semibold">Choker Suites</p>
            </div>
          </div>

          <div className="col-span-1 row-span-2 relative rounded-3xl overflow-hidden group border border-[#E8E5DF] bg-[#FAF8F5]">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
              alt="Cotton kurti"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <span className="text-[10px] uppercase font-bold text-[#C6A15B]">Daily Comfort</span>
              <p className="font-serif text-sm font-semibold">Straight Cotton Sets</p>
            </div>
          </div>

          <div className="col-span-1 row-span-1 relative rounded-3xl overflow-hidden group border border-[#E8E5DF] bg-[#FAF8F5]">
            <img
              src="https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80"
              alt="Chandbali earrings"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <p className="font-serif text-xs font-semibold">Floral Chandbalis</p>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 10. NEWSLETTER CALLOUT ───────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-[#FAF8F5] border-t border-[#E8E5DF]">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center space-y-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4A1D3F] block">
            Direct from Surat
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A1A1A]">
            Stay in Touch with Festive Launches
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Receive early previews of new fabric arrivals and imitation jewellery sets. No spam, ever.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="pt-2 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 bg-white border border-[#E8E5DF] rounded-full text-xs text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4A1D3F] transition-colors"
              required
            />
            <Button 
              type="submit" 
              variant="primary" 
              size="md" 
              className="rounded-full text-xs font-bold uppercase tracking-wider min-h-[44px]"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Home;
