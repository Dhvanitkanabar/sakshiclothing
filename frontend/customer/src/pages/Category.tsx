import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, SlidersHorizontal, SearchX, X, Sparkles, ArrowUpRight, CheckCircle2, ShieldCheck, Truck, Filter } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import { fetchProducts, API_URL } from '../lib/api';

// Curated high-resolution realistic photography for categories & subcategories
const CATEGORY_IMAGES: Record<string, string> = {
  jewellery: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80',
  clothing: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80',
  accessories: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1920&q=80',
  footwear: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1920&q=80',
};

const SUBCATEGORY_IMAGES: Record<string, string> = {
  // Clothing Subcategories
  'dresses': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
  'tops & shirts': 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=800&q=80',
  'tops': 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=800&q=80',
  'sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
  'kurtas': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
  'lehengas': 'https://images.unsplash.com/photo-1583391733975-0e7195821c9a?w=800&q=80',
  'jackets': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
  'bottoms': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',

  // Jewellery Subcategories
  'necklaces': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
  'earrings': 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80',
  'bangles': 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=800&q=80',
  'bracelets': 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=800&q=80',
  'rings': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
  'pendants': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',

  // Accessories Subcategories
  'handbags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
  'bags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
  'sunglasses': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
  'scarves': 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
  'belts': 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80',

  // Footwear Subcategories
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

const Category = () => {
  const { main, sub } = useParams<{ main: string; sub?: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxProductPrice, setMaxProductPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch subcategories for the current main category
  useEffect(() => {
    if (!main) return;
    fetch(`${API_URL}/categories?parentSlug=${main}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
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
      const filterKey = sub || main;
      const data = await fetchProducts({ category: filterKey });
      setProducts(data);
      setFilteredProducts(data);
      if (data.length > 0) {
        const maxP = Math.max(...data.map((p: Product) => p.price), 1000);
        setMaxProductPrice(Math.ceil(maxP / 500) * 500);
        setPriceRange([0, Math.ceil(maxP / 500) * 500]);
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
    else if (sortBy === 'featured') result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    setFilteredProducts(prev => {
      if (JSON.stringify(prev) === JSON.stringify(result)) return prev;
      return result;
    });
  }, [priceRange[0], priceRange[1], sortBy, products, loading]);

  const heroImage = CATEGORY_IMAGES[main?.toLowerCase() || ''] || `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80`;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Category Hero Header */}
      <div className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden bg-black text-white">
        <motion.div
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.65, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={heroImage}
            alt={main}
            className="w-full h-full object-cover filter brightness-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-black/40 to-black/60" />
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24 pb-16">
          <motion.nav
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] text-white uppercase tracking-[0.3em] mb-8 font-sans font-bold shadow-2xl"
          >
            <Link to="/" className="hover:text-amber-300 transition-colors">Home</Link>
            <ChevronRight size={10} />
            <Link to={`/category/${main}`} className="hover:text-amber-300 transition-colors">{main}</Link>
            {sub && (
              <>
                <ChevronRight size={10} />
                <span className="text-amber-300">{sub}</span>
              </>
            )}
          </motion.nav>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-8xl font-serif font-medium tracking-tight text-white capitalize leading-tight mb-4 drop-shadow-md"
          >
            {sub ? sub : main}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-sm md:text-base font-light max-w-xl mx-auto tracking-wide"
          >
            Handcrafted luxury pieces curated with precision, elegance, and timeless allure.
          </motion.p>

          {/* Luxury Highlights Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap justify-center items-center gap-6 md:gap-12 text-[11px] font-bold text-white/90 uppercase tracking-widest"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-400" /> 100% Authentic Luxury
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> Artisan Handcrafted
            </div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-amber-400" /> Express Complimentary Shipping
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 py-16">



        <div className="flex flex-col lg:flex-row gap-12">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-black bg-black text-white px-6 py-3 rounded-xl"
            >
              <SlidersHorizontal size={14} />
              {showFilters ? 'Hide Filters' : 'Filter & Sort'}
            </button>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              {filteredProducts.length} Products
            </span>
          </div>

          {/* Premium Sidebar */}
          <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-32 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-10">

              {/* Subcategories Sidebar Filter */}
              {subcategories.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                    <Filter size={14} className="text-black" />
                    <p className="text-xs font-serif font-bold uppercase tracking-wider text-black">Subcollections</p>
                  </div>
                  <ul className="space-y-1.5">
                    <li>
                      <Link
                        to={`/category/${main}`}
                        className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition-all ${
                          !sub ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                        }`}
                      >
                        <span>All {main}</span>
                        <ChevronRight size={12} />
                      </Link>
                    </li>
                    {subcategories.map((sc: any) => (
                      <li key={sc._id}>
                        <Link
                          to={`/category/${main}/${sc.slug}`}
                          className={`flex items-center justify-between text-xs font-medium uppercase tracking-wider px-4 py-3 rounded-xl transition-all ${
                            sub === sc.slug ? 'bg-black text-white font-bold shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                          }`}
                        >
                          <span>{sc.name}</span>
                          <ChevronRight size={12} className={sub === sc.slug ? 'text-white' : 'text-gray-400'} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-100">
                  <p className="text-xs font-serif font-bold uppercase tracking-wider text-black">Max Price</p>
                  <span className="text-xs font-bold text-black">₹{priceRange[1].toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxProductPrice}
                  step={100}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-black h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-gray-500 font-medium mt-3">
                  <span>₹0</span>
                  <span>₹{maxProductPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Sort By Dropdown */}
              <div>
                <div className="pb-3 mb-4 border-b border-gray-100">
                  <p className="text-xs font-serif font-bold uppercase tracking-wider text-black">Sort Order</p>
                </div>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-xs text-black font-medium focus:ring-2 focus:ring-black focus:outline-none bg-gray-50/50"
                >
                  <option value="featured">✨ Featured Collection</option>
                  <option value="low-high">🏷️ Price: Low to High</option>
                  <option value="high-low">💎 Price: High to Low</option>
                </select>
              </div>

              {/* Active filters summary */}
              {(priceRange[1] < maxProductPrice || sortBy !== 'featured') && (
                <button
                  onClick={() => { setPriceRange([0, maxProductPrice]); setSortBy('featured'); }}
                  className="w-full py-3 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-rose-100 transition-all"
                >
                  <X size={14} /> Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid Main Area */}
          <main className="flex-grow">
            <div className="hidden lg:flex justify-between items-center mb-8 pb-4 border-b border-gray-200/60">
              <div>
                <h3 className="text-xl font-serif font-bold text-black uppercase tracking-wide">
                  {sub ? `${sub} Collection` : `All ${main}`}
                </h3>
                <p className="text-xs text-muted mt-0.5">Showing {filteredProducts.length} luxury creations</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-6">
                    <Skeleton className="aspect-[3/4] rounded-3xl" />
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredProducts.length > 0 ? (
                  <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center px-6"
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-black border border-gray-100">
                      <SearchX size={32} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-black mb-2">No Pieces Found</h3>
                    <p className="text-muted font-light max-w-sm mx-auto mb-8 text-xs leading-relaxed">
                      We couldn't find any products matching your current price or category criteria. Try broadening your filter selection.
                    </p>
                    <button
                      onClick={() => { setPriceRange([0, maxProductPrice]); setSortBy('featured'); if (sub) navigate(`/category/${main}`); }}
                      className="px-8 py-4 rounded-2xl bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-md"
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
