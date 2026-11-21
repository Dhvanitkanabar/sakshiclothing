// Reading this as: Saved Wishlist Curation for Sakshi Clothing patrons, with mobile-first tap ergonomics, responsive 2/4-column luxury grid, and 1-tap Move to Bag. Dials: VARIANCE [8] / MOTION [6] / DENSITY [5].

import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';

const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToBag = (product: any) => {
    // If product has size options, default to first available size or 'M'
    const defaultSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : (product.selectedSize || 'Free Size');
    addToCart(product, defaultSize, 1);
    toggleWishlist(product);
    toast.success(`${product.name} moved to your bag.`);
  };

  if (wishlist.length === 0) {
    return (
      <div className="bg-[#FBF9F6] min-h-[75vh] flex items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-6 bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E5DF] shadow-xs"
        >
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 bg-[#FAF8F5] rounded-full flex items-center justify-center text-[#4A1D3F] border border-[#E8E5DF]">
              <Heart size={36} strokeWidth={1.5} />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-1 -right-1 text-[#C6A15B]"
            >
              <Sparkles size={20} />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-medium text-[#1A1A1A]">Your Wishlist is Empty</h1>
            <p className="text-xs text-[#6B7280] leading-relaxed max-w-xs mx-auto">
              Save your favorite sarees, suits, lehengas, and imitation jewellery pieces to craft your personal wardrobe.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/shop">
              <Button variant="primary" size="lg" fullWidth rightIcon={<ArrowRight size={15} />}>
                Explore Collections
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF9F6] min-h-screen pt-6 sm:pt-10 pb-24 px-4 sm:px-6 lg:px-8 text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="pb-6 border-b border-[#E8E5DF] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#C6A15B] mb-2">
              <Sparkles size={12} />
              <span>Personal Wardrobe Curation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-[#1A1A1A] tracking-tight">
              Saved <span className="italic">Wishlist</span>
            </h1>
          </div>
          <p className="text-xs text-[#6B7280]">
            Showing <strong>{wishlist.length}</strong> saved {wishlist.length === 1 ? 'piece' : 'pieces'}
          </p>
        </header>

        {/* Wishlist Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {wishlist.map((product) => {
              const isJewellery = product.category?.toLowerCase()?.includes('jewel') || 
                                  product.category?.toLowerCase()?.includes('necklace') || 
                                  product.category?.toLowerCase()?.includes('earring') || 
                                  product.category?.toLowerCase()?.includes('bangle');

              return (
                <motion.div
                  key={product.id || product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E5DF] overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#4A1D3F]/30 transition-all duration-300"
                >
                  <div className="relative aspect-[3/4] bg-[#FAF8F5] overflow-hidden">
                    <img
                      src={product.image || product.thumbnail?.url || product.images?.[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = "https://images.unsplash.com/photo-1611591475852-25bb3e76f536?q=80&w=600&auto=format&fit=crop";
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />

                    {/* Category Pill */}
                    {isJewellery && (
                      <div className="absolute top-3 left-3 bg-[#4A1D3F]/90 backdrop-blur-xs text-[#C6A15B] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#C6A15B]/30">
                        Imitation Jewellery
                      </div>
                    )}

                    {/* Delete / Remove Button (Always accessible, min 44px) */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-2.5 right-2.5 w-10 h-10 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center text-[#1A1A1A] hover:text-[#B43E2B] hover:bg-white shadow-xs transition-colors min-h-[44px] min-w-[44px]"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Card Info & Action */}
                  <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                    <div className="space-y-1">
                      <Link to={`/product/${product.id || product._id}`}>
                        <h3 className="text-xs sm:text-sm font-semibold text-[#1A1A1A] line-clamp-1 hover:text-[#4A1D3F] transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                          ₹{Number(product.price || 0).toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[11px] text-[#9CA3AF] line-through">
                            ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 1-tap Move to Bag CTA (Always visible on mobile & desktop, min 44px) */}
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => handleMoveToBag(product)}
                      leftIcon={<ShoppingBag size={14} />}
                      className="text-xs min-h-[44px]"
                    >
                      Move to Bag
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Wishlist;
