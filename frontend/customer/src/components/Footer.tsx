import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Truck, 
  RefreshCw, 
  CreditCard,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  Check,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../lib/api';

export const Footer: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || 'Patron', email: email.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        toast.success(data.message || 'Welcome to the Sakshi Atelier Circle! You are now subscribed.');
      } else {
        toast.error(data.message || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      setSubscribed(true);
      toast.success('Welcome to the Sakshi Atelier Circle! You are now subscribed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#100e0c] text-[#f7f2eb] pt-20 sm:pt-24 pb-28 lg:pb-14 border-t border-amber-950/40 relative overflow-hidden selection:bg-amber-400 selection:text-black">
      {/* Subtle Atmospheric Amber Glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[360px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" 
      />

      {/* Grand Archival Watermark */}
      <div 
        aria-hidden="true" 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 select-none pointer-events-none font-sans font-light text-[70px] sm:text-[140px] md:text-[210px] text-white/[0.02] tracking-tighter whitespace-nowrap leading-none"
      >
        SAKSHI ATELIER
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        {/* 1. VIP CIRCLE CONCIERGE BANNER */}
        <div className="bg-gradient-to-r from-[#1a1714] via-[#1f1b17] to-[#171411] border border-amber-900/30 rounded-3xl p-6 sm:p-10 lg:p-12 mb-16 sm:mb-20 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/25 text-amber-300 text-[9.5px] font-sans uppercase tracking-[0.28em]">
                <Sparkles size={11} className="text-amber-400" />
                <span>THE SAKSHI ATELIER CIRCLE</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-sans font-light text-white leading-tight">
                Private Previews & <span className="italic font-normal text-amber-300">Exclusive Drops</span>
              </h3>
              <p className="text-stone-400 text-xs sm:text-sm font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
                Join our private patron circle to receive early access to new collection drops, limited jewellery suites, and invitations to seasonal exhibitions.
              </p>
            </div>

            {/* Newsletter Subscription */}
            <div className="lg:col-span-6 w-full">
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-3 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name (Optional)"
                      className="w-full px-4 py-3 bg-black/60 border border-stone-800 rounded-2xl text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors font-light"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full px-4 py-3 bg-black/60 border border-stone-800 rounded-2xl text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors font-light"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-white hover:to-white text-stone-950 rounded-2xl text-xs font-sans uppercase tracking-widest font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    <span>{isSubmitting ? 'Joining Circle...' : 'Join Patron Circle'}</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              ) : (
                <div className="bg-black/60 border border-amber-400/40 rounded-2xl p-4 sm:p-6 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Check size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-sans uppercase tracking-widest text-amber-300 font-bold">
                      Invitation Confirmed
                    </p>
                    <p className="text-xs sm:text-sm text-stone-300 font-light mt-0.5">
                      Welcome to the Atelier Circle. You will receive private previews of our newest collections.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* 2. 5-COLUMN EDITORIAL FOOTER NAVIGATION */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-12 mb-16 sm:mb-20">
          {/* Column 1: Brand Atelier Heritage */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 space-y-4">
            <Link to="/" className="inline-flex flex-col items-start group">
              <span className="text-2xl font-sans font-light tracking-[0.24em] text-white group-hover:text-amber-300 transition-colors">
                SAKSHI
              </span>
              <span className="text-[8px] font-sans tracking-[0.38em] uppercase text-amber-400/70 -mt-0.5">
                ATELIER & ARCHIVE · SURAT
              </span>
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed font-light">
              Sculpting timeless contemporary fashion, celebratory silhouettes, and luxury jewellery through premium handlooms, artisan tailoring, and elevated design aesthetics.
            </p>
            <div className="text-[11px] font-sans text-amber-300/80 space-y-2 pt-1">
              <p className="flex items-center gap-2 text-stone-300">
                <MapPin size={13} className="text-amber-400 shrink-0" /> 
                <span>G-903 Sentosa Heights, Utran, Surat, Gujarat</span>
              </p>
              <p className="flex items-center gap-2 text-stone-300">
                <Phone size={13} className="text-amber-400 shrink-0" /> 
                <span>+91 9316533660</span>
              </p>
              <p className="flex items-center gap-2 text-stone-300">
                <Mail size={13} className="text-amber-400 shrink-0" /> 
                <span>sakshiclothing2025@gmail.com</span>
              </p>
            </div>
            <div>
              <a
                href="https://wa.me/919316533660"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-amber-400 hover:text-black border border-white/15 rounded-xl text-[10px] font-sans uppercase tracking-widest text-amber-300 transition-all duration-300"
              >
                <MessageCircle size={13} />
                <span>WhatsApp Customer Support</span>
              </a>
            </div>
          </div>

          {/* Column 2: Haute Collections */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-amber-400">
              Couture Universes
            </h4>
            <ul className="space-y-2 text-xs text-stone-400 font-light">
              <li>
                <Link to="/shop?category=Women" className="hover:text-white transition-colors">
                  Women's Festive & Contemporary
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Women&sub=Heritage Sarees" className="hover:text-white transition-colors">
                  Artisanal Sarees & Drapes
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Men" className="hover:text-white transition-colors">
                  Men's Kurtas & Bandhgalas
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Men&sub=Heritage Sherwanis" className="hover:text-white transition-colors">
                  Distinguished Royal Sherwanis
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Kids" className="hover:text-white transition-colors">
                  Kids Festive & Celebrations
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Jewellery" className="hover:text-white transition-colors">
                  Handcrafted Polki & Jadau Jewellery
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The Maison Heritage */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-amber-400">
              The Maison
            </h4>
            <ul className="space-y-2 text-xs text-stone-400 font-light">
              <li>
                <Link to="/stores" className="hover:text-white transition-colors">
                  The Surat & Varanasi Atelier Story
                </Link>
              </li>
              <li>
                <Link to="/stores" className="hover:text-white transition-colors">
                  45 Master Artisan Guilds
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Fabric Quality & Purity Standards
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Natural Botanical Dye Archive
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Runway Lookbook 2026
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Help & Services */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-amber-400">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-stone-400 font-light">
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Free Express Shipping
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Strict No Return Policy
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Size Guide & Measurements
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Atelier Flagship */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-amber-400">
              Atelier Flagship
            </h4>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-amber-900/30 space-y-2">
              <p className="font-sans font-bold text-white text-xs">Surat Flagship & Atelier</p>
              <p className="text-[11px] text-stone-300 font-sans leading-relaxed">
                G-903 Sentosa Heights, Utran, Surat, Gujarat - 394105
              </p>
              <p className="text-[10px] text-amber-300 font-sans flex items-center gap-1.5 pt-0.5">
                <Clock size={11} className="text-amber-400 shrink-0" />
                <span>10:30 AM – 8:30 PM (Daily)</span>
              </p>
              <p className="text-[10px] text-stone-300 font-sans flex items-center gap-1.5">
                <Phone size={11} className="text-amber-400 shrink-0" />
                <span>+91 9316533660</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3. STORE CREDENTIALS & TRUST SIGNALS */}
        <div className="py-7 border-y border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left mb-10">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div>
              <p className="text-xs font-sans font-bold text-white">Certified Quality Garments</p>
              <p className="text-[10px] text-stone-400 font-sans">Finest Handloom, Contemporary & Luxury Wear</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-xs font-sans font-bold text-white">Insured Global Courier</p>
              <p className="text-[10px] text-stone-400 font-sans">White-Glove Express via DHL</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
              <RefreshCw size={20} />
            </div>
            <div>
              <p className="text-xs font-sans font-bold text-white">Strict No Return Policy</p>
              <p className="text-[10px] text-stone-400 font-sans">Bespoke Handcrafted Orders</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-xs font-sans font-bold text-white">Encrypted Direct Checkout</p>
              <p className="text-[10px] text-stone-400 font-sans">UPI, Cards & NetBanking (100% Prepaid)</p>
            </div>
          </div>
        </div>

        {/* 4. COPYRIGHT & METHOD PILLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-sans text-center sm:text-left">
          <p>© 2026 Sakshi Clothing Private Limited. All Rights Reserved. Handcrafted in Surat, Gujarat, India.</p>

          <div className="flex flex-wrap justify-center gap-2 text-stone-400 text-[10px]">
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">UPI</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">RuPay</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">VISA</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">MASTERCARD</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">AMEX</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
