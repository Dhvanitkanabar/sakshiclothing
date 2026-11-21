import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import { PRODUCT_STATUS } from '../constants/index.js';

const BASE_URL = process.env.FRONTEND_CUSTOMER_URL || 'https://sakshiclothing.store';

/**
 * Generates dynamic, SEO-compliant XML sitemap for search engine bots
 * Includes core landing pages, collections, active products, and statutory legal pages
 */
export const getSitemapXml = async (req, res, next) => {
  try {
    const products = await Product.find({
      status: { $ne: PRODUCT_STATUS.ARCHIVED },
      isDeleted: { $ne: true }
    })
      .select('_id name updatedAt images')
      .lean();

    const categories = await Category.find({
      isActive: { $ne: false }
    })
      .select('_id name slug updatedAt')
      .lean();

    const staticRoutes = [
      { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${BASE_URL}/shop`, priority: '0.9', changefreq: 'daily' },
      { loc: `${BASE_URL}/track-order`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${BASE_URL}/contact`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${BASE_URL}/terms`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${BASE_URL}/privacy`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${BASE_URL}/refund-policy`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${BASE_URL}/shipping-policy`, priority: '0.5', changefreq: 'monthly' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Static pages
    const nowIso = new Date().toISOString().split('T')[0];
    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${route.loc}</loc>\n`;
      xml += `    <lastmod>${nowIso}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Categories
    for (const cat of categories) {
      const catSlug = cat.slug || encodeURIComponent(cat.name);
      const catDate = cat.updatedAt ? new Date(cat.updatedAt).toISOString().split('T')[0] : nowIso;
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/category/${catSlug}</loc>\n`;
      xml += `    <lastmod>${catDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Products
    for (const prod of products) {
      const prodDate = prod.updatedAt ? new Date(prod.updatedAt).toISOString().split('T')[0] : nowIso;
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/product/${prod._id}</loc>\n`;
      xml += `    <lastmod>${prodDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      if (prod.images && prod.images.length > 0 && prod.images[0].url) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${prod.images[0].url}</image:loc>\n`;
        xml += `      <image:title>${(prod.name || '').replace(/[<>&'"]/g, '')}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (error) {
    next(error);
  }
};
