import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag, Heart, Sparkles, Eye, Check } from 'lucide-react';
import { toast } from 'sonner';
import { PRODUCTS } from '../data/products';

interface ProductFilmstripCarouselProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  variant?: 'editorial' | 'dark' | 'clean' | 'beige';
}

const DEFAULT_PRODUCTS: Product[] = PRODUCTS.slice(0, 6);

export const ProductFilmstripCarousel: React.FC<ProductFilmstripCarouselProps> = ({
  products,
  title = "Complete the Look",
  subtitle = "Pairing recommendations from our atelier styling directors in Jaipur. Drag or scrub the 3D rail to view details.",
  variant = 'clean'
}) => {
  const displayProducts = (products && products.length > 0) ? products : DEFAULT_PRODUCTS;
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const total = displayProducts.length;

  // Auto drift
  useEffect(() => {
    if (!autoPlay || isDragging || total === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlay, isDragging, total]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Pointer drag handling
  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setAutoPlay(false);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    setDragOffset(delta);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    if (dragOffset < -60) {
      handleNext();
    } else if (dragOffset > 60) {
      handlePrev();
    }
    setIsDragging(false);
    setDragOffset(0);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  // Wheel handling
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > 30 || Math.abs(e.deltaY) > 50) {
      if (e.deltaX > 0 || e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const handleQuickAdd = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const size = product.sizes?.[0] || 'M';
    const success = await addToCart(product, size, 1);
    if (success) {
      setQuickAddedId(product.id);
      setTimeout(() => setQuickAddedId(null), 2000);
    }
  };

  if (!displayProducts || displayProducts.length === 0) return null;

  const isDark = variant === 'dark';

  return (
    <section 
      className={`relative py-16 sm:py-24 rounded-3xl overflow-hidden select-none transition-colors duration-500 border ${
        isDark 
          ? 'bg-[#141210] text-[#fbf7f0] border-amber-900/40' 
          : 'bg-stone-100/70 text-stone-900 border-stone-200/90 shadow-sm'
      }`}
      onWheel={onWheel}
    >
      {/* Subtle luxury ambient radial glow (No harsh vertical pinstripes) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.06), transparent 75%)'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-sans tracking-[0.25em] uppercase text-amber-800 font-bold mb-2">
              <Sparkles size={12} className="text-amber-700" />
              <span>✦ ATELIER PAIRING RAIL ✦</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-sans font-light text-stone-900 tracking-tight">
              {title}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Navigation Controllers */}
          <div className="flex items-center gap-4 shrink-0">
            <span className="font-sans text-xs tracking-widest text-stone-500 font-bold">
              {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-11 h-11 rounded-full border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 flex items-center justify-center transition-colors shadow-sm"
                aria-label="Previous card"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="w-11 h-11 rounded-full bg-stone-900 text-white hover:bg-amber-800 flex items-center justify-center shadow-md transition-colors"
                aria-label="Next card"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 3D PERSPECTIVE STAGE */}
        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="relative w-full h-[500px] sm:h-[580px] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-[1400px]"
          style={{ touchAction: 'pan-y' }}
        >
          {displayProducts.map((product, index) => {
            let offset = index - activeIndex;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isCurrent = offset === 0;
            const isVisible = Math.abs(offset) <= 3;
            if (!isVisible) return null;

            const translateX = offset * 260 + (isCurrent ? dragOffset * 0.4 : 0);
            const translateZ = -Math.abs(offset) * 160 + (isCurrent ? 40 : 0);
            const rotateY = -offset * 18;
            const scale = Math.max(0.72, 1 - Math.abs(offset) * 0.12);
            const opacity = Math.max(0.2, 1 - Math.abs(offset) * 0.28);
            const zIndex = 30 - Math.abs(offset);

            const isWishlisted = isInWishlist(product.id);

            return (
              <motion.div
                key={product.id}
                onClick={() => {
                  if (offset !== 0) setActiveIndex(index);
                }}
                className="absolute w-[280px] sm:w-[320px] rounded-2xl overflow-hidden cursor-pointer shadow-xl transition-shadow border border-stone-200/90 bg-white text-stone-900"
                style={{
                  zIndex,
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.6s ease',
                  boxShadow: isCurrent 
                    ? '0 30px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(217, 119, 6, 0.3)'
                    : '0 15px 35px -10px rgba(0, 0, 0, 0.15)',
                }}
              >
                {/* Clean Top Bar */}
                <div className="flex items-center justify-between px-5 py-2.5 border-b border-stone-100 bg-stone-50 text-[9px] font-sans tracking-widest uppercase text-stone-500 font-bold">
                  <span>SAKSHI COUTURE</span>
                  <span>NO. {String(index + 1).padStart(2, '0')}</span>
                </div>

                {/* Framed Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 group">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40" />

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all ${
                      isWishlisted 
                        ? 'bg-amber-400 text-black shadow-md' 
                        : 'bg-black/30 text-white hover:bg-black/50'
                    }`}
                    title="Add to Wishlist"
                  >
                    <Heart size={13} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>

                  {/* Current Active Card Controls */}
                  {isCurrent && (
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
                      <Link
                        to={`/product/${product.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-stone-900 text-[10px] font-sans font-bold tracking-wider uppercase backdrop-blur-md flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Eye size={12} /> Inspect
                      </Link>
                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-amber-500 hover:text-black text-white text-[10px] font-sans font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-1"
                      >
                        {quickAddedId === product.id ? (
                          <>
                            <Check size={12} className="text-emerald-400" /> Added
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={12} /> Add to Bag
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Identity Footer */}
                <div className="p-4 bg-white border-t border-stone-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-sans uppercase tracking-widest text-stone-400 mb-0.5">
                        {product.category} · {product.subCategory || 'Haute Couture'}
                      </p>
                      <h3 className="font-sans font-bold text-sm text-stone-900 truncate">
                        {product.name}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-sans text-stone-400 block uppercase">Price</span>
                      <span className="font-sans font-bold text-sm text-stone-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Rail Timeline scrubber dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {displayProducts.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex 
                  ? 'w-8 bg-stone-900' 
                  : 'w-2 bg-stone-300 hover:bg-stone-400'
              }`}
              aria-label={`Jump to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductFilmstripCarousel;
