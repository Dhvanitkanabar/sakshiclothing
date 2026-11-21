// Reading this as: Legal Terms and Conditions for Sakshi Clothing patrons, Razorpay payment compliance, and Indian E-Commerce Rules (2020), with high typographic clarity, structured clause cards, and official disclosures. Dials: VARIANCE [5] / MOTION [3] / DENSITY [5].

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Scale, AlertCircle, FileText, CheckCircle2, ChevronRight, Mail, Phone, MapPin } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#1A1A1A] py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8E5DF] text-[11px] text-[#6B7280]">
          <Link to="/" className="hover:text-[#4A1D3F] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#1A1A1A] font-semibold">Terms & Conditions</span>
        </nav>

        {/* Page Header */}
        <header className="space-y-3 border-b border-[#E8E5DF] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6EFF4] text-[#4A1D3F] text-xs font-semibold uppercase tracking-wider">
            <Scale size={14} />
            <span>Legal Agreement</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1A1A1A]">
            Terms and Conditions of Service
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Effective Date: November 21, 2026 · Last Updated: November 2026
          </p>
        </header>

        {/* Legal Advisory Notice Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle size={16} className="text-amber-700 shrink-0" />
            <span>Notice for Regulatory Review & Verification</span>
          </div>
          <p className="leading-relaxed">
            These terms are drafted in accordance with the Information Technology Act, 2000, and the Consumer Protection (E-Commerce) Rules, 2020. Clauses containing regulatory assumptions are explicitly highlighted for corporate legal and chartered accountancy confirmation.
          </p>
        </div>

        {/* Section 1: Entity & Binding Agreement */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A] flex items-center gap-2">
            <span>1. Identity of Operating Entity & Agreement</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            This digital platform (the "Site" or "Storefront"), accessible via domain <strong>sakshiclothing.store</strong> and its official mobile applications, is owned and operated by <strong>{BUSINESS_CONFIG.legal.entityName}</strong>, having its principal place of business at {BUSINESS_CONFIG.address.fullFormatted}.
          </p>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            By browsing, creating an account, or purchasing products on this platform, you irrevocably agree to be bound by these Terms and Conditions, our Privacy Policy, Refund Policy, and Shipping Policy.
          </p>
          <div className="p-3 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl text-xs text-[#6B7280]">
            <span className="font-semibold text-amber-800">[TODO: LAWYER_REVIEW]:</span> Confirm legal constitution of business entity (Proprietorship vs. LLP vs. Pvt Ltd) before final execution.
          </div>
        </section>

        {/* Section 2: Artificial / Imitation Jewellery Disclosure */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#C6A15B]/30 space-y-4 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#C6A15B]" />
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A] flex items-center gap-2">
            <span>2. Honest Disclosure: Artificial & Imitation Jewellery</span>
          </h2>
          <div className="p-4 rounded-xl bg-[#F4EEDF]/60 border border-[#C6A15B]/40 space-y-2 text-xs text-[#6B5528] leading-relaxed">
            <p className="font-bold uppercase tracking-wider text-[#A4813D]">
              Mandatory Statutory Customer Advisory
            </p>
            <p>
              {BUSINESS_CONFIG.legal.imitationJewelleryDisclosure}
            </p>
            <p>
              All stone embellishments described as "Kundan", "Polki", or "Pearls" are simulated, synthetic glass crystals and faux pearls crafted for celebratory attire. Sakshi Clothing makes zero representations of precious gemstone or bullion hallmarking on artificial jewellery items.
            </p>
          </div>
        </section>

        {/* Section 3: Pricing, Taxation & Currency */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
            3. Pricing, Taxes & Payment Verification
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#4B5563] leading-relaxed list-disc list-inside">
            <li><strong>Currency:</strong> All prices listed on the platform are in Indian Rupees (INR ₹).</li>
            <li><strong>Tax-Inclusive:</strong> {BUSINESS_CONFIG.legal.taxInclusiveNotice} Registered GSTIN: <strong>{BUSINESS_CONFIG.legal.gstNumber}</strong>.</li>
            <li><strong>Server-Side Pricing:</strong> In accordance with our security protocols, order totals are authoritatively calculated and verified on our server against our product database. Any attempt to modify client-side payloads will result in immediate rejection.</li>
            <li><strong>Payment Gateways:</strong> Payments are processed securely via Reserve Bank of India (RBI) authorized payment aggregators (Razorpay). Sakshi Clothing never stores raw credit/debit card numbers or CVV codes on our servers.</li>
          </ul>
          <div className="p-3 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl text-xs text-[#6B7280]">
            <span className="font-semibold text-amber-800">[TODO: CA_REVIEW]:</span> Confirm HSN code mapping (5007/6204 for apparel, 7117 for imitation jewellery) and GST return filing frequency.
          </div>
        </section>

        {/* Section 4: User Accounts & Authentication */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
            4. User Accounts & Security
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            Users authenticate via Clerk identity services. You are responsible for maintaining the confidentiality of your credentials. You agree to notify us immediately at {BUSINESS_CONFIG.supportEmail} upon suspecting unauthorized account access. Sakshi Clothing reserves the right to terminate accounts engaged in abusive, fraudulent, or automated bot activity.
          </p>
        </section>

        {/* Section 5: Orders, Cancellation & Delivery */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
            5. Order Fulfillment, Cancellation & Shipping
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            Order acceptance occurs upon verification of payment or verification of Cash on Delivery details. Delivery timelines, shipping costs, and cancellation terms are governed strictly by our official <strong>Shipping Policy</strong> and <strong>Refund Policy</strong>.
          </p>
        </section>

        {/* Section 6: Limitation of Liability & Governing Law */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
            6. Limitation of Liability & Dispute Jurisdiction
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            To the maximum extent permitted by Indian law, Sakshi Clothing's cumulative liability for any claim arising from a product purchase shall not exceed the actual invoice amount paid by the customer for the specific product in dispute.
          </p>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            These terms are governed by the substantive laws of India. Any legal dispute, arbitration, or litigation shall be subject to the exclusive jurisdiction of the competent courts in <strong>Surat, Gujarat, India</strong>.
          </p>
          <div className="p-3 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl text-xs text-[#6B7280]">
            <span className="font-semibold text-amber-800">[TODO: LAWYER_REVIEW]:</span> Validate unilateral arbitration clause enforceability under the Arbitration and Conciliation Act, 1996.
          </div>
        </section>

        {/* Section 7: Grievance Redressal Mechanism */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#3E2B40]/20 space-y-4 shadow-sm bg-gradient-to-br from-white to-[#FAF8F5]">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#4A1D3F] flex items-center gap-2">
            <span>7. Grievance Officer Details</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            In accordance with Rule 5(6) of the Consumer Protection (E-Commerce) Rules, 2020 and the Information Technology Act, 2000, our designated Grievance Redressal Officer is:
          </p>
          <div className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2 text-xs text-[#1A1A1A]">
            <p><strong>Designation:</strong> {BUSINESS_CONFIG.grievanceOfficer.designation}</p>
            <p className="flex items-center gap-2">
              <Mail size={13} className="text-[#C6A15B]" />
              <span><strong>Email:</strong> <a href={`mailto:${BUSINESS_CONFIG.grievanceOfficer.email}`} className="text-[#4A1D3F] underline">{BUSINESS_CONFIG.grievanceOfficer.email}</a></span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={13} className="text-[#C6A15B]" />
              <span><strong>Telephone:</strong> {BUSINESS_CONFIG.grievanceOfficer.phone}</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin size={13} className="text-[#C6A15B] shrink-0 mt-0.5" />
              <span><strong>Postal Address:</strong> {BUSINESS_CONFIG.grievanceOfficer.address}</span>
            </p>
            <p className="text-[#6B7280] pt-1">
              <strong>SLA:</strong> {BUSINESS_CONFIG.grievanceOfficer.responseSla}
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Terms;
