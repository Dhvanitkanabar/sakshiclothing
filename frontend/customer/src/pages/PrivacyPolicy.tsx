// Reading this as: Statutory Privacy Policy for Sakshi Clothing patrons compliant with India's Digital Personal Data Protection (DPDP) Act 2023, IT Act 2000, Clerk auth, and Razorpay payment processing. Dials: VARIANCE [5] / MOTION [3] / DENSITY [5].

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Server, RefreshCw, Mail, Phone, MapPin, ChevronRight, AlertCircle } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#1A1A1A] py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8E5DF] text-[11px] text-[#6B7280]">
          <Link to="/" className="hover:text-[#4A1D3F] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#1A1A1A] font-semibold">Privacy Policy</span>
        </nav>

        {/* Page Header */}
        <header className="space-y-3 border-b border-[#E8E5DF] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6EFF4] text-[#4A1D3F] text-xs font-semibold uppercase tracking-wider">
            <Lock size={14} />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1A1A1A]">
            Privacy Policy & Data Notice
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Effective Date: November 21, 2026 · Compliant with the Digital Personal Data Protection (DPDP) Act, 2023
          </p>
        </header>

        {/* Regulatory Advisory Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle size={16} className="text-amber-700 shrink-0" />
            <span>DPDP Act 2023 & IT Act 2000 Compliance Note</span>
          </div>
          <p className="leading-relaxed">
            Sakshi Clothing respects your personal dignity and constitutional right to privacy. This privacy notice explains what digital personal data we collect as a Data Fiduciary, the lawful purpose of collection, our security safeguards, third-party processors, and your statutory rights to access, rectify, or erase your data.
          </p>
          <p className="text-[#6B7280]">
            <span className="font-semibold text-amber-800">[TODO: LAWYER_REVIEW]:</span> Confirm notification requirements for data fiduciary registration under DPDP Act rules once operationalized by the Data Protection Board of India.
          </p>
        </div>

        {/* Section 1: Data We Collect */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
            1. Personal Data Collected & Purpose
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            We collect only the minimal personal data strictly necessary to provide an authentic, secure shopping experience:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1.5 text-xs">
              <p className="font-semibold text-[#1A1A1A]">Identity & Contact Data</p>
              <p className="text-[#6B7280] leading-relaxed">
                Full name, mobile number, email address, and shipping/billing address used exclusively for order fulfillment, courier delivery, and tax invoicing.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1.5 text-xs">
              <p className="font-semibold text-[#1A1A1A]">Authentication Data</p>
              <p className="text-[#6B7280] leading-relaxed">
                Federated OAuth tokens or one-time password (OTP) verification records managed securely via our authentication partner, Clerk.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1.5 text-xs">
              <p className="font-semibold text-[#1A1A1A]">Transaction & Payment Data</p>
              <p className="text-[#6B7280] leading-relaxed">
                Order amounts, payment identifiers (Razorpay order ID, payment ID), and payment mode (UPI/Card). We <strong>never</strong> store raw card numbers, expiry dates, or CVVs.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1.5 text-xs">
              <p className="font-semibold text-[#1A1A1A]">Technical & Device Logs</p>
              <p className="text-[#6B7280] leading-relaxed">
                IP address, browser user-agent, and anonymized performance analytics used for bot mitigation, fraud detection, and mobile responsiveness tuning.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Data Processors & Third Parties */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
            2. Authorized Third-Party Data Processors
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            We partner with audited, industry-leading processors operating under strict data confidentiality covenants:
          </p>
          <ul className="space-y-3 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4A1D3F] mt-2 shrink-0" />
              <span><strong>Clerk Inc.:</strong> Provides user session authentication, multi-factor verification, and OAuth delegation adhering to SOC 2 Type II standards.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4A1D3F] mt-2 shrink-0" />
              <span><strong>Razorpay Software Private Limited:</strong> RBI-licensed payment aggregator facilitating PCI-DSS Level 1 encrypted transactions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4A1D3F] mt-2 shrink-0" />
              <span><strong>Logistics Partners (Bluedart, Delhivery, DTDC):</strong> Receive only recipient name, delivery address, and phone number for parcel handoff and OTP-verified delivery.</span>
            </li>
          </ul>
        </section>

        {/* Section 3: Cookies & Analytics */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
            3. Cookies & Consent Management
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            We employ essential cookies to preserve your cart contents, active session, and security tokens. Optional performance or analytics cookies (such as Google Analytics 4) are strictly opt-in and remain dormant until explicit consent is granted via our Cookie Consent preference center.
          </p>
        </section>

        {/* Section 4: Data Retention & Security */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
            4. Data Retention, Encryption & Storage
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            Customer order records and tax invoices are retained for a minimum statutory period of 8 years to comply with Section 128 of the Companies Act, 2013, and GST regulations. All in-transit data is protected using TLS 1.3 encryption, and database records are isolated with role-based access restrictions.
          </p>
          <div className="p-3 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl text-xs text-[#6B7280]">
            <span className="font-semibold text-amber-800">[TODO: CA_REVIEW]:</span> Confirm statutory retention period alignment with current Indian Income Tax Act guidelines.
          </div>
        </section>

        {/* Section 5: Your Statutory DPDP Rights */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] space-y-4 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1A1A1A]">
            5. Your Rights as a Data Principal
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            <p>Under the Digital Personal Data Protection Act, 2023, you enjoy the following enforceable rights:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Right to Information:</strong> Access a summary of your personal data processed by Sakshi Clothing.</li>
              <li><strong>Right to Correction & Erasure:</strong> Request rectification of outdated information or erasure of account data when the transaction purpose is fulfilled.</li>
              <li><strong>Right of Grievance Redressal:</strong> Submit grievances regarding data processing directly to our Grievance Officer.</li>
              <li><strong>Right to Nominate:</strong> Nominate an individual to exercise your data rights in the event of death or incapacity.</li>
            </ul>
          </div>
        </section>

        {/* Section 6: Grievance Officer & Contact */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#3E2B40]/20 space-y-4 shadow-sm bg-gradient-to-br from-white to-[#FAF8F5]">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#4A1D3F]">
            6. Grievance Redressal Officer
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            If you wish to exercise your data rights, lodge an inquiry, or report a suspected data irregularity, contact our designated Grievance Officer:
          </p>
          <div className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2 text-xs text-[#1A1A1A]">
            <p><strong>Officer Name:</strong> {BUSINESS_CONFIG.grievanceOfficer.name}</p>
            <p><strong>Role:</strong> {BUSINESS_CONFIG.grievanceOfficer.designation}</p>
            <p className="flex items-center gap-2">
              <Mail size={13} className="text-[#C6A15B]" />
              <span><strong>Email:</strong> <a href={`mailto:${BUSINESS_CONFIG.grievanceOfficer.email}`} className="text-[#4A1D3F] underline">{BUSINESS_CONFIG.grievanceOfficer.email}</a></span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={13} className="text-[#C6A15B]" />
              <span><strong>Phone:</strong> {BUSINESS_CONFIG.grievanceOfficer.phone}</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin size={13} className="text-[#C6A15B] shrink-0 mt-0.5" />
              <span><strong>Address:</strong> {BUSINESS_CONFIG.grievanceOfficer.address}</span>
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

export default PrivacyPolicy;
