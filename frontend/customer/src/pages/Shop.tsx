import React, { useEffect, useState, useMemo } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import Skeleton from '../components/ui/Skeleton';
import { fetchProducts, getCachedProducts } from '../lib/api';
import { PRODUCTS } from '../data/products';
import { SearchX, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const CATEGORY_META: Record<string, { badge: string; title: string; description: string; subcategories: string[] }> = {
  men: {
    badge: "SAKSHI ATELIER · MEN'S COUTURE",
    title: "Men's Collection",
    description: "Contemporary tailoring, classic sherwanis, kurtas, jackets, and refined menswear handcrafted by master artisans in Surat.",
    subcategories: ['All', 'Kurtas & Kurta Sets', 'Jackets & Blazers', 'Ethnic & Festive Wear', 'Shirts & Trousers']
  },
  women: {
    badge: "SAKSHI ATELIER · WOMEN'S COUTURE",
    title: "Women's Collection",
    description: "Handcrafted lehengas, artisanal sarees, couture anarkalis, and contemporary silhouettes designed for timeless elegance.",
    subcategories: ['All', 'Ethnic & Festive Sets', 'Dresses & Indo-Western', 'Sarees & Drapes', 'Suits & Kurtis']
  },
  kids: {
    badge: "SAKSHI ATELIER · KIDS COUTURE",
    title: "Kids Collection",
    description: "Charming festive wear, artisanal kurtas, celebratory ensembles, and comfort-first occasion wear for boys and girls.",
    subcategories: ['All', 'Boys Clothing', 'Girls Clothing', 'Kids Festive & Ethnic Wear', 'Casual & Party Wear']
  },
  jewellery: {
    badge: "SAKSHI ATELIER · HEIRLOOM JEWELLERY",
    title: "Jewellery Collection",
    description: "Heirloom Kundan suites, bespoke chokers, temple bangles, and artisan-crafted festive jewellery.",
    subcategories: ['All', 'Necklaces & Chokers', 'Earrings & Jhumkas', 'Bangles & Bracelets', 'Festive Jewellery Sets']
  }
};

export const Shop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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

  const categories = ['All', 'Women', 'Men', 'Kids', 'Jewellery'];

  // Two-way sync with search params
  useEffect(() => {
    setSelectedCategory(categoryParam || 'All');
    setSelectedSubCategory(subParam || 'All');
  }, [categoryParam, subParam]);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      const data = await fetchProducts();
      if (!isMounted) return;
      const validData = (data && data.length > 0) ? data : PRODUCTS;
      setProducts(validData);
      setFilteredProducts(validData);
      setLoading(false);
    };
    loadProducts();
    return () => { isMounted = false; };
  }, []);

  // Category metadata (badge, title, description, subcategories)
  const categoryMeta = useMemo(() => {
    const key = (selectedCategory || '').toLowerCase();
    if (CATEGORY_META[key]) {
      return CATEGORY_META[key];
    }
    return {
      badge: "ATELIER & ARCHIVE · SURAT",
      title: "All Collections",
      description: "Curated artisanal apparel across Women, Men, Kids, and Heirloom Jewellery handcrafted by master artisans in Surat.",
      subcategories: ['All']
    };
  }, [selectedCategory]);

  // Dynamic subcategories: merge static defaults with dynamic ones from products in that category
  const activeSubcategories = useMemo(() => {
    if (selectedCategory === 'All') {
      const dynamicSubs = new Set<string>();
      products.forEach(p => {
        if (p.subCategory) dynamicSubs.add(p.subCategory);
      });
      return ['All', ...Array.from(dynamicSubs).filter(Boolean)];
    }

    const defaultSubs = categoryMeta.subcategories;
    const dynamicSubs = new Set<string>(defaultSubs);
    products
      .filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())
      .forEach(p => {
        if (p.subCategory) dynamicSubs.add(p.subCategory);
      });

    return Array.from(dynamicSubs);
  }, [selectedCategory, categoryMeta, products]);

  useEffect(() => {
    if (loading) return;
    
    let result = [...products];

    // Multi-term Smart Search Filter
    if (query) {
      const cleanQ = query.trim().toLowerCase();
      const terms = cleanQ.split(/\s+/).filter(Boolean);
      result = result.filter(p => {
        const fullText = `${p.name} ${p.category} ${p.subCategory || ''} ${p.description || ''}`.toLowerCase();
        return fullText.includes(cleanQ) || (terms.length > 0 && terms.every(t => fullText.includes(t))) || (terms.length > 0 && terms.some(t => fullText.includes(t)));
      });
    }

    if (mood) {
      const m = mood.toLowerCase();
      if (m === 'minimalist') result = result.filter(p => p.price > 15000);
      if (m === 'royal') result = result.filter(p => p.price > 35000);
    }

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
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

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubCategory('All');
    if (cat === 'All') {
      navigate('/shop');
    } else {
      navigate(`/shop?category=${encodeURIComponent(cat)}`);
    }
  };

  const handleSubCategoryClick = (sub: string) => {
    setSelectedSubCategory(sub);
    if (sub === 'All') {
      if (selectedCategory === 'All') {
        navigate('/shop');
      } else {
        navigate(`/shop?category=${encodeURIComponent(selectedCategory)}`);
      }
    } else {
      navigate(`/shop?category=${encodeURIComponent(selectedCategory)}&sub=${encodeURIComponent(sub)}`);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-900 selection:bg-amber-400 selection:text-black pb-28 lg:pb-16">
      {/* Category or Search Header */}
      {query ? (
        <header className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-5 sm:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-stone-200/80 pb-4">
            <div>
              <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-amber-700 font-bold block mb-1">
                Atelier Search Archive
              </span>
              <h1 className="text-2xl sm:text-3xl font-sans font-semibold text-stone-900 tracking-tight flex items-baseline gap-2">
                Search: <span className="font-serif italic font-normal text-stone-800">"{query}"</span>
              </h1>
            </div>
            <p className="text-stone-500 text-xs sm:text-sm font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'creation' : 'creations'} found
            </p>
          </div>
        </header>
      ) : (
        <header className="pt-12 sm:pt-16 pb-8 sm:pb-10 px-5 sm:px-8 max-w-7xl mx-auto text-center">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-amber-900 font-bold block">
              {categoryMeta.badge}
            </span>
            <h1 className="text-3xl sm:text-5xl font-sans font-light text-stone-900 tracking-tight">
              {mood ? `${mood} Edit` : categoryMeta.title}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm font-light max-w-2xl mx-auto leading-relaxed">
              {categoryMeta.description}
            </p>
          </motion.div>
        </header>
      )}

      {/* Horizontal Filter Chips & Filter Drawer Trigger */}
      <div className="sticky top-14 sm:top-16 z-30 bg-[#FAF8F5]/90 backdrop-blur-xl border-y border-stone-200/80 py-3 sm:py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {/* Scrollable Category Pills */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar snap-x flex-grow py-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-sans uppercase tracking-wider font-bold whitespace-nowrap transition-all snap-start ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-stone-900 text-white shadow-xs' 
                    : 'bg-white text-stone-700 hover:bg-stone-200/80 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}

            {activeSubcategories.length > 1 && (
              <>
                <div className="w-px h-7 bg-stone-300 mx-1 shrink-0 self-center" />
                {activeSubcategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => handleSubCategoryClick(sub)}
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
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <h3 className="text-xl font-sans font-bold text-stone-900">Filter & Refine</h3>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-sans uppercase tracking-wider text-stone-500 font-bold">
                    <span>Price Range</span>
                    <span className="text-stone-900 font-bold">₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}</span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={160000} 
                    step={2000}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-stone-400 font-sans">
                    <span>₹0</span>
                    <span>₹1,60,000+</span>
                  </div>
                </div>

                {/* Sort Option */}
                <div className="space-y-3">
                  <label className="text-xs font-sans uppercase tracking-wider text-stone-500 font-bold block">
                    Sort Order
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'featured', label: '✦ Atelier Curated' },
                      { id: 'low-high', label: 'Price: Low to High' },
                      { id: 'high-low', label: 'Price: High to Low' },
                      { id: 'newest', label: 'Seasonal Highlights' }
                    ].map(sort => (
                      <button
                        key={sort.id}
                        onClick={() => setSortBy(sort.id)}
                        className={`text-left px-4 py-3 rounded-xl text-xs font-sans font-medium transition-all ${
                          sortBy === sort.id 
                            ? 'bg-stone-900 text-white font-bold' 
                            : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {sort.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-200 flex gap-3">
                <button
                  onClick={() => {
                    setPriceRange([0, 160000]);
                    setSortBy('featured');
                  }}
                  className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-sans font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider hover:bg-amber-800 transition-colors shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Product Showcase Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 sm:mt-12">
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
            ) : (selectedCategory !== 'All' && !products.some(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())) ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 sm:py-28 bg-white rounded-3xl border border-stone-200/90 shadow-sm flex flex-col items-center px-6 sm:px-12 space-y-5"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-sans font-bold uppercase tracking-widest">
                  <Sparkles size={12} className="text-amber-600" />
                  <span>New Drop In Progress</span>
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <h3 className="text-2xl sm:text-4xl font-sans font-bold text-stone-900 capitalize tracking-tight">
                    {selectedCategory} Collection Coming Soon...
                  </h3>
                  <p className="text-stone-500 font-light text-xs sm:text-sm leading-relaxed">
                    Our master artisans and designers are currently curating and handcrafting our upcoming {selectedCategory} collection. Exquisite fabrics, bespoke silhouettes, and heirloom craftsmanship will be arriving shortly.
                  </p>
                </div>

                {/* 3 Value Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl py-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                    <p className="text-xs font-bold text-stone-900">Handcrafted Excellence</p>
                    <p className="text-[11px] text-stone-500 font-light">Artisanal tailoring and pure textiles designed to perfection.</p>
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
                  <button
                    onClick={() => handleCategoryClick('All')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-900 text-white font-sans uppercase tracking-widest text-xs font-bold hover:bg-amber-800 transition-colors shadow-md"
                  >
                    Explore Available Collections
                  </button>
                  <button
                    onClick={() => handleCategoryClick('Women')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-sans uppercase tracking-widest text-xs font-bold transition-colors"
                  >
                    View Women's Collection
                  </button>
                </div>
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
                    navigate('/shop');
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
