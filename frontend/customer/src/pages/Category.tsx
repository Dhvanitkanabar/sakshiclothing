// Reading this as: Category Landing Page for Sakshi Clothing, with breadcrumbs, responsive 2/4-column product grid, and imitation jewellery safeguards. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, SlidersHorizontal, SearchX, X, Sparkles, ShieldCheck, Truck, Filter, RotateCcw } from 'lucide-react';
import { fetchProducts, API_URL, getCachedProducts } from '../lib/api';
import { Button } from '../components/ui/Button';

export const Category: React.FC = () => {
  const { main, sub } = useParams<{ main: string; sub?: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 160000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const mainClean = (main || 'Women').toLowerCase();
  const isJewellery = mainClean.includes('jewel');

  useEffect(() => {
    const loadCategoryProducts = async () => {
      setLoading(true);
      const filterKey = sub || main || '';
      const data = await fetchProducts({ category: filterKey });
      const validData = Array.isArray(data) ? data : [];
      setProducts(validData);
      setFilteredProducts(validData);
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
  }, [priceRange, sortBy, products, loading]);

  const firstProductImage = products[0]?.image || '';

  return (
    <div className="min-h-screen bg-[#FBF9F6] pb-24 lg:pb-16 text-[#1A1A1A]">
      
      {/* Category Hero Banner */}
      <div className="relative min-h-[38vh] sm:min-h-[46vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#2D1627] via-[#3B1A34] to-[#1A1A1A] text-white">
        {firstProductImage && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.35, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img
              src={firstProductImage}
              alt={main}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FBF9F6] via-black/40 to-black/60" />
          </motion.div>
        )}

        <div className="relative z-10 text-center px-5 max-w-3xl mx-auto pt-16 pb-12 sm:pt-20 sm:pb-16">
          <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] text-white uppercase tracking-wider mb-4 font-semibold">
            <Link to="/" className="hover:text-[#C6A15B] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to={`/category/${main}`} className="hover:text-[#C6A15B] transition-colors capitalize">{main}</Link>
            {sub && (
              <>
                <ChevronRight size={12} />
                <span className="text-[#C6A15B] capitalize">{sub}</span>
              </>
            )}
          </nav>

          <h1 className="font-serif text-3xl sm:text-5xl text-white font-medium capitalize tracking-tight mb-2.5">
            {sub ? sub : (isJewellery ? 'Imitation Jewellery' : main)}
          </h1>

          <p className="text-white/85 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
            {isJewellery 
              ? 'Hypoallergenic, skin-safe brass choker sets, earrings, and bangles with anti-tarnish finish.' 
              : 'Authentic Indian ethnic wear handcrafted with premium textiles and generational embroidery.'
            }
          </p>

          {isJewellery && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6A15B]/20 text-[#E0C78F] border border-[#C6A15B]/30 text-xs font-semibold">
              <Sparkles size={13} />
              <span>100% Artificial / Imitation Jewellery · Nickel & Lead Free</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Sticky Sort Bar */}
        <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4 mb-6">
          <div>
            <span className="text-xs text-[#6B7280]">
              Showing <strong className="text-[#1A1A1A]">{filteredProducts.length}</strong> items
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="bg-white border border-[#E8E5DF] rounded-xl text-xs font-medium text-[#1A1A1A] px-3 py-2 min-h-[44px] focus:outline-none focus:border-[#4A1D3F]"
            >
              <option value="featured">Featured First</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* 2 columns on mobile, 3 on tablet, 4 on desktop */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E5DF] p-8 max-w-md mx-auto">
            <SearchX size={44} className="mx-auto mb-3 text-[#9CA3AF]" />
            <h3 className="font-serif text-xl font-medium text-[#1A1A1A] mb-1.5">No pieces found</h3>
            <p className="text-xs text-[#6B7280] mb-6">We're updating our collection with fresh artisanal creations.</p>
            <Link to="/shop">
              <Button variant="primary" size="md">Browse All Products</Button>
            </Link>
          </div>
        )}

      </div>

    </div>
  );
};

export default Category;
