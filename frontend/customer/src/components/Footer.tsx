import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Hash, MessageCircle, Video, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#FDFCFB] border-t border-black/5 pt-20 pb-12 mt-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Top Section: High-Impact Brand Statement */}
        <div className="text-center mb-20 space-y-8">
          <Link to="/" className="inline-flex flex-col items-center group">
            <span className="text-4xl md:text-5xl font-serif font-black tracking-[-0.04em] text-black">
              SAKSHI
            </span>
            <span className="text-[9px] font-sans font-black tracking-[0.6em] text-gray-400 group-hover:text-black transition-colors duration-700 -mr-[0.6em] -mt-1">
              CLOTHING
            </span>
          </Link>
          <p className="text-xl md:text-2xl font-serif italic text-black/40 max-w-xl mx-auto leading-relaxed">
            "Crafting a new standard of modern elegance through uncompromising vision."
          </p>
        </div>

        {/* Middle Section: Centered Newsletter (Architectural Box) */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="bg-white p-10 md:p-14 rounded-[32px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.05)] border border-black/5 text-center space-y-8">
            <div className="space-y-3">
              <h3 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-black">Maison Journal</h3>
              <p className="text-md text-gray-400 font-serif italic">Join our circle for seasonal curations.</p>
            </div>
            <form className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email Address"
                className="flex-grow bg-gray-50 px-6 py-4 rounded-xl text-sm font-sans focus:outline-none focus:ring-1 focus:ring-black/10 transition-all border border-transparent"
              />
              <button className="bg-black text-white px-8 py-4 rounded-xl text-[9px] font-sans font-black uppercase tracking-[0.2em] hover:bg-black/80 transition-all whitespace-nowrap shadow-xl">
                Subscribe
              </button>
            </form>
            <p className="text-[8px] font-sans font-bold text-gray-200 uppercase tracking-[0.2em]">
              Consent is implied by submission.
            </p>
          </div>
        </div>

        {/* Global Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20 pt-16 border-t border-black/5">
          <div className="space-y-8">
            <h4 className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-black">Collections</h4>
            <ul className="space-y-4">
              {['Women', 'Men', 'Kids', 'New In'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-[13px] font-sans font-medium text-gray-400 hover:text-black transition-colors flex items-center group">
                    {item}
                    <ArrowUpRight size={10} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-black">The Maison</h4>
            <ul className="space-y-4">
              {['Story', 'Archive', 'Ethics', 'Journal'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-[13px] font-sans font-medium text-gray-400 hover:text-black transition-colors flex items-center group">
                    {item}
                    <ArrowUpRight size={10} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-black">Assistance</h4>
            <ul className="space-y-4">
              {['Contact', 'Shipping', 'Returns', 'Guarantees'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-[13px] font-sans font-medium text-gray-400 hover:text-black transition-colors flex items-center group">
                    {item}
                    <ArrowUpRight size={10} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-black">Social</h4>
            <div className="flex gap-4">
              {[Camera, Hash, MessageCircle, Video].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-black/5 hover:border-black transition-all group">
                  <Icon size={16} className="text-gray-300 group-hover:text-black transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Clean & Minimal */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-black/5">
          <p className="text-[9px] font-sans font-black uppercase tracking-[0.2em] text-gray-300">
            © 2026 SAKSHI CLOTHING
          </p>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Archive'].map((item) => (
              <Link key={item} to="/" className="text-[9px] font-sans font-black uppercase tracking-[0.2em] text-gray-300 hover:text-black transition-colors">
                {item}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4 opacity-10 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
            <div className="w-7 h-4 border border-black/10 rounded-sm bg-white" />
            <div className="w-7 h-4 border border-black/10 rounded-sm bg-white" />
            <div className="w-7 h-4 border border-black/10 rounded-sm bg-white" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
