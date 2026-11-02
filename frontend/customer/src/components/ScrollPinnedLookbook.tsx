import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Sparkles, Feather, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const ScrollPinnedLookbook: React.FC = () => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const slide1Ref = useRef<HTMLDivElement>(null);
  const slide2Ref = useRef<HTMLDivElement>(null);
  const slide3Ref = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const image1Ref = useRef<HTMLImageElement>(null);
  const image2Ref = useRef<HTMLImageElement>(null);
  const image3Ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    const pinWrap = pinWrapRef.current;
    if (!trigger || !pinWrap) return;

    const ctx = gsap.context(() => {
      // Main pinned scrub timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger,
          start: 'top top',
          end: '+=2400',
          pin: pinWrap,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${self.progress * 100}%`;
            }
            if (counterRef.current) {
              const currentChapter = Math.min(3, Math.floor(self.progress * 3) + 1);
              counterRef.current.innerText = `CHAPTER 0${currentChapter} / 03`;
            }
          },
        },
      });

      // Chapter 1 -> Chapter 2 transition
      tl.to(image1Ref.current, {
        scale: 1.15,
        opacity: 0.1,
        y: -40,
        ease: 'none',
      }, 0);

      tl.to(slide1Ref.current, {
        y: -60,
        opacity: 0,
        ease: 'none',
      }, 0);

      tl.fromTo(
        slide2Ref.current,
        { opacity: 0, y: 80, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, ease: 'none' },
        0.3
      );

      tl.fromTo(
        image2Ref.current,
        { scale: 0.9, opacity: 0, rotate: -3 },
        { scale: 1, opacity: 1, rotate: 0, ease: 'none' },
        0.3
      );

      // Chapter 2 -> Chapter 3 transition
      tl.to(slide2Ref.current, {
        opacity: 0,
        y: -60,
        ease: 'none',
      }, 0.7);

      tl.to(image2Ref.current, {
        opacity: 0.1,
        scale: 1.15,
        ease: 'none',
      }, 0.7);

      tl.fromTo(
        slide3Ref.current,
        { opacity: 0, y: 80, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, ease: 'none' },
        0.75
      );

      tl.fromTo(
        image3Ref.current,
        { scale: 0.88, opacity: 0, rotate: 3 },
        { scale: 1, opacity: 1, rotate: 0, ease: 'none' },
        0.75
      );
    }, triggerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={triggerRef} className="relative bg-[#0d0c0b] text-[#fbf7f0] w-full">
      {/* The pinned container viewport */}
      <div
        ref={pinWrapRef}
        className="h-screen w-full flex flex-col justify-between overflow-hidden relative"
      >
        {/* Pinned Top Bar */}
        <div className="z-30 px-6 md:px-12 pt-8 flex items-center justify-between border-b border-white/10 pb-4 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span
              ref={counterRef}
              className="text-xs font-sans tracking-[0.25em] text-amber-300 uppercase"
            >
              CHAPTER 01 / 03
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-sans text-stone-400 hidden sm:inline">
              GSAP ScrollTrigger · Pin & Scrub
            </span>
            {/* Scroll progress track */}
            <div className="w-32 sm:w-48 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                ref={progressBarRef}
                className="h-full bg-amber-400 w-0 transition-all duration-75"
              />
            </div>
          </div>
        </div>

        {/* Center Stage with Absolute Transitioning Chapters */}
        <div className="relative flex-grow flex items-center justify-center px-6 md:px-12 max-w-7xl mx-auto w-full">
          
          {/* Chapter 1: The Architectural Drape */}
          <div
            ref={slide1Ref}
            className="absolute inset-0 flex flex-col lg:flex-row items-center justify-between gap-12 z-20 pointer-events-auto"
          >
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 text-[10px] font-sans tracking-[0.3em] uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <Compass size={12} />
                <span>Volume 04 · Haute Couture Drape</span>
              </div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-light leading-[1.05] tracking-tight">
                The <span className="italic font-normal text-amber-200">Architectural</span> <br />
                Drape
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                Sculpted from handloom Mulberry silk in Jaipur, our signature silhouette balances flowing weightlessness with sharp architectural pleats.
              </p>
              <div className="pt-2 flex items-center gap-6">
                <div>
                  <p className="font-sans text-2xl font-bold text-amber-300">140h</p>
                  <p className="text-[10px] font-sans uppercase tracking-wider text-stone-400">Hand Embroidery</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="font-sans text-2xl font-bold text-amber-300">100%</p>
                  <p className="text-[10px] font-sans uppercase tracking-wider text-stone-400">Mulberry Silk</p>
                </div>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-white text-black hover:bg-amber-400 text-xs font-bold uppercase tracking-widest transition-colors shadow-xl"
              >
                <span>Discover Piece</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="relative aspect-[3/4] w-full max-w-[340px] sm:max-w-[420px] rounded-3xl overflow-hidden shadow-2xl border border-white/15">
              <img
                ref={image1Ref}
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop"
                alt="Architectural Drape"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Chapter 2: Jaipur Handloom Artisanship */}
          <div
            ref={slide2Ref}
            className="absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-between gap-12 z-20 opacity-0 pointer-events-auto"
          >
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 text-[10px] font-sans tracking-[0.3em] uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <Feather size={12} />
                <span>Living Heritage · Zardozi Threading</span>
              </div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-light leading-[1.05] tracking-tight">
                Jaipur <br />
                <span className="italic font-normal text-amber-200">Heritage</span> Weave
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                Every motif is pressed by master karigars using authentic vegetable dyes and spun silver wire. Preserving three generations of craft in every seam.
              </p>
              <div className="pt-2 flex items-center gap-6">
                <div>
                  <p className="font-sans text-2xl font-bold text-amber-300">Pit Looms</p>
                  <p className="text-[10px] font-sans uppercase tracking-wider text-stone-400">Traditional Technique</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="font-sans text-2xl font-bold text-amber-300">Natural Dyes</p>
                  <p className="text-[10px] font-sans uppercase tracking-wider text-stone-400">Botanical Extract</p>
                </div>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-amber-400 text-black hover:bg-white text-xs font-bold uppercase tracking-widest transition-colors shadow-xl"
              >
                <span>Read Atelier Journal</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="relative aspect-[3/4] w-full max-w-[340px] sm:max-w-[420px] rounded-3xl overflow-hidden shadow-2xl border border-white/15">
              <img
                ref={image2Ref}
                src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1200&auto=format&fit=crop"
                alt="Jaipur Weave"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Chapter 3: Midnight Velvet Noir */}
          <div
            ref={slide3Ref}
            className="absolute inset-0 flex flex-col lg:flex-row items-center justify-between gap-12 z-20 opacity-0 pointer-events-auto"
          >
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 text-[10px] font-sans tracking-[0.3em] uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <Sparkles size={12} />
                <span>Nocturne Capsule · Limited 50 Pieces</span>
              </div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-light leading-[1.05] tracking-tight">
                Midnight <br />
                <span className="italic font-normal text-amber-200">Velvet Noir</span>
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                Deep indigo silk velvet infused with micro-sequin constellations. Designed for celebratory galas and royal evenings beneath the starlight.
              </p>
              <div className="pt-2 flex items-center gap-6">
                <div>
                  <p className="font-sans text-2xl font-bold text-amber-300">Numbered</p>
                  <p className="text-[10px] font-sans uppercase tracking-wider text-stone-400">Certificate of Authenticity</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="font-sans text-2xl font-bold text-amber-300">Custom Fit</p>
                  <p className="text-[10px] font-sans uppercase tracking-wider text-stone-400">Atelier Made-to-Measure</p>
                </div>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-white text-black hover:bg-amber-400 text-xs font-bold uppercase tracking-widest transition-colors shadow-xl"
              >
                <span>Reserve Consultation</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="relative aspect-[3/4] w-full max-w-[340px] sm:max-w-[420px] rounded-3xl overflow-hidden shadow-2xl border border-white/15">
              <img
                ref={image3Ref}
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop"
                alt="Midnight Velvet Noir"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>

        </div>

        {/* Pinned Bottom Helper Indicator */}
        <div className="z-30 px-6 md:px-12 pb-6 flex items-center justify-between text-[11px] font-sans text-stone-400 border-t border-white/10 pt-4 bg-black/40 backdrop-blur-md">
          <span>Scroll down to scrub through the editorial archive ↓</span>
          <span className="hidden sm:inline">Sakshi Clothing · Jaipur Atelier</span>
        </div>
      </div>
    </div>
  );
};

export default ScrollPinnedLookbook;
