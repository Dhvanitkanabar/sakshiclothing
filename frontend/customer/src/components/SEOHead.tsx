// Reading this as: Zero-bloat, React 19 native dynamic SEO Head Manager for Sakshi Clothing. Updates page title, meta description, canonical links, OpenGraph / Twitter cards, and injects structured JSON-LD schemas (Organization, Product, BreadcrumbList). Dials: VARIANCE [4] / MOTION [1] / DENSITY [5].

import React, { useEffect } from 'react';
import { BUSINESS_CONFIG } from '../config/business';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = 'Sakshi Clothing | Authentic Indian Couture & Imitation Jewellery';
const DEFAULT_DESCRIPTION = 'Explore handcrafted sarees, bespoke lehengas, kurtis, and skin-friendly imitation jewellery from our Surat atelier. Express shipping across India with Cash on Delivery.';
const DEFAULT_IMAGE = 'https://sakshiclothing.store/og-image.jpg';
const SITE_URL = 'https://sakshiclothing.store';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noIndex = false,
  jsonLd,
}) => {
  const fullTitle = title 
    ? (title.includes('Sakshi') ? title : `${title} | Sakshi Clothing`)
    : DEFAULT_TITLE;

  const currentCanonical = canonicalUrl 
    ? canonicalUrl 
    : typeof window !== 'undefined'
      ? `${SITE_URL}${window.location.pathname}`
      : SITE_URL;

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // Helper to create or update meta tags
    const setMetaTag = (selector: string, attr: string, value: string) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        if (selector.startsWith('meta[name="')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) element.setAttribute('name', name);
        } else if (selector.startsWith('meta[property="')) {
          const prop = selector.match(/property="([^"]+)"/)?.[1];
          if (prop) element.setAttribute('property', prop);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attr, value);
    };

    // 2. Primary Meta Tags
    setMetaTag('meta[name="description"]', 'content', description);
    setMetaTag('meta[name="robots"]', 'content', noIndex ? 'noindex, nofollow' : 'index, follow');

    // 3. OpenGraph Tags
    setMetaTag('meta[property="og:title"]', 'content', fullTitle);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:type"]', 'content', ogType);
    setMetaTag('meta[property="og:url"]', 'content', currentCanonical);
    setMetaTag('meta[property="og:image"]', 'content', ogImage);
    setMetaTag('meta[property="og:site_name"]', 'content', BUSINESS_CONFIG.storeName);
    setMetaTag('meta[property="og:locale"]', 'content', 'en_IN');

    // 4. Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'content', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
    setMetaTag('meta[name="twitter:image"]', 'content', ogImage);

    // 5. Canonical Link
    let linkCanonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', currentCanonical);

    // 6. JSON-LD Structured Data
    const SCRIPT_ID = 'seo-structured-data';
    let scriptTag = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = SCRIPT_ID;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Cleanup custom JSON-LD when component unmounts
      const tag = document.getElementById(SCRIPT_ID);
      if (tag) tag.remove();
    };
  }, [fullTitle, description, currentCanonical, ogType, ogImage, noIndex, jsonLd]);

  return null;
};

// Common Default Schema: Organization & OnlineStore
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  '@id': `${SITE_URL}/#organization`,
  name: BUSINESS_CONFIG.storeName,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description: 'Specialist retailer of handcrafted Indian textiles, sarees, lehengas, and hypoallergenic imitation artificial jewellery.',
  email: BUSINESS_CONFIG.supportEmail,
  telephone: BUSINESS_CONFIG.supportPhone,
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS_CONFIG.address.line1,
    addressLocality: BUSINESS_CONFIG.address.city,
    addressRegion: BUSINESS_CONFIG.address.state,
    postalCode: BUSINESS_CONFIG.address.pincode,
    addressCountry: 'IN',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '19:00',
    },
  ],
  sameAs: [
    BUSINESS_CONFIG.socialLinks.instagram,
    BUSINESS_CONFIG.socialLinks.facebook,
    BUSINESS_CONFIG.socialLinks.youtube,
  ].filter(Boolean),
});

export default SEOHead;
