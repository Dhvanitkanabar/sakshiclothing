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
    returnWindowDays: number;
    codAvailable: boolean;
    jewelleryPolicy: string;
    clothingPolicy: string;
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
  tagline: 'Authentic Indian Couture & Hypoallergenic Imitation Jewellery',
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
    freeShippingThreshold: Number(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD) || 999,
    standardShippingFee: 99,
    returnWindowDays: 7,
    codAvailable: true,
    jewelleryPolicy: 'Handcrafted imitation & artificial jewellery. 100% skin-friendly brass base with protective anti-tarnish coating. 7-day hassle-free exchange for transit issues.',
    clothingPolicy: 'Authentic Indian textiles, sarees, lehengas & suits tailored with generational craftsmanship. 7-day returns on unworn items with tags intact.',
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
    imitationJewelleryDisclosure: 'NOTICE CONCERNING ARTIFICIAL JEWELLERY: All jewellery creations offered on this platform are imitation / artificial fashion jewellery. They are crafted utilizing hypoallergenic brass base, zinc alloys, synthetic Kundan, Polki glass, and electroplated micro-gold or rhodium finish. Products are NOT composed of 22K/24K solid precious gold, silver, or genuine diamonds.',
  },
  socialLinks: {
    instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/sakshiclothing',
    facebook: import.meta.env.VITE_FACEBOOK_URL || '',
    youtube: import.meta.env.VITE_YOUTUBE_URL || '',
  },
};

export default BUSINESS_CONFIG;
