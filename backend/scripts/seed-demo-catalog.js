import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../src/models/Product.model.js';
import Category from '../src/models/Category.model.js';
import User from '../src/models/User.model.js';
import { PRODUCT_STATUS } from '../src/constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sakshiclothing';

// 1. Production Database Safety Lock
const isProduction = process.env.NODE_ENV === 'production' || 
  (!MONGODB_URI.includes('localhost') && !MONGODB_URI.includes('127.0.0.1') && !MONGODB_URI.includes('mongo:27017'));

const hasForceFlag = process.argv.includes('--force-production');

if (isProduction && !hasForceFlag) {
  console.error('\n====================================================================');
  console.error('❌ SAFETY ABORT: Production database detected!');
  console.error(`Target URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`);
  console.error('Demo catalogue seeding is blocked on production by default.');
  console.error('To override, re-run with explicit flag: --force-production');
  console.error('====================================================================\n');
  process.exit(1);
}

// 2. Curated Demo Categories
const demoCategories = [
  {
    name: 'Women',
    slug: 'women',
    description: 'Everyday sarees, printed kurti sets, and celebration lehengas from Surat.',
    displayOrder: 1
  },
  {
    name: 'Men',
    slug: 'men',
    description: 'Cotton kurtas, festive nehru jackets, and daily ethnic wear.',
    displayOrder: 2
  },
  {
    name: 'Kids',
    slug: 'kids',
    description: 'Comfortable ethnic wear and festive sets for boys and girls.',
    displayOrder: 3
  },
  {
    name: 'Imitation Jewellery',
    slug: 'jewellery',
    description: 'Fashion artificial jewellery: brass necklaces, jhumkas, bangles, and sets.',
    displayOrder: 4
  }
];

// 3. 32 Realistic Surat Products (Pricing ₹399 - ₹3,499, Honest Copy)
const demoProducts = [
  // --- WOMEN: SAREES, KURTIS & ETHNIC WEAR ---
  {
    name: 'Surat Floral Art Silk Saree with Blouse Piece',
    categorySlug: 'women',
    subCategory: 'Sarees',
    basePrice: 1299,
    discountPrice: 899,
    stock: 24,
    sizes: ['Free Size (5.5m + 0.8m)'],
    tags: ['saree', 'art silk', 'women', 'surat', 'festive'],
    material: 'Art Silk Blend',
    description: 'Lightweight everyday art silk saree crafted in Surat with all-over floral motifs and an unstitched contrast blouse piece.',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Bandhani Printed Georgette Daily Saree',
    categorySlug: 'women',
    subCategory: 'Sarees',
    basePrice: 1199,
    discountPrice: 799,
    stock: 18,
    sizes: ['Free Size (5.5m)'],
    tags: ['bandhani', 'georgette', 'saree', 'casual', 'women'],
    material: 'Poly-Georgette',
    description: 'Traditional Gujarati Bandhani dot print on breezy georgette fabric. Ideal for daily temple wear and family gatherings.',
    images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Straight Cotton Kurti with Palazzo Set',
    categorySlug: 'women',
    subCategory: 'Kurti Sets',
    basePrice: 1499,
    discountPrice: 999,
    stock: 35,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tags: ['kurti', 'palazzo', 'cotton', 'office wear', 'women'],
    material: 'Cotton Slub',
    description: 'Comfortable everyday workwear kurti set in breathable slub cotton, paired with matching solid elasticated palazzos.',
    images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Anarkali Flared Printed Kurta with Dupatta',
    categorySlug: 'women',
    subCategory: 'Kurti Sets',
    basePrice: 1899,
    discountPrice: 1399,
    stock: 20,
    sizes: ['M', 'L', 'XL'],
    tags: ['anarkali', 'printed', 'festive', 'dupatta', 'women'],
    material: 'Rayon Viscose',
    description: 'Flared floor-touch Anarkali silhouette with digital floral placement print and a lightweight chiffon dupatta.',
    images: ['https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Semi-Stitched Festive Jacquard Lehenga Choli',
    categorySlug: 'women',
    subCategory: 'Lehengas',
    basePrice: 3499,
    discountPrice: 2499,
    stock: 12,
    sizes: ['Semi-Stitched (Fits up to 42 waist)'],
    tags: ['lehenga', 'jacquard', 'wedding guest', 'festive', 'women'],
    material: 'Jacquard Silk Blend',
    description: 'Festive woven jacquard lehenga with gold-toned border and matching unstitched blouse fabric.',
    images: ['https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Embroidered Cotton Blend Festive Kurti',
    categorySlug: 'women',
    subCategory: 'Kurti Sets',
    basePrice: 899,
    discountPrice: 599,
    stock: 40,
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['kurti', 'embroidery', 'daily', 'budget', 'women'],
    material: 'Cotton Blend',
    description: 'Yoke machine embroidered everyday tunic designed for casual college or office wear.',
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Chanderi Foil Printed Saree with Tassels',
    categorySlug: 'women',
    subCategory: 'Sarees',
    basePrice: 1599,
    discountPrice: 1099,
    stock: 15,
    sizes: ['Free Size (5.5m)'],
    tags: ['chanderi', 'foil print', 'saree', 'festive', 'women'],
    material: 'Chanderi Poly Blend',
    description: 'Shimmering metallic foil print over Chanderi weave with pallu tassel accents.',
    images: ['https://images.unsplash.com/photo-1610030469668-935cb31a1827?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Casual A-Line Rayon Kurta with Pockets',
    categorySlug: 'women',
    subCategory: 'Kurti Sets',
    basePrice: 699,
    discountPrice: 499,
    stock: 50,
    sizes: ['M', 'L', 'XL', 'XXL'],
    tags: ['rayon', 'a-line', 'casual', 'pocket', 'women'],
    material: 'Pure Rayon 140 GSM',
    description: 'Ultra-soft everyday A-line kurta featuring one side utility pocket and mandarin collar.',
    images: ['https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=80']
  },

  // --- MEN: KURTAS, PYJAMAS & WAISTCOATS ---
  {
    name: 'Mandarin Collar Slub Cotton Men Kurta',
    categorySlug: 'men',
    subCategory: 'Kurtas',
    basePrice: 1299,
    discountPrice: 799,
    stock: 25,
    sizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)'],
    tags: ['kurta', 'cotton', 'men', 'festive', 'simple'],
    material: '100% Slub Cotton',
    description: 'Classic solid straight kurta for men in breathable textured cotton, featuring side slits and front button placket.',
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Woven Nehru Jacket (Waistcoat) for Festive Wear',
    categorySlug: 'men',
    subCategory: 'Jackets',
    basePrice: 1699,
    discountPrice: 1199,
    stock: 16,
    sizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)'],
    tags: ['nehru jacket', 'waistcoat', 'men', 'wedding guest'],
    material: 'Jacquard Matka Blend',
    description: 'Tailored sleeveless Nehru waistcoat with metallic buttons and breast pocket for pocket square.',
    images: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Festive Men Kurta with Churidar Pyjama Set',
    categorySlug: 'men',
    subCategory: 'Kurta Sets',
    basePrice: 1999,
    discountPrice: 1499,
    stock: 22,
    sizes: ['40 (M)', '42 (L)', '44 (XL)'],
    tags: ['kurta set', 'pyjama', 'men', 'diwali', 'pooja'],
    material: 'Art Silk Cotton Blend',
    description: 'Coordinated two-piece ethnic set including a sheen kurta and comfortable drawstring churidar.',
    images: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Short Casual Printed Cotton Kurta for Men',
    categorySlug: 'men',
    subCategory: 'Kurtas',
    basePrice: 899,
    discountPrice: 599,
    stock: 30,
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['short kurta', 'denim pair', 'men', 'daily'],
    material: 'Printed Cotton',
    description: 'Thigh-length casual kurta that pairs seamlessly with denim or chinos for relaxed daily outings.',
    images: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Pathani Style Men Kurta Set',
    categorySlug: 'men',
    subCategory: 'Kurta Sets',
    basePrice: 2199,
    discountPrice: 1699,
    stock: 14,
    sizes: ['40 (M)', '42 (L)', '44 (XL)'],
    tags: ['pathani', 'men', 'festive', 'eid', 'comfort'],
    material: 'Cotton Rich Blend',
    description: 'Traditional shirt-collar Pathani kurta with roll-up sleeves and matching wide-leg salwar.',
    images: ['https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Digital Print Floral Silk Blend Kurta',
    categorySlug: 'men',
    subCategory: 'Kurtas',
    basePrice: 1399,
    discountPrice: 949,
    stock: 19,
    sizes: ['38 (S)', '40 (M)', '42 (L)'],
    tags: ['floral', 'digital print', 'men', 'haldi', 'sangeet'],
    material: 'Silk Poly Blend',
    description: 'Subtle pastel floral print kurta designed for daytime festive occasions like Haldi or Mehendi.',
    images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80']
  },

  // --- KIDS: BOYS & GIRLS FESTIVE WEAR ---
  {
    name: 'Boys Cotton Kurta with Dhoti Pant Set',
    categorySlug: 'kids',
    subCategory: 'Boys Ethnic',
    basePrice: 1199,
    discountPrice: 799,
    stock: 20,
    sizes: ['2-3 Y', '4-5 Y', '6-7 Y', '8-9 Y'],
    tags: ['boys', 'dhoti pant', 'kids', 'festive'],
    material: '100% Soft Cotton',
    description: 'Ready-to-wear pre-stitched elasticated dhoti pants paired with soft printed cotton kurta for easy movement.',
    images: ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Girls Ready-to-Wear Floral Lehenga Choli',
    categorySlug: 'kids',
    subCategory: 'Girls Ethnic',
    basePrice: 1499,
    discountPrice: 999,
    stock: 18,
    sizes: ['3-4 Y', '5-6 Y', '7-8 Y', '9-10 Y'],
    tags: ['girls', 'lehenga', 'kids', 'festive'],
    material: 'Georgette with Cotton Lining',
    description: 'Playful floral flared skirt with comfortable inner cotton lining and easy back zip blouse.',
    images: ['https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Boys Brocade Waistcoat and Kurta Set (3-Piece)',
    categorySlug: 'kids',
    subCategory: 'Boys Ethnic',
    basePrice: 1799,
    discountPrice: 1299,
    stock: 15,
    sizes: ['4-5 Y', '6-7 Y', '8-9 Y'],
    tags: ['boys', 'waistcoat', '3 piece', 'kids', 'wedding'],
    material: 'Brocade & Cotton Silk',
    description: 'Three-piece celebration set including solid kurta, pyjama, and contrasting brocade jacket.',
    images: ['https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Girls Anarkali Style Gown with Net Dupatta',
    categorySlug: 'kids',
    subCategory: 'Girls Ethnic',
    basePrice: 1399,
    discountPrice: 899,
    stock: 16,
    sizes: ['4-5 Y', '6-7 Y', '8-9 Y'],
    tags: ['girls', 'anarkali', 'gown', 'kids'],
    material: 'Soft Net & Satin Lining',
    description: 'Floor-length festive gown with soft net flare that is gentle on child skin and easy to wear.',
    images: ['https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80']
  },

  // --- IMITATION JEWELLERY: NECKLACES, EARRINGS, BANGLES, RINGS & SETS ---
  {
    name: 'Kundan Choker Necklace Set with Drop Earrings',
    categorySlug: 'jewellery',
    subCategory: 'Necklaces',
    basePrice: 1499,
    discountPrice: 999,
    stock: 28,
    sizes: ['Adjustable Dori'],
    tags: ['kundan', 'choker', 'earrings', 'imitation jewellery', 'wedding'],
    material: 'Brass base alloy with micro gold polish and synthetic Kundan glass stones',
    description: 'Traditional imitation Kundan choker set crafted on brass alloy with faux pearl drops and matching stud drop earrings.',
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Traditional Matte Gold Temple Rani Haar',
    categorySlug: 'jewellery',
    subCategory: 'Necklaces',
    basePrice: 1999,
    discountPrice: 1399,
    stock: 14,
    sizes: ['Long Chain (24 inch)'],
    tags: ['temple jewellery', 'rani haar', 'matte gold', 'artificial jewellery'],
    material: 'Zinc brass alloy with matte 1-gram gold tone polish and synthetic rubies',
    description: 'South-inspired temple imitation long necklace featuring goddess motif pendant and ruby-red glass stones.',
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Classic Meenakari Floral Chandbali Earrings',
    categorySlug: 'jewellery',
    subCategory: 'Earrings',
    basePrice: 799,
    discountPrice: 499,
    stock: 45,
    sizes: ['Standard (3 inch drop)'],
    tags: ['chandbali', 'meenakari', 'earrings', 'jhumka', 'imitation'],
    material: 'Alloy metal with enamel meenakari work and artificial pearl seed hangings',
    description: 'Crescent-shaped Chandbali earrings with colorful enamel Meenakari work, designed for festive and sangeet outfits.',
    images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Antique Gold Finish Dome Jhumka Earrings',
    categorySlug: 'jewellery',
    subCategory: 'Earrings',
    basePrice: 699,
    discountPrice: 399,
    stock: 50,
    sizes: ['Standard (2.5 inch drop)'],
    tags: ['jhumka', 'antique gold', 'earrings', 'everyday festive'],
    material: 'Lead-free brass alloy with antique oxidized gold plating and micro-bead ghungroos',
    description: 'Classic bell-shaped imitation dome jhumkas with delicate bead drops. Lightweight design prevents earlobe pull.',
    images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Set of 4 Textured Gold Plated Brass Bangles',
    categorySlug: 'jewellery',
    subCategory: 'Bangles',
    basePrice: 1199,
    discountPrice: 799,
    stock: 30,
    sizes: ['2.4', '2.6', '2.8'],
    tags: ['bangles', 'kadas', 'gold plated', 'brass', 'imitation'],
    material: 'High-finish brass with 1-micron yellow gold electroplating',
    description: 'Four-piece everyday wearable imitation bangle set with diamond-cut geometric faceting for subtle sparkle.',
    images: ['https://images.unsplash.com/photo-1611591475152-4735d387e949?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Kundan Embedded Openable Statement Kada',
    categorySlug: 'jewellery',
    subCategory: 'Bangles',
    basePrice: 999,
    discountPrice: 649,
    stock: 22,
    sizes: ['Free Size (Screw Openable)'],
    tags: ['kada', 'bangle', 'kundan', 'openable', 'jewellery'],
    material: 'Brass alloy with screw lock mechanism and synthetic white Kundan stones',
    description: 'Single statement openable bracelet kada with secure screw closure, wearable on either wrist alone or paired with glass bangles.',
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Adjustable Floral Polki Finger Ring',
    categorySlug: 'jewellery',
    subCategory: 'Rings',
    basePrice: 499,
    discountPrice: 299,
    stock: 60,
    sizes: ['Adjustable Band'],
    tags: ['finger ring', 'polki', 'adjustable', 'imitation'],
    material: 'Brass base with foil-backed faux Polki stone and flexible sizing band',
    description: 'Eye-catching round flower ring with mirror-finish synthetic polki stones. Easily adjustable for any finger size.',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Oxidized Silver Tone Tribal Statement Ring',
    categorySlug: 'jewellery',
    subCategory: 'Rings',
    basePrice: 399,
    discountPrice: 249,
    stock: 55,
    sizes: ['Adjustable Band'],
    tags: ['oxidized ring', 'boho', 'silver tone', 'budget'],
    material: 'Oxidized zinc alloy with antique blackened patina',
    description: 'Bohemian-style oversized oxidized ring with embossed paisley relief. Perfect complement to cotton kurtis.',
    images: ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Complete Bridal Imitation Jewellery Set with Maang Tikka',
    categorySlug: 'jewellery',
    subCategory: 'Jewellery Sets',
    basePrice: 2999,
    discountPrice: 1999,
    stock: 10,
    sizes: ['Full Set (Choker + Earrings + Maang Tikka)'],
    tags: ['bridal set', 'full set', 'maang tikka', 'imitation jewellery', 'wedding'],
    material: 'Brass alloy, synthetic rubies, green emerald beads, faux pearls, and gold-plated polish',
    description: 'Coordinated festive set including grand choker necklace, matching chandelier earrings, and a centered forehead maang tikka.',
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Pearl String Mala with Kundan Center Pendant',
    categorySlug: 'jewellery',
    subCategory: 'Necklaces',
    basePrice: 1099,
    discountPrice: 699,
    stock: 25,
    sizes: ['Medium Chain (18 inch)'],
    tags: ['pearl mala', 'pendant', 'subtle', 'imitation'],
    material: 'Multi-strand faux shell pearls with gold-electroplated alloy pendant',
    description: 'Three-layer artificial pearl string mala anchored by a circular floral Kundan medallion pendant.',
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Daily Wear Gold-Tone CZ Stud Earrings (Pack of 3)',
    categorySlug: 'jewellery',
    subCategory: 'Earrings',
    basePrice: 599,
    discountPrice: 349,
    stock: 40,
    sizes: ['Assorted Sizes (4mm, 6mm, 8mm)'],
    tags: ['studs', 'cz', 'daily wear', 'office', 'imitation'],
    material: 'Skin-friendly brass with cubic zirconia synthetic diamonds',
    description: 'Pack of three sparkling cubic zirconia everyday studs with secure push-back closures.',
    images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Festive Hathphool (Hand Harness) with Ring',
    categorySlug: 'jewellery',
    subCategory: 'Jewellery Sets',
    basePrice: 899,
    discountPrice: 549,
    stock: 20,
    sizes: ['Adjustable Wrist & Ring'],
    tags: ['hathphool', 'hand harness', 'sangeet', 'mehendi'],
    material: 'Gold-polished brass with tiny white faux pearls and linked finger ring',
    description: 'Traditional Indian hand ornament connecting an adjustable wrist bracelet to a delicate finger ring with pearl chains.',
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80']
  }
];

async function seed() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);

  // Fetch or create an admin user reference for createdBy
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.findOne({});
  }

  // 1. Seed or resolve categories
  console.log('Resolving demo categories...');
  const categoryMap = new Map();

  for (const cat of demoCategories) {
    let existing = await Category.findOne({ slug: cat.slug });
    if (!existing) {
      existing = await Category.create({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        isActive: true,
        displayOrder: cat.displayOrder
      });
      console.log(`  + Created category: ${cat.name} (${cat.slug})`);
    } else {
      console.log(`  ✓ Found category: ${cat.name} (${cat.slug})`);
    }
    categoryMap.set(cat.slug, existing._id);
  }

  // 2. Insert Demo Products with isDemo: true
  console.log('\nInserting 32 demo products (isDemo: true)...');
  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of demoProducts) {
    const categoryId = categoryMap.get(item.categorySlug);
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const productPayload = {
      name: item.name,
      slug,
      shortDescription: item.description,
      description: `${item.description} All clothing and jewellery orders are dispatched directly from our Surat hub. Features verified standard sizing and quality inspections.`,
      category: categoryId,
      tags: item.tags,
      isDemo: true, // Crucial field for admin tagging & automated purging
      status: PRODUCT_STATUS.PUBLISHED,
      isPublished: true,
      isFeatured: Math.random() > 0.6,
      isTrending: Math.random() > 0.5,
      isNewArrival: Math.random() > 0.7,
      pricing: {
        basePrice: item.basePrice,
        discountPrice: item.discountPrice,
        taxRate: 18 // 18% GST inclusive
      },
      inventory: {
        totalStock: item.stock,
        lowStockThreshold: 5
      },
      productFacts: {
        material: item.material,
        careInstructions: [
          'For clothing: Gentle machine wash or hand wash with mild liquid detergent. Dry in shade.',
          'For artificial jewellery: Store in airtight zip lock pouches away from water, perfume, and harsh chemicals. Wipe with soft cotton cloth after use.'
        ]
      },
      returnPolicy: {
        isReturnable: true,
        returnWindowDays: 7
      },
      images: item.images.map((imgUrl, idx) => ({
        url: imgUrl,
        publicId: `demo-${slug}-${idx}`,
        isPrimary: idx === 0,
        displayOrder: idx
      })),
      thumbnail: {
        url: item.images[0],
        publicId: `demo-${slug}-thumb`,
        isPrimary: true
      },
      variants: item.sizes.map((sz, idx) => ({
        size: sz,
        sku: `DEMO-${slug.slice(0, 10).toUpperCase()}-${idx + 1}`,
        price: item.discountPrice || item.basePrice,
        discount: item.discountPrice ? item.basePrice - item.discountPrice : 0,
        stock: Math.max(1, Math.floor(item.stock / item.sizes.length)),
        status: PRODUCT_STATUS.PUBLISHED
      })),
      createdBy: admin?._id
    };

    const existing = await Product.findOne({ slug });
    if (existing) {
      await Product.findByIdAndUpdate(existing._id, productPayload);
      updatedCount++;
    } else {
      await Product.create(productPayload);
      insertedCount++;
    }
  }

  console.log(`\n✅ Seeding complete:`);
  console.log(`   - Inserted new demo products: ${insertedCount}`);
  console.log(`   - Updated existing demo products: ${updatedCount}`);
  console.log(`   - Total demo products now in catalog: ${await Product.countDocuments({ isDemo: true })}`);

  await mongoose.disconnect();
  console.log('Database disconnected successfully.');
}

seed().catch(err => {
  console.error('Fatal error during demo seeding:', err);
  process.exit(1);
});
