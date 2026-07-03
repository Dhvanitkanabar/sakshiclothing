import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ShoppingBag, ChevronRight, Star, ShieldCheck, Truck, RotateCcw, Heart, Share2, Ruler, Plus, Minus } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import { useWishlist } from '../context/WishlistContext';
import { fetchProductById, fetchProducts } from '../lib/api';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (!id) return;
    const loadProductData = async () => {
      setLoading(true);
      const data = await fetchProductById(id); // ID can also be slug if backend routes logic allows, or just id for now
      if (data) {
        setProduct(data);
        setSelectedSize(data.sizes[0] || '');
        
        // Fetch related products by category
        const related = await fetchProducts({ category: data.category, limit: 4 });
        setRelatedProducts(related.filter(p => p.id !== data.id).slice(0, 4));
      }
      setLoading(false);
    };
    loadProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-white flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-t-2 border-black rounded-full"
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-luxury-white flex flex-col items-center justify-center px-4">
        <h2 className="heading-lg mb-8">Piece not found</h2>
        <Link to="/shop" className="caption border-b border-black pb-2">Return to Collection</Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="bg-luxury-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="max-w-[1800px] mx-auto px-6 py-12">
        <nav className="flex items-center gap-4 caption text-muted">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight size={10} />
          <Link to={`/category/${product.category}`} className="hover:text-black">{product.category}</Link>
          <ChevronRight size={10} />
          <span className="text-black">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 pb-32">
        <div className="flex flex-col lg:flex-row gap-24">
          {/* Image Section (Editorial Layout) */}
          <div className="lg:w-[65%] space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="aspect-[3/4] overflow-hidden rounded-[3rem] bg-beige/30"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <div className="grid grid-cols-2 gap-12">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-beige/20"
              >
                <img src={`https://picsum.photos/seed/${product.id}1/1200/1600`} alt="Detail 1" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-beige/20"
              >
                <img src={`https://picsum.photos/seed/${product.id}2/1200/1600`} alt="Detail 2" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:w-[35%] space-y-16 lg:sticky lg:top-40 h-fit">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <span className="caption text-rose-600">New Arrival</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="black" />)}
                  <span className="caption !text-[8px] ml-2">(48)</span>
                </div>
              </div>

              <h1 className="heading-xl leading-tight">{product.name}</h1>

              <div className="flex items-baseline gap-6">
                <span className="text-4xl font-sans font-bold tracking-tighter">₹{product.price}</span>
                <span className="text-xl text-muted line-through">₹{Math.round(product.price * 1.4)}</span>
              </div>
            </div>

            <p className="text-muted text-lg leading-relaxed font-light">
              {product.description || "A masterpiece of contemporary design, this piece embodies the essence of modern luxury. Meticulously crafted from the finest materials, it offers an unparalleled blend of comfort and avant-garde style."}
            </p>

            {/* Size Selection */}
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <span className="caption">Select Size</span>
                <button className="flex items-center gap-2 caption hover:text-black transition-colors">
                  <Ruler size={14} /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-4">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-16 h-16 flex items-center justify-center rounded-2xl border transition-all duration-500 ${
                      selectedSize === size
                        ? 'bg-black border-black text-white shadow-xl'
                        : 'border-black/5 text-muted hover:border-black/20'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-beige/30 rounded-full px-6 py-4">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-black transition-colors"><Minus size={14} /></button>
                  <span className="mx-6 font-bold w-6 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-black transition-colors"><Plus size={14} /></button>
                </div>
                
                <button
                  onClick={() => addToCart(product, selectedSize, quantity)}
                  className="flex-grow bg-black text-white py-6 rounded-full caption hover:bg-rose-600 transition-all shadow-xl"
                >
                  Add to Bag
                </button>
              </div>

              <button 
                onClick={() => toggleWishlist(product)}
                className={`w-full py-6 rounded-full border transition-all duration-500 flex items-center justify-center gap-3 ${
                  isWishlisted 
                    ? 'bg-rose-50 border-rose-100 text-rose-600' 
                    : 'border-black/5 text-muted hover:border-black/20'
                }`}
              >
                <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                <span className="caption">{isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="pt-16 border-t border-black/5 space-y-12">
              <div className="flex gap-12">
                {['description', 'details', 'shipping'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`caption relative transition-colors ${
                      activeTab === tab ? 'text-black' : 'text-muted hover:text-black'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 right-0 h-px bg-black" />
                    )}
                  </button>
                ))}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-muted leading-relaxed font-light"
                >
                  {activeTab === 'description' && (
                    <p>This exquisite piece from SakshiClothing is designed for the modern individual who values both aesthetics and quality. The fabric is sourced from the finest mills, ensuring a luxurious feel against the skin.</p>
                  )}
                  {activeTab === 'details' && (
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3"><span className="w-1 h-1 bg-black rounded-full" /> 100% Premium Organic Cotton</li>
                      <li className="flex items-center gap-3"><span className="w-1 h-1 bg-black rounded-full" /> Hand-finished detailing</li>
                      <li className="flex items-center gap-3"><span className="w-1 h-1 bg-black rounded-full" /> Sustainably produced in India</li>
                    </ul>
                  )}
                  {activeTab === 'shipping' && (
                    <p>Complimentary express shipping on all orders over ₹2000. Returns accepted within 30 days of delivery.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-64 pt-32 border-t border-black/5">
            <div className="flex justify-between items-end mb-24">
              <div className="space-y-6">
                <span className="caption">Curated for you</span>
                <h2 className="heading-lg">Complete the Look</h2>
              </div>
              <Link to="/shop" className="caption border-b border-black pb-2">View All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetails;
