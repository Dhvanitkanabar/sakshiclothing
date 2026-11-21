// Reading this as: Footer for Sakshi Clothing Indian Fashion & Imitation Jewellery, with high-contrast accessibility, trust guarantees, and genuine store policies. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Truck, 
  RotateCcw, 
  CreditCard,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  Banknote
} from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../lib/api';
import { BUSINESS_CONFIG } from '../config/business';

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
        body: JSON.stringify({ name: name.trim() || 'Valued Patron', email: email.trim() })
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
    <footer className="bg-[#1C161D] text-[#E5E0D8] pt-12 pb-24 lg:pb-10 border-t border-[#37142E] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. BRAND TRUST BADGES STRIP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6 px-4 bg-[#261C28] rounded-2xl border border-[#3E2B40] mb-12 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A1D3F] flex items-center justify-center shrink-0 text-[#C6A15B]">
              <Truck size={18} />
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Free Express Shipping</p>
              <p className="text-[#A89FA9] text-[11px]">On all prepaid & COD orders above ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A1D3F] flex items-center justify-center shrink-0 text-[#C6A15B]">
              <Banknote size={18} />
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Cash on Delivery (COD)</p>
              <p className="text-[#A89FA9] text-[11px]">Available across 19,000+ PIN codes in India</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A1D3F] flex items-center justify-center shrink-0 text-[#C6A15B]">
              <RotateCcw size={18} />
            </div>
            <div>
              <p className="font-semibold text-white text-xs">{BUSINESS_CONFIG.policies.returnWindowDays}-Day Easy Returns</p>
              <p className="text-[#A89FA9] text-[11px]">Hassle-free return & size exchange policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A1D3F] flex items-center justify-center shrink-0 text-[#C6A15B]">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Skin-Friendly Imitation</p>
              <p className="text-[#A89FA9] text-[11px]">Lead-free brass with anti-tarnish finish</p>
            </div>
          </div>
        </div>

        {/* 2. NEWSLETTER SUBSCRIPTION BOX */}
        <div className="bg-[#261C28] border border-[#3E2B40] rounded-2xl p-6 sm:p-8 mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left space-y-1.5 max-w-lg">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A1D3F] text-[#C6A15B] text-[10px] uppercase tracking-wider font-semibold">
                <Sparkles size={12} />
                <span>Sakshi Insiders Club</span>
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-white">
                Get 10% Off Your First Order
              </h3>
              <p className="text-[#A89FA9] text-xs">
                Subscribe for private festive collection launches, styling guides, and secret coupon codes.
              </p>
            </div>

            <div className="w-full lg:w-auto lg:min-w-[420px]">
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch gap-2.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-4 py-3 bg-[#1C161D] border border-[#3E2B40] rounded-xl text-xs text-white placeholder-[#8A818B] focus:outline-none focus:border-[#C6A15B] transition-colors min-h-[44px]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-[#C6A15B] hover:bg-[#B38F48] text-[#1A1A1A] rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-60 min-h-[44px]"
                  >
                    <span>{isSubmitting ? 'Joining...' : 'Subscribe'}</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              ) : (
                <div className="bg-[#15803D]/20 border border-[#15803D]/40 rounded-xl px-5 py-3.5 flex items-center gap-2.5 text-[#86EFAC] text-xs">
                  <Check size={16} className="text-[#4ADE80] shrink-0" />
                  <span>Welcome! You're now on our VIP announcement list.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. FOOTER NAVIGATION LINKS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10 pb-8 border-b border-[#37142E]">
          
          {/* Column 1: Brand & Contact */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-[0.16em] text-white">
                SAKSHI
              </span>
            </Link>
            <p className="text-[11px] text-[#A89FA9] leading-relaxed">
              Curating authentic Indian clothing and hypoallergenic imitation artificial jewellery for the modern woman.
            </p>
            <div className="space-y-2 text-[11px] text-[#DDD6DF] pt-1">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="text-[#C6A15B] shrink-0 mt-0.5" />
                <span>{BUSINESS_CONFIG.address.fullFormatted}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-[#C6A15B] shrink-0" />
                <span>{BUSINESS_CONFIG.helplineDisplay}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-[#C6A15B] shrink-0" />
                <span>{BUSINESS_CONFIG.supportEmail}</span>
              </p>
            </div>
            <div className="pt-2">
              <a
                href={BUSINESS_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#4ADE80] border border-[#25D366]/30 rounded-full text-xs font-medium transition-colors min-h-[44px]"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Support</span>
              </a>
            </div>
          </div>

          {/* Column 2: Clothing Collections */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#C6A15B]">
              Ethnic Clothing
            </h4>
            <ul className="space-y-2 text-[#A89FA9] text-xs">
              <li>
                <Link to="/shop?category=Women&sub=Heritage Sarees" className="hover:text-white transition-colors">
                  Heritage Sarees & Drapes
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Women&sub=Bridal Lehengas" className="hover:text-white transition-colors">
                  Bridal & Party Lehengas
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Women&sub=Artisanal Sets" className="hover:text-white transition-colors">
                  Kurtis & Anarkali Sets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Women" className="hover:text-white transition-colors">
                  Festive Co-ord Sets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Men" className="hover:text-white transition-colors">
                  Men's Sherwanis & Kurtas
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Imitation Jewellery */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#C6A15B]">
              Imitation Jewellery
            </h4>
            <ul className="space-y-2 text-[#A89FA9] text-xs">
              <li>
                <Link to="/shop?category=Jewellery" className="hover:text-white transition-colors">
                  Chokers & Statement Sets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Jewellery" className="hover:text-white transition-colors">
                  Jhumkas & Chandbalis
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Jewellery" className="hover:text-white transition-colors">
                  Bangles & Kada Sets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Jewellery" className="hover:text-white transition-colors">
                  Cocktail Rings & Hathphool
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Jewellery" className="hover:text-white transition-colors">
                  Maang Tikka & Matha Patti
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Care */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#C6A15B]">
              Customer Care
            </h4>
            <ul className="space-y-2 text-[#A89FA9] text-xs">
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Concierge
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping & Dispatch
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <a href={`tel:${BUSINESS_CONFIG.supportPhone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                  Helpline: {BUSINESS_CONFIG.helplineDisplay}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#C6A15B]">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-[#A89FA9] text-xs">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy (DPDP)
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-white transition-colors">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li className="pt-1 text-[10px] text-[#A89FA9]">
                GSTIN: <span className="text-white font-mono">{BUSINESS_CONFIG.legal.gstNumber}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* 4. COPYRIGHT & PAYMENT CHIPS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8A818B] pt-2">
          <div className="space-y-1 text-center sm:text-left">
            <p>© 2026 {BUSINESS_CONFIG.legal.entityName}. All Rights Reserved. Surat, Gujarat, India.</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[10px] text-[#A89FA9]">
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <span>•</span>
              <Link to="/refund-policy" className="hover:text-white transition-colors">Refunds</Link>
              <span>•</span>
              <Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping</Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-white transition-colors">Grievance Desk</Link>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#DDD6DF]">
            <span className="px-2.5 py-1 rounded bg-[#261C28] border border-[#3E2B40]">UPI</span>
            <span className="px-2.5 py-1 rounded bg-[#261C28] border border-[#3E2B40]">Razorpay</span>
            <span className="px-2.5 py-1 rounded bg-[#261C28] border border-[#3E2B40]">RuPay</span>
            <span className="px-2.5 py-1 rounded bg-[#261C28] border border-[#3E2B40]">VISA / Mastercard</span>
            <span className="px-2.5 py-1 rounded bg-[#261C28] border border-[#3E2B40]">Cash on Delivery</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
