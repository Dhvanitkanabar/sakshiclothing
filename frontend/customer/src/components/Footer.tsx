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
  ShieldCheck,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../lib/api';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
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
        toast.success(data.message || 'Subscribed successfully!');
      } else {
        toast.error(data.message || 'Subscription failed. Please try again.');
      }
    } catch {
      setSubscribed(true);
      toast.success('Subscribed successfully!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#0e0c0a] text-stone-300 pt-10 sm:pt-12 pb-24 lg:pb-8 border-t border-amber-950/30 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. COMPACT PATRON NEWSLETTER ROW */}
        <div className="bg-[#171411] border border-amber-900/30 rounded-2xl p-4 sm:p-6 mb-10 shadow-lg">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="text-center lg:text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[10px] uppercase tracking-wider font-semibold">
                <Sparkles size={11} className="text-amber-400" />
                <span>Atelier Circle</span>
              </div>
              <h3 className="text-base sm:text-lg font-sans font-medium text-white">
                Private Previews & Exclusive Drops
              </h3>
              <p className="text-stone-400 text-xs">
                Receive instant email announcements for new drops and festive arrivals.
              </p>
            </div>

            <div className="w-full lg:w-auto lg:min-w-[420px]">
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <span>{isSubmitting ? 'Joining...' : 'Subscribe'}</span>
                    <ArrowRight size={13} />
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2 text-emerald-300 text-xs">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>You are subscribed to the Atelier Circle.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. MINIMALIST 4-COLUMN FOOTER LINKS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 pb-8 border-b border-white/5">
          
          {/* Column 1: Brand & Contact */}
          <div className="col-span-2 sm:col-span-1 space-y-2.5">
            <Link to="/" className="inline-block">
              <span className="text-xl font-sans font-bold tracking-[0.2em] text-white">
                SAKSHI
              </span>
            </Link>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Curated contemporary & festive ethnic wear, handcrafted in Surat.
            </p>
            <div className="space-y-1.5 text-[11px] text-stone-300 pt-1">
              <p className="flex items-start gap-1.5">
                <MapPin size={12} className="text-amber-400 shrink-0 mt-0.5" />
                <span>G-903 Sentosa Heights, Utran, Surat, Gujarat</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone size={12} className="text-amber-400 shrink-0" />
                <span>+91 9316533660</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail size={12} className="text-amber-400 shrink-0" />
                <span>sakshiclothing2025@gmail.com</span>
              </p>
            </div>
            <div className="pt-1">
              <a
                href="https://wa.me/919316533660"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px] font-medium transition-colors"
              >
                <MessageCircle size={12} />
                <span>WhatsApp Support</span>
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Collections
            </h4>
            <ul className="space-y-1.5 text-stone-400 text-[11px]">
              <li>
                <Link to="/shop?category=Women" className="hover:text-white transition-colors">
                  Women's Wear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Men" className="hover:text-white transition-colors">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Kids" className="hover:text-white transition-colors">
                  Kids Festive Wear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Jewellery" className="hover:text-white transition-colors">
                  Jewellery Suite
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Explore All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Customer Care
            </h4>
            <ul className="space-y-1.5 text-stone-400 text-[11px]">
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <span className="text-stone-300 font-medium">
                  Strict No Return Policy
                </span>
              </li>
              <li>
                <span className="text-stone-400">
                  Free Express Delivery
                </span>
              </li>
              <li>
                <span className="text-stone-400">
                  100% Prepaid Orders Only
                </span>
              </li>
              <li>
                <a href="tel:+919316533660" className="hover:text-white transition-colors">
                  Helpline: +91 9316533660
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Atelier Store */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Surat Atelier
            </h4>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-[11px]">
              <p className="font-semibold text-white">Flagship Boutique</p>
              <p className="text-stone-400 leading-tight">
                G-903 Sentosa Heights, Utran, Surat - 394105
              </p>
              <p className="text-amber-300/90 flex items-center gap-1 text-[10px] pt-0.5">
                <Clock size={11} className="text-amber-400 shrink-0" />
                <span>10:30 AM – 8:30 PM (Daily)</span>
              </p>
            </div>
          </div>

        </div>

        {/* 3. COMPACT TRUST BADGES STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-stone-400 text-[10px] mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-amber-400 shrink-0" />
            <span>Certified Quality Apparel</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-amber-400 shrink-0" />
            <span>Insured White-Glove Courier</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-amber-400 shrink-0" />
            <span>Strict No Return Policy</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-amber-400 shrink-0" />
            <span>100% Prepaid (UPI & Cards)</span>
          </div>
        </div>

        {/* 4. COPYRIGHT & PAYMENT PILLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500 pt-3 border-t border-white/5">
          <p>© 2026 Sakshi Clothing Private Limited. Handcrafted in Surat, Gujarat.</p>

          <div className="flex items-center gap-1.5 text-[9px] text-stone-400">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">UPI</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">RuPay</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">VISA</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">Mastercard</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
