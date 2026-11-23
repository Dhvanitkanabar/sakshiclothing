// Reading this as: Statutory Shipping & Delivery Policy for Sakshi Clothing, detailing Surat fulfillment timelines, COD coverage across India, courier partners, and transit insurance guarantees. Dials: VARIANCE [5] / MOTION [3] / DENSITY [5].

import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Clock, Banknote, ShieldCheck, ChevronRight, AlertCircle, Package } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';
import SEOHead from '../components/SEOHead';

export const ShippingPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#1A1A1A] py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="Shipping & Delivery Policy | Sakshi Clothing"
        description="Express 2-5 business day delivery across India from our Surat atelier with free shipping above ₹999."
      />
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8E5DF] text-[11px] text-[#6B7280]">
          <Link to="/" className="hover:text-[#7B1E2B] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#1A1A1A] font-semibold">Shipping Policy</span>
        </nav>

        {/* Page Header */}
        <header className="space-y-3 border-b border-[#E8E5DF] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF4F5] text-[#7B1E2B] text-xs font-semibold uppercase tracking-wider">
            <Truck size={14} />
            <span>Fulfillment & Logistics</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1A1A1A]">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Effective Date: November 21, 2026 · Express Shipping from Surat, Gujarat to 19,000+ PIN Codes
          </p>
        </header>

        {/* Dispatch & Delivery SLA Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E5DF] space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-full bg-[#FDF4F5] text-[#7B1E2B] flex items-center justify-center">
              <Clock size={18} />
            </div>
            <h3 className="font-semibold text-sm text-[#1A1A1A]">24-48h Dispatch</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Every parcel is individually hand-inspected and dispatched from our Surat atelier within 1-2 business days.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E8E5DF] space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-full bg-[#F4EEDF] text-[#C6A15B] flex items-center justify-center">
              <Truck size={18} />
            </div>
            <h3 className="font-semibold text-sm text-[#1A1A1A]">2-5 Days Delivery</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Express air shipping to metro cities (Mumbai, Delhi, Bengaluru, etc.) and ground delivery for regional centers.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E8E5DF] space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <Banknote size={18} />
            </div>
            <h3 className="font-semibold text-sm text-[#1A1A1A]">Free Above ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Free delivery on all domestic orders over ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}. Flat ₹{BUSINESS_CONFIG.policies.standardShippingFee} below.
            </p>
          </div>
        </div>

        {/* Section 1: Shipping Charges & Thresholds */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
            1. Domestic Shipping Rates & Thresholds
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5DF] bg-[#FAF8F5]">
                  <th className="py-3 px-4 font-semibold text-[#1A1A1A]">Order Value</th>
                  <th className="py-3 px-4 font-semibold text-[#1A1A1A]">Shipping Charge</th>
                  <th className="py-3 px-4 font-semibold text-[#1A1A1A]">Estimated Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DF]">
                <tr>
                  <td className="py-3 px-4 font-medium text-[#1A1A1A]">₹{BUSINESS_CONFIG.policies.freeShippingThreshold} & Above</td>
                  <td className="py-3 px-4 font-bold text-[#059669]">FREE</td>
                  <td className="py-3 px-4 text-[#6B7280]">2-4 Business Days</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-[#1A1A1A]">Under ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}</td>
                  <td className="py-3 px-4 text-[#1A1A1A]">₹{BUSINESS_CONFIG.policies.standardShippingFee} Flat Rate</td>
                  <td className="py-3 px-4 text-[#6B7280]">2-5 Business Days</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#6B7280]">
            All shipping fees charged are inclusive of statutory GST (18%).
          </p>
        </section>

        {/* Section 2: Cash on Delivery Guidelines */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A] flex items-center gap-2">
            <Banknote size={20} className="text-[#7B1E2B]" />
            <span>2. Cash on Delivery (COD) Terms</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            <p>
              We provide Cash on Delivery (COD) service across 19,000+ PIN codes in India. When placing a COD order:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
              <li>Our team or automated verification bot may verify your contact number via OTP prior to dispatch.</li>
              <li>Please keep exact cash or dynamic UPI QR ready at the time of doorstep delivery.</li>
              <li>Repeated unaccepted COD deliveries may result in account COD privilege suspension.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Courier Partners & Tracking */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A] flex items-center gap-2">
            <Package size={20} className="text-[#C6A15B]" />
            <span>3. Courier Partners & Live Shipment Tracking</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            All consignments are handed over to tier-one national logistics providers including <strong>Bluedart, Delhivery, DTDC, Xpressbees, and India Post Speed Post</strong>.
          </p>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            Immediately upon courier scanning, an SMS and email containing the Air Waybill (AWB) number and direct tracking link are dispatched to you. You can also monitor your live package status directly via our <Link to="/track-order" className="text-[#7B1E2B] font-semibold underline">Track Order Portal</Link>.
          </p>
        </section>

        {/* Section 4: Tamper-Evident Packaging */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A] flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#059669]" />
            <span>4. Tamper-Evident Packaging & Delivery Inspection</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            Every Sakshi Clothing shipment is sealed with reinforced security tamper tape. If you notice that the external parcel packaging is physically torn, re-taped, or crushed at the time of delivery:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#6B7280]">
            <li>Kindly refuse delivery and ask the delivery executive to record "Package Damaged/Tampered".</li>
            <li>Alternatively, record an unboxing video before signing the delivery slip.</li>
            <li>Notify us within 24 hours at <strong>{BUSINESS_CONFIG.supportEmail}</strong>.</li>
          </ul>
        </section>

        {/* Section 5: Origin & Grievance Contact */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#3E2B40]/20 space-y-4 shadow-sm bg-gradient-to-br from-white to-[#FAF8F5]">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#7B1E2B]">
            5. Atelier Origin & Logistics Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            All shipments originate from our central textile & jewellery atelier in Surat, Gujarat:
          </p>
          <div className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2 text-xs text-[#1A1A1A]">
            <p><strong>Atelier & Dispatch Center:</strong> {BUSINESS_CONFIG.address.fullFormatted}</p>
            <p><strong>Logistics Helpline:</strong> {BUSINESS_CONFIG.supportPhone}</p>
            <p><strong>Support Email:</strong> <a href={`mailto:${BUSINESS_CONFIG.supportEmail}`} className="text-[#7B1E2B] underline">{BUSINESS_CONFIG.supportEmail}</a></p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ShippingPolicy;
