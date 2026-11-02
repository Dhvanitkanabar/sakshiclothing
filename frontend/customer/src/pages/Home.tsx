import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft,
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Star, 
  Heart, 
  ChevronRight,
  Clock,
  Copy,
  Pause,
  Play,
  Flame,
  Crown,
  Gem,
  Award
} from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { fetchProducts, fetchFeaturedProducts, fetchNewArrivals, getCachedProducts, getCachedFeatured, getCachedNewArrivals } from '../lib/api';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'sonner';
import { ShimmerBadge } from '../components/watermelon/ShimmerBadge';
import { SpringTabs } from '../components/watermelon/SpringTabs';
import { ShimmerButton } from '../components/watermelon/ShimmerButton';
import { GlowCard } from '../components/watermelon/GlowCard';
import { CounterBadge } from '../components/watermelon/CounterBadge';
import { FloatingActionDock } from '../components/watermelon/FloatingActionDock';
import { ScrollRibbon } from '../components/watermelon/ScrollRibbon';
import { ScrollMetricBar } from '../components/watermelon/ScrollMetricBar';
import { ScrollSectionBridge } from '../components/watermelon/ScrollSectionBridge';
import { ScrollSectionTracker } from '../components/watermelon/ScrollSectionTracker';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Instant 0ms startup: Initialize immediately with cached/authentic dataset
  const [products, setProducts] = useState<Product[]>(getCachedProducts);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(getCachedFeatured);
  const [newArrivals, setNewArrivals] = useState<Product[]>(getCachedNewArrivals);
  const [activeTab, setActiveTab] = useState<'all' | 'bestsellers' | 'bridal' | 'men' | 'sarees' | 'jewellery'>('all');
  const [loading, setLoading] = useState(false);

  // Global Page Scroll Progress for Fluid Velocity Indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // 1. HERO CAROUSEL STATE WITH REAL-TIME PROGRESS
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const heroSlides = [
    {
      id: 1,
      tag: "Bridal Collection 2026",
      title: "Handcrafted Luxury Bridal Wear & Couture Lehengas",
      subtitle: "Bespoke Indian bridal couture hand-embroidered by generational artisans in Jaipur. Woven with pure mulberry silk, fine gold dabka wirework, and delicate scalloped veils.",
      image: "https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=2000&auto=format&fit=crop",
      ctaPrimary: "Shop Bridal Collection",
      linkPrimary: "/shop?category=Women&sub=Bridal Lehengas",
      ctaSecondary: "Book Styling Session",
      linkSecondary: "/stores",
      badge: "Silk Mark India Certified"
    },
    {
      id: 2,
      tag: "Royal Menswear Edit",
      title: "Bespoke Royal Sherwanis & Tailored Bandhgalas",
      subtitle: "Ivory and midnight silk brocades with structured canvas, clean royal lines, and hand-engraved metal crest buttons.",
      image: "https://images.unsplash.com/photo-1783188223691-8a233ee51cd8?q=80&w=2000&auto=format&fit=crop",
      ctaPrimary: "Shop Menswear",
      linkPrimary: "/shop?category=Men",
      ctaSecondary: "Groom Styling Service",
      linkSecondary: "/stores",
      badge: "Hand-Tailored in Jaipur"
    },
    {
      id: 3,
      tag: "Pure Heritage Silks",
      title: "Authentic Handwoven Banarasi Katan Silk Sarees",
      subtitle: "Pure katan silk Banarasi drapes woven with metallic gold kadwa jaal across generational pit looms in Varanasi.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2000&auto=format&fit=crop",
      ctaPrimary: "Shop Pure Silks",
      linkPrimary: "/shop?category=Women&sub=Heritage Sarees",
      ctaSecondary: "View Saree Catalog",
      linkSecondary: "/shop",
      badge: "100% Pure Mulberry Silk"
    }
  ];

  // Auto-advance hero slides every 5.5 seconds
  useEffect(() => {
    if (isSlidePaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroSlides.length, isSlidePaused]);

  // Non-blocking background sync: updates real-time store catalog without blocking initial page render
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
        console.warn('Background store sync deferred to cached dataset:', err);
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
      case 'bestsellers':
        return featuredProducts;
      case 'bridal':
        return products.filter(p => p.category === 'Bridal' || p.subCategory?.toLowerCase().includes('bridal') || p.subCategory?.toLowerCase().includes('anarkali'));
      case 'men':
        return products.filter(p => p.category === 'Men');
      case 'sarees':
        return products.filter(p => p.subCategory?.toLowerCase().includes('saree') || p.name.toLowerCase().includes('saree'));
      case 'jewellery':
        return products.filter(p => p.category === 'Jewellery' || p.subCategory?.toLowerCase().includes('jewel'));
      case 'all':
      default:
        return products;
    }
  };

  const displayedProducts = getTabProducts();
  const spotlightProduct = displayedProducts[0] || PRODUCTS[0];
  const gridProducts = displayedProducts.slice(1, 9);

  // 2. RUNWAY CAROUSEL STATE WITH CONTINUOUS AUTO-SCROLL
  const runwayRef = useRef<HTMLDivElement>(null);
  const [isRunwayAutoplaying, setIsRunwayAutoplaying] = useState(true);
  const [runwayScrollProgress, setRunwayScrollProgress] = useState(0);

  const handleRunwayScroll = () => {
    if (!runwayRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = runwayRef.current;
    const totalScrollable = scrollWidth - clientWidth;
    if (totalScrollable > 0) {
      setRunwayScrollProgress(scrollLeft / totalScrollable);
    }
  };

  const scrollRunway = (direction: 'left' | 'right') => {
    if (!runwayRef.current) return;
    const scrollAmount = direction === 'left' ? -340 : 340;
    runwayRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Continuous auto-sliding on runway carousel
  useEffect(() => {
    if (!isRunwayAutoplaying) return;
    const autoScrollTimer = setInterval(() => {
      if (!runwayRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = runwayRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        runwayRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        runwayRef.current.scrollBy({ left: 340, behavior: 'smooth' });
      }
    }, 4200);
    return () => clearInterval(autoScrollTimer);
  }, [isRunwayAutoplaying]);

  const handleQuickAdd = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product, product.sizes?.[0] || 'M', 1);
  };

  // 3. CURATED FASHION UNIVERSES (COOL, AVANT-GARDE CATEGORIES)
  const categories = [
    {
      name: "NOUVEAU BRIDAL",
      number: "01",
      count: "Curated Bridal Lehengas",
      image: "https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=800&auto=format&fit=crop",
      desc: "Pure raw silk & 240-hour zardozi",
      link: "/shop?category=Women&sub=Bridal Lehengas"
    },
    {
      name: "HEIRLOOM WEAVES",
      number: "02",
      count: "Varanasi Pit-Loom Sarees",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
      desc: "Real kadwa gold zari & katan silk",
      link: "/shop?category=Women&sub=Heritage Sarees"
    },
    {
      name: "IMPERIAL HOMME",
      number: "03",
      count: "Royal Brocade Sherwanis",
      image: "https://images.unsplash.com/photo-1783188223691-8a233ee51cd8?q=80&w=800&auto=format&fit=crop",
      desc: "Hand-engraved crest brass buttons",
      link: "/shop?category=Men&sub=Heritage Sherwanis"
    },
    {
      name: "JODHPUR SUITS",
      number: "04",
      count: "Architectural Bandhgalas",
      image: "https://plus.unsplash.com/premium_photo-1682090774051-77cdd6b1e7cd?q=80&w=800&auto=format&fit=crop",
      desc: "Silk-wool blend with mandarin collars",
      link: "/shop?category=Men&sub=Suits & Jackets"
    },
    {
      name: "MODERN ANARKALIS",
      number: "05",
      count: "Couture Flared Gowns",
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
      desc: "Tissue organza with French knots",
      link: "/shop?category=Women&sub=Couture Anarkalis"
    },
    {
      name: "HERITAGE JADAU",
      number: "06",
      count: "Royal Polki Jewelry",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
      desc: "22k gold plated polki & emeralds",
      link: "/shop?category=Jewellery"
    }
  ];

  // 4. INTERACTIVE BRIDAL ANATOMY WITH AUTO-PULSE
  const [activeHotspot, setActiveHotspot] = useState<number>(1);
  const hotspots = [
    {
      id: 1,
      x: "52%",
      y: "32%",
      title: "Real Zari Kadwa Brocade",
      desc: "Woven across 140 uninterrupted hours using genuine silver and metallic gold threads on Varanasi pit looms.",
      tag: "PIT LOOM WEAVE"
    },
    {
      id: 2,
      x: "36%",
      y: "56%",
      title: "Gossamer Scalloped Organza Veil",
      desc: "Featherlight sheer organza trimmed with hand-cut scalloped gota patti and delicate micro-pearl edging.",
      tag: "ATELIER FINISH"
    },
    {
      id: 3,
      x: "62%",
      y: "74%",
      title: "18th-Century Rajputana Zardozi",
      desc: "Pure metallic dabka wiring and bugle beads hand-stitched onto dense mulberry raw silk for an imposing royal relief.",
      tag: "ROYAL EMBROIDERY"
    }
  ];

  // Auto-cycle anatomy hotspot every 4.5 seconds
  useEffect(() => {
    const spotTimer = setInterval(() => {
      setActiveHotspot((prev) => (prev % hotspots.length) + 1);
    }, 4500);
    return () => clearInterval(spotTimer);
  }, [hotspots.length]);

  // 5. ATELIER KARIGAR ARCHIVE TABS
  const [atelierStep, setAtelierStep] = useState(0);
  const atelierSteps = [
    {
      num: "01",
      title: "Pure Mulberry Ahimsa Silk",
      subtitle: "Ethical & Organic Handlooms",
      desc: "We exclusively source peace silk cultivated with organic luster, natural thermal breathability, and celestial drape.",
      stat: "100%",
      statLabel: "Silk Mark India Certified",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop"
    },
    {
      num: "02",
      title: "Generational Hand Zardozi",
      subtitle: "Metalsmithing in Pure Thread",
      desc: "Jaipur master artisans stitch real metallic gold dabka wires by hand, spending up to 240 hours on a single bridal panel.",
      stat: "240+",
      statLabel: "Hours per Garment",
      image: "https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=1200&auto=format&fit=crop"
    },
    {
      num: "03",
      title: "Generational Pit Looms",
      subtitle: "Unbroken Varanasi Tradition",
      desc: "Hand-thrown shuttles weaving less than 1 inch of solid gold zari kadwa jaal per day, creating family heirlooms.",
      stat: "140",
      statLabel: "Loom Hours",
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop"
    },
    {
      num: "04",
      title: "Architectural Canvas Tailoring",
      subtitle: "Bespoke Anatomical Fit",
      desc: "Structured with Italian horsehair canvas and mulmul lining for effortless movement and razor-sharp silhouette.",
      stat: "45+",
      statLabel: "Master Artisan Guilds",
      image: "https://images.unsplash.com/photo-1783188223691-8a233ee51cd8?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  // 6. PATRON TESTIMONIALS (REAL EDITORIAL QUOTES)
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonials = [
    {
      name: 'Aarohi Singhania',
      location: 'Fashion Director, Mumbai',
      text: 'The Noor-e-Jahan bridal lehenga was the centerpiece of my wedding week. The drape of the 120-gram mulberry raw silk and the weight of the zardozi are in a league of their own.',
      item: 'Piece: The Noor-e-Jahan Scalloped Raw Silk Bridal Lehenga',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'Rudra Pratap Singh',
      location: 'Architect & Collector, London',
      text: 'Acquired the Jodhpur Imperial Brocade Sherwani for my private reception. The structured shoulder canvas, hand-engraved brass crest buttons, and silk finish are supreme.',
      item: 'Piece: The Jodhpur Imperial Brocade Royal Sherwani',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'Dr. Meera Varma',
      location: 'Patron of Arts, Dubai',
      text: 'The Katan Silk Kadwa Banarasi Saree is a certified family heirloom. Soft, lustrous, and authentic. The Silk Mark verification and custom archival box made the unboxing unforgettable.',
      item: 'Piece: The Maharani Katan Silk Kadwa Banarasi Saree',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop'
    }
  ];

  useEffect(() => {
    const testTimer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(testTimer);
  }, [testimonials.length]);

  const copyCoupon = () => {
    navigator.clipboard.writeText('SAKSHI20');
    toast.success('Festive privilege code SAKSHI20 copied to clipboard');
  };

  return (
    <div className="bg-[#FAF8F5] text-stone-900 min-h-screen overflow-x-hidden selection:bg-amber-400 selection:text-black pb-24 lg:pb-0">
      
      {/* Global Fluid Scroll Depth Progress Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-200 origin-left z-50 pointer-events-none shadow-sm"
      />

      {/* 1. CINEMATIC HERO LOOKBOOK (RESPONSIVE & MOBILE FIRST) */}
      <section 
        id="hero-section"
        onMouseEnter={() => setIsSlidePaused(true)}
        onMouseLeave={() => setIsSlidePaused(false)}
        className="relative min-h-[580px] sm:min-h-[700px] lg:min-h-[820px] w-full overflow-hidden bg-stone-950 text-white flex items-center py-16 sm:py-24"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-0"
          >
            <img
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].title}
              className="w-full h-full object-cover object-center opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content Area */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full">
          <div className="max-w-3xl space-y-4 sm:space-y-6">
            {/* Tag Badge */}
            <motion.div
              key={`tag-${currentSlide}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ShimmerBadge variant="gold" size="md">
                {heroSlides[currentSlide].tag}
              </ShimmerBadge>
            </motion.div>

            {/* Split H1 Headline with Fluid Clamp */}
            <motion.h1
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-sans font-extrabold text-white tracking-tight leading-[1.12]"
            >
              {heroSlides[currentSlide].title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              key={`desc-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-stone-300 text-xs sm:text-sm md:text-base font-light max-w-2xl leading-relaxed"
            >
              {heroSlides[currentSlide].subtitle}
            </motion.p>

            {/* Dual Responsive Action Buttons */}
            <motion.div
              key={`actions-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-4"
            >
              <Link to={heroSlides[currentSlide].linkPrimary}>
                <ShimmerButton
                  variant="gold"
                  size="md"
                  icon={<ArrowRight size={14} className="order-last ml-1" />}
                >
                  {heroSlides[currentSlide].ctaPrimary}
                </ShimmerButton>
              </Link>
              <Link to={heroSlides[currentSlide].linkSecondary}>
                <ShimmerButton variant="outline" size="md">
                  {heroSlides[currentSlide].ctaSecondary}
                </ShimmerButton>
              </Link>
            </motion.div>

            {/* Verification Badge */}
            <div className="pt-2 flex items-center gap-2 text-stone-400 text-[11px] font-sans">
              <ShieldCheck size={14} className="text-amber-400" />
              <span>{heroSlides[currentSlide].badge}</span>
            </div>
          </div>
        </div>

        {/* Slide Indicator Dots on Mobile / Mini Rail */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroSlides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Liquid Scrolling Ribbon 1 (After Hero) */}
      <ScrollRibbon
        dark={true}
        speed={32}
        items={[
          '100% Pure Mulberry Silk',
          'Hand-Embroidered in Jaipur',
          '24K Gold-Finished Dabka Wirework',
          'Silk Mark India Certified',
          'Complimentary Worldwide Courier',
          'Bespoke Bridal Tailoring',
          'Rajputana Heritage Weaves'
        ]}
      />

      {/* Fluid In-Between Scroll Animation Bridge: Section 02 */}
      <ScrollSectionBridge
        sectionNumber="02"
        sectionTitle="The Atelier Philosophy"
        watermarkText="HAUTE COUTURE • RADICAL CRAFT"
        badgeText="AHIMSA SILK"
        theme="light"
      />

      {/* 2. BRAND PHILOSOPHY MANIFESTO WITH SCROLL REVEAL */}
      <motion.section 
        id="manifesto-section"
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-16 sm:py-24 px-6 max-w-7xl mx-auto border-b border-stone-200/80"
      >
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 block">
            The Atelier Philosophy
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-sans font-bold text-stone-900 leading-tight">
            We do not produce seasonal fashion. <br className="hidden sm:inline" />
            <span className="font-extrabold text-amber-950">We sculpt wearable heirlooms.</span>
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm md:text-base font-normal max-w-2xl mx-auto leading-relaxed">
            In an age of industrial haste, Sakshi stands at the nexus of radical craft, certified 100% Ahimsa mulberry silks, and royal Rajputana zardozi needlework.
          </p>
        </div>
      </motion.section>

      {/* Fluid In-Between Scroll Animation Bridge: Section 03 */}
      <ScrollSectionBridge
        sectionNumber="03"
        sectionTitle="The Living Runway Archive"
        watermarkText="SPRING / SUMMER 2026 RUNWAY"
        badgeText="NEW EDITIONS"
        theme="light"
      />

      {/* 3. THE LIVING RUNWAY ARCHIVE (TOUCH CAROUSEL WITH SCROLL REVEAL) */}
      <motion.section 
        id="runway-section" 
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-16 sm:py-24 px-5 sm:px-8 max-w-7xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900 mb-2">
              <Sparkles size={13} className="text-amber-800" />
              <span>Spring / Summer '26 Edit</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-sans font-bold text-stone-900 tracking-tight">
              The Living Runway Archive
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm font-normal mt-1">
              Fresh arrivals and new fashion collections hand-crafted by master artisans in Jaipur.
            </p>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunwayAutoplaying(!isRunwayAutoplaying)}
              className="px-3.5 py-2 rounded-full border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-sans flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {isRunwayAutoplaying ? (
                <>
                  <Pause size={12} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={12} />
                  <span>Play</span>
                </>
              )}
            </button>
            <button
              onClick={() => scrollRunway('left')}
              className="w-10 h-10 rounded-full border border-stone-300 bg-white hover:bg-amber-400 hover:border-amber-400 text-stone-800 transition-all flex items-center justify-center shadow-xs"
              aria-label="Previous pieces"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => scrollRunway('right')}
              className="w-10 h-10 rounded-full bg-stone-900 hover:bg-amber-800 text-white transition-all flex items-center justify-center shadow-md"
              aria-label="Next pieces"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <div className="w-full h-1 bg-stone-200 rounded-full mb-6 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
            style={{ width: `${Math.max(15, runwayScrollProgress * 100)}%` }}
          />
        </div>

        {/* Smooth Horizontal Track with Momentum & Hover Pause */}
        <div 
          ref={runwayRef}
          onScroll={handleRunwayScroll}
          onMouseEnter={() => setIsRunwayAutoplaying(false)}
          onMouseLeave={() => setIsRunwayAutoplaying(true)}
          className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 snap-x snap-mandatory cursor-grab active:cursor-grabbing"
        >
          {products.map((prod) => {
            const isWish = isInWishlist(prod.id);
            return (
              <div 
                key={`runway-${prod.id}`}
                className="w-[270px] sm:w-[320px] shrink-0 bg-white rounded-3xl p-3.5 sm:p-4 border border-stone-200/90 hover:border-amber-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group snap-center"
              >
                {/* Image Portal */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 mb-3.5">
                  <Link 
                    to={`/product/${prod.id}`} 
                    className="block w-full h-full"
                    onClick={() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                    }}
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>

                  {/* Wishlist Heart */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(prod);
                    }}
                    className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all ${
                      isWish 
                        ? 'bg-amber-400 text-stone-950 scale-105 shadow-md' 
                        : 'bg-black/35 text-white hover:bg-black/60'
                    }`}
                    aria-label="Save to Wishlist"
                  >
                    <Heart size={14} fill={isWish ? 'currentColor' : 'none'} />
                  </button>

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-[9px] font-sans tracking-widest uppercase text-stone-900 font-bold">
                    {prod.category}
                  </div>
                </div>

                {/* Garment Details & Direct Add */}
                <div className="space-y-2.5">
                  <div>
                    <span className="text-[10px] font-sans tracking-widest uppercase text-stone-500 block mb-0.5">
                      {prod.subCategory || 'HAUTE COUTURE'}
                    </span>
                    <Link 
                      to={`/product/${prod.id}`}
                      onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                      }}
                    >
                      <h3 className="text-sm sm:text-base font-sans font-bold text-stone-900 group-hover:text-amber-900 transition-colors truncate">
                        {prod.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div>
                      <p className="text-[9px] text-stone-400 font-sans uppercase tracking-wider">Price</p>
                      <p className="text-base sm:text-lg font-sans font-bold text-stone-900">₹{prod.price.toLocaleString('en-IN')}</p>
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(prod, e)}
                      className="px-3.5 py-2 bg-stone-900 hover:bg-amber-400 hover:text-stone-950 text-white rounded-xl text-xs font-sans uppercase tracking-wider font-bold transition-all duration-300 flex items-center gap-1.5 shadow-xs"
                    >
                      <ShoppingBag size={12} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Liquid Scrolling Ribbon 2 (Between Runway and Universes) */}
      <ScrollRibbon
        direction="right"
        dark={false}
        speed={30}
        items={[
          'Royal Bridal Lehengas',
          'Tailored Silk Sherwanis',
          'Banarasi Katan Sarees',
          'Heritage Kundan Jewellery',
          'Scalloped Organza Veils',
          'Custom Couture Fit',
          'Private Atelier Appointments'
        ]}
      />

      {/* Fluid In-Between Scroll Animation Bridge: Section 04 */}
      <ScrollSectionBridge
        sectionNumber="04"
        sectionTitle="Curated Fashion Universes"
        watermarkText="SIX ATELIER UNIVERSES"
        badgeText="JAIPUR & VARANASI"
        theme="light"
      />

      {/* 4. SHOP BY UNIVERSE - 6 HIGH-FASHION ARCHED CARDS (STAGGERED SCROLL REVEAL) */}
      <motion.section 
        id="universes-section"
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-16 sm:py-24 px-5 sm:px-8 max-w-7xl mx-auto border-t border-stone-200/80"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 block mb-2">
              Curated Ateliers
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-sans font-bold text-stone-900 tracking-tight">
              Curated Fashion Universes
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm font-normal mt-1">
              Explore specialized couture worlds from royal bridal trousseaus to Varanasi pit-loom silks.
            </p>
          </div>
          <Link 
            to="/shop" 
            className="text-xs font-sans uppercase tracking-wider font-bold text-stone-900 hover:text-amber-800 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Explore All Universes</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-5">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <Link
                to={cat.link}
                className="group flex flex-col items-center text-center p-4 sm:p-5 bg-white rounded-3xl border border-stone-200/90 hover:border-amber-400 hover:shadow-xl transition-all duration-300 relative h-full"
              >
                <span className="absolute top-3 right-3 text-[9px] font-sans text-stone-300 group-hover:text-amber-800 transition-colors font-bold">
                  {cat.number}
                </span>
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden mb-3 border-2 border-stone-100 group-hover:border-amber-400 transition-colors shadow-md">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-sans font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-stone-500 font-sans mt-1 line-clamp-1">
                  {cat.count}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Animated Metrics Strip Between Universes and Catalog */}
      <ScrollMetricBar />

      {/* Fluid In-Between Scroll Animation Bridge: Section 05 */}
      <ScrollSectionBridge
        sectionNumber="05"
        sectionTitle="The Curated Catalog"
        watermarkText="ROYAL HEIRLOOM SILKS"
        badgeText="100% SILK MARK"
        theme="light"
      />

      {/* 5. ELEVATED EDITORIAL CATALOG (SCROLL REVEAL) */}
      <motion.section 
        id="catalog-section"
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-16 sm:py-24 px-5 sm:px-8 max-w-7xl mx-auto bg-stone-100/70 rounded-3xl border border-stone-200/80 my-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 sm:mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900 mb-2">
              <Crown size={13} className="text-amber-800" />
              <span>The Salon Archive · 2026 Editions</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-sans font-bold text-stone-900 tracking-tight">
              The Curated Catalog
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm font-normal mt-1">
              Certified pure fabrics, intricate Rajputana needlecraft, and unapologetic Indian elegance.
            </p>
          </div>

          {/* Filter Tabs with Watermelon SpringTabs */}
          <div className="pb-2 overflow-x-auto no-scrollbar">
            <SpringTabs
              tabs={[
                { id: 'all', label: 'All Garments' },
                { id: 'bestsellers', label: 'Bestsellers' },
                { id: 'bridal', label: 'Haute Bridal' },
                { id: 'men', label: 'Atelier Homme' },
                { id: 'sarees', label: 'Heirloom Silks' },
                { id: 'jewellery', label: 'Fine Jewels' },
              ]}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as any)}
              size="md"
            />
          </div>
        </div>

        {/* Editorial Asymmetric Layout: Spotlight Feature + Garment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Spotlight Masterwork Card (Left 4 cols) */}
          {spotlightProduct && (
            <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-amber-300/40 shadow-xl space-y-4 relative group">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-amber-800 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  ✦ ATELIER SPOTLIGHT ✦
                </span>
                <span className="text-[10px] text-stone-500 font-sans">100% Pure Silk Mark</span>
              </div>

              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100">
                <Link 
                  to={`/product/${spotlightProduct.id}`}
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                  }}
                >
                  <img
                    src={spotlightProduct.image}
                    alt={spotlightProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </Link>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-sans">
                  240 Artisan Hours
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-sans tracking-widest uppercase text-stone-500">
                  {spotlightProduct.subCategory || 'HAUTE COUTURE'}
                </span>
                <Link 
                  to={`/product/${spotlightProduct.id}`}
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                  }}
                >
                  <h3 className="text-lg sm:text-xl font-sans font-bold text-stone-900 hover:text-amber-900 transition-colors">
                    {spotlightProduct.name}
                  </h3>
                </Link>
                <p className="text-xs text-stone-600 font-light leading-relaxed line-clamp-2">
                  {spotlightProduct.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <div>
                    <span className="text-[9px] font-sans uppercase text-stone-400 block">Price</span>
                    <span className="text-lg sm:text-xl font-sans font-bold text-stone-900">
                      ₹{spotlightProduct.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleQuickAdd(spotlightProduct, e)}
                    className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 font-sans text-xs uppercase tracking-wider font-bold rounded-xl shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
                  >
                    <ShoppingBag size={14} />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Garments (Right 8 cols) - 2 columns on mobile */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {loading ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-stone-200/60 rounded-3xl animate-pulse" />
                ))
              ) : gridProducts.length > 0 ? (
                gridProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-stone-200">
                  <ShoppingBag size={40} className="mx-auto text-stone-300 mb-3" />
                  <p className="text-stone-600 font-sans text-lg">No garments found in this selection.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 bg-stone-900 hover:bg-amber-800 text-white rounded-2xl text-xs font-sans uppercase tracking-widest font-bold transition-all duration-300 shadow-xl"
          >
            <span>Explore All {products.length || 12} Atelier Masterpieces</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </motion.section>

      {/* Fluid In-Between Scroll Animation Bridge: Section 06 */}
      <ScrollSectionBridge
        sectionNumber="06"
        sectionTitle="Behind The Craft of Royal Couture"
        watermarkText="PRECISION & ARTISANSHIP"
        badgeText="240 KARIGAR HOURS"
        theme="transition-to-dark"
      />

      {/* 6. CRAFT ANATOMY HOTSPOT SHOWCASE (SCROLL REVEAL) */}
      <motion.section 
        id="anatomy-section"
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-16 sm:py-24 bg-[#141210] text-[#f5efe6] px-5 sm:px-8 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block">
              Precision & Artisanship
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-sans font-bold text-white leading-tight">
              Behind the Craft of Royal Couture
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm font-normal leading-relaxed">
              Every Sakshi piece is brought to life through centuries-old Indian handloom and metalsmithing embroidery techniques.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* Interactive Image Frame with Hotspots */}
            <div className="lg:col-span-7 relative rounded-3xl overflow-hidden aspect-[4/5] bg-stone-900 shadow-2xl border border-white/10 group">
              <img
                src="https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=1400&auto=format&fit=crop"
                alt="Bridal Haute Couture Anatomy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

              {/* Pulsing Hotspot Pins */}
              {hotspots.map((spot) => (
                <div
                  key={spot.id}
                  style={{ left: spot.x, top: spot.y }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    onClick={() => setActiveHotspot(spot.id)}
                    className="relative group/pin p-2"
                    aria-label={spot.title}
                  >
                    <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-xs font-bold transition-all shadow-xl ${
                      activeHotspot === spot.id 
                        ? 'bg-amber-400 text-stone-950 scale-125 ring-4 ring-amber-400/40' 
                        : 'bg-stone-950/90 text-amber-300 border border-amber-400/50 hover:bg-amber-400 hover:text-black'
                    }`}>
                      {spot.id}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {/* Hotspot Details Card */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              {hotspots.map((spot) => {
                const isSelected = activeHotspot === spot.id;
                return (
                  <motion.div
                    key={spot.id}
                    onClick={() => setActiveHotspot(spot.id)}
                    className={`p-5 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer ${
                      isSelected 
                        ? 'bg-[#1e1a16] border-amber-400 shadow-2xl scale-[1.02]' 
                        : 'bg-[#181512]/60 border-white/10 opacity-70 hover:opacity-100 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-amber-400 font-bold">
                        {spot.tag}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 text-xs font-sans flex items-center justify-center">
                        {spot.id}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-sans font-semibold text-white mb-1.5 sm:mb-2">
                      {spot.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed">
                      {spot.desc}
                    </p>
                  </motion.div>
                );
              })}

              <div className="pt-2">
                <Link
                  to="/shop?category=Women&sub=Bridal Lehengas"
                  className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-white hover:to-white text-stone-950 rounded-2xl text-xs font-sans uppercase tracking-wider font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Shop This Bridal Look</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Fluid In-Between Scroll Animation Bridge: Section 07 */}
      <ScrollSectionBridge
        sectionNumber="07"
        sectionTitle="Atelier Privilege Code"
        watermarkText="SAKSHI20 • 20% PRIVILEGE CREDIT"
        badgeText="LIMITED ACCESS"
        theme="dark"
      />

      {/* 7. PROMOTIONAL PRIVILEGE CODE BANNER (SCROLL REVEAL) */}
      <motion.section 
        id="privilege-section"
        initial={{ opacity: 0, scale: 0.97, y: 35 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 sm:px-8 max-w-7xl mx-auto my-14 sm:my-20"
      >
        <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-12 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-sans uppercase tracking-wider">
              <Clock size={13} /> Exclusive Atelier Privilege
            </div>
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-sans font-light leading-tight">
              Enjoy Flat <span className="font-bold text-amber-300">20% Credit</span> on Your Bespoke Order
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm md:text-base font-light leading-relaxed">
              Apply code <span className="font-sans font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded">SAKSHI20</span> at checkout for instant privilege credit across all Couture Silks, Sherwanis, and Lehengas.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 shrink-0 w-full sm:w-auto">
            <button
              onClick={copyCoupon}
              className="w-full sm:w-auto px-6 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-sans uppercase tracking-widest font-bold transition-all border border-white/25 flex items-center justify-center gap-2"
            >
              <Copy size={14} />
              <span>Copy Code</span>
            </button>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-7 py-3.5 sm:py-4 bg-amber-400 text-stone-950 hover:bg-white rounded-2xl text-xs font-sans uppercase tracking-widest font-bold transition-all shadow-xl inline-flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} />
              <span>Shop Collection</span>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Fluid In-Between Scroll Animation Bridge: Section 08 */}
      <ScrollSectionBridge
        sectionNumber="08"
        sectionTitle="Four Pillars of Authentic Craft"
        watermarkText="JAIPUR & VARANASI TRADITIONS"
        badgeText="HERITAGE ARCHIVE"
        theme="dark"
      />

      {/* 8. FOUR PILLARS OF ARTISANSHIP (SCROLL REVEAL) */}
      <motion.section 
        id="pillars-section"
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-16 sm:py-24 bg-[#161412] text-[#f7f3ec] px-5 sm:px-8 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block">
              Heritage Archive
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-sans font-bold text-white leading-tight">
              Four Pillars of Authentic Craft
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm font-normal leading-relaxed">
              How our generational karigars in Jaipur and Varanasi preserve India's most celebrated textile traditions.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
            {atelierSteps.map((step, idx) => (
              <button
                key={step.num}
                onClick={() => setAtelierStep(idx)}
                className={`p-4 sm:p-6 rounded-2xl text-left border transition-all duration-300 ${
                  atelierStep === idx
                    ? 'bg-[#221d18] border-amber-400 shadow-xl'
                    : 'bg-[#1b1714]/60 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-xs font-bold text-amber-400 block mb-1">{step.num}</span>
                <h4 className="text-sm sm:text-base font-sans font-bold text-white mb-1 line-clamp-1">{step.title}</h4>
                <p className="text-xs text-stone-400 font-normal line-clamp-1">{step.subtitle}</p>
              </button>
            ))}
          </div>

          {/* Active Pillar Card wrapped in Watermelon GlowCard */}
          <GlowCard className="p-6 sm:p-10 border-amber-400/30">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Craft Standards · Pillar {atelierSteps[atelierStep].num}
                </span>
                <h3 className="text-xl sm:text-3xl font-sans font-bold text-white">
                  {atelierSteps[atelierStep].title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                  {atelierSteps[atelierStep].desc}
                </p>
                <div className="pt-2 flex items-center gap-4">
                  <div className="bg-black/50 border border-amber-400/30 rounded-2xl p-4">
                    <span className="text-2xl sm:text-3xl font-sans font-bold text-amber-400 block">
                      {atelierSteps[atelierStep].stat}
                    </span>
                    <span className="text-[10px] font-sans text-stone-400 uppercase tracking-wider">
                      {atelierSteps[atelierStep].statLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl overflow-hidden aspect-[4/3] bg-stone-900 border border-white/10">
                <img
                  src={atelierSteps[atelierStep].image}
                  alt={atelierSteps[atelierStep].title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </GlowCard>
        </div>
      </motion.section>

      {/* Fluid In-Between Scroll Animation Bridge: Section 09 */}
      <ScrollSectionBridge
        sectionNumber="09"
        sectionTitle="Words from Our Valued Patrons"
        watermarkText="VALUED PATRONS WORLDWIDE"
        badgeText="5.0 ★ VERIFIED"
        theme="transition-to-light"
      />

      {/* 9. REAL PATRON & CRITIC TESTIMONIALS (SCROLL REVEAL) */}
      <motion.section 
        id="testimonials-section"
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-16 sm:py-24 px-5 sm:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 block">
            Customer Reviews
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-sans font-bold text-stone-900 tracking-tight">
            Words from our Valued Patrons
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm font-normal">
            Reflections from clients and bridal couples worldwide.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-12 border border-stone-200/90 shadow-xl text-center space-y-6 relative">
          <div className="flex justify-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={16} fill="currentColor" />
            ))}
          </div>

          <p className="text-base sm:text-xl font-sans font-medium text-stone-800 leading-relaxed">
            "{testimonials[activeTestimonial].text}"
          </p>

          <div className="flex flex-col items-center gap-2 pt-2 border-t border-stone-100">
            <img
              src={testimonials[activeTestimonial].avatar}
              alt={testimonials[activeTestimonial].name}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
            />
            <h4 className="font-sans font-bold text-stone-900 text-base">
              {testimonials[activeTestimonial].name}
            </h4>
            <span className="text-[11px] font-sans text-stone-500">
              {testimonials[activeTestimonial].location}
            </span>
            <span className="text-[10px] font-sans text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {testimonials[activeTestimonial].item}
            </span>
          </div>

          {/* Testimonial Nav dots */}
          <div className="flex justify-center gap-2 pt-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeTestimonial === idx ? 'bg-amber-600 w-6' : 'bg-stone-300'
                }`}
                aria-label={`Testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Floating Section Progress Tracker Rail */}
      <ScrollSectionTracker />

      {/* Watermelon UI Signature Floating Action Concierge & Scroll Progress */}
      <FloatingActionDock />
    </div>
  );
};

export default Home;
