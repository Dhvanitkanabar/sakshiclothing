/**
 * Sakshi Clothing — Centralized Backend Business Configuration
 * Defines business settings, operational policies, and contact information.
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
    freeShippingThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD) || 999,
    defaultShippingCharge: 99,
  },
  policies: {
    returnWindowDays: 7,
    codAvailable: true,
  },
  socialLinks: {
    instagram: process.env.INSTAGRAM_URL || 'https://instagram.com/sakshiclothing',
    facebook: process.env.FACEBOOK_URL || '',
    youtube: process.env.YOUTUBE_URL || '',
  },
};

export default BUSINESS_CONFIG;
