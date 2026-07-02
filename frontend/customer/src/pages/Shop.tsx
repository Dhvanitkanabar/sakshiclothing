import React, { useEffect, useState, useRef } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import Skeleton from '../components/ui/Skeleton';
import { fetchProducts } from '../lib/api';
import { SearchX, SlidersHorizontal, X } from 'lucide-react';

import { useSearchParams } from 'react-router-dom';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q');
  const mood = searchParams.get('mood');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get('sub') || 'All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = ['All', 'Women', 'Men', 'Kids'];
  const subCategories = ['All', 'Ethnic', 'Western', 'Shirts', 'T-Shirts', 'Jeans', 'Footwear', 'Boys', 'Girls'];

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setFilteredProducts(data);
      setLoading(false);
    };
    loadProducts();
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
        p.subCategory.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // Mood Filter
    if (mood) {
      const m = mood.toLowerCase();
      // If mood is specified, we might have specific tags or categories for it
      // For now, let's just do a simple check or filter by subcategory if appropriate
      if (m === 'minimalist') result = result.filter(p => p.price > 5000); // Example logic
      if (m === 'streetwear') result = result.filter(p => p.subCategory === 'Jeans' || p.subCategory === 'T-Shirts');
    }

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (selectedSubCategory !== 'All') {
      result = result.filter(p => p.subCategory === selectedSubCategory);
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
    <div className="bg-luxury-white min-h-screen">
      {/* Header */}
      <header className="pt-40 pb-20 px-6 max-w-[1800px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <span className="caption mb-6 block">The Collection</span>
          <h1 className="heading-xl mb-8">
            {query ? `Results for "${query}"` : mood ? `${mood} Edit` : 'All Pieces'}
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
            A curated selection of timeless silhouettes and contemporary designs, crafted for the modern individual.
          </p>
        </motion.div>
      </header>

      {/* Horizontal Filter Chips */}
      <div className="sticky top-20 z-30 bg-luxury-white/80 backdrop-blur-md border-y border-black/5 py-6">
        <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between gap-8">
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x flex-grow">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-full caption whitespace-nowrap transition-all snap-start ${
                  selectedCategory === cat 
                    ? 'bg-black text-white' 
                    : 'bg-beige/50 text-muted hover:bg-beige'
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="w-px h-10 bg-black/5 mx-2 shrink-0" />
            {subCategories.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubCategory(sub)}
                className={`px-8 py-3 rounded-full caption whitespace-nowrap transition-all snap-start ${
                  selectedSubCategory === sub 
                    ? 'bg-black text-white' 
                    : 'bg-beige/50 text-muted hover:bg-beige'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-3 px-8 py-3 bg-black text-white rounded-full caption shrink-0"
          >
            <SlidersHorizontal size={14} /> Filter & Sort
          </button>
        </div>
      </div>

      {/* Advanced Filter Overlay */}
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
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 p-12 flex flex-col"
            >
              <div className="flex justify-between items-center mb-16">
                <h2 className="text-3xl font-serif font-bold">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-beige rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow space-y-12">
                <div className="space-y-6">
                  <span className="caption">Sort By</span>
                  <div className="grid grid-cols-1 gap-4">
                    {['featured', 'low-high', 'high-low', 'newest'].map(option => (
                      <button
                        key={option}
                        onClick={() => setSortBy(option)}
                        className={`w-full text-left px-6 py-4 rounded-2xl caption transition-all ${
                          sortBy === option ? 'bg-black text-white' : 'bg-beige/50 text-muted hover:bg-beige'
                        }`}
                      >
                        {option.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <span className="caption">Price Range</span>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="10000" 
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full h-1 bg-beige rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="flex justify-between mt-4 caption">
                      <span>₹0</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-6 bg-black text-white rounded-full caption mt-12"
              >
                Show {filteredProducts.length} Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Grid (Asymmetric) */}
      <main className="py-24 px-6 max-w-[1800px] mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i, idx) => (
              <div key={i} className={`${idx % 3 === 0 ? 'md:col-span-8' : 'md:col-span-4'} space-y-6`}>
                <Skeleton className="aspect-[3/4] rounded-[2rem]" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className={`${
                      index % 5 === 0 ? 'md:col-span-8' : 'md:col-span-4'
                    } ${index % 3 === 0 ? 'md:mt-24' : ''}`}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-48"
              >
                <SearchX size={64} className="mx-auto mb-8 text-muted/20" />
                <h3 className="heading-lg mb-6">No pieces found</h3>
                <p className="text-muted text-lg mb-12">Adjust your filters to discover more silhouettes.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedSubCategory('All');
                    setPriceRange([0, 10000]);
                    setSortBy('featured');
                  }}
                  className="px-12 py-5 bg-black text-white rounded-full caption"
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
