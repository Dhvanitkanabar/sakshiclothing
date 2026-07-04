import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToBag = (product: any) => {
    addToCart(product, 'M', 1); // Default size M for quick move
    toggleWishlist(product);
    toast.success(`${product.name} moved to bag.`);
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-48 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="relative inline-flex items-center justify-center">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
              <Heart size={48} strokeWidth={1} />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-2 -right-2 text-rose-200"
            >
              <Sparkles size={24} />
            </motion.div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-serif font-medium tracking-tight text-luxury-black">Your Wishlist is Empty</h1>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
              Save your favorite pieces to curated your personal collection.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-4 bg-luxury-black text-white px-12 py-6 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-rose-600 transition-all duration-700 shadow-2xl shadow-black/10 group"
          >
            Explore Collection <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-32">
      <header className="mb-24 space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-rose-600">Personal Curation</span>
        <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter text-luxury-black">
          My <span className="italic">Wishlist</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
        <AnimatePresence mode="popLayout">
          {wishlist.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
              <div className="aspect-[3/4] bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 relative mb-6">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="absolute top-6 right-6">
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-luxury-black hover:bg-rose-600 hover:text-white transition-all duration-500 shadow-xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[80%] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-100">
                  <button
                    onClick={() => handleMoveToBag(product)}
                    className="w-full bg-white text-luxury-black py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-black hover:text-white transition-all duration-500 shadow-2xl flex items-center justify-center gap-2"
                  >
                    Move to Bag <ShoppingBag size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 px-2 text-center">
                <h3 className="text-sm font-bold text-luxury-black tracking-tight">{product.name}</h3>
                <p className="text-sm font-serif font-medium text-rose-600 italic">₹{product.price.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wishlist;
