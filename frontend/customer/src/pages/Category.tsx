import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, SlidersHorizontal, SearchX } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import { fetchProducts } from '../lib/api';

const Category = () => {
  const { main, sub } = useParams<{ main: string; sub?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadCategoryProducts = async () => {
      setLoading(true);
      const data = await fetchProducts({ category: main });
      const finalData = sub ? data.filter(p => p.subCategory.toLowerCase() === sub.toLowerCase()) : data;
      setProducts(finalData);
      setFilteredProducts(finalData);
      setLoading(false);
    };
    loadCategoryProducts();
  }, [main, sub]);

  useEffect(() => {
    if (loading) return;
    
    let result = [...products];
    const [minPrice, maxPrice] = priceRange;
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    if (sortBy === 'low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'featured') {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    // Only update if the result has actually changed to avoid infinite loops
    setFilteredProducts(prev => {
      if (JSON.stringify(prev) === JSON.stringify(result)) return prev;
      return result;
    });
  }, [priceRange[0], priceRange[1], sortBy, products, loading]);

  return (
    <div className="min-h-screen bg-white">
      {/* Category Header */}
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-luxury-black">
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src={`https://picsum.photos/seed/${main}/1920/1080`} 
            alt={main}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div className="relative z-10 text-center px-4">
          <motion.nav 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-3 text-[10px] text-white/60 uppercase tracking-[0.3em] mb-6 font-sans font-bold"
          >
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-white">{main}</span>
            {sub && (
              <>
                <ChevronRight size={10} />
                <span className="text-white">{sub}</span>
              </>
            )}
          </motion.nav>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-8xl font-serif font-medium tracking-tight text-white"
          >
            {sub ? sub : main}
          </motion.h1>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center mb-8">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-luxury-black px-6 py-3 rounded-full"
            >
              <SlidersHorizontal size={14} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {filteredProducts.length} Items
            </span>
          </div>

          {/* Sidebar */}
          <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-32">
              <FilterSidebar
                categories={[main || 'All']}
                selectedCategory={main || 'All'}
                setSelectedCategory={() => {}}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-grow">
            <div className="hidden lg:flex justify-between items-center mb-12">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                Showing {filteredProducts.length} premium pieces
              </span>
              <div className="flex items-center gap-4">
                {/* Sort dropdown could go here if not in sidebar */}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-6">
                    <Skeleton className="aspect-[3/4] rounded-2xl" />
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
                  <motion.div 
                    layout
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8"
                  >
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-40 bg-gray-50 rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center"
                  >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                      <SearchX size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-serif font-medium text-luxury-black mb-2">No pieces found</h3>
                    <p className="text-gray-400 font-light max-w-xs mx-auto mb-8 text-sm">
                      We couldn't find anything matching your filters in this collection.
                    </p>
                    <button 
                      onClick={() => {
                        setPriceRange([0, 10000]);
                        setSortBy('featured');
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-luxury-black underline underline-offset-8 hover:text-rose-600 transition-colors"
                    >
                      Clear all filters
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
