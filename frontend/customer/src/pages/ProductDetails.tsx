import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, Star, ShieldCheck, Truck, RotateCcw, Heart, Ruler, Plus, Minus, Sparkles, Award } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import ProductFilmstripCarousel from '../components/ProductFilmstripCarousel';
import { useWishlist } from '../context/WishlistContext';
import { fetchProductById, fetchProducts } from '../lib/api';
import { PRODUCTS } from '../data/products';
import { toast } from 'sonner';

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('craft');
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    // Immediate scroll lock to top when product ID loads or changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    if (!id) return;
    const loadProductData = async () => {
      setLoading(true);
      const data = await fetchProductById(id);
      const chosen = data || PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
      if (chosen) {
        setProduct(chosen);
        if (chosen.variants && chosen.variants.length > 0) {
          const inStock = chosen.variants.find((v: any) => (v.stock > 0 || v.status !== 'out_of_stock') && v.size);
          setSelectedSize(inStock ? inStock.size : (chosen.variants[0]?.size || 'Standard'));
        } else if (chosen.sizes && chosen.sizes.length > 0) {
          setSelectedSize(chosen.sizes[0]);
        } else {
          setSelectedSize('Standard');
        }
        setMainImage(chosen.image);
        
        // Fetch related pieces
        const related = await fetchProducts({ category: chosen.category, limit: 4 });
        const validRelated = (related && related.length > 0) ? related : PRODUCTS;
        setRelatedProducts(validRelated.filter(p => p.id !== chosen.id).slice(0, 4));
      }
      setLoading(false);
      // Immediately reset scroll once product data and layout are painted
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
      });
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
      }, 50);
    };
    loadProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-stone-300 border-t-amber-800 rounded-full"
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-sans font-light text-stone-900 mb-4">Silhouette Not Found</h2>
        <p className="text-stone-500 font-sans text-xs mb-6">The requested product is currently unavailable.</p>
        <Link to="/shop" className="px-6 py-3 bg-stone-900 text-white rounded-xl text-xs font-sans uppercase tracking-widest font-bold">
          Explore Current Collection
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const currentVariant = product.variants?.find(v => v.size === selectedSize) || product.variants?.[0];
  const currentStock = currentVariant?.stock !== undefined ? currentVariant.stock : ((product as any).stock ?? 12);
  const isSelectedOutOfStock = currentStock <= 0 || currentVariant?.status === 'out_of_stock';

  const parseUrl = (img: any): string => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (typeof img === 'object' && img.url) return img.url;
    return '';
  };

  const allImages = Array.from(
    new Set([
      parseUrl(product.image),
      ...(product.images || []).map(parseUrl)
    ].filter(Boolean))
  );

  const handleAddToCart = async () => {
    if (isSelectedOutOfStock) {
      toast.error(`"${product.name}" (${selectedSize}) is currently out of stock`);
      return;
    }
    const success = await addToCart(product, selectedSize || 'Standard', quantity);
    if (success) {
      toast.success(`"${product.name}" added to shopping bag`);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-900 selection:bg-amber-400 selection:text-black pb-28 lg:pb-16">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-4 sm:pb-6">
        <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-sans uppercase tracking-widest text-stone-500">
          <Link to="/" className="hover:text-stone-900 transition-colors">Atelier</Link>
          <ChevronRight size={10} className="text-stone-400" />
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-stone-900 transition-colors">
            {product.category}
          </Link>
          <ChevronRight size={10} className="text-stone-400" />
          <span className="text-stone-900 truncate max-w-[200px] sm:max-w-none font-bold">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Left Column: Gallery & Micro Thumbnails */}
          <div className="lg:col-span-7 space-y-4">
            <div className="w-full aspect-[4/5] max-h-[640px] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-md relative group">
              <img 
                src={mainImage || product.image} 
                alt={product.name} 
                className="w-full h-full object-cover rounded-3xl" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-md text-[9px] font-sans tracking-widest uppercase font-bold text-stone-900">
                {product.category} · {product.subCategory || 'HAUTE COUTURE'}
              </div>
            </div>
            
            {/* Gallery Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
                {allImages.map((imgUrl, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(imgUrl)}
                    className={`w-16 sm:w-20 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                      mainImage === imgUrl ? 'border-amber-800 shadow-sm scale-102' : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Piece Architecture & Add To Bag */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-amber-800 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  ✦ RUNWAY ARCHIVE ✦
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={13} fill="currentColor" />)}
                  <span className="text-xs font-sans font-bold text-stone-700 ml-1.5">(5.0)</span>
                </div>
              </div>

              {/* Title with Fluid Clamp */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-light text-stone-900 tracking-tight leading-[1.15]">
                {product.name}
              </h1>

              {/* Price & Valuation */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-sans font-bold text-stone-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-sans text-stone-400">All Taxes Included · Free Courier</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed">
              {product.description || "A masterwork of royal Indian craftsmanship. Meticulously hand-embroidered by generational karigars in our Jaipur atelier using pure mulberry silks, authentic gold zari threads, and architectural tailoring."}
            </p>

            {/* Size Selection */}
            <div className="space-y-3.5 pt-4 border-t border-stone-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-sans uppercase tracking-wider font-bold text-stone-800">
                  Select Size / Proportion
                </span>
                <span className="text-[11px] font-sans text-stone-500">
                  {isSelectedOutOfStock ? 'Out of Stock' : `${currentStock} available in atelier`}
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map(variant => {
                    const isOutOfStock = (variant.stock !== undefined && variant.stock <= 0) || variant.status === 'out_of_stock';
                    const isSelected = selectedSize === variant.size;
                    return (
                      <button
                        key={variant._id || variant.size}
                        onClick={() => setSelectedSize(variant.size)}
                        className={`min-w-14 sm:min-w-16 h-12 sm:h-14 px-3 flex flex-col items-center justify-center rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                            : isOutOfStock
                            ? 'bg-stone-100 border-stone-200 text-stone-400 line-through'
                            : 'bg-white border-stone-200 text-stone-800 hover:border-amber-800'
                        }`}
                      >
                        <span className="font-sans text-xs font-bold">{variant.size}</span>
                      </button>
                    );
                  })
                ) : product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-14 sm:min-w-16 h-12 sm:h-14 px-3 flex items-center justify-center rounded-2xl border font-sans text-xs font-bold transition-all ${
                        selectedSize === size
                          ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                          : 'bg-white border-stone-200 text-stone-800 hover:border-amber-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => setSelectedSize('Standard')}
                    className="px-5 h-12 rounded-2xl bg-stone-900 text-white font-sans text-xs font-bold uppercase tracking-wider"
                  >
                    Bespoke Atelier Fit
                  </button>
                )}
              </div>
            </div>

            {/* Quantity and Primary Action */}
            <div className="space-y-3.5 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-stone-200 rounded-2xl px-4 py-2.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:text-black text-stone-400 transition-colors"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="mx-4 font-sans font-bold text-sm w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => {
                      if (quantity < currentStock) setQuantity(quantity + 1);
                      else toast.info(`Maximum ${currentStock} pieces in current lot`);
                    }}
                    disabled={isSelectedOutOfStock || quantity >= currentStock}
                    className="p-1 hover:text-black text-stone-400 transition-colors disabled:opacity-30"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isSelectedOutOfStock}
                  className={`flex-grow py-3.5 sm:py-4 rounded-2xl font-sans text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                    isSelectedOutOfStock
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                      : 'bg-stone-900 hover:bg-amber-800 text-white cursor-pointer active:scale-98'
                  }`}
                >
                  <ShoppingBag size={14} />
                  <span>{isSelectedOutOfStock ? 'Sold Out in Atelier' : 'Add to Shopping Bag'}</span>
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product)}
                className={`w-full py-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-wider font-bold cursor-pointer ${
                  isWishlisted
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-black'
                }`}
              >
                <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                <span>{isWishlisted ? 'Saved in Masterpiece Archive' : 'Save to Masterpiece Archive'}</span>
              </button>
            </div>

            {/* Craft Specs Tabs */}
            <div className="pt-6 border-t border-stone-200 space-y-4">
              <div className="flex gap-6 border-b border-stone-200 pb-2">
                {[
                  { id: 'craft', label: 'Craft & Fabric' },
                  { id: 'delivery', label: 'Insured Delivery' },
                  { id: 'care', label: 'Handloom Care' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-xs font-sans uppercase tracking-wider transition-colors pb-1 relative ${
                      activeTab === tab.id ? 'text-amber-900 font-bold' : 'text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="detailsTab" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-amber-800" />
                    )}
                  </button>
                ))}
              </div>

              <div className="text-xs text-stone-600 font-light leading-relaxed pt-2">
                {activeTab === 'craft' && (
                  <ul className="space-y-2 font-sans text-[11px]">
                    <li className="flex items-center gap-2">✦ 100% Premium Certified Fabric & Tailored Fit</li>
                    <li className="flex items-center gap-2">✦ Authentic 24K real gold/silver metallic dabka and zardozi</li>
                    <li className="flex items-center gap-2">✦ Tailored with Italian canvas interlining and breathable mulmul cotton</li>
                    <li className="flex items-center gap-2">✦ Hand-dyed using organic wild botanical infusions in Jaipur</li>
                  </ul>
                )}
                {activeTab === 'delivery' && (
                  <p>
                    Complimentary insured white-glove express courier across India. Dispatched in our velvet-lined archival keepsake box with serialized authenticity card. Please note: Due to bespoke made-to-measure craftsmanship, all orders follow our strict No Return Policy.
                  </p>
                )}
                {activeTab === 'care' && (
                  <p>
                    Dry clean exclusively by heritage textile specialists. Store draped in muslin cloth with cedarwood chips to preserve the real metallic zari luster.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Complete the Look Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-12 border-t border-stone-200/80">
            <ProductFilmstripCarousel
              products={relatedProducts}
              title="Atelier Styling Pairings"
              subtitle="Recommendations from our Surat salon directors to complete your royal trousseau."
              variant="clean"
            />
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-16 sm:mt-24">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {/* Mobile Sticky Purchase Bar (Always within thumb's reach) */}
      <div className="lg:hidden fixed bottom-[max(3.8rem,env(safe-area-inset-bottom))] left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-stone-200 px-4 py-2.5 shadow-xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[8px] font-sans uppercase text-stone-400 block leading-tight">Total Price</span>
          <span className="font-sans font-bold text-base text-stone-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isSelectedOutOfStock}
          className="px-6 py-3 bg-stone-900 text-white rounded-xl text-xs font-sans uppercase tracking-widest font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <ShoppingBag size={13} />
          <span>{isSelectedOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
