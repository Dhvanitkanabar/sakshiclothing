// Reading this as: Statutory Refund, Return & Cancellation Policy for Sakshi Clothing, clearly separating ethnic apparel from imitation jewellery hygiene protocols, Razorpay payment reversal SLAs, and Indian Consumer Protection compliance. Dials: VARIANCE [5] / MOTION [3] / DENSITY [5].

import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, AlertCircle, Clock, Banknote, RefreshCw } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';

export const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#1A1A1A] py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8E5DF] text-[11px] text-[#6B7280]">
          <Link to="/" className="hover:text-[#4A1D3F] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#1A1A1A] font-semibold">Refund & Return Policy</span>
        </nav>

        {/* Page Header */}
        <header className="space-y-3 border-b border-[#E8E5DF] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6EFF4] text-[#4A1D3F] text-xs font-semibold uppercase tracking-wider">
            <RotateCcw size={14} />
            <span>Customer Protection & Returns</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1A1A1A]">
            Refund, Return & Cancellation Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Effective Date: November 21, 2026 · Standard {BUSINESS_CONFIG.policies.returnWindowDays}-Day Return Protocol
          </p>
        </header>

        {/* Legal Advisory Note */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle size={16} className="text-amber-700 shrink-0" />
            <span>Category-Specific Return Protocols</span>
          </div>
          <p className="leading-relaxed">
            Due to strict personal hygiene considerations and the delicate artisan assembly of artificial jewellery, return conditions differ between our <strong>Ethnic Clothing Collections</strong> and our <strong>Imitation Jewellery Collection</strong>. Please review the detailed guidelines below.
          </p>
          <p className="text-[#6B7280]">
            <span className="font-semibold text-amber-800">[TODO: LAWYER_REVIEW]:</span> Confirm customer mandatory unboxing video requirement compliance with State Consumer Dispute Redressal Commission rulings.
          </p>
        </div>

        {/* Section 1: Clothing Returns & Exchanges */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F6EFF4] text-[#4A1D3F] flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
              1. Ethnic Clothing Return & Exchange Policy
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            We provide a hassle-free <strong>{BUSINESS_CONFIG.policies.returnWindowDays}-day return or exchange window</strong> from the verified date of delivery for sarees, lehengas, kurtis, and unstitched fabrics.
          </p>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2 text-xs">
            <p className="font-semibold text-[#1A1A1A]">Eligibility Criteria for Clothing:</p>
            <ul className="list-disc list-inside space-y-1.5 text-[#6B7280] pl-1">
              <li>Garments must be entirely unworn, unwashed, unaltered, and free of perfumes or body odor.</li>
              <li>All original barcode tags, security ribbons, and packaging must remain intact.</li>
              <li>Custom-tailored blouses or bespoke hem alterations are non-returnable.</li>
              <li>Customers may opt for an immediate size exchange or a full refund back to the payment source.</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Imitation Jewellery Return Policy */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#C6A15B]/30 space-y-4 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#C6A15B]" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F4EEDF] text-[#C6A15B] flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
              2. Imitation & Artificial Jewellery Return Policy
            </h2>
          </div>
          <div className="p-4 rounded-xl bg-[#F4EEDF]/50 border border-[#C6A15B]/40 space-y-2 text-xs text-[#6B5528] leading-relaxed">
            <p className="font-bold uppercase tracking-wider text-[#A4813D]">
              Hygiene & Transit Safety Guidelines
            </p>
            <p>
              Due to sanitary regulations governing wearable ornaments (earrings, noserings, necklaces) and anti-tarnish plating sensitivity, returns for imitation jewellery are accepted <strong>exclusively in cases of transit breakage, manufacturing defects, or wrong item delivery</strong>.
            </p>
            <p className="font-medium text-[#1A1A1A]">
              Mandatory Unboxing Video Protocol:
            </p>
            <p>
              To claim a replacement or refund for damaged jewellery, an uncut 360-degree video recording of the outer package unboxing must be submitted within <strong>48 hours of delivery</strong> to <strong>{BUSINESS_CONFIG.supportEmail}</strong> or via WhatsApp at <strong>{BUSINESS_CONFIG.helplineDisplay}</strong>.
            </p>
          </div>
        </section>

        {/* Section 3: Order Cancellation */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A] flex items-center gap-2">
            <Clock size={20} className="text-[#4A1D3F]" />
            <span>3. Order Cancellation Policy</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            <p>
              <strong>Prior to Dispatch:</strong> You may cancel your order free of charge any time prior to shipment handover. Upon cancellation, 100% of the transaction amount will be credited back immediately.
            </p>
            <p>
              <strong>Post-Dispatch:</strong> Once an Air Waybill (AWB) has been generated and the courier partner has dispatched the shipment from our Surat atelier, the package cannot be cancelled in transit. You may refuse delivery at the doorstep or initiate a return upon receipt following standard return conditions.
            </p>
          </div>
        </section>

        {/* Section 4: Refund Timelines & Disbursement */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A] flex items-center gap-2">
            <Banknote size={20} className="text-[#C6A15B]" />
            <span>4. Refund Timelines & Disbursement Channels</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            <p>
              Once your returned package is received at our Surat fulfillment facility and passes quality inspection (usually within 24-48 business hours):
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>Prepaid Orders (UPI, Cards, Netbanking):</strong> Refunds are initiated automatically via Razorpay to the original payment source within <strong>5 to 7 business days</strong>.</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> Our customer support team will contact you to verify your preferred bank account IFSC or UPI ID for direct NEFT/UPI settlement within <strong>5 to 7 business days</strong>.</li>
            </ul>
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl text-xs text-[#6B7280]">
              <span className="font-semibold text-amber-800">[TODO: CA_REVIEW]:</span> Verify GST credit note generation protocols on returns exceeding 30 days within the current tax quarter.
            </div>
          </div>
        </section>

        {/* Section 5: Grievance & Escalation */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#3E2B40]/20 space-y-4 shadow-sm bg-gradient-to-br from-white to-[#FAF8F5]">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#4A1D3F]">
            5. Return Assistance & Grievance Redressal
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            If you experience any delay in reverse pickup or refund disbursement, our dedicated Grievance Officer is at your service:
          </p>
          <div className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2 text-xs text-[#1A1A1A]">
            <p><strong>Designation:</strong> {BUSINESS_CONFIG.grievanceOfficer.designation}</p>
            <p><strong>Email:</strong> <a href={`mailto:${BUSINESS_CONFIG.grievanceOfficer.email}`} className="text-[#4A1D3F] underline">{BUSINESS_CONFIG.grievanceOfficer.email}</a></p>
            <p><strong>Direct Helpline:</strong> {BUSINESS_CONFIG.grievanceOfficer.phone}</p>
            <p><strong>SLA:</strong> {BUSINESS_CONFIG.grievanceOfficer.responseSla}</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default RefundPolicy;
