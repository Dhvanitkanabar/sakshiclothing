// Reading this as: Statutory No-Return & Transit Damage Policy for Sakshi Clothing with legal disclosure tags, unboxing proof guidelines, and cancellation refund workflows. Dials: VARIANCE [5] / MOTION [3] / DENSITY [5].

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Sparkles, CheckCircle2, ChevronRight, AlertCircle, Clock, Banknote, PackageX, FileText } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';
import SEOHead from '../components/SEOHead';

export const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#1A1A1A] py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="No-Return & Transit Damage Policy | Sakshi Clothing"
        description="Sakshi Clothing operates a strict No-Return Policy on all apparel and imitation jewellery. Damaged, defective, or incorrect items are covered within 48 hours of delivery with unboxing proof."
      />
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8E5DF] text-[11px] text-[#6B7280]">
          <Link to="/" className="hover:text-[#7B1E2B] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#1A1A1A] font-semibold">Return & Refund Policy</span>
        </nav>

        {/* Page Header */}
        <header className="space-y-3 border-b border-[#E8E5DF] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF4F5] text-[#7B1E2B] text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert size={14} />
            <span>Store Policy & Consumer Protection</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1A1A1A]">
            No-Return & Damage Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Effective Date: November 23, 2026 · Strict No Return / No Exchange Policy with 48-Hour Transit Damage Coverage
          </p>
        </header>

        {/* Executive Summary Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FDF4F5] border border-[#7B1E2B]/20 text-[#1A1A1A] space-y-3 shadow-xs">
          <div className="flex items-center gap-2 font-serif text-lg text-[#7B1E2B]">
            <PackageX size={20} className="shrink-0" />
            <span>Core Policy Summary: All Sales Are Final</span>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            Sakshi Clothing operates on a strict <strong>No Return / No Exchange Policy</strong> across all clothing lines and artificial/imitation jewellery. 
            Because our garments are sourced directly from Surat textile markets and artificial jewellery is subject to personal hygiene standards, we do not accept returns or exchanges for <strong>change of mind, size, fit, color, or style preference</strong>.
          </p>
          <div className="p-3 bg-white/80 rounded-xl border border-[#7B1E2B]/10 text-xs text-[#7B1E2B] font-medium">
            <strong>Exception:</strong> Items that arrive damaged in transit, with manufacturing defects, or wrong items sent will be replaced or refunded if reported within <strong>48 hours of delivery</strong> accompanied by an unboxing video.
          </div>
        </div>

        {/* Legal Advisory Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle size={16} className="text-amber-700 shrink-0" />
            <span>Legal Review Assumptions & Statutory Notice</span>
          </div>
          <p className="leading-relaxed">
            This policy is drafted in accordance with the Consumer Protection (E-Commerce) Rules, 2020 and Indian Contract Act, 1872.
          </p>
          <div className="space-y-1 text-[#6B7280]">
            <p><span className="font-semibold text-amber-800">[LAWYER_REVIEW]:</span> Confirm whether non-returnable disclosures are sufficiently prominent on checkout consent under Consumer Protection Rules 2020, Rule 6(5).</p>
            <p><span className="font-semibold text-amber-800">[LAWYER_REVIEW]:</span> Review the 48-hour transit damage claim reporting window against state consumer forum precedent on latent defects.</p>
            <p><span className="font-semibold text-amber-800">[LAWYER_REVIEW]:</span> Verify requirement for raw 360-degree unboxing video proof as condition precedent for transit breakage compensation.</p>
          </div>
        </div>

        {/* Section 1: Non-Returnable Scope */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FDF4F5] text-[#7B1E2B] flex items-center justify-center shrink-0">
              <PackageX size={16} />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
              1. Non-Returnable Conditions (Clothing & Jewellery)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            Please review size charts, product measurements, and photographs carefully before ordering. We do NOT accept returns or exchanges for any of the following:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#4B5563]">
            <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl space-y-1">
              <span className="font-semibold text-[#1A1A1A]">Size & Fit Issues</span>
              <p className="text-[#6B7280]">Garment too tight, loose, long, or short. Standard sizing tolerance of ±0.5 inches applies.</p>
            </div>
            <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl space-y-1">
              <span className="font-semibold text-[#1A1A1A]">Color & Shade Variations</span>
              <p className="text-[#6B7280]">Minor color variations due to digital monitor calibration or studio lighting.</p>
            </div>
            <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl space-y-1">
              <span className="font-semibold text-[#1A1A1A]">Personal Preference & Change of Mind</span>
              <p className="text-[#6B7280]">Not liking fabric hand-feel, embroidery style, or event cancellation.</p>
            </div>
            <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl space-y-1">
              <span className="font-semibold text-[#1A1A1A]">Hygiene (Imitation Jewellery)</span>
              <p className="text-[#6B7280]">Worn earrings, noserings, necklaces, or bangles cannot be returned under any condition.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Transit Damage & Defective Exception */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#C6A15B]/40 space-y-4 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#C6A15B]" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F4EEDF] text-[#C6A15B] flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
              2. Transit Damage & Manufacturing Defect Guarantee
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            If your parcel arrives physically damaged, tampered, broken, or contains the wrong product:
          </p>
          <div className="p-4 rounded-xl bg-[#F4EEDF]/40 border border-[#C6A15B]/30 space-y-2 text-xs text-[#6B5528] leading-relaxed">
            <p className="font-bold uppercase tracking-wider text-[#A4813D]">
              Mandatory 48-Hour Unboxing Proof Protocol:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li>Record a clear, uncut, 360-degree video of the sealed outer parcel from the courier label through opening and inspecting the product.</li>
              <li>Report the problem within <strong>48 hours of delivery</strong> via your Customer Dashboard ("Report a Problem") or email <strong>{BUSINESS_CONFIG.supportEmail}</strong>.</li>
              <li>Attach photographs of the defect and the link or video file of the unboxing footage.</li>
              <li>Upon verification, we will arrange a reverse pickup and issue an immediate replacement or full refund to your original payment method.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Order Cancellation */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-[#7B1E2B]" />
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
              3. Order Cancellation Policy
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            <p>
              <strong>Prior to Dispatch:</strong> You may cancel your order at no charge before shipment handover directly from your Customer Profile or by contacting support. 100% of the payment will be refunded.
            </p>
            <p>
              <strong>Post-Dispatch:</strong> Once an order is packed, assigned an Air Waybill (AWB), and dispatched from our Surat atelier, it cannot be cancelled.
            </p>
          </div>
        </section>

        {/* Section 4: Refund Timelines */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Banknote size={20} className="text-[#059669]" />
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
              4. Refund Timelines & Payment Reversal
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            <p>
              Where a refund is approved (e.g. pre-dispatch cancellation or verified transit defect claim):
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>Online Prepaid Payments (UPI, Cards, Netbanking):</strong> Initiated automatically via Razorpay to the original payment source within <strong>5 to 7 business days</strong>.</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> If an approved claim requires a refund, our support team will contact you to verify your UPI ID or bank account for direct NEFT transfer within <strong>5 to 7 business days</strong>.</li>
            </ul>
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl text-xs text-[#6B7280]">
              <span className="font-semibold text-amber-800">[LAWYER_REVIEW]:</span> Confirm bank chargeback indemnification clause for unauthorized claim submissions.
            </div>
          </div>
        </section>

        {/* Section 5: Grievance Officer */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#3E2B40]/20 space-y-4 shadow-sm bg-gradient-to-br from-white to-[#FAF8F5]">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#7B1E2B]">
            5. Grievance Officer & Contact Information
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            In compliance with the Consumer Protection (E-Commerce) Rules, 2020, our Grievance Officer coordinates escalations:
          </p>
          <div className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2 text-xs text-[#1A1A1A]">
            <p><strong>Designation:</strong> {BUSINESS_CONFIG.grievanceOfficer.designation}</p>
            <p><strong>Email:</strong> <a href={`mailto:${BUSINESS_CONFIG.grievanceOfficer.email}`} className="text-[#7B1E2B] underline">{BUSINESS_CONFIG.grievanceOfficer.email}</a></p>
            <p><strong>Direct Helpline:</strong> {BUSINESS_CONFIG.grievanceOfficer.phone}</p>
            <p><strong>Address:</strong> {BUSINESS_CONFIG.grievanceOfficer.address}</p>
            <p><strong>SLA:</strong> {BUSINESS_CONFIG.grievanceOfficer.responseSla}</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default RefundPolicy;
