import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { ShoppingBag, Heart, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  dark?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, dark = false }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  
  const fallbackImage = "https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=1000&auto=format&fit=crop";

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-beige/50">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <motion.img
            src={product.image || fallbackImage}
            alt={product.name}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-md transition-all duration-500 z-20 ${
            isWishlisted 
              ? 'bg-black text-white' 
              : 'bg-white/20 text-white hover:bg-white/40'
          }`}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={isWishlisted ? 0 : 2} />
        </button>

        {/* Quick Add Button (Desktop) */}
        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => addToCart(product, product.sizes[0] || 'M', 1)}
              className="absolute inset-x-6 bottom-6 bg-white text-black py-4 rounded-full caption flex items-center justify-center gap-3 shadow-2xl z-20 hidden lg:flex"
            >
              <Plus size={14} /> Add to Bag
            </motion.button>
          )}
        </AnimatePresence>

        {/* Mobile Quick Add */}
        <button
          onClick={() => addToCart(product, product.sizes[0] || 'M', 1)}
          className="absolute bottom-4 right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg lg:hidden z-20"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Info Container */}
      <div className={`mt-6 space-y-2 ${dark ? 'text-white' : 'text-black'}`}>
        <div className="flex justify-between items-start gap-4">
          <Link to={`/product/${product.id}`} className="flex-grow">
            <h3 className="text-lg font-serif font-medium leading-tight group-hover:opacity-60 transition-opacity">
              {product.name}
            </h3>
          </Link>
          <p className="text-lg font-sans font-bold tracking-tighter">₹{product.price}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`caption !text-[8px] ${dark ? 'text-white/40' : 'text-muted'}`}>
            {product.category}
          </span>
          <span className={`w-1 h-1 rounded-full ${dark ? 'bg-white/20' : 'bg-beige'}`} />
          <span className={`caption !text-[8px] ${dark ? 'text-white/40' : 'text-muted'}`}>
            {product.subCategory}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
