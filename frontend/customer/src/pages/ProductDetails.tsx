// Reading this as: Dual-Layout Product Details Page for Sakshi Clothing (Clothing vs Imitation Jewellery), with size chart modal, PIN code delivery checker, and mobile sticky purchase bar. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  ShieldAlert,
  Truck, 
  RotateCcw, 
  Heart, 
  Ruler, 
  Plus, 
  Minus, 
  Sparkles, 
  Check, 
  MapPin, 
  CheckCircle2,
  Banknote,
  Info,
  X,
  Share2
} from 'lucide-react';
import { nativeApp } from '../services/nativeService';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import { useWishlist } from '../context/WishlistContext';
import { fetchProductById, fetchProducts } from '../lib/api';
import { BUSINESS_CONFIG } from '../config/business';
import { getSavedPincode, checkPincodeDelivery, savePincode, PincodeResult } from '../utils/pincode';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import SEOHead from '../components/SEOHead';
import { Reveal, StaggerGroup, StaggerItem } from '../lib/motion';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'delivery'>('details');
  const [mainImage, setMainImage] = useState('');
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  // PIN code checker state
  const [pincode, setPincode] = useState(() => getSavedPincode() || '');
  const [pincodeStatus, setPincodeStatus] = useState<PincodeResult | null>(() => {
    const saved = getSavedPincode();
    return saved ? checkPincodeDelivery(saved) : null;
  });

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      toast.error('Please enter a valid 6-digit Indian postal PIN code.');
      return;
    }
    const result = checkPincodeDelivery(cleanPin);
    setPincodeStatus(result);
    if (result.isServiceable) {
      savePincode(cleanPin);
      toast.success(`Serviceable to PIN ${cleanPin}`);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    if (!id) return;
    const loadProductData = async () => {
      setLoading(true);
      const data = await fetchProductById(id);
      if (data) {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          const inStock = data.variants.find((v: any) => (v.stock > 0 || v.status !== 'out_of_stock') && v.size);
          setSelectedSize(inStock?.size || data.variants[0]?.size || 'Standard');
        } else if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0] || 'Standard');
        } else {
          setSelectedSize('Standard');
        }

        const DEAD_IMG_LIST = ['image-1793650768360-508253073.jpeg'];
        const validImgs = (data.images || []).map((i: any) => typeof i === 'string' ? i : i.url).filter((u: string) => u && !DEAD_IMG_LIST.some(d => u.includes(d)));
        const primary = validImgs[0] || (data.image && !DEAD_IMG_LIST.some(d => data.image.includes(d)) ? data.image : '');
        setMainImage(primary);
        
        // Fetch related pieces from database
        try {
          const related = await fetchProducts({ category: data.category, limit: 4 });
          if (Array.isArray(related) && related.length > 0) {
            setRelatedProducts(related.filter((p: any) => p.id !== data.id).slice(0, 4));
          } else {
            setRelatedProducts([]);
          }
        } catch {
          setRelatedProducts([]);
        }
      } else {
        setProduct(null);
      }
      setLoading(false);
    };
    loadProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-[#E8E5DF] border-t-[#7B1E2B] rounded-full"
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A] mb-3">Product Not Found</h2>
        <p className="text-[#6B7280] text-xs mb-6">The requested piece is currently unavailable.</p>
        <Link to="/shop">
          <Button variant="primary">Explore Current Collection</Button>
        </Link>
      </div>
    );
  }

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

  const DEAD_IMAGES = ['image-1793650768360-508253073.jpeg'];
  const allImages = Array.from(
    new Set([
      parseUrl(product.image),
      ...(product.images || []).map(parseUrl)
    ].filter(img => img && !DEAD_IMAGES.some(d => img.includes(d))))
  );

  const price = product.price || 0;
  const mrp = (product as any).mrp || (product as any).originalPrice || Math.round(price * 1.35);
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleAddToCart = async () => {
    if (isSelectedOutOfStock) {
      toast.error(`"${product.name}" (${selectedSize}) is currently out of stock`);
      return;
    }
    const sizeToUse = isJewellery ? 'One Size' : (selectedSize || 'Standard');
    const success = await addToCart(product, sizeToUse, quantity);
    if (success) {
      toast.success(`"${product.name}" added to shopping bag`);
    }
  };



  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: allImages.filter(Boolean),
    description: product.description || `Handcrafted ${product.name} from Sakshi Clothing.`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: BUSINESS_CONFIG.storeName,
    },
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : `https://sakshiclothing.store/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: isSelectedOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: BUSINESS_CONFIG.storeName,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
        merchantReturnDays: 0,
        returnMethod: 'https://schema.org/ReturnNotPermitted',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://sakshiclothing.store/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category,
        item: `https://sakshiclothing.store/shop?category=${encodeURIComponent(product.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://sakshiclothing.store/product/${product.id}`,
      },
    ],
  };

  return (
    <div className="bg-[#FBF9F6] min-h-screen text-[#1A1A1A] pb-28 lg:pb-16">
      <SEOHead
        title={`${product.name} — Handcrafted ${product.category}`}
        description={product.description?.slice(0, 160) || `Buy authentic ${product.name} at Sakshi Clothing. Handcrafted luxury with pan-India delivery.`}
        ogType="product"
        ogImage={mainImage || allImages[0] || product.image}
        jsonLd={[productSchema, breadcrumbSchema]}
      />
      
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link to="/" className="hover:text-[#7B1E2B] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[#7B1E2B] transition-colors">
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#1A1A1A] truncate max-w-[200px] sm:max-w-none font-medium">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Left Column: Image Gallery */}
          <Reveal variant="fromLeft" className="lg:col-span-7 space-y-4">
            <div className="w-full aspect-[3/4] max-h-[640px] rounded-3xl overflow-hidden bg-[#F4EFEA] border border-[#E8E5DF] shadow-sm relative group">
              <img 
                src={mainImage || allImages[0] || product.image} 
                alt={product.name} 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102" 
                referrerPolicy="no-referrer" 
              />
              
              {/* Category & Imitation Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isJewellery ? (
                  <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#C6A15B] border border-[#C6A15B]/30 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
                    <span>Imitation Jewellery</span>
                  </span>
                ) : (
                  <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#7B1E2B] border border-[#7B1E2B]/20 shadow-xs">
                    {product.category}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-[#B43E2B] text-white px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs w-fit">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Native Share Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  nativeApp.haptic('light');
                  nativeApp.share({
                    title: product.name,
                    text: `Discover ${product.name} on Sakshi Clothing:`,
                    url: window.location.href,
                    dialogTitle: `Share ${product.name}`
                  });
                }}
                className="absolute top-4 right-16 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full backdrop-blur-md transition-all z-20 bg-white/85 text-[#1A1A1A] hover:bg-white hover:text-[#7B1E2B] shadow-xs active:scale-95"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Wishlist Heart Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(product);
                }}
                className={`absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full backdrop-blur-md transition-all z-20 ${
                  isWishlisted
                    ? 'bg-[#7B1E2B] text-white shadow-md'
                    : 'bg-white/85 text-[#1A1A1A] hover:bg-white hover:text-[#7B1E2B] shadow-xs'
                }`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Heart
                  className="w-5 h-5"
                  fill={isWishlisted ? "currentColor" : "none"}
                  strokeWidth={isWishlisted ? 0 : 2}
                />
              </button>
            </div>
            
            {/* Gallery Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {allImages.map((imgUrl, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(imgUrl)}
                    className={`w-18 sm:w-20 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden border-2 transition-all min-h-[44px] ${
                      mainImage === imgUrl ? 'border-[#7B1E2B] shadow-sm scale-102' : 'border-[#E8E5DF] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </button>
                ))}
              </div>
            )}
          </Reveal>

          {/* Right Column: Details & Actions */}
          <Reveal variant="fromRight" className="lg:col-span-5 space-y-6">
            
            {/* Header / Titles / Price */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
                  isJewellery ? 'text-[#C6A15B]' : 'text-[#7B1E2B]'
                }`}>
                  {isJewellery ? 'Artisanal Imitation Jewellery' : (product.subCategory || 'Heirloom Fashion')}
                </span>
                <div className="flex items-center gap-1 text-[#C6A15B]">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                  <span className="text-xs font-semibold text-[#1A1A1A] ml-1.5">(5.0)</span>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1A1A1A] font-medium tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {mrp > price && (
                  <span className="text-base text-[#9CA3AF] line-through font-normal">
                    ₹{mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-[#B43E2B]">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                Inclusive of all taxes · Free Express Delivery on ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}+
              </p>
            </div>

            {/* Jewellery Specific Assurance Notice */}
            {isJewellery ? (
              <div className="p-4 rounded-2xl bg-[#F4EEDF] border border-[#C6A15B]/30 space-y-2">
                <div className="flex items-center gap-2 text-[#A4813D] font-semibold text-xs">
                  <Sparkles size={15} />
                  <span>Artificial / Imitation Jewellery Specification</span>
                </div>
                <p className="text-xs text-[#6B5528] leading-relaxed">
                  {product.productFacts?.hypoallergenicClaim 
                    ? product.productFacts.hypoallergenicClaim 
                    : (product.productFacts?.material 
                        ? `Crafted with ${product.productFacts.material}${product.productFacts.plating ? ` and finished in ${product.productFacts.plating}` : ''}. Designed for comfortable festive wear.`
                        : "Fashion imitation jewellery crafted with brass/alloy base metal and electroplated finish. Synthetic stones and faux beads.")}
                </p>
              </div>
            ) : (
              <p className="text-[#4B5563] text-sm leading-relaxed">
                {product.description || ""}
              </p>
            )}

            {/* Clothing Size Selector OR Jewellery Specs */}
            {!isJewellery ? (
              <div className="space-y-3 pt-4 border-t border-[#E8E5DF]">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
                    Select Size
                  </span>
                  <button
                    onClick={() => setIsSizeChartOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#7B1E2B] hover:underline font-semibold min-h-[44px] py-1"
                  >
                    <Ruler size={14} />
                    <span>View Size Guide</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {(product.sizes && product.sizes.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL', 'Free Size']).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-14 h-12 px-3.5 rounded-xl border text-xs font-semibold transition-all min-h-[44px] flex items-center justify-center ${
                        selectedSize === size
                          ? 'bg-[#7B1E2B] border-[#7B1E2B] text-white shadow-xs'
                          : 'bg-white border-[#E8E5DF] text-[#1A1A1A] hover:border-[#7B1E2B]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-4 border-t border-[#E8E5DF]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] block">
                  Fit & Dimensions
                </span>
                <p className="text-xs text-[#6B7280]">
                  One Size with adjustable cotton dori / extending chain. Suitable for all necklines and wrist sizes.
                </p>
              </div>
            )}

            {/* Quantity Selector & Add to Bag */}
            <div className="space-y-3 pt-4 border-t border-[#E8E5DF]">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-[#E8E5DF] rounded-xl px-3 py-1.5 min-h-[46px]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A]"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="mx-3 font-semibold text-sm w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isSelectedOutOfStock || quantity >= currentStock}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A] disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <Button
                  variant={isJewellery ? "champagne" : "primary"}
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isSelectedOutOfStock}
                  className={`flex-1 font-semibold min-h-[48px] ${isJewellery ? 'text-[#1A1A1A]' : 'text-white'}`}
                  leftIcon={<ShoppingBag size={16} />}
                >
                  {isSelectedOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}
                </Button>
              </div>

              {/* Policy Trust Notice */}
              <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] text-[11px] text-[#4B5563]">
                <ShieldAlert size={14} className="text-[#7B1E2B] shrink-0" />
                <span><strong>No returns</strong> (damaged or wrong items covered within 48h). <Link to="/refund-policy" className="text-[#7B1E2B] underline font-medium">Read policy</Link></span>
              </div>
            </div>

            {/* PIN Code Delivery Checker */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#111111]">
                <MapPin size={15} className="text-[#7B1E2B]" />
                <span>Delivery & COD Availability</span>
              </div>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN code (e.g. 394105)"
                  className="flex-1 px-3.5 py-2 text-base rounded-xl border border-[#E8E5DF] focus:outline-none focus:border-[#7B1E2B] min-h-[44px]"
                />
                <Button type="submit" variant="outline" size="sm" className="shrink-0 min-h-[44px]">
                  Check
                </Button>
              </form>
              {pincodeStatus && (
                <div className={`text-xs p-3 rounded-xl border flex flex-col gap-1 ${
                  pincodeStatus.isServiceable 
                    ? 'bg-[#F4FBF5] border-[#C6E8CD] text-[#15803D]' 
                    : 'bg-[#FDF2F0] border-[#F8D7DA] text-[#B43E2B]'
                }`}>
                  <div className="flex items-center gap-1.5 font-semibold">
                    {pincodeStatus.isServiceable ? <CheckCircle2 size={15} /> : <Info size={15} />}
                    <span>{pincodeStatus.isServiceable ? `Delivering to PIN ${pincodeStatus.pincode} (${pincodeStatus.estimatedDays})` : pincodeStatus.message}</span>
                  </div>
                  {pincodeStatus.isServiceable && (
                    <div className="text-[11px] text-[#5C5855] flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>Expected arrival: <strong className="text-[#111111]">{pincodeStatus.deliveryDateStr}</strong></span>
                      <span>•</span>
                      <span>Cash on Delivery: <strong className="text-[#15803D]">Eligible</strong></span>
                      <span>•</span>
                      <span>Free shipping above ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Details & Care Tabs */}
            <div className="pt-4 border-t border-[#E8E5DF] space-y-3">
              <div className="flex gap-6 border-b border-[#E8E5DF]">
                {[
                  { id: 'details', label: isJewellery ? 'Jewellery Specs' : 'Fabric & Details' },
                  { id: 'care', label: 'Care Instructions' },
                  { id: 'delivery', label: 'Shipping & Returns' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`text-xs font-semibold uppercase tracking-wider pb-2 relative min-h-[40px] ${
                      activeTab === tab.id ? 'text-[#7B1E2B]' : 'text-[#6B7280] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="prodTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7B1E2B]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="text-xs text-[#4B5563] leading-relaxed pt-1">
                {activeTab === 'details' && (
                  <div className="space-y-3">
                    {/* Database product facts */}
                    {product.productFacts && (product.productFacts.material || product.productFacts.plating || product.productFacts.stone || product.productFacts.isHypoallergenic) ? (
                      <ul className="space-y-2 text-xs">
                        {product.productFacts.material && (
                          <li className="flex items-start gap-2">
                            <span className="text-[#C6A15B]">✦</span>
                            <span><strong>Material / Base:</strong> {product.productFacts.material}</span>
                          </li>
                        )}
                        {product.productFacts.plating && (
                          <li className="flex items-start gap-2">
                            <span className="text-[#C6A15B]">✦</span>
                            <span><strong>Plating & Finish:</strong> {product.productFacts.plating}</span>
                          </li>
                        )}
                        {product.productFacts.stone && (
                          <li className="flex items-start gap-2">
                            <span className="text-[#C6A15B]">✦</span>
                            <span><strong>Stone / Embellishment:</strong> {product.productFacts.stone}</span>
                          </li>
                        )}
                        {product.productFacts.isHypoallergenic && (
                          <li className="flex items-start gap-2 text-emerald-700">
                            <span className="text-emerald-600">✓</span>
                            <span><strong>Skin Safety:</strong> {product.productFacts.hypoallergenicClaim || 'Lead-safe and nickel-safe for normal wear [CONFIRM]'}</span>
                          </li>
                        )}
                      </ul>
                    ) : null}

                    {/* Craft & Fabric items from database */}
                    {Array.isArray(product.craftAndFabric) && product.craftAndFabric.length > 0 && (
                      <ul className="space-y-1.5 text-xs pt-2 border-t border-[#E8E5DF]">
                        {product.craftAndFabric.map((line: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#7B1E2B]">✦</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Fallback to description if no bulleted facts entered */}
                    {(!product.productFacts || (!product.productFacts.material && !product.productFacts.plating && !product.productFacts.stone)) && (!product.craftAndFabric || product.craftAndFabric.length === 0) && (
                      <p className="text-xs text-[#6B7280]">
                        {product.description || 'Authentic designer wear from Sakshi Clothing.'}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'care' && (
                  <div className="space-y-2 text-xs">
                    {Array.isArray(product.productFacts?.careInstructions) && product.productFacts.careInstructions.length > 0 ? (
                      <ul className="space-y-1.5">
                        {product.productFacts.careInstructions.map((instruction: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span>•</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="space-y-1.5">
                        {isJewellery ? (
                          <>
                            <li>• Store each piece individually in an airtight pouch or box to prevent tarnishing.</li>
                            <li>• Avoid direct contact with perfumes, sanitizers, body lotions, and water.</li>
                            <li>• Gently wipe with a soft dry cloth after each wear before storing.</li>
                          </>
                        ) : (
                          <>
                            <li>• Dry cleaning recommended for delicate fabrics, embroidery, and zari work.</li>
                            <li>• Gentle hand wash in cold water with mild detergent for daily cotton items.</li>
                            <li>• Steam iron inside-out on low heat setting. Avoid direct heat on metallic embroidery.</li>
                          </>
                        )}
                      </ul>
                    )}
                  </div>
                )}

                {activeTab === 'delivery' && (
                  <div className="space-y-2 text-xs">
                    <p>
                      <strong>Free Shipping:</strong> On all orders above ₹{BUSINESS_CONFIG.policies.freeShippingThreshold} across India. Dispatched within 24 hours.
                    </p>
                    <p>
                      <strong>Cash on Delivery (COD):</strong> {BUSINESS_CONFIG.policies.codAvailable ? 'Available nationwide across 19,000+ PIN codes with zero extra fees.' : 'Prepaid only.'}
                    </p>
                    <p>
                      <strong>Strict No-Return Policy:</strong> {isJewellery ? BUSINESS_CONFIG.policies.jewelleryPolicy : BUSINESS_CONFIG.policies.clothingPolicy}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </Reveal>
        </div>

        {/* Complete the Look Section */}
        {relatedProducts.length > 0 && (
          <Reveal variant="fromBottom" className="mt-16 sm:mt-24 pt-12 border-t border-[#E8E5DF]">
            <div className="mb-8">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7B1E2B] block mb-1">
                Curated Pairings
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-medium">
                Complete The Look
              </h2>
            </div>
            <StaggerGroup stagger={0.05} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <StaggerItem key={p.id} variant="fromBottom">
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Reveal>
        )}

        {/* Reviews Section */}
        <Reveal variant="fromBottom" className="mt-16 sm:mt-24">
          <ProductReviews productId={product.id} />
        </Reveal>
      </div>

      {/* Size Chart Modal */}
      <Modal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        title="Ethnic Wear Size Guide (Inches)"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-[#1A1A1A]">
          {Array.isArray(product.productFacts?.sizeChartGuide) && product.productFacts.sizeChartGuide.length > 0 && (
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl space-y-1">
              <p className="font-semibold text-[#7B1E2B]">Product Fit Notes:</p>
              <ul className="space-y-1 text-[#4B5563]">
                {product.productFacts.sizeChartGuide.map((note: string, idx: number) => (
                  <li key={idx}>• {note}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[#6B7280]">
            All measurements are garment body measurements in inches. If you fall between sizes, we recommend sizing up.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-[#E8E5DF] rounded-xl overflow-hidden">
              <thead className="bg-[#FAF8F5] text-[11px] font-semibold uppercase text-[#7B1E2B]">
                <tr>
                  <th className="p-3 border-b border-[#E8E5DF]">Size</th>
                  <th className="p-3 border-b border-[#E8E5DF]">Bust / Chest</th>
                  <th className="p-3 border-b border-[#E8E5DF]">Waist</th>
                  <th className="p-3 border-b border-[#E8E5DF]">Hips</th>
                  <th className="p-3 border-b border-[#E8E5DF]">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DF]">
                <tr>
                  <td className="p-3 font-semibold">XS (34)</td>
                  <td className="p-3">34"</td>
                  <td className="p-3">28"</td>
                  <td className="p-3">38"</td>
                  <td className="p-3">48"</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">S (36)</td>
                  <td className="p-3">36"</td>
                  <td className="p-3">30"</td>
                  <td className="p-3">40"</td>
                  <td className="p-3">48"</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">M (38)</td>
                  <td className="p-3">38"</td>
                  <td className="p-3">32"</td>
                  <td className="p-3">42"</td>
                  <td className="p-3">49"</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">L (40)</td>
                  <td className="p-3">40"</td>
                  <td className="p-3">34"</td>
                  <td className="p-3">44"</td>
                  <td className="p-3">49"</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">XL (42)</td>
                  <td className="p-3">42"</td>
                  <td className="p-3">36"</td>
                  <td className="p-3">46"</td>
                  <td className="p-3">50"</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="pt-2 text-center">
            <Button variant="outline" size="sm" onClick={() => setIsSizeChartOpen(false)}>
              Close Size Guide
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mobile Sticky Add to Bag Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#E8E5DF] px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase text-[#6B7280] block font-medium">Price</span>
          <span className="font-bold text-base text-[#1A1A1A]">
            ₹{price.toLocaleString('en-IN')}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isSelectedOutOfStock}
          className={`min-h-[44px] px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold shadow-md flex items-center gap-1.5 active:scale-95 transition-all select-none ${
            isJewellery
              ? 'bg-[#C6A15B] text-white hover:bg-[#B38F48]'
              : 'bg-[#7B1E2B] text-white hover:bg-[#621721]'
          }`}
        >
          <ShoppingBag size={14} />
          <span>{isSelectedOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
        </button>
      </div>

    </div>
  );
};

export default ProductDetails;
