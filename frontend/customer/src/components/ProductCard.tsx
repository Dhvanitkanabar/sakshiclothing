import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Product } from '../types';
import { ShoppingBag, Heart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  dark?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, dark = false }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  
  // 3D card tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -5;
    const rotY = ((x - centerX) / centerX) * 5;
    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const totalStock = product.variants && product.variants.length > 0
    ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    : ((product as any).stock ?? 10);
  const isOutOfStock = totalStock <= 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error(`"${product.name}" is currently out of stock`);
      return;
    }
    const size = product.sizes?.[0] || product.variants?.[0]?.size || 'M';
    const success = await addToCart(product, size, 1);
    if (success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const fallbackImage = "https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=1200&auto=format&fit=crop";
  const displayImage = product.image || fallbackImage;
  const secondaryImage = (product.images && product.images.length > 1) ? product.images[1] : displayImage;

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative w-full perspective-[1000px]"
      style={{
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
      }}
    >
      {/* Image Container — Responsive aspect ratio with clean borders */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#f4ece1] shadow-xs border border-stone-200/90 group-hover:border-amber-400/60 group-hover:shadow-xl transition-all duration-300">
        <Link 
          to={`/product/${product.id}`} 
          className="block w-full h-full relative"
          onClick={() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          }}
        >
          <motion.img
            src={isHovered && secondaryImage !== displayImage ? secondaryImage : displayImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-all duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Wishlist Button — Min 44px tap target on mobile */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all duration-300 z-20 ${
            isWishlisted 
              ? 'bg-amber-400 text-black shadow-lg scale-110' 
              : 'bg-black/35 text-white hover:bg-black/60 hover:scale-105'
          }`}
          title={isWishlisted ? 'Remove from saved' : 'Save piece'}
          aria-label="Wishlist"
        >
          <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Category tag pill */}
        <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 bg-white/90 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[8px] sm:text-[9px] font-sans tracking-widest uppercase text-stone-800 shadow-xs pointer-events-none font-bold">
          {product.category}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
            <span className="px-3 py-1 bg-stone-900/90 text-white rounded-full text-[9px] sm:text-[10px] font-sans font-bold tracking-widest uppercase border border-white/20 shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info Container — Clean Modern Professional Shopping Format */}
      <div className={`mt-2.5 sm:mt-3.5 space-y-1 ${dark ? 'text-white' : 'text-stone-900'}`}>
        <p className="text-[11px] font-medium tracking-wider text-stone-500 uppercase truncate">
          {product.subCategory || 'Couture'}
        </p>

        <Link 
          to={`/product/${product.id}`} 
          className="block"
          onClick={() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          }}
        >
          <h3 className="font-sans font-semibold text-xs sm:text-sm md:text-base text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-1 gap-1">
          <div>
            <span className="font-sans font-bold text-sm sm:text-base text-stone-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 shadow-xs shrink-0 ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                : 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer active:scale-95'
            }`}
            title={isOutOfStock ? 'Piece is currently out of stock' : 'Add to shopping bag'}
          >
            {isOutOfStock ? (
              <span>Out</span>
            ) : justAdded ? (
              <>
                <Check size={11} className="text-emerald-400" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={11} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
