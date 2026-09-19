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
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    if (!id) return;
    const loadProductData = async () => {
      setLoading(true);
      const data = await fetchProductById(id); // ID can also be slug if backend routes logic allows, or just id for now
      if (data) {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          const inStock = data.variants.find((v: any) => (v.stock > 0 || v.status !== 'out_of_stock') && v.size);
          setSelectedSize(inStock ? inStock.size : (data.variants[0]?.size || 'Standard'));
        } else if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        } else {
          setSelectedSize('Standard');
        }
        setMainImage(data.image);
        
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
      <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-8">
        <nav className="flex items-center gap-4 caption text-muted">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight size={10} />
          <Link to={`/category/${product.category}`} className="hover:text-black">{product.category}</Link>
          <ChevronRight size={10} />
          <span className="text-black">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          {/* Image Section */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="w-full max-w-md mx-auto aspect-[4/5] max-h-[480px] rounded-3xl overflow-hidden bg-gray-50/80 border border-gray-100 shadow-md relative flex items-center justify-center">
              <img 
                src={mainImage || product.image} 
                alt={product.name} 
                className="w-full h-full object-cover rounded-3xl" 
                referrerPolicy="no-referrer" 
              />
            </div>
            
            {/* Image Gallery Thumbnails */}
            {(() => {
              const parseUrl = (img: any): string => {
                if (!img) return '';
                if (typeof img === 'string') return img;
                if (typeof img === 'object' && img.url) return img.url;
                return '';
              };

              const allImages = Array.from(
                new Set(
                  [
                    parseUrl(product.image),
                    ...(product.images || []).map(parseUrl)
                  ].filter(Boolean)
                )
              );

              if (allImages.length <= 1) return null;

              return (
                <div className="flex justify-center gap-3 overflow-x-auto no-scrollbar pb-2">
                  {allImages.map((imgUrl, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setMainImage(imgUrl)}
                      className={`w-16 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                        mainImage === imgUrl ? 'border-black shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Info Section */}
          <div className="w-full lg:w-1/2">
            <div className="sticky top-40 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="caption text-luxury-black/60 bg-gray-100 px-3 py-1 rounded-full">New Arrival</span>
                  <div className="flex items-center gap-1 text-black">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                    <span className="text-xs font-bold ml-2">(48)</span>
                  </div>
                </div>

                <h1 className="text-5xl lg:text-7xl font-serif font-bold tracking-tight leading-[0.95] break-words uppercase">{product.name}</h1>

                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-sans font-medium tracking-tight">₹{product.price}</span>
                  <span className="text-lg text-gray-400 line-through">₹{Math.round(product.price * 1.4)}</span>
                </div>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed font-light">
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
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map(variant => {
                    const isOutOfStock = variant.stock === 0 || variant.status === 'out_of_stock';
                    const isSelected = selectedSize === variant.size;
                    return (
                      <button
                        key={variant._id || variant.size}
                        onClick={() => !isOutOfStock && setSelectedSize(variant.size)}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? 'Out of stock' : ''}
                        className={`w-16 h-16 flex flex-col items-center justify-center rounded-2xl border transition-all duration-500 relative overflow-hidden ${
                          isSelected
                            ? 'bg-black border-black text-white shadow-xl'
                            : isOutOfStock
                            ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-black/5 text-muted hover:border-black/20'
                        }`}
                      >
                        <span className="z-10">{variant.size}</span>
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[120%] h-px bg-gray-300 rotate-45 transform origin-center absolute"></div>
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map(size => (
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
                  ))
                ) : (
                  <button
                    onClick={() => setSelectedSize('Standard')}
                    className="px-6 h-16 flex items-center justify-center rounded-2xl border bg-black border-black text-white shadow-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Standard / Free Size
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-6 border-t border-black/5">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-black text-gray-400 transition-colors"><Minus size={16} /></button>
                  <span className="mx-6 font-bold w-6 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-black text-gray-400 transition-colors"><Plus size={16} /></button>
                </div>
                
                <button
                  onClick={() => addToCart(product, selectedSize, quantity)}
                  disabled={!selectedSize || (product.variants?.find(v => v.size === selectedSize)?.stock === 0)}
                  className={`flex-grow py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-md ${
                    (!selectedSize || (product.variants?.find(v => v.size === selectedSize)?.stock === 0))
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-black text-white hover:bg-gray-800 hover:shadow-xl'
                  }`}
                >
                  Add to Bag
                </button>
              </div>

              <button 
                onClick={() => toggleWishlist(product)}
                className={`w-full py-4 rounded-2xl border transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm ${
                  isWishlisted 
                    ? 'bg-red-50 border-red-100 text-red-600' 
                    : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
                }`}
              >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                <span>{isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
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
                    <p>Complimentary express shipping on all orders. Returns accepted within 30 days of delivery.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-40 pt-24 border-t border-black/5">
            <div className="flex justify-between items-end mb-24">
              <div className="space-y-6">
                <span className="caption">Curated for you</span>
                <h2 className="heading-lg">Complete the Look</h2>
              </div>
              <Link to="/shop" className="caption border-b border-black pb-2">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
              {relatedProducts.map(p => (
                <div key={p.id} className="col-span-1">
                  <ProductCard product={p} />
                </div>
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
