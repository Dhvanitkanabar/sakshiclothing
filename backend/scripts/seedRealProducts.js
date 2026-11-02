import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.model.js';
import Category from '../src/models/Category.model.js';
import User from '../src/models/User.model.js';

dotenv.config();

const realCategories = [
  {
    name: 'Women',
    slug: 'women',
    description: 'Haute couture bridal lehengas, handloom sarees, and couture anarkalis.',
    isActive: true,
    displayOrder: 1
  },
  {
    name: 'Men',
    slug: 'men',
    description: 'Imperial brocade sherwanis, Jodhpur bandhgalas, and handspun silk kurtas.',
    isActive: true,
    displayOrder: 2
  },
  {
    name: 'Bridal',
    slug: 'bridal',
    description: 'The Royal Bridal Trousseau 2026. Handcrafted zardozi, dabka, and gossamer veils.',
    isActive: true,
    displayOrder: 3
  },
  {
    name: 'Jewellery',
    slug: 'jewellery',
    description: 'Heirloom Jadau, Polki, and Kundan bridal jewelry suites.',
    isActive: true,
    displayOrder: 4
  }
];

const realProductsData = [
  {
    id: 'sakshi-01',
    name: 'The Noor-e-Jahan Scalloped Raw Silk Bridal Lehenga',
    slug: 'noor-e-jahan-scalloped-raw-silk-bridal-lehenga',
    categoryName: 'Women',
    subCategory: 'Bridal Lehengas',
    price: 145000,
    discountPrice: 125000,
    sizes: ['XS', 'S', 'M', 'L', 'Bespoke'],
    images: [
      'https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop'
    ],
    shortDescription: 'Handcrafted mulberry raw silk bridal lehenga with 18th-century Rajputana zardozi and scalloped organza veil.',
    description: 'Handcrafted over 240 artisan hours in our Jaipur atelier, this heirloom lehenga features pure mulberry raw silk, real gold-finished dabka wirework, micro-cut bugle beads, and a scalloped tissue organza dupatta.',
    featured: true,
    rating: 5.0,
    tags: ['bridal', 'lehenga', 'couture', 'zardozi', 'silk']
  },
  {
    id: 'sakshi-02',
    name: 'The Maharani Katan Silk Kadwa Banarasi Saree',
    slug: 'maharani-katan-silk-kadwa-banarasi-saree',
    categoryName: 'Women',
    subCategory: 'Heritage Sarees',
    price: 48500,
    discountPrice: 42000,
    sizes: ['Free Size (6.5m with blouse)'],
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=1200&auto=format&fit=crop'
    ],
    shortDescription: 'Varanasi pit-loom handloom saree woven with pure katan silk and 24k metallic gold zari.',
    description: 'Woven across 140 uninterrupted hours by master weavers on generational pit looms in Varanasi. Features pure mulberry katan silk and an intricate floral kadwa jaal with solid gold-toned pallu.',
    featured: true,
    rating: 5.0,
    tags: ['saree', 'banarasi', 'kadwa', 'heritage', 'silk']
  },
  {
    id: 'sakshi-03',
    name: 'The Jodhpur Imperial Brocade Royal Sherwani',
    slug: 'jodhpur-imperial-brocade-royal-sherwani',
    categoryName: 'Men',
    subCategory: 'Heritage Sherwanis',
    price: 72000,
    discountPrice: 65000,
    sizes: ['38', '40', '42', '44', 'Bespoke'],
    images: [
      'https://images.unsplash.com/photo-1783188223691-8a233ee51cd8?q=80&w=1200&auto=format&fit=crop',
      'https://plus.unsplash.com/premium_photo-1682090784102-b5e9fc3fb3bb?q=80&w=1200&auto=format&fit=crop'
    ],
    shortDescription: 'Ivory handloom silk brocade sherwani with custom engraved royal crest buttons and structured shoulder canvas.',
    description: 'Sculpted with traditional horsehair canvas interlining for a razor-sharp masculine silhouette. Features bespoke ivory and champagne gold silk brocade with hand-engraved brass crest buttons.',
    featured: true,
    rating: 5.0,
    tags: ['sherwani', 'groom', 'menswear', 'royal', 'brocade']
  },
  {
    id: 'sakshi-04',
    name: 'The Mehrangarh Textured Silk Bandhgala Jacket',
    slug: 'mehrangarh-textured-silk-bandhgala-jacket',
    categoryName: 'Men',
    subCategory: 'Suits & Jackets',
    price: 34000,
    discountPrice: 29500,
    sizes: ['38', '40', '42', '44'],
    images: [
      'https://plus.unsplash.com/premium_photo-1682090774051-77cdd6b1e7cd?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop'
    ],
    shortDescription: 'Midnight obsidian navy silk-wool weave with asymmetric high mandarin collar.',
    description: 'Structured royal navy silk-wool blend bandhgala jacket with high mandarin collar, angled breast welt pocket, and matte horn crest buttons. Perfect for black-tie sangeet evenings.',
    featured: true,
    rating: 4.9,
    tags: ['bandhgala', 'menswear', 'formal', 'jacket', 'navy']
  },
  {
    id: 'sakshi-05',
    name: 'The Chandni Tissue Organza Hand-Embroidered Anarkali',
    slug: 'chandni-tissue-organza-anarkali',
    categoryName: 'Women',
    subCategory: 'Couture Anarkalis',
    price: 54000,
    discountPrice: 48000,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=1200&auto=format&fit=crop'
    ],
    shortDescription: 'Blush champagne tissue organza with delicate French knots and gossamer dupatta.',
    description: 'Ethereal blush champagne tissue organza featuring a 56-kalidar flowing flare, micro-sequin scatter, hand-stitched gota patti edging, and a featherweight scalloped dupatta.',
    featured: true,
    rating: 4.9,
    tags: ['anarkali', 'couture', 'organza', 'festive', 'women']
  },
  {
    id: 'sakshi-06',
    name: 'The Rooh Asymmetric Handloom Khadi Silk Kurta',
    slug: 'rooh-asymmetric-handloom-khadi-silk-kurta',
    categoryName: 'Men',
    subCategory: 'Modern Kurtas',
    price: 16800,
    discountPrice: 14500,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1783188223691-8a233ee51cd8?q=80&w=1200&auto=format&fit=crop'
    ],
    shortDescription: 'Organic handspun khadi silk with asymmetric Angrakha crossover and mother-of-pearl buttons.',
    description: 'Tailored from 100% organic handspun khadi silk in a deep slate olive hue. Features an architectural asymmetric Angrakha neckline, concealed placket, and tonal resham embroidery.',
    featured: false,
    rating: 4.8,
    tags: ['kurta', 'khadi', 'menswear', 'minimalist', 'handspun']
  },
  {
    id: 'sakshi-07',
    name: 'The Gulmohar Resham Appliqué Festive Ensemble',
    slug: 'gulmohar-resham-applique-festive-ensemble',
    categoryName: 'Women',
    subCategory: 'Artisanal Sets',
    price: 28500,
    discountPrice: 24000,
    sizes: ['XS', 'S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1651132133386-a64fbf794081?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop'
    ],
    shortDescription: 'Blush crimson silk organza with hand-appliquéd lotus petals and tailored trousers.',
    description: 'Gossamer tissue organza in blush crimson with delicate hand-appliquéd lotus petals, genuine dabka wiring, and an intricately beaded choli blouse.',
    featured: true,
    rating: 5.0,
    tags: ['festive', 'applique', 'organza', 'crimson', 'couture']
  },
  {
    id: 'sakshi-08',
    name: 'The Darbar Hand-Woven Chanderi Angrakha Gown',
    slug: 'darbar-hand-woven-chanderi-angrakha-gown',
    categoryName: 'Women',
    subCategory: 'Artisanal Sets',
    price: 38000,
    discountPrice: 32500,
    sizes: ['XS', 'S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop'
    ],
    shortDescription: 'Emerald green pure Chanderi silk with hand block printed floral jaal and artisanal tassels.',
    description: 'Ethereal emerald Chanderi silk with hand block printed gold floral jaal, pure silver zari borders, and delicate dori ties tipped with handcrafted fabric tassels.',
    featured: true,
    rating: 4.9,
    tags: ['chanderi', 'angrakha', 'emerald', 'handloom', 'women']
  },
  {
    id: 'sakshi-09',
    name: 'The Kohinoor Polki Jadau Choker & Earring Suite',
    slug: 'kohinoor-polki-jadau-choker-earring-suite',
    categoryName: 'Jewellery',
    subCategory: 'Heritage Jewels',
    price: 65000,
    discountPrice: 58000,
    sizes: ['One Size Adjustable'],
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop'
    ],
    shortDescription: 'Handcrafted 22k gold-plated silver setting with uncut polki stones and Zambian emerald beads.',
    description: 'Artfully set by traditional Rajasthani jadau artisans. Uncut polki stones held in lac setting, accented with natural Zambian emerald beads and cultured South Sea pearl clusters.',
    featured: true,
    rating: 5.0,
    tags: ['jewellery', 'polki', 'jadau', 'choker', 'bridal']
  },
  {
    id: 'sakshi-10',
    name: 'The Raas Gota Patti Flared Sharara Ensemble',
    slug: 'raas-gota-patti-flared-sharara-ensemble',
    categoryName: 'Women',
    subCategory: 'Bridal Lehengas',
    price: 42000,
    discountPrice: 36000,
    sizes: ['XS', 'S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=1200&auto=format&fit=crop'
    ],
    shortDescription: 'Mustard ochre georgette silk with traditional Jaipur gota patti geometry and bandhani dupatta.',
    description: 'Vibrant mustard ochre pure georgette silk featuring intricate marodi and authentic Jaipur gota patti geometric borders. Paired with a hand-tied bandhani silk dupatta.',
    featured: false,
    rating: 4.9,
    tags: ['sharara', 'gota-patti', 'festive', 'bandhani', 'women']
  },
  {
    id: 'sakshi-11',
    name: 'The Regent Obsidian Velvet Tuxedo Bandhgala',
    slug: 'regent-obsidian-velvet-tuxedo-bandhgala',
    categoryName: 'Men',
    subCategory: 'Suits & Jackets',
    price: 58000,
    discountPrice: 49000,
    sizes: ['38', '40', '42', '44'],
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
      'https://plus.unsplash.com/premium_photo-1682090774051-77cdd6b1e7cd?q=80&w=1200&auto=format&fit=crop'
    ],
    shortDescription: 'Deep obsidian micro-velvet with silk satin piping and hand-embroidered resham cuffs.',
    description: 'A modern black-tie masterpiece. Rich obsidian micro-velvet with pure mulberry silk satin lapel piping, sculptured chest canvas, and subtle tone-on-tone matte resham cuffs.',
    featured: true,
    rating: 5.0,
    tags: ['velvet', 'tuxedo', 'bandhgala', 'menswear', 'black-tie']
  },
  {
    id: 'sakshi-12',
    name: 'The Sitara Sheer Organza Cape Lehenga',
    slug: 'sitara-sheer-organza-cape-lehenga',
    categoryName: 'Women',
    subCategory: 'Bridal Lehengas',
    price: 88000,
    discountPrice: 78000,
    sizes: ['XS', 'S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1651132133386-a64fbf794081?q=80&w=1200&auto=format&fit=crop'
    ],
    shortDescription: 'Dusty lavender tissue organza with 3D floral petals and crystal-embellished cape.',
    description: 'Contemporary cocktail bridal lehenga in dusty lavender tissue organza. Features 3D laser-cut petals, hand-embroidered Swarovski crystals, and a floor-length sheer dramatic cape.',
    featured: true,
    rating: 5.0,
    tags: ['cape-lehenga', 'contemporary', 'lavender', 'crystals', 'bridal']
  }
];

const seedRealData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sakshiclothing_staging';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding real Sakshi Clothing catalog...');

    const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne({});
    const adminId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

    // 1. Upsert Categories
    const categoryMap = {};
    for (const catData of realCategories) {
      let cat = await Category.findOne({ slug: catData.slug });
      if (!cat) {
        cat = await Category.create(catData);
      } else {
        cat.name = catData.name;
        cat.description = catData.description;
        cat.isActive = true;
        await cat.save();
      }
      categoryMap[catData.name] = cat._id;
    }

    // 2. Remove outdated mock/test products
    await Product.deleteMany({});
    console.log('Cleared old products.');

    // 3. Insert Real Products
    for (const item of realProductsData) {
      const categoryId = categoryMap[item.categoryName] || categoryMap['Women'];
      
      const variants = item.sizes.map((s, idx) => ({
        size: s,
        sku: `${item.slug.slice(0, 8).toUpperCase()}-${s}`,
        price: item.discountPrice || item.price,
        discount: item.discountPrice ? item.price - item.discountPrice : 0,
        stock: 12,
        status: 'published'
      }));

      const imagesArray = item.images.map((url, idx) => ({
        url,
        publicId: `sakshi-real-${item.id}-${idx}`,
        alt: `${item.name} View ${idx + 1}`,
        isPrimary: idx === 0,
        displayOrder: idx
      }));

      await Product.create({
        name: item.name,
        slug: item.slug,
        shortDescription: item.shortDescription,
        description: item.description,
        category: categoryId,
        tags: item.tags,
        images: imagesArray,
        thumbnail: imagesArray[0],
        pricing: {
          basePrice: item.price,
          discountPrice: item.discountPrice,
          taxRate: 0
        },
        inventory: {
          totalStock: variants.reduce((acc, v) => acc + v.stock, 0),
          lowStockThreshold: 3
        },
        variants,
        status: 'published',
        isFeatured: item.featured,
        isTrending: true,
        isBestSeller: item.price > 40000,
        isNewArrival: true,
        isPublished: true,
        createdBy: adminId
      });
    }

    console.log(`Successfully seeded ${realProductsData.length} authentic Sakshi Clothing products into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed real data:', err);
    process.exit(1);
  }
};

seedRealData();
