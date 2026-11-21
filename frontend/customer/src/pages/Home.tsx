// Reading this as: Storefront Home Page for Sakshi Clothing (Indian ethnic fashion & artificial jewellery), targeting women 18-40, with clean, bright, youthful editorial luxury. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  Banknote,
  ChevronRight
} from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { fetchHomepageData, fetchProducts, getCachedProducts, HomepageData } from '../lib/api';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { BUSINESS_CONFIG } from '../config/business';
import SEOHead, { getOrganizationSchema } from '../components/SEOHead';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Instant startup from cached dataset with live background refresh
  const [products, setProducts] = useState<Product[]>(getCachedProducts);
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'clothing' | 'jewellery'>('all');
  const [loading, setLoading] = useState(false);

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);

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
  const jewelleryProducts = homepageData?.jewelleryProducts?.length 
    ? homepageData.jewelleryProducts 
    : products.filter(p => {
        const c = (p.category || '').toLowerCase();
        const s = (p.subCategory || '').toLowerCase();
        return c.includes('jewel') || s.includes('jewel');
      });
  const clothingProducts = products.filter(p => {
    const c = (p.category || '').toLowerCase();
    return !c.includes('jewel');
  });
  const reviews = homepageData?.reviews || [];

  // Carousel slide timer for active hero banners
  useEffect(() => {
    if (heroBanners.length <= 1 || isSlidePaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 5500);
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

  // Top items for spotlight & lookbook pairing
  const spotlightProduct = jewelleryProducts[0] || null;
  const lookbookClothing = clothingProducts[0] || null;
  const lookbookJewellery = jewelleryProducts[0] || null;

  return (
    <div className="bg-[#FBF9F6] text-[#1A1A1A] min-h-screen">
      <SEOHead
        title="Sakshi Clothing | Luxury Indian Wear & Imitation Jewellery"
        description="Discover handcrafted sarees, lehengas, kurtis, and skin-friendly imitation jewellery from Surat. Free shipping above ₹999 with Cash on Delivery."
        jsonLd={getOrganizationSchema()}
      />
      
      {/* ─── 1. HERO BANNER (DATA-DRIVEN CAROUSEL OR LUXURY BRAND HERO) ─── */}
      <section 
        id="hero-banner"
        onMouseEnter={() => setIsSlidePaused(true)}
        onMouseLeave={() => setIsSlidePaused(false)}
        className="relative w-full min-h-[560px] sm:min-h-[640px] lg:min-h-[740px] bg-[#1A1A1A] text-white flex items-center overflow-hidden"
      >
        {heroBanners.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="absolute inset-0 z-0"
              >
                {heroBanners[currentSlide]?.image?.url && (
                  <img
                    src={heroBanners[currentSlide].image.url}
                    alt={heroBanners[currentSlide].title || "Sakshi Clothing Banner"}
                    className="w-full h-full object-cover object-center opacity-55"
                    fetchPriority="high"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              </motion.div>
            </AnimatePresence>

            <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full py-16 sm:py-24">
              <div className="max-w-2xl space-y-4 sm:space-y-6">
                
                {heroBanners[currentSlide]?.subtitle && (
                  <motion.div
                    key={`pill-${currentSlide}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4A1D3F]/90 backdrop-blur-md text-[#C6A15B] border border-[#C6A15B]/30 text-xs font-semibold uppercase tracking-wider shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Free Shipping on Orders Above ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}</span>
                  </motion.div>
                )}

                <motion.h1
                  key={`h1-${currentSlide}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-medium tracking-tight leading-[1.12]"
                >
                  {heroBanners[currentSlide]?.title || "Timeless Indian Silhouettes, Modern Grace"}
                </motion.h1>

                {heroBanners[currentSlide]?.subtitle && (
                  <motion.p
                    key={`sub-${currentSlide}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-[#E5E0D8] text-sm sm:text-base font-light max-w-xl leading-relaxed"
                  >
                    {heroBanners[currentSlide].subtitle}
                  </motion.p>
                )}

                <motion.div
                  key={`cta-${currentSlide}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
                >
                  <Link to={heroBanners[currentSlide]?.buttonLink || "/shop"}>
                    <Button 
                      variant="champagne" 
                      size="lg" 
                      fullWidth 
                      className="font-semibold shadow-lg text-[#1A1A1A]"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      {heroBanners[currentSlide]?.buttonText || "Explore Collection"}
                    </Button>
                  </Link>
                  <Link to="/shop?category=Jewellery">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      fullWidth 
                      className="bg-white/10 hover:bg-white text-white hover:text-[#1A1A1A] border-white/30 font-semibold"
                    >
                      Imitation Jewellery
                    </Button>
                  </Link>
                </motion.div>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-white/80 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#C6A15B]" />
                    <span>Free Shipping Above ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-[#C6A15B]" />
                    <span>Cash on Delivery</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-[#C6A15B]" />
                    <span>{BUSINESS_CONFIG.policies.returnWindowDays}-Day Returns</span>
                  </span>
                </div>

              </div>
            </div>

            {heroBanners.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {heroBanners.map((s, idx) => (
                  <button
                    key={s._id || idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 min-h-[44px] flex items-center px-1 ${
                      currentSlide === idx ? 'w-8 bg-[#C6A15B]' : 'w-3 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full py-20 sm:py-28 bg-gradient-to-br from-[#2D1627] via-[#1C161D] to-[#120F13]">
            <div className="max-w-3xl space-y-5 sm:space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4A1D3F] text-[#C6A15B] border border-[#C6A15B]/30 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Festive & Wedding Couture 2026</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-medium tracking-tight leading-[1.12]">
                Timeless Indian Silhouettes, <br />
                <span className="text-[#C6A15B] italic font-normal">Modern Artisanal Grace.</span>
              </h1>

              <p className="text-[#E5E0D8] text-sm sm:text-base font-light max-w-xl leading-relaxed">
                Handcrafted sarees, designer lehengas, and curated hypoallergenic artificial jewellery tailored in Surat for celebrations and weddings.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <Link to="/shop?category=Women">
                  <Button 
                    variant="champagne" 
                    size="lg" 
                    fullWidth 
                    className="font-semibold shadow-lg text-[#1A1A1A]"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Shop Ethnic Clothing
                  </Button>
                </Link>
                <Link to="/shop?category=Jewellery">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    fullWidth 
                    className="bg-white/10 hover:bg-white text-white hover:text-[#1A1A1A] border-white/30 font-semibold"
                  >
                    Explore Imitation Jewellery
                  </Button>
                </Link>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-white/80 font-medium">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#C6A15B]" />
                  <span>Free Shipping Above ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-[#C6A15B]" />
                  <span>COD Available</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-[#C6A15B]" />
                  <span>{BUSINESS_CONFIG.policies.returnWindowDays}-Day Returns</span>
                </span>
              </div>

            </div>
          </div>
        )}
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
                <h4 className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">Free Express Shipping</h4>
                <p className="text-[11px] text-[#6B7280]">On all orders above ₹{BUSINESS_CONFIG.policies.freeShippingThreshold} in India</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F4EEDF] flex items-center justify-center shrink-0 text-[#C6A15B]">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">Cash on Delivery</h4>
                <p className="text-[11px] text-[#6B7280]">Available across 19,000+ PIN codes</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F6EFF4] flex items-center justify-center shrink-0 text-[#4A1D3F]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">{BUSINESS_CONFIG.policies.returnWindowDays}-Day Returns</h4>
                <p className="text-[11px] text-[#6B7280]">Hassle-free size exchange & return policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F4EEDF] flex items-center justify-center shrink-0 text-[#C6A15B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">Skin-Safe Imitation</h4>
                <p className="text-[11px] text-[#6B7280]">Lead-free hypoallergenic jewellery finish</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. CATEGORY TILES EXPLORER (COLLAPSES CLEANLY IF NO CATEGORIES) ── */}
      {categories.length > 0 && (
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-5 sm:px-8">
          <SectionHeading
            eyebrow="Curated Edits"
            title="Explore by Category"
            subtitle="Discover handcrafted Indian ethnic wear and stunning artificial jewellery created for celebratory moments."
            actionHref="/shop"
            actionText="View All Collections"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-5">
            {categories.map((cat: any) => {
              const catImg = cat.image?.url || cat.thumbnail?.url || '';
              const isJewel = (cat.name || '').toLowerCase().includes('jewel');
              return (
                <Link
                  key={cat._id || cat.name}
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden p-3 transition-all duration-300 hover:border-[#4A1D3F]/40 hover:shadow-md"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF8F5] mb-2.5">
                    {catImg ? (
                      <img
                        src={catImg}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FAF8F5] to-[#EFEAE2] text-[#4A1D3F] font-serif font-bold text-lg">
                        {cat.name?.[0] || 'S'}
                      </div>
                    )}
                    {isJewel && (
                      <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider text-[#C6A15B] border border-[#C6A15B]/30 shadow-xs">
                        Imitation
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-xs sm:text-sm font-medium text-[#1A1A1A] group-hover:text-[#4A1D3F] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-[10px] text-[#6B7280] truncate mt-0.5">
                      {cat.description}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

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
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-[#FAF8F5] rounded-2xl border border-[#E8E5DF] max-w-lg mx-auto">
              <p className="text-xs text-[#6B7280] mb-4">No pieces listed in this section yet.</p>
              <Link to="/shop">
                <Button variant="outline" size="sm">Browse Full Catalog</Button>
              </Link>
            </div>
          )}

          {displayedProducts.length > 0 && (
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
          )}

        </div>
      </section>

      {/* ─── 5. DEDICATED IMITATION JEWELLERY SPOTLIGHT (DATA-DRIVEN) ───── */}
      {(spotlightBanners.length > 0 || spotlightProduct) && (
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
                    {spotlightBanners[0]?.title || "Regal Aesthetics, Everyday Comfort."}
                  </h2>

                  <p className="text-[#E5E0D8] text-xs sm:text-sm md:text-base font-light leading-relaxed max-w-xl">
                    {spotlightBanners[0]?.subtitle || "Our curated imitation jewellery is designed for high-impact celebratory dressing without heavy weight or skin sensitivity. Crafted from hypoallergenic brass with premium micro-plating."}
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
                  {spotlightBanners[0]?.image?.url ? (
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-[#C6A15B]/30">
                      <img
                        src={spotlightBanners[0].image.url}
                        alt="Spotlight Collection"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ) : spotlightProduct && (
                    <Link to={`/product/${spotlightProduct.id}`} className="block group">
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-[#C6A15B]/30">
                        {spotlightProduct.image && (
                          <img
                            src={spotlightProduct.image}
                            alt={spotlightProduct.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-xl p-3 text-[#1A1A1A] flex items-center justify-between">
                          <div className="pr-2">
                            <p className="text-[10px] uppercase font-bold tracking-wider text-[#C6A15B]">Featured Piece</p>
                            <p className="font-serif text-xs font-semibold truncate">{spotlightProduct.name}</p>
                          </div>
                          <span className="text-xs font-bold text-[#1A1A1A] shrink-0">₹{spotlightProduct.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>

              </div>
            </div>

          </div>
        </section>
      )}

      {/* ─── 6. SHOP THE LOOK (PAIRING CLOTHING + JEWELLERY) ──────────── */}
      {((lookbookBanners.length >= 2) || (lookbookClothing && lookbookJewellery)) && (
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-5 sm:px-8">
          <SectionHeading
            eyebrow="Complete The Ensemble"
            title="Shop The Look"
            subtitle="Pair our handcrafted Indian drapes with matching imitation jewellery for the complete celebration edit."
            align="center"
          />

          <div className="bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-10 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Step 1: The Drape / Outfit */}
              {lookbookClothing && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A1D3F] bg-[#F6EFF4] px-3 py-1 rounded-full">
                    Step 1: The Drape
                  </span>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E5DF]">
                    {lookbookClothing.image && (
                      <img
                        src={lookbookClothing.image}
                        alt={lookbookClothing.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="pr-2">
                      <h4 className="font-serif text-sm sm:text-base font-medium text-[#1A1A1A] truncate">{lookbookClothing.name}</h4>
                      <p className="text-xs font-bold text-[#1A1A1A]">₹{lookbookClothing.price.toLocaleString('en-IN')}</p>
                    </div>
                    <Link to={`/product/${lookbookClothing.id}`} className="shrink-0">
                      <Button variant="outline" size="sm">View Saree</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Step 2: The Imitation Jewellery */}
              {lookbookJewellery && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C6A15B] bg-[#F4EEDF] px-3 py-1 rounded-full">
                    Step 2: The Imitation Accent
                  </span>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E5DF]">
                    {lookbookJewellery.image && (
                      <img
                        src={lookbookJewellery.image}
                        alt={lookbookJewellery.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="pr-2">
                      <h4 className="font-serif text-sm sm:text-base font-medium text-[#1A1A1A] truncate">{lookbookJewellery.name}</h4>
                      <p className="text-xs font-bold text-[#1A1A1A]">₹{lookbookJewellery.price.toLocaleString('en-IN')}</p>
                    </div>
                    <Link to={`/product/${lookbookJewellery.id}`} className="shrink-0">
                      <Button variant="champagne" size="sm" className="text-[#1A1A1A]">View Jewellery</Button>
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ─── 7. REAL VERIFIED REVIEWS (COLLAPSES CLEANLY IF NO REVIEWS) ─── */}
      {reviews.length > 0 && (
        <section className="py-16 sm:py-24 bg-white border-t border-[#E8E5DF]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <SectionHeading
              eyebrow="Patron Reflections"
              title="Loved Across India"
              subtitle="Real reviews from customers who celebrated their special days in Sakshi creations."
              align="center"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((r: any, idx: number) => (
                <div 
                  key={r._id || idx}
                  className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E8E5DF] flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-[#C6A15B]">
                      {Array.from({ length: r.rating || 5 }).map((_, i) => (
                        <Star key={i} size={15} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-[#4B5563] italic leading-relaxed">
                      "{r.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E8E5DF]/60">
                    <p className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">{r.customer?.fullName || 'Verified Customer'}</p>
                    <p className="text-[11px] text-[#6B7280]">Verified Purchase</p>
                    {r.product?.name && (
                      <span className="text-[10px] text-[#4A1D3F] font-medium block mt-1">
                        Piece: {r.product.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;