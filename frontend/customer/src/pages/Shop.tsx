import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import Skeleton from '../components/ui/Skeleton';
import { fetchProducts, getCachedProducts } from '../lib/api';
import { PRODUCTS } from '../data/products';
import { SearchX, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import ProductFilmstripCarousel from '../components/ProductFilmstripCarousel';
import { useSearchParams } from 'react-router-dom';

export const Shop = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const mood = searchParams.get('mood');
  const categoryParam = searchParams.get('category');
  const subParam = searchParams.get('sub') || searchParams.get('subCategory');
  
  // Instant 0ms startup
  const [products, setProducts] = useState<Product[]>(getCachedProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(getCachedProducts);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
  const [selectedSubCategory, setSelectedSubCategory] = useState(subParam || 'All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 160000]);
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [categories, setCategories] = useState<string[]>(['All']);
  const [subCategories, setSubCategories] = useState<string[]>(['All']);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (subParam) setSelectedSubCategory(subParam);
  }, [categoryParam, subParam]);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      const data = await fetchProducts();
      if (!isMounted) return;
      const validData = (data && data.length > 0) ? data : PRODUCTS;
      setProducts(validData);
      setFilteredProducts(validData);

      const cats = new Set<string>();
      const subs = new Set<string>();
      validData.forEach(p => {
        if (p.category) cats.add(p.category);
        if (p.subCategory) subs.add(p.subCategory);
      });
      setCategories(['All', ...Array.from(cats)]);
      setSubCategories(['All', ...Array.from(subs).filter(Boolean)]);

      setLoading(false);
    };
    loadProducts();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (loading) return;
    
    let result = [...products];

    // Search Query Filter
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.subCategory?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    if (mood) {
      const m = mood.toLowerCase();
      if (m === 'minimalist') result = result.filter(p => p.price > 15000);
      if (m === 'royal') result = result.filter(p => p.price > 35000);
    }

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedSubCategory !== 'All') {
      result = result.filter(p => p.subCategory?.toLowerCase() === selectedSubCategory.toLowerCase());
    }

    const [minPrice, maxPrice] = priceRange;
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    if (sortBy === 'low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [selectedCategory, selectedSubCategory, priceRange, sortBy, products, loading, query, mood]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-900 selection:bg-amber-400 selection:text-black pb-28 lg:pb-16">
      {/* Header */}
      <header className="pt-14 sm:pt-20 pb-10 sm:pb-14 px-5 sm:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-3 sm:space-y-4"
        >
          <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-amber-900 font-bold block">
            ATELIER & ARCHIVE · SURAT
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light text-stone-900 tracking-tight">
            {query ? `Search: "${query}"` : mood ? `${mood} Edit` : 'The Imperial Wardrobe'}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed">
            Pure Ahimsa mulberry silks, hand-beaten 24k gold zardozi embroidery, and heirloom Banarasi pit loom weaves handcrafted for discerning connoisseurs.
          </p>
        </motion.div>
      </header>

      {/* 3D Editorial Lookbook Rail */}
      {!query && products.length > 0 && (
        <div className="mb-10 sm:mb-16">
          <ProductFilmstripCarousel
            products={products.slice(0, 8)}
            title="Seasonal Lookbook Rail"
            subtitle="Interact with 3D perspectives to preview full cuts, embroidery finishes, and silhouette drape."
            variant="beige"
          />
        </div>
      )}

      {/* Horizontal Filter Chips & Filter Drawer Trigger */}
      <div className="sticky top-14 sm:top-16 z-30 bg-[#FAF8F5]/90 backdrop-blur-xl border-y border-stone-200/80 py-3 sm:py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {/* Scrollable Category Pills */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar snap-x flex-grow py-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-sans uppercase tracking-wider font-bold whitespace-nowrap transition-all snap-start ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-stone-900 text-white shadow-xs' 
                    : 'bg-white text-stone-700 hover:bg-stone-200/80 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
            {subCategories.length > 1 && (
              <>
                <div className="w-px h-7 bg-stone-300 mx-1 shrink-0 self-center" />
                {subCategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-sans uppercase tracking-wider font-medium whitespace-nowrap transition-all snap-start ${
                      selectedSubCategory.toLowerCase() === sub.toLowerCase()
                        ? 'bg-amber-900 text-white shadow-xs' 
                        : 'bg-white/80 text-stone-600 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </>
            )}
          </div>

          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-stone-900 hover:bg-amber-800 text-white rounded-full text-xs font-sans uppercase tracking-widest font-bold shrink-0 transition-colors shadow-sm"
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Filter & Sort</span>
            <span className="sm:hidden">Sort</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Overlay (Mobile Friendly) */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm sm:max-w-md bg-white z-50 p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center pb-6 border-b border-stone-200 mb-6">
                  <h2 className="text-xl sm:text-2xl font-sans font-bold text-stone-900">Filter & Refine</h2>
                  <button 
                    onClick={() => setIsFilterOpen(false)} 
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-stone-400 font-bold block">
                      SORT ARCHIVE BY
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'featured', label: 'Curated' },
                        { id: 'newest', label: 'New Arrivals' },
                        { id: 'low-high', label: 'Price: Low to High' },
                        { id: 'high-low', label: 'Price: High to Low' },
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => setSortBy(option.id)}
                          className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all border ${
                            sortBy === option.id 
                              ? 'bg-stone-900 text-white border-stone-900 font-bold' 
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-stone-400 font-bold block">
                      MAXIMUM PRICE
                    </span>
                    <div className="space-y-2">
                      <input 
                        type="range" 
                        min="10000" 
                        max="160000" 
                        step="5000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                        className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <div className="flex justify-between text-xs font-sans text-stone-500">
                        <span>₹10,000</span>
                        <span className="font-bold text-stone-900">₹{priceRange[1].toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-200 mt-8 space-y-2">
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-3.5 bg-stone-900 text-white rounded-2xl text-xs font-sans uppercase tracking-widest font-bold shadow-md hover:bg-amber-800 transition-colors"
                >
                  Show {filteredProducts.length} Products
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedSubCategory('All');
                    setPriceRange([0, 160000]);
                    setSortBy('featured');
                  }}
                  className="w-full py-2.5 text-stone-500 hover:text-stone-950 text-xs font-sans transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Grid (2 columns on mobile, 3 on tablet, 4 on desktop) */}
      <main className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
              <motion.div 
                layout
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8"
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 sm:py-36 bg-white rounded-3xl border border-stone-200 p-8"
              >
                <SearchX size={48} className="mx-auto mb-4 text-stone-300" />
                <h3 className="text-xl sm:text-2xl font-sans font-bold text-stone-900 mb-2">No products found</h3>
                <p className="text-stone-500 text-xs sm:text-sm font-light mb-8 max-w-md mx-auto">
                  Adjust your search parameters or price thresholds to explore more pieces from the collection.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedSubCategory('All');
                    setPriceRange([0, 160000]);
                    setSortBy('featured');
                  }}
                  className="px-8 py-3 bg-stone-900 text-white rounded-2xl text-xs font-sans uppercase tracking-widest font-bold hover:bg-amber-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default Shop;
