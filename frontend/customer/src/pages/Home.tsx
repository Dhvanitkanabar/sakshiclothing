import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Camera, ArrowDown, Play, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Marquee from '../components/Marquee';
import { toast } from 'sonner';
import { fetchFeaturedProducts, fetchNewArrivals } from '../lib/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [heroBanner, setHeroBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featured, arrivals, cmsRes] = await Promise.all([
          fetchFeaturedProducts(),
          fetchNewArrivals(),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/cms/homepage`)
        ]);
        setFeaturedProducts(featured);
        setNewArrivals(arrivals);
        
        const cmsData = await cmsRes.json();
        if (cmsData.success && cmsData.data.heroBanners && cmsData.data.heroBanners.length > 0) {
          setHeroBanner(cmsData.data.heroBanners[0]);
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const moods = [
    { name: 'Minimalist', img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop', path: '/shop?mood=minimalist', size: 'large' },
    { name: 'Streetwear', img: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=1000&auto=format&fit=crop', path: '/shop?mood=streetwear', size: 'small' },
    { name: 'Avant-Garde', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop', path: '/shop?mood=avant-garde', size: 'small' },
    { name: 'Midnight', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop', path: '/shop?mood=midnight', size: 'large' },
  ];

  const marqueeItems = [
    'NEW ARRIVALS',
    'CRAFTED IN JAIPUR',
    'HANDWOVEN SILK & LINEN',
    'SUMMER 2026 EDIT',
    'EXPRESS SHIPPING WORLDWIDE',
    'SUSTAINABLE LUXURY'
  ];

  return (
    <div ref={containerRef} className="bg-white overflow-x-hidden">
      {/* 1. LOOKBOOK HERO SECTION (PRESERVED BENCHMARK) */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ scale: useTransform(scrollYProgress, [0, 0.2], [1, 1.1]) }}
          className="absolute inset-0 z-0"
        >
          <img
            src={heroBanner ? heroBanner.image?.url : "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"}
            alt="Hero Lookbook"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
        </motion.div>

        <div className="relative z-10 text-center text-white px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-amber-300 mb-6 block">
              {heroBanner ? heroBanner.subtitle : 'Volume 04 — Summer 2026'}
            </span>
            <h1
              className="text-4xl sm:text-6xl lg:text-8xl font-serif font-medium tracking-tight mb-10 leading-tight"
              dangerouslySetInnerHTML={{
                __html: heroBanner ? heroBanner.title.replace('New', '<span class="italic font-light">New</span>') : 'The <span class="italic font-light">New</span> <br />Standard'
              }}
            />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
              <Link
                to={heroBanner?.buttonLink || "/shop"}
                className="group px-8 py-4 bg-white text-black hover:bg-amber-400 rounded-full text-xs font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-xl flex items-center gap-3"
              >
                {heroBanner?.buttonText || 'Explore Collection'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => toast.message("Lookbook Film coming soon", { description: "Our Summer 2026 campaign is currently in production." })}
                className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.25em] text-white/80 hover:text-white transition-colors py-3"
              >
                <Play size={16} fill="currentColor" /> Watch Film
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 pointer-events-none"
        >
          <ArrowDown size={24} />
        </motion.div>
      </section>

      {/* CONTINUOUS MOVING MARQUEE STRIP */}
      <Marquee items={marqueeItems} direction="left" speed={25} dark />

      {/* 2. SHOP BY MOOD */}
      <section className="py-24 md:py-36 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 block mb-3">CURATED AESTHETICS</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900">Shop by <span className="italic font-normal">Mood</span></h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mt-4">
              Fashion is an extension of your internal state. Choose the aesthetic that resonates with your current journey.
            </p>
          </div>
          <Link to="/shop" className="text-xs font-black uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-1 hover:text-amber-600 hover:border-amber-600 transition-colors shrink-0">
            View All Styles →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {moods.map((mood, idx) => (
            <motion.div
              key={mood.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className={`relative overflow-hidden rounded-3xl group cursor-pointer border border-slate-100 shadow-sm ${
                mood.size === 'large' ? 'md:col-span-7 aspect-[16/9]' : 'md:col-span-5 aspect-[4/5]'
              }`}
            >
              <Link to={mood.path} className="block w-full h-full">
                <img
                  src={mood.img}
                  alt={mood.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors duration-500" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10 text-white">
                  <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase mb-1">EDITION</span>
                  <h3 className="text-2xl md:text-4xl font-serif font-bold mb-2">{mood.name}</h3>
                  <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-all">
                    Discover Collection <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED CRAFTSMANSHIP STORY */}
      <section className="py-24 md:py-36 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-400 block">THE MAISON HERITAGE</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight">
                Crafted <br /> <span className="italic font-light text-amber-200">Consciously</span>
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Every stitch tells a story of heritage and innovation. Our studio in Jaipur blends traditional hand-weaving techniques with avant-garde silhouettes designed for modern luxury.
              </p>
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-800">
                <div>
                  <p className="text-2xl font-bold font-serif text-amber-400">100%</p>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Organic Fabric</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-serif text-amber-400">Handmade</p>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Jaipur Artisans</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-serif text-amber-400">Zero</p>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Waste Philosophy</p>
                </div>
              </div>
              <div className="pt-4">
                <Link to="/shop" className="inline-flex items-center gap-3 px-8 py-4 bg-amber-400 text-slate-950 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white transition-colors">
                  Explore Heritage Line <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                <img 
                  src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1000&auto=format&fit=crop" 
                  alt="Craftsmanship"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-slate-950/90 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl max-w-xs hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">Artisanal Promise</p>
                <p className="text-xs text-slate-300 leading-relaxed">Using 100% natural dyes and sustainably harvested silks since 2018.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. TRENDING PRODUCTS GRID */}
      <section className="py-24 md:py-36 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 block mb-2">CURATED BESTSELLERS</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900">Trending <span className="italic font-normal">Now</span></h2>
          </div>
          <Link to="/shop" className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-900 pb-1 hover:text-amber-600 hover:border-amber-600 transition-colors">
            Shop All Products →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-slate-100 rounded-2xl animate-pulse" />
            ))
          ) : (
            featuredProducts.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* CONTINUOUS REVERSE MARQUEE STRIP */}
      <Marquee items={['AUTUMN PREVIEW', 'LIMITED EDITION', 'HAND EMBROIDERED', 'SAKSHI MAISON']} direction="right" speed={30} />

      {/* 5. NEW ARRIVALS SECTION */}
      <section className="py-24 md:py-36 px-6 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-400 block mb-3">LATEST DROPS</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold">New <span className="italic font-normal text-amber-200">Arrivals</span></h2>
            <p className="text-slate-400 text-sm mt-4">Discover the freshest additions to our seasonal wardrobe.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} dark />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-4 px-10 py-4 bg-white text-slate-950 hover:bg-amber-400 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-xl"
            >
              Explore Complete Catalogue <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION BAR */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/80 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Complimentary Shipping</h4>
              <p className="text-xs text-slate-500 mt-1">Free express delivery across India</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Seamless Returns</h4>
              <p className="text-xs text-slate-500 mt-1">7-day doorstep pickup & exchange</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Authenticated Quality</h4>
              <p className="text-xs text-slate-500 mt-1">100% genuine artisanal garments</p>
            </div>
          </div>
        </div>
      </section>

      {/* INSTAGRAM & SOCIAL GALLERY */}
      <section className="py-24 md:py-36 px-6 max-w-7xl mx-auto text-center">
        <Camera size={36} className="mx-auto mb-6 text-amber-600" />
        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 block mb-2">FOLLOW OUR JOURNAL</span>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-12">@SakshiClothing</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=500&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=500&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1529139513402-f209979821ed?q=80&w=500&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=500&auto=format&fit=crop',
          ].map((img, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden group cursor-pointer relative shadow-sm border border-slate-100">
              <img src={img} alt="Instagram post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={24} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
