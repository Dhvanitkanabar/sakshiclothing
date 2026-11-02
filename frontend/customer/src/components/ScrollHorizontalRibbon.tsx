import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

interface ScrollHorizontalRibbonProps {
  products: Product[];
}

export const ScrollHorizontalRibbon: React.FC<ScrollHorizontalRibbonProps> = ({ products }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const scrollWidth = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollWidth + 400}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [products]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0] || 'M', 1);
    toast.success(`Added ${product.name} to bag`);
  };

  return (
    <section ref={sectionRef} className="relative bg-[#f6efe2] text-[#241c16] overflow-hidden py-16">
      <div className="px-6 md:px-12 max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-sans tracking-[0.3em] uppercase text-amber-800 flex items-center gap-2 mb-2">
            <Sparkles size={12} /> HORIZONTAL PERSPECTIVE RIBBON
          </span>
          <h2 className="text-3xl sm:text-5xl font-sans font-light">
            Capsule <span className="italic font-normal">Editions</span>
          </h2>
        </div>
        <p className="text-xs font-sans text-stone-600 uppercase tracking-widest">
          Scroll to navigate collection strip →
        </p>
      </div>

      {/* Horizontal track container */}
      <div className="relative w-full h-[460px] flex items-center overflow-visible">
        <div
          ref={trackRef}
          className="flex gap-8 px-6 md:px-16 flex-nowrap shrink-0 will-change-transform"
        >
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="w-[280px] sm:w-[320px] rounded-2xl overflow-hidden bg-white shadow-xl border border-amber-900/10 shrink-0 group flex flex-col justify-between"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-sans px-2.5 py-1 rounded-md">
                  EDIT 0{idx + 1}
                </div>
                <button
                  onClick={(e) => handleQuickAdd(product, e)}
                  className="absolute bottom-4 right-4 p-3 rounded-full bg-black text-white hover:bg-amber-400 hover:text-black transition-colors shadow-lg"
                  title="Add to bag"
                >
                  <ShoppingBag size={14} />
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-sans font-bold text-base leading-snug line-clamp-1 group-hover:text-amber-800 transition-colors">
                    <Link 
                      to={`/product/${product.id}`}
                      onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                      }}
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <span className="font-sans font-bold text-base whitespace-nowrap">₹{product.price}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-sans text-stone-500 pt-2 border-t border-amber-900/10">
                  <span>{product.category}</span>
                  <Link
                    to={`/product/${product.id}`}
                    onClick={() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                    }}
                    className="inline-flex items-center gap-1 text-black font-bold uppercase tracking-wider hover:text-amber-700"
                  >
                    View <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollHorizontalRibbon;
