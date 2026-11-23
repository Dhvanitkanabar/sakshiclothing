/**
 * Sakshi Clothing — Centralized Business & Store Configuration
 * Defines operational thresholds, policies, contact details, legal compliance, and social links.
 * Overridable via environment variables (VITE_*) and populated via backend StoreSettings.
 */

export interface BusinessConfig {
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  helplineDisplay: string;
  whatsappNumber: string;
  whatsappUrl: string;
  address: {
    line1: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    fullFormatted: string;
  };
  policies: {
    freeShippingThreshold: number;
    standardShippingFee: number;
    codHandlingFee: number;
    returnWindowHours: number;
    noReturnsPermitted: boolean;
    damagedOrDefectiveCovered: boolean;
    codAvailable: boolean;
    returnPolicySummary: string;
    cancellationPolicy: string;
    jewelleryPolicy: string;
    clothingPolicy: string;
  };
  payment: {
    allowedMethods: string[];
    defaultOnlineMethod: string;
    razorpayHiddenMethods: Array<{ method: string }>;
  };
  grievanceOfficer: {
    name: string;
    designation: string;
    email: string;
    phone: string;
    address: string;
    responseSla: string;
  };
  legal: {
    entityName: string;
    jurisdiction: string;
    gstNumber: string;
    taxInclusiveNotice: string;
    imitationJewelleryDisclosure: string;
  };
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
}

export const BUSINESS_CONFIG: BusinessConfig = {
  storeName: import.meta.env.VITE_STORE_NAME || 'Sakshi Clothing',
  tagline: 'Everyday Indian Fashion & Imitation Jewellery from Surat',
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'sakshiclothing2025@gmail.com',
  supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '+91 9316533660',
  helplineDisplay: '+91 9316533660',
  whatsappNumber: '919316533660',
  whatsappUrl: 'https://wa.me/919316533660',
  address: {
    line1: 'G-903 Sentosa Heights',
    area: 'Utran',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '394105',
    country: 'India',
    fullFormatted: 'G-903 Sentosa Heights, Utran, Surat, Gujarat - 394105, India',
  },
  policies: {
    freeShippingThreshold: Number(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD) || 300,
    standardShippingFee: 49,
    codHandlingFee: 0,
    returnWindowHours: 48,
    noReturnsPermitted: true,
    damagedOrDefectiveCovered: true,
    codAvailable: true,
    returnPolicySummary: 'No returns or exchanges for change of mind, fit, size, or color. Damaged, defective, or incorrect items covered upon reporting within 48 hours of delivery with unboxing video & photo proof.',
    cancellationPolicy: 'Orders may be cancelled prior to dispatch with full refund to original source in 5–7 business days.',
    jewelleryPolicy: 'Fashion & imitation jewellery collection crafted with brass/copper alloy and micro-plated finish. Strict No Return Policy. 48-hour reporting window for verified transit damage or defect with unboxing proof.',
    clothingPolicy: 'Authentic Indian ethnic and daily wear clothing from Surat textile markets. Strict No Return Policy for size or fit preference. Damaged or wrong items replaced or refunded upon 48-hour unboxing verification.',
  },
  payment: {
    allowedMethods: ['upi', 'cod'],
    defaultOnlineMethod: 'upi',
    razorpayHiddenMethods: [
      { method: 'card' },
      { method: 'netbanking' },
      { method: 'wallet' },
      { method: 'emi' },
      { method: 'cardless_emi' },
      { method: 'paylater' }
    ]
  },
  grievanceOfficer: {
    name: 'Grievance Redressal Officer',
    designation: 'Head of Customer Relations & Compliance',
    email: 'sakshiclothing2025@gmail.com',
    phone: '+91 9316533660',
    address: 'G-903 Sentosa Heights, Utran, Surat, Gujarat - 394105, India',
    responseSla: 'Acknowledgment within 48 business hours; resolution within 30 days pursuant to Consumer Protection (E-Commerce) Rules, 2020.',
  },
  legal: {
    entityName: 'Sakshi Clothing',
    jurisdiction: 'Surat, Gujarat, India',
    gstNumber: '24AABCS1429B1Z1',
    taxInclusiveNotice: 'All prices on Sakshi Clothing are denominated in Indian National Rupees (INR ₹) and are fully inclusive of all applicable statutory Goods & Services Tax (18% GST).',
    imitationJewelleryDisclosure: 'NOTICE CONCERNING ARTIFICIAL JEWELLERY: All jewellery items on this website are imitation / artificial fashion jewellery created from brass/alloy base metal, electroplated gold/silver tones, synthetic Kundan/glass stones, and artificial beads. These are not real gold, silver, or genuine gemstones.',
  },
  socialLinks: {
    instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/sakshiclothing',
    facebook: import.meta.env.VITE_FACEBOOK_URL || '',
    youtube: import.meta.env.VITE_YOUTUBE_URL || '',
  },
};

/**
 * Fetch authoritative business configuration from backend API to ensure
 * single source of truth for shipping thresholds and policies without hardcoding.
 */
export async function fetchBusinessConfig(): Promise<BusinessConfig> {
  try {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiBase}/cms/business-config`);
    if (res.ok) {
      const data = await res.json();
      if (data?.data) {
        const remote = data.data;
        if (remote.shipping?.freeShippingThreshold !== undefined) {
          BUSINESS_CONFIG.policies.freeShippingThreshold = Number(remote.shipping.freeShippingThreshold);
        }
        if (remote.shipping?.defaultShippingCharge !== undefined) {
          BUSINESS_CONFIG.policies.standardShippingFee = Number(remote.shipping.defaultShippingCharge);
        }
        if (remote.shipping?.codHandlingFee !== undefined) {
          BUSINESS_CONFIG.policies.codHandlingFee = Number(remote.shipping.codHandlingFee);
        }
        if (remote.policies?.returnPolicy) {
          BUSINESS_CONFIG.policies.returnPolicySummary = remote.policies.returnPolicy;
        }
        if (remote.payment) {
          BUSINESS_CONFIG.payment = {
            allowedMethods: remote.payment.allowedMethods || BUSINESS_CONFIG.payment.allowedMethods,
            defaultOnlineMethod: remote.payment.defaultOnlineMethod || BUSINESS_CONFIG.payment.defaultOnlineMethod,
            razorpayHiddenMethods: remote.payment.razorpayHiddenMethods || BUSINESS_CONFIG.payment.razorpayHiddenMethods
          };
        }
      }
    }
  } catch (err) {
    console.debug('Using local BUSINESS_CONFIG fallback:', err);
  }
  return BUSINESS_CONFIG;
}

export default BUSINESS_CONFIG;
