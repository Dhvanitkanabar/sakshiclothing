/**
 * Sakshi Clothing — Centralized Backend Business Configuration
 * Defines business settings, operational policies, legal parameters, and contact information.
 * All backend utilities (invoice generator, email service, store settings fallback) import from here.
 */

export const BUSINESS_CONFIG = {
  storeName: process.env.STORE_NAME || 'Sakshi Clothing',
  supportEmail: process.env.STORE_SUPPORT_EMAIL || process.env.EMAIL_FROM || 'sakshiclothing2025@gmail.com',
  supportPhone: process.env.STORE_SUPPORT_PHONE || '+91 9316533660',
  whatsappNumber: '919316533660',
  gstNumber: process.env.STORE_GST_NUMBER || '24AABCS1429B1Z1',
  address: {
    line1: 'G-903 Sentosa Heights',
    area: 'Utran',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '394105',
    country: 'India',
    fullFormatted: 'G-903 Sentosa Heights, Utran, Surat, Gujarat - 394105, India',
  },
  shipping: {
    freeShippingThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD) || 300,
    defaultShippingCharge: Number(process.env.DEFAULT_SHIPPING_FEE) || 49,
    codHandlingFee: Number(process.env.COD_HANDLING_FEE) || 0,
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
    ],
  },
  policies: {
    returnWindowHours: 48,
    noReturnsPermitted: true,
    damagedOrDefectiveCovered: true,
    returnPolicy: 'No returns or exchanges for change of mind, fit, size, or color. Damaged, defective, or incorrect items are covered if reported within 48 hours of delivery with an unboxing video and photo proof.',
    cancellationPolicy: 'Orders may be cancelled prior to dispatch. Refunds for prepaid orders cancelled before dispatch are processed within 5–7 business days to the original payment source.',
    codAvailable: true,
  },
  grievanceOfficer: {
    name: 'Grievance Redressal Officer',
    designation: 'Head of Customer Relations & Compliance',
    email: process.env.GRIEVANCE_EMAIL || 'sakshiclothing2025@gmail.com',
    phone: '+91 9316533660',
    address: 'G-903 Sentosa Heights, Utran, Surat, Gujarat - 394105, India',
    responseSla: 'Acknowledgment within 48 business hours; resolution within 30 days pursuant to Consumer Protection (E-Commerce) Rules, 2020.',
  },
  legal: {
    entityName: 'Sakshi Clothing',
    jurisdiction: 'Surat, Gujarat, India',
    gstNumber: process.env.STORE_GST_NUMBER || '24AABCS1429B1Z1',
  },
  socialLinks: {
    instagram: process.env.INSTAGRAM_URL || 'https://instagram.com/sakshiclothing',
    facebook: process.env.FACEBOOK_URL || '',
    youtube: process.env.YOUTUBE_URL || '',
  },
};

export default BUSINESS_CONFIG;
