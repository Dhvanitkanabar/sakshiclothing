import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, SlidersHorizontal, SearchX, X, Sparkles, ShieldCheck, Truck, Filter } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import { fetchProducts, API_URL, getCachedProducts } from '../lib/api';
import { PRODUCTS } from '../data/products';

// Curated high-resolution realistic photography for categories & subcategories
const CATEGORY_IMAGES: Record<string, string> = {
  jewellery: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&q=80',
  women: 'https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?w=1920&q=80',
  men: 'https://images.unsplash.com/photo-1783188223691-8a233ee51cd8?w=1920&q=80',
  kids: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=1920&q=80',
  bridal: 'https://images.unsplash.com/photo-1651132133386-a64fbf794081?w=1920&q=80',
  clothing: 'https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?w=1920&q=80'
};

const SUBCATEGORY_IMAGES: Record<string, string> = {
  'bridal lehengas': 'https://images.unsplash.com/photo-1651132133386-a64fbf794081?w=800&q=80',
  'heritage sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
  'sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
  'heritage sherwanis': 'https://images.unsplash.com/photo-1783188223691-8a233ee51cd8?w=800&q=80',
  'couture anarkalis': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
  'modern kurtas': 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80',
  'suits & jackets': 'https://plus.unsplash.com/premium_photo-1682090774051-77cdd6b1e7cd?w=800&q=80',
  'heritage jewels': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
};

const getSubCategoryImage = (subName: string) => {
  const nameKey = (subName || '').toLowerCase().trim();
  if (SUBCATEGORY_IMAGES[nameKey]) return SUBCATEGORY_IMAGES[nameKey];
  return 'https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?w=800&q=80';
};

export const Category = () => {
  const { main, sub } = useParams<{ main: string; sub?: string }>();
  const navigate = useNavigate();
  // Initialize empty and load from server
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 160000]);
  const [maxProductPrice, setMaxProductPrice] = useState(160000);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!main) return;
    fetch(`${API_URL}/categories?parentSlug=${main}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          const subs = (data.data || []).filter((c: any) =>
            c.parentCategory?.slug?.toLowerCase() === main.toLowerCase() ||
            c.parentCategory?.name?.toLowerCase() === main.toLowerCase()
          );
          setSubcategories(subs);
        }
      })
      .catch(() => {});
  }, [main]);

  useEffect(() => {
    const loadCategoryProducts = async () => {
      setLoading(true);
      const filterKey = sub || main || '';
      const data = await fetchProducts({ category: filterKey });
      
      let validData = Array.isArray(data) ? data : [];
      if (validData.length === 0) {
        const lowerKey = filterKey.toLowerCase();
        validData = PRODUCTS.filter(p => 
          p.category.toLowerCase() === lowerKey || 
          p.subCategory?.toLowerCase().includes(lowerKey) ||
          p.name.toLowerCase().includes(lowerKey)
        );
      }
      
      setProducts(validData);
      setFilteredProducts(validData);
      if (validData.length > 0) {
        const maxP = Math.max(...validData.map((p: Product) => p.price), 160000);
        setMaxProductPrice(Math.ceil(maxP / 5000) * 5000);
        setPriceRange([0, Math.ceil(maxP / 5000) * 5000]);
      }
      setLoading(false);
    };
    loadCategoryProducts();
  }, [main, sub]);

  useEffect(() => {
    if (loading) return;
    let result = [...products];
    const [minPrice, maxPrice] = priceRange;
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);
    if (sortBy === 'low-high') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'high-low') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    setFilteredProducts(result);
  }, [priceRange[0], priceRange[1], sortBy, products, loading]);

  const heroImage = CATEGORY_IMAGES[main?.toLowerCase() || ''] || `https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?w=1920&q=80`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 lg:pb-16 text-stone-900 selection:bg-amber-400 selection:text-black">
      {/* Category Hero Header */}
      <div className="relative min-h-[42vh] sm:min-h-[50vh] flex items-center justify-center overflow-hidden bg-stone-950 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.65, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={heroImage}
            alt={main}
            className="w-full h-full object-cover filter brightness-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-black/45 to-black/60" />
        </motion.div>

        <div className="relative z-10 text-center px-5 max-w-4xl mx-auto pt-16 pb-12 sm:pt-20 sm:pb-16">
          <motion.nav
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] sm:text-[10px] text-white uppercase tracking-[0.28em] mb-6 font-sans font-bold shadow-xl"
          >
            <Link to="/" className="hover:text-amber-300 transition-colors">Atelier</Link>
            <ChevronRight size={10} />
            <Link to={`/category/${main}`} className="hover:text-amber-300 transition-colors capitalize">{main}</Link>
            {sub && (
              <>
                <ChevronRight size={10} />
                <span className="text-amber-300 capitalize">{sub}</span>
              </>
            )}
          </motion.nav>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tight text-white capitalize leading-tight mb-3 drop-shadow-md"
          >
            {sub ? sub : main}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-white/80 text-xs sm:text-sm font-light max-w-lg mx-auto tracking-wide"
          >
            Authentic handcrafted fashion curated with precision, premium tailoring, and contemporary silhouettes.
          </motion.p>

          {/* Highlights Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-6 sm:mt-8 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-[10px] sm:text-[11px] font-sans text-white/90 uppercase tracking-widest"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-400" /> Certified Premium Quality Garments
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" /> 24K Real Zari Craft
            </div>
            <div className="flex items-center gap-1.5">
              <Truck size={14} className="text-amber-400" /> Insured White-Glove Courier
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Mobile Filter Toggle Bar */}
        <div className="lg:hidden flex justify-between items-center mb-6 pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-base font-sans font-bold text-stone-900 uppercase">
              {sub ? `${sub}` : `All ${main}`}
            </h3>
            <p className="text-[11px] font-sans text-stone-500">{filteredProducts.length} Items</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-full text-xs font-sans uppercase tracking-wider font-bold"
          >
            <Filter size={12} />
            <span>Refine</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-64 shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-widest text-stone-400 font-bold block mb-3">
                  PRICE THRESHOLD
                </span>
                <input
                  type="range"
                  min="0"
                  max={maxProductPrice}
                  step="5000"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs font-sans text-stone-600 mt-2">
                  <span>₹0</span>
                  <span className="font-bold text-stone-900">₹{priceRange[1].toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-sans uppercase tracking-widest text-stone-400 font-bold block mb-3">
                  SORT ORDER
                </span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-sans text-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none bg-stone-50"
                >
                  <option value="featured">✦ Curated Collection</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>

              {(priceRange[1] < maxProductPrice || sortBy !== 'featured') && (
                <button
                  onClick={() => { setPriceRange([0, maxProductPrice]); setSortBy('featured'); }}
                  className="w-full py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-700 text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-stone-200 transition-colors"
                >
                  <X size={13} /> Reset Filters
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid Area (2 columns on mobile, 3 on desktop) */}
          <main className="flex-grow w-full">
            <div className="hidden lg:flex justify-between items-center mb-6 pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-xl font-sans font-bold text-stone-900 uppercase tracking-wide">
                  {sub ? `${sub} Atelier` : `All ${main} Masterpieces`}
                </h3>
                <p className="text-xs font-sans text-stone-500 mt-0.5">Showing {filteredProducts.length} items</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredProducts.length > 0 ? (
                  <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </motion.div>
                ) : products.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 sm:py-28 bg-white rounded-3xl border border-stone-200/90 shadow-sm flex flex-col items-center px-6 sm:px-12 space-y-5"
                  >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-sans font-bold uppercase tracking-widest">
                      <Sparkles size={12} className="text-amber-600" />
                      <span>New Collection In Progress</span>
                    </div>

                    <div className="space-y-2 max-w-lg mx-auto">
                      <h3 className="text-2xl sm:text-4xl font-sans font-bold text-stone-900 capitalize tracking-tight">
                        {sub || main} Collection Coming Soon...
                      </h3>
                      <p className="text-stone-500 font-light text-xs sm:text-sm leading-relaxed">
                        Our master karigars and designers are currently curating and handcrafting our upcoming {sub || main} collection. Exquisite fabrics, bespoke silhouettes, and heirloom craftsmanship will be arriving shortly.
                      </p>
                    </div>

                    {/* 3 Value Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl py-4 text-left">
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                        <p className="text-xs font-bold text-stone-900">Handcrafted Quality</p>
                        <p className="text-[11px] text-stone-500 font-light">Artisanal embroidery and pure textiles tailored to perfection.</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                        <p className="text-xs font-bold text-stone-900">Curated New Drop</p>
                        <p className="text-[11px] text-stone-500 font-light">Seasonal colors and modern fits currently in production.</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                        <p className="text-xs font-bold text-stone-900">Priority Patron Access</p>
                        <p className="text-[11px] text-stone-500 font-light">Join the Atelier Circle in the footer for early notification.</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <Link
                        to="/shop?category=Women"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-900 text-white font-sans uppercase tracking-widest text-xs font-bold hover:bg-amber-800 transition-colors shadow-md"
                      >
                        Explore Women's Collection
                      </Link>
                      <Link
                        to="/shop"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-sans uppercase tracking-widest text-xs font-bold transition-colors"
                      >
                        View All Collections
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 sm:py-32 bg-white rounded-3xl border border-stone-200 shadow-xs flex flex-col items-center px-6"
                  >
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400">
                      <SearchX size={28} />
                    </div>
                    <h3 className="text-xl font-sans font-bold text-stone-900 mb-2">No Products Found</h3>
                    <p className="text-stone-500 font-light max-w-sm mx-auto mb-6 text-xs leading-relaxed">
                      We couldn't find any creations matching your current price threshold. Try broadening your filter selection.
                    </p>
                    <button
                      onClick={() => { setPriceRange([0, maxProductPrice]); setSortBy('featured'); if (sub) navigate(`/category/${main}`); }}
                      className="px-6 py-3 rounded-xl bg-stone-900 text-white font-sans uppercase tracking-widest text-xs font-bold hover:bg-amber-800 transition-colors"
                    >
                      Explore All {main}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Category;
