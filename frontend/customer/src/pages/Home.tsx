// Reading this as: Storefront Home Page for Sakshi Clothing (Indian ethnic fashion & artificial jewellery), targeting women 18-40, with clean, bright, youthful editorial luxury. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  ChevronRight,
  Banknote,
  Heart,
  CheckCircle2,
  Gem
} from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { fetchProducts, fetchFeaturedProducts, fetchNewArrivals, getCachedProducts, getCachedFeatured, getCachedNewArrivals } from '../lib/api';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Instant 0ms startup from cached dataset with live background refresh
  const [products, setProducts] = useState<Product[]>(getCachedProducts);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(getCachedFeatured);
  const [newArrivals, setNewArrivals] = useState<Product[]>(getCachedNewArrivals);
  const [activeTab, setActiveTab] = useState<'all' | 'clothing' | 'jewellery'>('all');
  const [loading, setLoading] = useState(false);

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);

  const heroSlides = [
    {
      id: 1,
      eyebrow: "Festive & Wedding Collection 2026",
      title: "Timeless Indian Silhouettes, Modern Grace",
      subtitle: "Handcrafted Sarees, Designer Lehengas & Artisanal Kurti Ensembles tailored in Surat with pure handloom aesthetics.",
      image: "https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=2000&auto=format&fit=crop",
      primaryCta: "Shop Ethnic Clothing",
      primaryLink: "/shop?category=Women",
      secondaryCta: "Explore Imitation Jewellery",
      secondaryLink: "/shop?category=Jewellery",
      offerTag: "FREE Express Shipping on ₹999+"
    },
    {
      id: 2,
      eyebrow: "Curated Artificial & Fashion Jewellery",
      title: "Artisanal Imitation Jewellery That Shines With You",
      subtitle: "Hypoallergenic, skin-friendly brass choker sets, regal jhumkas, and kada bangles designed to elevate your festive look.",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2000&auto=format&fit=crop",
      primaryCta: "Discover Jewellery",
      primaryLink: "/shop?category=Jewellery",
      secondaryCta: "View Festive Sarees",
      secondaryLink: "/shop?category=Women&sub=Heritage Sarees",
      offerTag: "100% Skin-Friendly Brass & Plating"
    },
    {
      id: 3,
      eyebrow: "Everyday & Occasion Kurta Sets",
      title: "Effortless Elegance for the Contemporary Woman",
      subtitle: "Bespoke Anarkalis, breathable cotton silks, and versatile co-ord sets crafted for weddings, pujas, and celebrations.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2000&auto=format&fit=crop",
      primaryCta: "Shop New Arrivals",
      primaryLink: "/shop?sort=newest",
      secondaryCta: "Browse All Collections",
      secondaryLink: "/shop",
      offerTag: "Cash on Delivery Available"
    }
  ];

  useEffect(() => {
    if (isSlidePaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroSlides.length, isSlidePaused]);

  useEffect(() => {
    let isMounted = true;
    const loadStoreData = async () => {
      try {
        const [all, feat, arrivals] = await Promise.all([
          fetchProducts(),
          fetchFeaturedProducts(),
          fetchNewArrivals()
        ]);
        if (!isMounted) return;
        if (all && all.length > 0) setProducts(all);
        if (feat && feat.length > 0) setFeaturedProducts(feat);
        if (arrivals && arrivals.length > 0) setNewArrivals(arrivals);
      } catch (err) {
        console.warn('Background sync fallback to cache:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadStoreData();
    return () => { isMounted = false; };
  }, []);

  // Filter products by tab
  const getTabProducts = () => {
    switch (activeTab) {
      case 'clothing':
        return products.filter((p) => {
          const cat = (p.category || '').toLowerCase();
          return cat !== 'jewellery' && !cat.includes('jewel');
        });
      case 'jewellery':
        return products.filter((p) => {
          const cat = (p.category || '').toLowerCase();
          const sub = (p.subCategory || '').toLowerCase();
          return cat === 'jewellery' || cat.includes('jewel') || sub.includes('jewel');
        });
      case 'all':
      default:
        return products;
    }
  };

  const displayedProducts = getTabProducts();

  // Curated Visual Category Tiles
  const categoryTiles = [
    {
      title: "Heritage Sarees",
      subtitle: "Banarasi & Chanderi Drapes",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
      link: "/shop?category=Women&sub=Heritage Sarees",
      isJewellery: false,
    },
    {
      title: "Bridal & Party Lehengas",
      subtitle: "Opulent Volume & Gota Patti",
      image: "https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=800&auto=format&fit=crop",
      link: "/shop?category=Women&sub=Bridal Lehengas",
      isJewellery: false,
    },
    {
      title: "Kurtis & Suits",
      subtitle: "Everyday & Festive Sets",
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
      link: "/shop?category=Women&sub=Artisanal Sets",
      isJewellery: false,
    },
    {
      title: "Imitation Choker Sets",
      subtitle: "Skin-Safe Brass & Faux Stones",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
      link: "/shop?category=Jewellery",
      isJewellery: true,
    },
    {
      title: "Jhumkas & Earrings",
      subtitle: "Chandbalis & Meenakari",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop",
      link: "/shop?category=Jewellery",
      isJewellery: true,
    },
    {
      title: "Festive Co-ord Sets",
      subtitle: "Contemporary Indo-Western",
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
      link: "/shop?category=Women",
      isJewellery: false,
    }
  ];

  // Verified Customer Testimonials
  const testimonials = [
    {
      name: "Pooja Trivedi",
      city: "Ahmedabad",
      rating: 5,
      review: "The Kadwa Banarasi Saree was breathtaking for my sister's wedding. The zari work is exquisite and the fabric feels truly royal. Express delivery arrived in just 2 days!",
      item: "The Maharani Katan Silk Saree",
    },
    {
      name: "Ananya Deshmukh",
      city: "Pune",
      rating: 5,
      review: "I was skeptical ordering imitation jewellery online, but the Polki Choker set blew me away! The finish is subtle and skin-friendly without any irritation. 10/10 recommend.",
      item: "The Kohinoor Polki Imitation Choker Suite",
    },
    {
      name: "Rhea Sen",
      city: "Bangalore",
      rating: 5,
      review: "The fit of the Anarkali set was perfect right out of the box. Cash on delivery was seamless and the packaging felt like unboxing a boutique luxury package.",
      item: "The Chandni Hand-Embroidered Anarkali",
    }
  ];

  return (
    <div className="bg-[#FBF9F6] text-[#1A1A1A] min-h-screen">
      
      {/* ─── 1. HERO CAROUSEL BANNER ─────────────────────────────────── */}
      <section 
        id="hero-banner"
        onMouseEnter={() => setIsSlidePaused(true)}
        onMouseLeave={() => setIsSlidePaused(false)}
        className="relative w-full min-h-[560px] sm:min-h-[640px] lg:min-h-[740px] bg-[#1A1A1A] text-white flex items-center overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <img
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].title}
              className="w-full h-full object-cover object-center opacity-55"
              fetchPriority="high"
            />
            {/* Elegant multi-stop gradients for maximum readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </motion.div>
        </AnimatePresence>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full py-16 sm:py-24">
          <div className="max-w-2xl space-y-4 sm:space-y-6">
            
            {/* Offer Pill */}
            <motion.div
              key={`pill-${currentSlide}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4A1D3F]/90 backdrop-blur-md text-[#C6A15B] border border-[#C6A15B]/30 text-xs font-semibold uppercase tracking-wider shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{heroSlides[currentSlide].offerTag}</span>
            </motion.div>

            {/* Split H1 Headline */}
            <motion.h1
              key={`h1-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-medium tracking-tight leading-[1.12]"
            >
              {heroSlides[currentSlide].title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              key={`sub-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[#E5E0D8] text-sm sm:text-base font-light max-w-xl leading-relaxed"
            >
              {heroSlides[currentSlide].subtitle}
            </motion.p>

            {/* Responsive Dual Action CTAs */}
            <motion.div
              key={`cta-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
            >
              <Link to={heroSlides[currentSlide].primaryLink}>
                <Button 
                  variant="champagne" 
                  size="lg" 
                  fullWidth 
                  className="font-semibold shadow-lg text-[#1A1A1A]"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {heroSlides[currentSlide].primaryCta}
                </Button>
              </Link>
              <Link to={heroSlides[currentSlide].secondaryLink}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  fullWidth 
                  className="bg-white/10 hover:bg-white text-white hover:text-[#1A1A1A] border-white/30 font-semibold"
                >
                  {heroSlides[currentSlide].secondaryCta}
                </Button>
              </Link>
            </motion.div>

            {/* Value Check Strip */}
            <div className="pt-2 flex items-center gap-4 text-xs text-white/80 font-medium">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#C6A15B]" />
                <span>Free Express Shipping</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-[#C6A15B]" />
                <span>COD Available</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-[#C6A15B]" />
                <span>7-Day Returns</span>
              </span>
            </div>

          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroSlides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 min-h-[44px] flex items-center px-1 ${
                currentSlide === idx ? 'w-8 bg-[#C6A15B]' : 'w-3 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ─── 2. TRUST VALUE PROPOSITIONS BAR ─────────────────────────── */}
      <section className="bg-white border-y border-[#E8E5DF] py-6 sm:py-8 shadow-xs">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F6EFF4] flex items-center justify-center shrink-0 text-[#4A1D3F]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">Free Shipping</h4>
                <p className="text-[11px] text-[#6B7280]">On all orders above ₹999 across India</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F4EEDF] flex items-center justify-center shrink-0 text-[#C6A15B]">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">Cash on Delivery</h4>
                <p className="text-[11px] text-[#6B7280]">Pay at your doorstep anywhere in India</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F6EFF4] flex items-center justify-center shrink-0 text-[#4A1D3F]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">7-Day Easy Returns</h4>
                <p className="text-[11px] text-[#6B7280]">Hassle-free size exchange & returns</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F4EEDF] flex items-center justify-center shrink-0 text-[#C6A15B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">Skin-Safe Imitation</h4>
                <p className="text-[11px] text-[#6B7280]">Lead-free hypoallergenic jewellery polish</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. CATEGORY TILES EXPLORER ───────────────────────────────── */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading
          eyebrow="Curated Edits"
          title="Explore by Category"
          subtitle="Discover handcrafted Indian ethnic wear and stunning artificial jewellery created for celebratory moments."
          actionHref="/shop"
          actionText="View All Collections"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-5">
          {categoryTiles.map((cat) => (
            <Link
              key={cat.title}
              to={cat.link}
              className="group flex flex-col bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden p-3 transition-all duration-300 hover:border-[#4A1D3F]/40 hover:shadow-md"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF8F5] mb-2.5">
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {cat.isJewellery && (
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider text-[#C6A15B] border border-[#C6A15B]/30 shadow-xs">
                    Imitation
                  </span>
                )}
              </div>
              <h3 className="font-serif text-xs sm:text-sm font-medium text-[#1A1A1A] group-hover:text-[#4A1D3F] transition-colors line-clamp-1">
                {cat.title}
              </h3>
              <p className="text-[10px] text-[#6B7280] truncate mt-0.5">
                {cat.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 4. TRENDING COLLECTION (TABBED: ALL / CLOTHING / JEWELLERY) ── */}
      <section className="py-16 sm:py-24 bg-white border-y border-[#E8E5DF]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4A1D3F] block mb-1.5">
                Trending Right Now
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl text-[#1A1A1A] font-medium leading-tight">
                Our Most Loved Creations
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                Handpicked bestselling silhouettes and artificial jewellery suites.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-full border border-[#E8E5DF] self-start md:self-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-full transition-all ${
                  activeTab === 'all'
                    ? 'bg-[#4A1D3F] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1A1A1A]'
                }`}
              >
                All Pieces
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
                <Sparkles className="w-3 h-3" />
                <span>Imitation Jewellery</span>
              </button>
            </div>
          </div>

          {/* Product Grid: 2 columns on mobile, 4 columns on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/shop">
              <Button 
                variant="secondary" 
                size="lg" 
                className="font-semibold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Explore All Products
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* ─── 5. DEDICATED IMITATION JEWELLERY SPOTLIGHT ─────────────────── */}
      <section className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#E8E5DF] overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          
          <div className="bg-gradient-to-br from-[#2D1627] via-[#3B1A34] to-[#4A1D3F] text-white rounded-3xl p-6 sm:p-12 border border-[#C6A15B]/30 shadow-xl relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Copy & Assurance */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C6A15B]/20 text-[#E0C78F] border border-[#C6A15B]/40 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Artificial Jewellery Collection</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-medium leading-tight text-white">
                  Regal Aesthetics, <br />
                  <span className="text-[#C6A15B] italic font-normal">Everyday Comfort.</span>
                </h2>

                <p className="text-[#E5E0D8] text-xs sm:text-sm md:text-base font-light leading-relaxed max-w-xl">
                  Our curated imitation jewellery is designed for high-impact celebratory dressing without heavy weight or skin sensitivity. Crafted from hypoallergenic brass with premium micro-plating and radiant faux Kundan and Polki stones.
                </p>

                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3.5 bg-black/25 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">100% Skin-Friendly</p>
                    <p className="text-[11px] text-white/70 mt-0.5">Nickel & lead free for sensitive skin</p>
                  </div>
                  <div className="p-3.5 bg-black/25 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">Anti-Tarnish Plating</p>
                    <p className="text-[11px] text-white/70 mt-0.5">High-grade finish with protective coat</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to="/shop?category=Jewellery">
                    <Button 
                      variant="champagne" 
                      size="lg" 
                      className="font-semibold text-[#1A1A1A] shadow-md"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Shop Imitation Jewellery
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Imagery Showcase */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-[#C6A15B]/30">
                  <img
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop"
                    alt="Imitation Jewellery Suite"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-xl p-3 text-[#1A1A1A] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#C6A15B]">Bestselling Suite</p>
                      <p className="font-serif text-xs font-semibold truncate">Polki Jadau Choker & Earrings</p>
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">₹65,000</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─── 6. SHOP THE LOOK (PAIRING CLOTHING + JEWELLERY) ──────────── */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading
          eyebrow="Complete The Ensemble"
          title="Shop The Look"
          subtitle="Pair our handcrafted Indian drapes with matching imitation jewellery for the complete celebration edit."
          align="center"
        />

        <div className="bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* The Outfit */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A1D3F] bg-[#F6EFF4] px-3 py-1 rounded-full">
                Step 1: The Drape
              </span>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E5DF]">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop"
                  alt="Katan Silk Saree"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h4 className="font-serif text-sm sm:text-base font-medium text-[#1A1A1A]">The Maharani Kadwa Banarasi Saree</h4>
                  <p className="text-xs font-bold text-[#1A1A1A]">₹48,500</p>
                </div>
                <Link to="/shop?category=Women&sub=Heritage Sarees">
                  <Button variant="outline" size="sm">View Saree</Button>
                </Link>
              </div>
            </div>

            {/* The Imitation Jewellery */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C6A15B] bg-[#F4EEDF] px-3 py-1 rounded-full">
                Step 2: The Imitation Accent
              </span>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E5DF]">
                <img
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop"
                  alt="Imitation Choker Suite"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h4 className="font-serif text-sm sm:text-base font-medium text-[#1A1A1A]">Polki Jadau Choker & Earring Suite</h4>
                  <p className="text-xs font-bold text-[#1A1A1A]">₹65,000</p>
                </div>
                <Link to="/shop?category=Jewellery">
                  <Button variant="champagne" size="sm" className="text-[#1A1A1A]">View Jewellery</Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 7. VERIFIED CUSTOMER REVIEWS ────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white border-t border-[#E8E5DF]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <SectionHeading
            eyebrow="Patron Reflections"
            title="Loved Across India"
            subtitle="Real reviews from customers who celebrated their special days in Sakshi creations."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div 
                key={t.name}
                className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E8E5DF] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[#C6A15B]">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#4B5563] italic leading-relaxed">
                    "{t.review}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E5DF]/60">
                  <p className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">{t.name}</p>
                  <p className="text-[11px] text-[#6B7280]">{t.city} · Verified Purchase</p>
                  <span className="text-[10px] text-[#4A1D3F] font-medium block mt-1">
                    Purchased: {t.item}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
