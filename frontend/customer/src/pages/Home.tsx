import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowRight, ShoppingBag, Camera, ArrowDown, Play } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
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

  return (
    <div ref={containerRef} className="bg-luxury-white">
      {/* 1. LOOKBOOK HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ scale: useTransform(scrollYProgress, [0, 0.2], [1, 1.1]) }}
          className="absolute inset-0 z-0"
        >
          <img
            src={heroBanner ? heroBanner.image.url : "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"}
            alt="Hero Lookbook"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>

        <div className="relative z-10 text-center text-white px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="caption text-white/80 mb-6 block">{heroBanner ? heroBanner.subtitle : 'Volume 04 — Summer 2026'}</span>
            <h1 className="heading-xl mb-12" dangerouslySetInnerHTML={{ __html: heroBanner ? heroBanner.title.replace('New', '<span class="italic font-light">New</span>') : 'The <span class="italic font-light">New</span> <br />Standard' }}>
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <Link
                to={heroBanner?.buttonLink || "/shop"}
                className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] border-b border-white/30 pb-2 hover:border-white transition-all"
              >
                {heroBanner?.buttonText || 'Explore Collection'} <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <button 
                onClick={() => toast.message("Lookbook Film coming soon", { description: "Our Summer 2026 campaign is currently in production." })}
                className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-white transition-colors"
              >
                <Play size={16} fill="currentColor" /> Watch Film
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40"
        >
          <ArrowDown size={24} />
        </motion.div>
      </section>

      {/* 2. SHOP BY MOOD (CREATIVE LAYOUT) */}
      <section className="py-40 px-6 max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-24 gap-12">
          <div className="max-w-2xl">
            <span className="caption mb-6 block">Curation</span>
            <h2 className="heading-lg mb-8">Shop by <span className="italic">Mood</span></h2>
            <p className="text-muted text-lg leading-relaxed max-w-md">
              Fashion is an extension of your internal state. Choose the aesthetic that resonates with your current journey.
            </p>
          </div>
          <Link to="/shop" className="caption border-b border-black pb-2 text-black">View All Styles</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {moods.map((mood, idx) => (
            <motion.div
              key={mood.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className={`relative overflow-hidden rounded-3xl group cursor-pointer ${
                mood.size === 'large' ? 'md:col-span-7 aspect-[16/9]' : 'md:col-span-5 aspect-[4/5]'
              }`}
            >
              <img
                src={mood.img}
                alt={mood.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
              <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
                <h3 className="text-4xl font-serif font-bold mb-4">{mood.name}</h3>
                <Link to={mood.path} className="caption text-white/0 group-hover:text-white transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  Discover Pieces
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED STORY (SPLIT SCREEN) */}
      <section className="py-40 bg-beige overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="space-y-12"
            >
              <span className="caption">The Maison</span>
              <h2 className="heading-lg">Crafted <br /> <span className="italic">Consciously</span></h2>
              <p className="text-muted text-xl leading-relaxed">
                Every stitch tells a story of heritage and innovation. Our studio in Jaipur blends traditional hand-weaving techniques with avant-garde silhouettes.
              </p>
              <div className="pt-8">
                <Link to="/about" className="px-12 py-5 bg-black text-white rounded-full caption hover:bg-muted transition-colors">
                  Our Story
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="aspect-[3/4] rounded-[4rem] overflow-hidden luxury-shadow">
                <img 
                  src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1000&auto=format&fit=crop" 
                  alt="Craftsmanship"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-white rounded-[3rem] p-8 luxury-shadow hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-black mb-4">Materiality</p>
                <p className="text-xs text-muted leading-relaxed">Using 100% organic cotton and natural dyes since 2018.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. HORIZONTAL SCROLL EXPERIENCE (TRENDING) */}
      <section className="py-40 overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6 mb-24">
          <div className="flex justify-between items-end">
            <h2 className="heading-lg">Trending <span className="italic">Now</span></h2>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center text-muted">←</div>
              <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center text-black">→</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <motion.div 
            className="flex gap-12 px-6 md:px-[calc((100vw-1700px)/2)] overflow-x-auto no-scrollbar pb-20 snap-x"
          >
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="min-w-[400px] aspect-[3/4] bg-beige rounded-[3rem] animate-pulse" />
              ))
            ) : (
              featuredProducts.map(product => (
                <motion.div 
                  key={product.id} 
                  className="min-w-[320px] md:min-w-[450px] snap-center"
                  whileHover={{ y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* 5. ASYMMETRIC PRODUCT LAYOUT (NEW ARRIVALS) */}
      <section className="py-40 px-6 bg-luxury-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <span className="caption text-white/40 mb-6 block">Latest Drop</span>
            <h2 className="heading-lg text-white">New <span className="italic">Arrivals</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
            {newArrivals.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`${
                  idx % 3 === 0 ? 'md:col-span-8' : 'md:col-span-4'
                } ${idx % 2 !== 0 ? 'md:mt-24' : ''}`}
              >
                <ProductCard product={product} dark />
              </motion.div>
            ))}
          </div>
          
          <div className="mt-32 text-center">
            <Link to="/shop" className="group inline-flex items-center gap-6 heading-lg text-white/20 hover:text-white transition-colors">
              View All <ArrowRight size={64} strokeWidth={1} className="group-hover:translate-x-8 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER INSTAGRAM */}
      <section className="py-40 px-6 max-w-7xl mx-auto text-center">
        <Camera size={48} className="mx-auto mb-12 text-muted" />
        <h2 className="text-4xl md:text-6xl font-serif mb-12">@SakshiClothing</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=500&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=500&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1529139513402-f209979821ed?q=80&w=500&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=500&auto=format&fit=crop',
          ].map((img, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden">
              <img src={img} alt="Instagram" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
