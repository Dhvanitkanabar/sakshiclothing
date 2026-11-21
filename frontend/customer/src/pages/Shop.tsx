// Reading this as: Collection & Shop Catalog for Sakshi Clothing, with mobile bottom-sheet filter, responsive 2/4-column grid, and champagne jewellery accents. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useEffect, useState, useMemo } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { fetchProducts, getCachedProducts } from '../lib/api';
import { PRODUCTS } from '../data/products';
import { SearchX, SlidersHorizontal, X, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const CATEGORY_META: Record<string, { badge: string; title: string; description: string; subcategories: string[] }> = {
  women: {
    badge: "SAKSHI COUTURE · WOMEN",
    title: "Women's Collection",
    description: "Handcrafted heritage sarees, festive bridal lehengas, artisanal anarkalis, and breathable everyday kurti sets.",
    subcategories: ['All', 'Heritage Sarees', 'Bridal Lehengas', 'Artisanal Sets', 'Modern Kurtas', 'Couture Anarkalis']
  },
  men: {
    badge: "SAKSHI COUTURE · MEN",
    title: "Men's Collection",
    description: "Royal brocade sherwanis, structured silk bandhgalas, and festive kurta sets tailored for weddings and celebrations.",
    subcategories: ['All', 'Heritage Sherwanis', 'Suits & Jackets', 'Modern Kurtas']
  },
  kids: {
    badge: "SAKSHI COUTURE · KIDS",
    title: "Kids Collection",
    description: "Joyful celebratory festive wear and comfortable artisanal sets designed for boys and girls.",
    subcategories: ['All', 'Boys', 'Girls', 'Festive Kids Sets']
  },
  jewellery: {
    badge: "CURATED ARTIFICIAL JEWELLERY",
    title: "Imitation Jewellery Suite",
    description: "Hypoallergenic, skin-friendly brass choker sets, radiant jhumkas, and kada bangles with anti-tarnish micro-plating.",
    subcategories: ['All', 'Heritage Jewels', 'Necklaces & Sets', 'Earrings & Jhumkas', 'Bangles & Kadas']
  }
};

export const Shop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');
  const mood = searchParams.get('mood');
  const categoryParam = searchParams.get('category');
  const subParam = searchParams.get('sub') || searchParams.get('subCategory');
  
  // Instant startup from cached data
  const [products, setProducts] = useState<Product[]>(getCachedProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(getCachedProducts);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
  const [selectedSubCategory, setSelectedSubCategory] = useState(subParam || 'All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 160000]);
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = ['All', 'Women', 'Men', 'Kids', 'Jewellery'];

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

  const categoryMeta = useMemo(() => {
    const key = (selectedCategory || '').toLowerCase();
    if (CATEGORY_META[key]) {
      return CATEGORY_META[key];
    }
    return {
      badge: "SAKSHI CLOTHING & JEWELLERY",
      title: "All Collections",
      description: "Explore our complete edit of Indian ethnic drapes, bridal couture, and hypoallergenic imitation artificial jewellery.",
      subcategories: ['All']
    };
  }, [selectedCategory]);

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

    // Multi-term search query
    if (query) {
      const cleanQ = query.trim().toLowerCase();
      const terms = cleanQ.split(/\s+/).filter(Boolean);
      result = result.filter(p => {
        const fullText = `${p.name} ${p.category} ${p.subCategory || ''} ${p.description || ''}`.toLowerCase();
        return fullText.includes(cleanQ) || (terms.length > 0 && terms.every(t => fullText.includes(t)));
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

  const isJewellerySelected = selectedCategory.toLowerCase() === 'jewellery';

  return (
    <div className="bg-[#FBF9F6] min-h-screen text-[#1A1A1A] pb-24 lg:pb-16">
      
      {/* ─── 1. PAGE HEADER ─────────────────────────────────────────── */}
      <header className="pt-10 sm:pt-14 pb-6 sm:pb-8 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className={`text-[11px] font-semibold uppercase tracking-[0.2em] block ${
            isJewellerySelected ? 'text-[#C6A15B]' : 'text-[#4A1D3F]'
          }`}>
            {query ? `Search Archive · "${query}"` : categoryMeta.badge}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#1A1A1A] font-medium tracking-tight">
            {query ? `Results for "${query}"` : (mood ? `${mood} Edit` : categoryMeta.title)}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            {categoryMeta.description}
          </p>
          {isJewellerySelected && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4EEDF] text-[#A4813D] rounded-full text-[11px] font-semibold border border-[#C6A15B]/30 mt-1">
              <Sparkles size={13} />
              <span>100% Skin-Friendly Imitation Jewellery · Brass Base & Premium Plating</span>
            </div>
          )}
        </div>
      </header>

      {/* ─── 2. STICKY FILTER & SORT BAR ─────────────────────────────── */}
      <div className="sticky top-14 sm:top-16 z-30 bg-[#FBF9F6]/95 backdrop-blur-md border-y border-[#E8E5DF] py-3 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Scrollable Category & Subcategory Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 py-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all select-none ${
                    isSelected
                      ? cat.toLowerCase() === 'jewellery'
                        ? 'bg-[#C6A15B] text-white shadow-xs'
                        : 'bg-[#4A1D3F] text-white shadow-xs'
                      : 'bg-white text-[#1A1A1A] hover:bg-[#FAF8F5] border border-[#E8E5DF]'
                  }`}
                >
                  {cat === 'Jewellery' ? 'Imitation Jewellery' : cat}
                </button>
              );
            })}

            {activeSubcategories.length > 1 && (
              <>
                <div className="w-px h-6 bg-[#E8E5DF] mx-1 shrink-0" />
                {activeSubcategories.map((sub) => {
                  const isSelected = selectedSubCategory.toLowerCase() === sub.toLowerCase();
                  return (
                    <button
                      key={sub}
                      onClick={() => handleSubCategoryClick(sub)}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all select-none ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white'
                          : 'bg-white/80 text-[#6B7280] hover:text-[#1A1A1A] border border-[#E8E5DF]'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Filter & Sort Drawer Trigger */}
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] border border-[#E8E5DF] rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors shadow-xs active:scale-95"
            aria-label="Filter and Sort Options"
          >
            <SlidersHorizontal size={14} className="text-[#4A1D3F]" />
            <span className="hidden sm:inline">Filter & Sort</span>
          </button>
        </div>
      </div>

      {/* ─── 3. MOBILE & DESKTOP FILTER DRAWER ────────────────────────── */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                  <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">
                    Filter & Refine
                  </h3>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A] rounded-full transition-colors"
                    aria-label="Close filters"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Price Range Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    <span>Price Range</span>
                    <span className="text-[#1A1A1A] font-bold">
                      ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={160000} 
                    step={2000}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-[#4A1D3F] h-2 bg-[#E8E5DF] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#6B7280]">
                    <span>₹0</span>
                    <span>₹1,60,000+</span>
                  </div>
                </div>

                {/* Sort Order */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block">
                    Sort Order
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'featured', label: '✦ Atelier Curated' },
                      { id: 'low-high', label: 'Price: Low to High' },
                      { id: 'high-low', label: 'Price: High to Low' },
                      { id: 'newest', label: 'Newest Arrivals' }
                    ].map((sort) => (
                      <button
                        key={sort.id}
                        onClick={() => setSortBy(sort.id)}
                        className={`text-left px-4 py-3 min-h-[44px] rounded-xl text-xs font-medium transition-all ${
                          sortBy === sort.id 
                            ? 'bg-[#4A1D3F] text-white font-semibold shadow-xs' 
                            : 'bg-[#FAF8F5] text-[#1A1A1A] hover:bg-[#F2EFEA] border border-[#E8E5DF]'
                        }`}
                      >
                        {sort.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-[#E8E5DF] flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPriceRange([0, 160000]);
                    setSortBy('featured');
                  }}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 4. MAIN PRODUCT GRID ───────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        
        {/* Result Counter & Active Filter Pills */}
        <div className="flex items-center justify-between text-xs text-[#6B7280] mb-6">
          <span>
            Showing <strong className="text-[#1A1A1A]">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'creation' : 'creations'}
          </span>
          {(selectedCategory !== 'All' || selectedSubCategory !== 'All' || priceRange[1] < 160000) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSubCategory('All');
                setPriceRange([0, 160000]);
                navigate('/shop');
              }}
              className="text-[#4A1D3F] hover:underline flex items-center gap-1 font-medium min-h-[44px] py-1"
            >
              <RotateCcw size={12} />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* 2 columns on mobile, 3 on tablet, 4 on desktop */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="text-center py-20 sm:py-28 bg-white rounded-3xl border border-[#E8E5DF] p-8 max-w-xl mx-auto">
            <SearchX size={44} className="mx-auto mb-3 text-[#9CA3AF]" />
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A] mb-2">
              No products found
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] mb-6 leading-relaxed">
              We couldn't find any creations matching your selected filters or search terms. Try resetting your price filter or selecting another category.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedSubCategory('All');
                  setPriceRange([0, 160000]);
                  setSortBy('featured');
                  navigate('/shop');
                }}
              >
                Clear All Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCategoryClick('Women')}
              >
                Explore Women's Wear
              </Button>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default Shop;
