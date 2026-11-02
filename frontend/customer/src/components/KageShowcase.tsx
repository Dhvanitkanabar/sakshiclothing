import React, { useState } from 'react';
import { KageLandingPage } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';
import { Sparkles, Sliders, RefreshCw, Compass, ArrowUpRight, Moon, Flame, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

export const KageShowcase: React.FC = () => {
  const [headingFont, setHeadingFont] = useState<any>('onest');
  const [bodyFont, setBodyFont] = useState<any>('onest');
  const [headingWeight, setHeadingWeight] = useState('400');
  const [bodyWeight, setBodyWeight] = useState('300');
  const [primaryColor, setPrimaryColor] = useState('#e0231c');
  const [headingSize, setHeadingSize] = useState(46);
  const [bodySize, setBodySize] = useState(17);
  const [headingLetterSpacing, setHeadingLetterSpacing] = useState(-0.012);
  const [showControls, setShowControls] = useState(true);

  const resetControls = () => {
    setHeadingFont('onest');
    setBodyFont('onest');
    setHeadingWeight('400');
    setBodyWeight('300');
    setPrimaryColor('#e0231c');
    setHeadingSize(46);
    setBodySize(17);
    setHeadingLetterSpacing(-0.012);
  };

  return (
    <section className="relative py-20 lg:py-32 px-4 md:px-8 bg-[#05070a] text-[#dfe7e0] overflow-hidden border-y border-red-950/40">
      {/* Vermilion moon atmospheric glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#e0231c]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-red-950/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-[11px] font-sans tracking-widest uppercase mb-4">
              <Flame size={12} className="text-[#e0231c]" />
              <span>Three.js WebGL Live World · Five-Chapter Night Walk</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-light tracking-tight text-white">
              Kage — <span className="italic font-normal text-red-500">Torii at Dusk</span>
            </h2>
            <p className="text-stone-400 text-sm md:text-base max-w-2xl mt-3 font-light leading-relaxed">
              Charred cypress, lantern light, and a vermilion moon. A scroll-driven WebGL temple journey where background atmosphere and lighting dynamically transform as you walk the sacred mountain paths.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowControls(!showControls)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-sans uppercase tracking-wider text-red-300 transition-colors"
            >
              <Sliders size={14} />
              <span>{showControls ? 'Hide Typography' : 'Live Tuning'}</span>
            </button>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#e0231c] hover:bg-red-600 text-white text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-red-500/20"
            >
              <span>Explore Night Walk Edit</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Studio Canvas + Control Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Three.js Kage Stage */}
          <div className={`${showControls ? 'lg:col-span-9' : 'lg:col-span-12'} transition-all duration-500`}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-red-950/60 bg-[#05070a] min-h-[640px] md:min-h-[820px] h-[820px]">
              <div className="shader-frame w-full h-full !min-h-[820px]">
                <KageLandingPage
                  headingFont={headingFont}
                  bodyFont={bodyFont}
                  headingWeight={headingWeight}
                  bodyWeight={bodyWeight}
                  primaryColor={primaryColor}
                  headingSize={headingSize}
                  bodySize={bodySize}
                  headingLetterSpacing={headingLetterSpacing}
                  className="w-full h-full"
                />
              </div>

              {/* Bottom interaction guide banner */}
              <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none flex items-center justify-between text-[11px] font-sans text-stone-400 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-sm">
                <span className="flex items-center gap-2">
                  <Moon size={13} className="text-red-400" />
                  <span>Scroll inside frame to travel chapters · Background scene & lighting transforms with scroll</span>
                </span>
                <span className="hidden sm:inline text-stone-500">Kyoto Mountain Walk · Live WebGL World</span>
              </div>
            </div>
          </div>

          {/* Typography & Shading Controller */}
          {showControls && (
            <div className="lg:col-span-3 space-y-6 bg-stone-950/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl text-xs text-[#dfe7e0]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-sans uppercase tracking-wider text-red-400 flex items-center gap-2 font-bold">
                  <Sliders size={14} /> Kage Parameters
                </h3>
                <button
                  onClick={resetControls}
                  className="text-stone-400 hover:text-white transition-colors flex items-center gap-1 font-sans text-[10px]"
                  title="Reset to defaults"
                >
                  <RefreshCw size={11} /> Reset
                </button>
              </div>

              {/* Heading Font */}
              <div>
                <label className="text-[11px] font-sans text-stone-400 uppercase tracking-wider block mb-2">Display Font</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setHeadingFont('onest')}
                    className={`py-2 px-3 rounded-xl font-sans uppercase tracking-wider text-[10px] border transition-all ${
                      headingFont === 'onest'
                        ? 'bg-[#e0231c] text-white border-[#e0231c] font-bold shadow-sm'
                        : 'bg-stone-900 text-stone-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    Onest
                  </button>
                  <button
                    onClick={() => setHeadingFont('instrument-serif')}
                    className={`py-2 px-3 rounded-xl font-sans uppercase tracking-wider text-[10px] border transition-all ${
                      headingFont === 'instrument-serif'
                        ? 'bg-[#e0231c] text-white border-[#e0231c] font-bold shadow-sm'
                        : 'bg-stone-900 text-stone-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    Instrument
                  </button>
                </div>
              </div>

              {/* Vermilion Primary Accent Color Picker */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[11px] text-stone-400">
                  <span className="flex items-center gap-1.5"><Palette size={12} /> Primary Accent</span>
                  <span className="font-bold text-red-400">{primaryColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-white/20 p-0.5 bg-black"
                  />
                  <div className="flex gap-1.5 flex-grow">
                    {['#e0231c', '#f59e0b', '#10b981', '#3b82f6'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setPrimaryColor(c)}
                        className={`h-7 flex-grow rounded-md border transition-all ${
                          primaryColor === c ? 'ring-2 ring-white scale-105' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Heading Size Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[11px] text-stone-400">
                  <span>Heading Size</span>
                  <span className="font-bold text-red-400">{headingSize}px</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="60"
                  step="1"
                  value={headingSize}
                  onChange={(e) => setHeadingSize(parseInt(e.target.value))}
                  className="w-full accent-[#e0231c] cursor-pointer"
                />
              </div>

              {/* Body Size Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[11px] text-stone-400">
                  <span>Body Size</span>
                  <span className="font-bold text-red-400">{bodySize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="24"
                  step="1"
                  value={bodySize}
                  onChange={(e) => setBodySize(parseInt(e.target.value))}
                  className="w-full accent-[#e0231c] cursor-pointer"
                />
              </div>

              {/* Letter Spacing */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[11px] text-stone-400">
                  <span>Letter Spacing</span>
                  <span className="font-bold text-red-400">{headingLetterSpacing.toFixed(3)}em</span>
                </div>
                <input
                  type="range"
                  min="-0.03"
                  max="0.03"
                  step="0.002"
                  value={headingLetterSpacing}
                  onChange={(e) => setHeadingLetterSpacing(parseFloat(e.target.value))}
                  className="w-full accent-[#e0231c] cursor-pointer"
                />
              </div>

              {/* Specs */}
              <div className="pt-4 border-t border-white/10 space-y-2 text-[10px] text-stone-400 font-sans">
                <div className="flex justify-between">
                  <span>Chapters</span>
                  <span className="text-white font-bold">5 Scroll-Driven Scenes</span>
                </div>
                <div className="flex justify-between">
                  <span>Runtime</span>
                  <span className="text-white font-bold">Three.js WebGL + DOM</span>
                </div>
                <div className="flex justify-between">
                  <span>Revision</span>
                  <span className="text-white font-bold">SHA-256 c8e06b90</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default KageShowcase;
