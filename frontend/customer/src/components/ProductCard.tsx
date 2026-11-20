// Reading this as: Product Card for Sakshi Clothing Indian Fashion & Artificial Jewellery, with category-aware badges, dual clothing/jewellery variants, and tactile touch ergonomics. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingBag, Heart, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'sonner';

export interface ProductCardProps {
  product: Product;
  dark?: boolean;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, dark = false }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0] || product.variants?.[0]?.size || 'Standard'
  );

  const categoryLower = (product.category || '').toLowerCase();
  const subCategoryLower = (product.subCategory || '').toLowerCase();
  const isJewellery =
    categoryLower.includes('jewel') ||
    subCategoryLower.includes('jewel') ||
    subCategoryLower.includes('necklace') ||
    subCategoryLower.includes('earring') ||
    subCategoryLower.includes('bangle') ||
    subCategoryLower.includes('choker') ||
    subCategoryLower.includes('polki') ||
    subCategoryLower.includes('kundan');

  const totalStock =
    product.variants && product.variants.length > 0
      ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : ((product as any).stock ?? 10);
  const isOutOfStock = totalStock <= 0;

  // Compute realistic MRP for discount display if not provided
  const price = product.price || 0;
  const mrp = (product as any).mrp || (product as any).originalPrice || Math.round(price * 1.35);
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error(`"${product.name}" is currently out of stock`);
      return;
    }
    const sizeToUse = isJewellery ? 'One Size' : selectedSize;
    const success = await addToCart(product, sizeToUse, 1);
    if (success) {
      setJustAdded(true);
      toast.success(`Added ${product.name} to bag`);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const displayImage = product.image || '';
  const secondaryImage =
    product.images && product.images.length > 1 ? product.images[1] : displayImage;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col w-full h-full"
    >
      {/* Visual Media Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#F4EFEA] border border-[#E8E5DF] transition-all duration-300 group-hover:border-[#4A1D3F]/30 group-hover:shadow-md">
        <Link
          to={`/product/${product.id}`}
          className="block w-full h-full relative"
          onClick={() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          }}
        >
          <img
            src={isHovered && secondaryImage !== displayImage ? secondaryImage : displayImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {isJewellery ? (
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase text-[#C6A15B] border border-[#C6A15B]/30 shadow-xs">
              <Sparkles className="w-3 h-3 text-[#C6A15B]" />
              <span>Imitation Jewellery</span>
            </span>
          ) : (
            <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase text-[#4A1D3F] border border-[#4A1D3F]/20 shadow-xs">
              {product.category || 'Apparel'}
            </span>
          )}

          {discountPercent > 0 && (
            <span className="bg-[#B43E2B] text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs w-fit">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Toggle Button — Guaranteed min 44px tap target */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 z-20 ${
            isWishlisted
              ? 'bg-[#4A1D3F] text-white shadow-md scale-105'
              : 'bg-white/85 text-[#1A1A1A] hover:bg-white hover:text-[#4A1D3F] shadow-xs'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className="w-4 h-4 transition-transform active:scale-125"
            fill={isWishlisted ? 'currentColor' : 'none'}
            strokeWidth={isWishlisted ? 0 : 2}
          />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-15 pointer-events-none">
            <span className="px-3.5 py-1.5 bg-[#1A1A1A]/95 text-white rounded-full text-xs font-semibold tracking-widest uppercase border border-white/20 shadow-lg">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick Size Preview for Clothing on Desktop Hover */}
        {!isJewellery && product.sizes && product.sizes.length > 0 && !isOutOfStock && (
          <div className="hidden lg:flex absolute bottom-2.5 inset-x-2.5 bg-white/95 backdrop-blur-md rounded-xl p-2 items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 border border-[#E8E5DF]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Sizes
            </span>
            <div className="flex items-center gap-1">
              {product.sizes.slice(0, 5).map((size) => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`text-[11px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                    selectedSize === size
                      ? 'bg-[#4A1D3F] text-white font-semibold'
                      : 'text-[#1A1A1A] hover:bg-[#F2EFE9]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className={`mt-3 flex flex-col flex-1 justify-between ${dark ? 'text-white' : 'text-[#1A1A1A]'}`}>
        <div>
          {/* Subcategory / Craft / Jewellery note */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#6B7280]">
            <span className="font-medium uppercase tracking-wider truncate">
              {product.subCategory || (isJewellery ? 'Fashion Jewellery' : 'Artisanal Wear')}
            </span>
            {isJewellery && (
              <span className="text-[10px] text-[#C6A15B] font-medium tracking-tight shrink-0">
                Skin-Safe Brass
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.id}`}
            className="block mt-1 focus:outline-none focus:underline"
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
            }}
          >
            <h3 className="font-serif text-sm sm:text-base text-[#1A1A1A] font-medium line-clamp-1 group-hover:text-[#4A1D3F] transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="mt-2.5 pt-1.5 border-t border-[#F0ECE4] flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-[#1A1A1A] tracking-tight">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {mrp > price && (
              <span className="text-xs text-[#9CA3AF] line-through font-normal">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs shrink-0 select-none ${
              isOutOfStock
                ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed shadow-none'
                : isJewellery
                ? 'bg-[#C6A15B] hover:bg-[#B38F48] text-white active:scale-95'
                : 'bg-[#4A1D3F] hover:bg-[#3B1632] text-white active:scale-95'
            }`}
            title={isOutOfStock ? 'Sold out' : 'Add to shopping bag'}
            aria-label={`Add ${product.name} to bag`}
          >
            {isOutOfStock ? (
              <span>Out</span>
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
