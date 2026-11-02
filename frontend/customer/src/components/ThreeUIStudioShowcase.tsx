import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterCarousel, CharacterCarouselVariant } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';
import { Sparkles, Sliders, RefreshCw, Eye, Play, Pause, Layers, Compass, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ThreeUIStudioShowcaseProps {
  initialVariant?: CharacterCarouselVariant;
}

export const ThreeUIStudioShowcase: React.FC<ThreeUIStudioShowcaseProps> = ({
  initialVariant = 'filmstrip',
}) => {
  const [variant, setVariant] = useState<CharacterCarouselVariant>(initialVariant);
  const [speed, setSpeed] = useState<number>(1.0);
  const [scale, setScale] = useState<number>(1.0);
  const [opacity, setOpacity] = useState<number>(1.0);
  const [hue, setHue] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(1.0);
  const [brightness, setBrightness] = useState<number>(1.0);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const resetControls = () => {
    setSpeed(1.0);
    setScale(1.0);
    setOpacity(1.0);
    setHue(0);
    setSaturation(1.0);
    setBrightness(1.0);
    setIsPaused(false);
  };

  return (
    <section className="relative py-20 lg:py-32 px-4 md:px-8 bg-[#121110] text-[#f7f2ea] overflow-hidden border-y border-amber-900/30">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-800/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-sans tracking-widest uppercase mb-4">
              <Sparkles size={12} className="animate-spin text-amber-400" />
              <span>ThreeUI Interactive Runtime · DOM + CSS Shader Stage</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-light tracking-tight text-white">
              Character <span className="italic font-normal text-amber-200">Filmstrip</span> Deck
            </h2>
            <p className="text-stone-400 text-sm md:text-base max-w-2xl mt-3 font-light leading-relaxed">
              A warm editorial card deck with framed portraits, numbered identity footers, paper grain, and a deep looping perspective rail. Drag, scroll or use arrow keys to browse.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowControls(!showControls)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-sans uppercase tracking-wider text-amber-200 transition-colors"
            >
              <Sliders size={14} />
              <span>{showControls ? 'Hide Controls' : 'Live Tuning'}</span>
            </button>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-400/20"
            >
              <span>Explore Editorial Line</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Studio Canvas + Control Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main 3D Canvas Box */}
          <div className={`${showControls ? 'lg:col-span-9' : 'lg:col-span-12'} transition-all duration-500`}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black/60 aspect-[16/10] sm:aspect-[16/9] min-h-[460px] md:min-h-[560px]">
              {/* ThreeUI Component Frame */}
              <div className="shader-frame w-full h-full">
                <CharacterCarousel
                  variant={variant}
                  speed={isPaused ? 0 : speed}
                  scale={scale}
                  opacity={opacity}
                  hue={hue}
                  saturation={saturation}
                  brightness={brightness}
                  className="w-full h-full"
                />
              </div>

              {/* Floating Overlay Badges */}
              <div className="absolute top-5 left-5 z-20 pointer-events-none flex items-center gap-2">
                <span className="px-3 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-sans tracking-widest uppercase text-amber-300">
                  {variant === 'filmstrip' ? 'Perspective Rail · 1450px' : 'Sine Wave Rail'}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-sans text-stone-300 hidden sm:inline-block">
                  Speed: {speed.toFixed(2)}x
                </span>
              </div>

              <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white transition-colors"
                  title={isPaused ? 'Resume Carousel' : 'Pause Carousel'}
                >
                  {isPaused ? <Play size={14} className="text-amber-400" /> : <Pause size={14} />}
                </button>
                <button
                  onClick={() => setVariant(variant === 'filmstrip' ? 'wave' : 'filmstrip')}
                  className="px-3.5 py-2 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-xs font-sans uppercase tracking-wider text-amber-300 transition-colors"
                  title="Toggle Variant"
                >
                  {variant === 'filmstrip' ? 'Switch to Wave' : 'Switch to Filmstrip'}
                </button>
              </div>

              {/* Bottom interaction note */}
              <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none flex items-center justify-between text-[11px] font-sans text-stone-400 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                <span className="flex items-center gap-2">
                  <Compass size={13} className="text-amber-400" />
                  <span>Click & Drag left/right to scrub · Wheel to slide</span>
                </span>
                <span className="hidden sm:inline text-stone-400">Sakshi Luxury Maison · Editorial Vol. 4</span>
              </div>
            </div>
          </div>

          {/* Live Controller Sidebar */}
          {showControls && (
            <div className="lg:col-span-3 space-y-6 bg-stone-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-sans uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Sliders size={14} /> Shader Parameters
                </h3>
                <button
                  onClick={resetControls}
                  className="text-stone-400 hover:text-white transition-colors flex items-center gap-1"
                  title="Reset to defaults"
                >
                  <RefreshCw size={12} /> Reset
                </button>
              </div>

              {/* Variant Selector */}
              <div>
                <label className="text-[11px] font-sans text-stone-400 uppercase tracking-wider block mb-2">Variant</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVariant('filmstrip')}
                    className={`py-2 px-3 rounded-xl font-sans uppercase tracking-wider text-[11px] border transition-all ${
                      variant === 'filmstrip'
                        ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-md'
                        : 'bg-stone-800 text-stone-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    Filmstrip
                  </button>
                  <button
                    onClick={() => setVariant('wave')}
                    className={`py-2 px-3 rounded-xl font-sans uppercase tracking-wider text-[11px] border transition-all ${
                      variant === 'wave'
                        ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-md'
                        : 'bg-stone-800 text-stone-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    Wave
                  </button>
                </div>
              </div>

              {/* Speed Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[11px] text-stone-400">
                  <span>Speed</span>
                  <span className="text-amber-300">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.5"
                  step="0.05"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Scale Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[11px] text-stone-400">
                  <span>Scale</span>
                  <span className="text-amber-300">{scale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.02"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Hue Rotation Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[11px] text-stone-400">
                  <span>Hue Shift</span>
                  <span className="text-amber-300">{hue}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={hue}
                  onChange={(e) => setHue(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Saturation Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[11px] text-stone-400">
                  <span>Saturation</span>
                  <span className="text-amber-300">{saturation.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.0"
                  step="0.05"
                  value={saturation}
                  onChange={(e) => setSaturation(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Brightness Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[11px] text-stone-400">
                  <span>Brightness</span>
                  <span className="text-amber-300">{brightness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.35"
                  max="1.65"
                  step="0.05"
                  value={brightness}
                  onChange={(e) => setBrightness(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Editorial Specifications Info */}
              <div className="pt-4 border-t border-white/10 space-y-2 text-[10px] text-stone-400 font-sans">
                <div className="flex justify-between">
                  <span>Perspective</span>
                  <span className="text-stone-300">1450px</span>
                </div>
                <div className="flex justify-between">
                  <span>Runtime</span>
                  <span className="text-stone-300">DOM + CSS 3D</span>
                </div>
                <div className="flex justify-between">
                  <span>Source Revision</span>
                  <span className="text-stone-300">SHA-256 4c98939e</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ThreeUIStudioShowcase;
