import React, { useState } from 'react';
import { MengToSketchbookLandingPage } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';
import { BookOpen, Sparkles, Sliders, RefreshCw, ZoomIn, Compass, ArrowUpRight, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SketchbookShowcase: React.FC = () => {
  const [headingFont, setHeadingFont] = useState<any>('instrument-serif');
  const [bodyFont, setBodyFont] = useState<any>('newsreader');
  const [headingWeight, setHeadingWeight] = useState('400');
  const [bodyWeight, setBodyWeight] = useState('400');
  const [primaryColor, setPrimaryColor] = useState('#2b2721');
  const [headingSize, setHeadingSize] = useState(30);
  const [bodySize, setBodySize] = useState(20);
  const [headingLetterSpacing, setHeadingLetterSpacing] = useState(0.010);
  const [showControls, setShowControls] = useState(true);

  const resetControls = () => {
    setHeadingFont('instrument-serif');
    setBodyFont('newsreader');
    setHeadingWeight('400');
    setBodyWeight('400');
    setPrimaryColor('#2b2721');
    setHeadingSize(30);
    setBodySize(20);
    setHeadingLetterSpacing(0.010);
  };

  return (
    <section className="relative py-20 lg:py-32 px-4 md:px-8 bg-[#ece7dc] text-[#2b2721] overflow-hidden border-b border-stone-300">
      {/* Editorial paper wash background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(154, 106, 62, 0.08), transparent 70%)`
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-stone-300/80 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/5 border border-stone-900/15 text-[#9a6a3e] text-[11px] font-sans tracking-widest uppercase mb-4">
              <BookOpen size={12} className="text-[#9a6a3e]" />
              <span>ThreeUI Runtime · Tactile Interactive Sketchbook</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-normal tracking-tight text-[#2b2721]">
              Meng To — <span className="italic font-normal">Singapore Sketchbook</span>
            </h2>
            <p className="text-stone-700 text-sm md:text-base max-w-2xl mt-3 font-sans leading-relaxed">
              A tactile portfolio with nine illustrated architectural plates, real curved page turns, a draggable magnifying glass, zoom controls, and a botanical paper atmosphere.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowControls(!showControls)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-900/5 hover:bg-stone-900/10 border border-stone-900/20 text-xs font-sans uppercase tracking-wider text-[#2b2721] transition-colors"
            >
              <Sliders size={14} />
              <span>{showControls ? 'Hide Typography' : 'Live Tuning'}</span>
            </button>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2b2721] hover:bg-stone-800 text-[#ece7dc] text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-md"
            >
              <span>Explore Atelier Archive</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Interactive Frame & Tuning Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Sketchbook Frame */}
          <div className={`${showControls ? 'lg:col-span-9' : 'lg:col-span-12'} transition-all duration-500`}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-400/50 bg-[#ece7dc] min-h-[640px] md:min-h-[780px] h-[780px]">
              <div className="shader-frame w-full h-full !min-h-[780px]">
                <MengToSketchbookLandingPage
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
              <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none flex items-center justify-between text-[11px] font-sans text-stone-600 bg-white/70 backdrop-blur-md px-4 py-2 rounded-xl border border-stone-300 shadow-sm">
                <span className="flex items-center gap-2">
                  <ZoomIn size={13} className="text-[#9a6a3e]" />
                  <span>Click page corners to turn · Drag magnifying glass to inspect ink strokes</span>
                </span>
                <span className="hidden sm:inline">Plates 01–09 · Nine Illustrated Spreads</span>
              </div>
            </div>
          </div>

          {/* Typography & Color Controller */}
          {showControls && (
            <div className="lg:col-span-3 space-y-6 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-stone-300 shadow-lg text-xs text-[#2b2721]">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <h3 className="font-sans uppercase tracking-wider text-[#9a6a3e] flex items-center gap-2 font-bold">
                  <Sliders size={14} /> Typography Studio
                </h3>
                <button
                  onClick={resetControls}
                  className="text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1 font-sans text-[10px]"
                  title="Reset to defaults"
                >
                  <RefreshCw size={11} /> Reset
                </button>
              </div>

              {/* Heading Font */}
              <div>
                <label className="text-[11px] font-sans text-stone-600 uppercase tracking-wider block mb-2">Display Font</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setHeadingFont('instrument-serif')}
                    className={`py-2 px-3 rounded-xl font-sans uppercase tracking-wider text-[10px] border transition-all ${
                      headingFont === 'instrument-serif'
                        ? 'bg-[#2b2721] text-[#ece7dc] border-[#2b2721] font-bold shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    Instrument
                  </button>
                  <button
                    onClick={() => setHeadingFont('newsreader')}
                    className={`py-2 px-3 rounded-xl font-sans uppercase tracking-wider text-[10px] border transition-all ${
                      headingFont === 'newsreader'
                        ? 'bg-[#2b2721] text-[#ece7dc] border-[#2b2721] font-bold shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    Newsreader
                  </button>
                </div>
              </div>

              {/* Primary Color Picker */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[11px] text-stone-600">
                  <span className="flex items-center gap-1.5"><Palette size={12} /> Primary Ink</span>
                  <span className="font-bold">{primaryColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white"
                  />
                  <div className="flex gap-1.5 flex-grow">
                    {['#2b2721', '#4a3b32', '#1a232f', '#2a3a2b'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setPrimaryColor(c)}
                        className={`h-7 flex-grow rounded-md border transition-all ${
                          primaryColor === c ? 'ring-2 ring-stone-900 scale-105' : 'border-stone-300'
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
                <div className="flex justify-between font-sans text-[11px] text-stone-600">
                  <span>Heading Size</span>
                  <span className="font-bold">{headingSize}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="44"
                  step="1"
                  value={headingSize}
                  onChange={(e) => setHeadingSize(parseInt(e.target.value))}
                  className="w-full accent-[#2b2721] cursor-pointer"
                />
              </div>

              {/* Body Size Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[11px] text-stone-600">
                  <span>Body Size</span>
                  <span className="font-bold">{bodySize}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="26"
                  step="1"
                  value={bodySize}
                  onChange={(e) => setBodySize(parseInt(e.target.value))}
                  className="w-full accent-[#2b2721] cursor-pointer"
                />
              </div>

              {/* Letter Spacing */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[11px] text-stone-600">
                  <span>Letter Spacing</span>
                  <span className="font-bold">{headingLetterSpacing.toFixed(3)}em</span>
                </div>
                <input
                  type="range"
                  min="-0.02"
                  max="0.05"
                  step="0.005"
                  value={headingLetterSpacing}
                  onChange={(e) => setHeadingLetterSpacing(parseFloat(e.target.value))}
                  className="w-full accent-[#2b2721] cursor-pointer"
                />
              </div>

              {/* Specs */}
              <div className="pt-4 border-t border-stone-200 space-y-2 text-[10px] text-stone-600 font-sans">
                <div className="flex justify-between">
                  <span>Pages</span>
                  <span className="text-stone-900 font-bold">9 Transparent Spreads</span>
                </div>
                <div className="flex justify-between">
                  <span>Runtime</span>
                  <span className="text-stone-900 font-bold">HTML + DOM + 3D Mesh</span>
                </div>
                <div className="flex justify-between">
                  <span>Revision</span>
                  <span className="text-stone-900 font-bold">SHA-256 e0330548</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SketchbookShowcase;
