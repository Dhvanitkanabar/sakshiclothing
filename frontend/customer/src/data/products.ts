import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'sakshi-01',
    name: 'The Noor-e-Jahan Scalloped Raw Silk Bridal Lehenga',
    price: 145000,
    category: 'Women',
    subCategory: 'Bridal Lehengas',
    sizes: ['XS', 'S', 'M', 'L', 'Bespoke'],
    image: 'https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Handcrafted over 240 artisan hours in our Jaipur atelier, this heirloom bridal lehenga features pure mulberry raw silk, real gold-finished dabka wirework, micro-cut bugle beads, and a scalloped tissue organza dupatta.',
    featured: true,
    rating: 5.0
  },
  {
    id: 'sakshi-02',
    name: 'The Maharani Katan Silk Kadwa Banarasi Saree',
    price: 48500,
    category: 'Women',
    subCategory: 'Heritage Sarees',
    sizes: ['Free Size (6.5m with blouse)'],
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Woven across 140 uninterrupted hours by master weavers on generational pit looms in Varanasi. Features pure mulberry katan silk and an intricate floral kadwa jaal with solid gold-toned pallu.',
    featured: true,
    rating: 5.0
  },
  {
    id: 'sakshi-03',
    name: 'The Jodhpur Imperial Brocade Royal Sherwani',
    price: 72000,
    category: 'Men',
    subCategory: 'Heritage Sherwanis',
    sizes: ['38', '40', '42', '44', 'Bespoke'],
    image: 'https://images.unsplash.com/photo-1783188223691-8a233ee51cd8?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1783188223691-8a233ee51cd8?q=80&w=1200&auto=format&fit=crop',
      'https://plus.unsplash.com/premium_photo-1682090784102-b5e9fc3fb3bb?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Sculpted with traditional horsehair canvas interlining for a razor-sharp masculine silhouette. Features bespoke ivory and champagne gold silk brocade with hand-engraved brass crest buttons.',
    featured: true,
    rating: 5.0
  },
  {
    id: 'sakshi-04',
    name: 'The Mehrangarh Textured Silk Bandhgala Jacket',
    price: 34000,
    category: 'Men',
    subCategory: 'Suits & Jackets',
    sizes: ['38', '40', '42', '44'],
    image: 'https://plus.unsplash.com/premium_photo-1682090774051-77cdd6b1e7cd?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://plus.unsplash.com/premium_photo-1682090774051-77cdd6b1e7cd?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Structured royal navy silk-wool blend bandhgala jacket with high mandarin collar, angled breast welt pocket, and matte horn crest buttons. Perfect for black-tie sangeet evenings.',
    featured: true,
    rating: 4.9
  },
  {
    id: 'sakshi-05',
    name: 'The Chandni Tissue Organza Hand-Embroidered Anarkali',
    price: 54000,
    category: 'Women',
    subCategory: 'Couture Anarkalis',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Ethereal blush champagne tissue organza featuring a 56-kalidar flowing flare, micro-sequin scatter, hand-stitched gota patti edging, and a featherweight scalloped dupatta.',
    featured: true,
    rating: 4.9
  },
  {
    id: 'sakshi-06',
    name: 'The Rooh Asymmetric Handloom Khadi Silk Kurta',
    price: 16800,
    category: 'Men',
    subCategory: 'Modern Kurtas',
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1783188223691-8a233ee51cd8?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Tailored from 100% organic handspun khadi silk in a deep slate olive hue. Features an architectural asymmetric Angrakha neckline, concealed placket, and tonal resham embroidery.',
    featured: false,
    rating: 4.8
  },
  {
    id: 'sakshi-07',
    name: 'The Gulmohar Resham Appliqué Festive Ensemble',
    price: 28500,
    category: 'Women',
    subCategory: 'Artisanal Sets',
    sizes: ['XS', 'S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1651132133386-a64fbf794081?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1651132133386-a64fbf794081?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Gossamer tissue organza in blush crimson with delicate hand-appliquéd lotus petals, genuine dabka wiring, and an intricately beaded choli blouse.',
    featured: true,
    rating: 5.0
  },
  {
    id: 'sakshi-08',
    name: 'The Darbar Hand-Woven Chanderi Angrakha Gown',
    price: 38000,
    category: 'Women',
    subCategory: 'Artisanal Sets',
    sizes: ['XS', 'S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Ethereal emerald Chanderi silk with hand block printed gold floral jaal, pure silver zari borders, and delicate dori ties tipped with handcrafted fabric tassels.',
    featured: true,
    rating: 4.9
  },
  {
    id: 'sakshi-09',
    name: 'The Kohinoor Polki Jadau Choker & Earring Suite',
    price: 65000,
    category: 'Jewellery',
    subCategory: 'Heritage Jewels',
    sizes: ['One Size Adjustable'],
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Artfully set by traditional Rajasthani jadau artisans. Uncut polki stones held in lac setting, accented with natural Zambian emerald beads and cultured South Sea pearl clusters.',
    featured: true,
    rating: 5.0
  },
  {
    id: 'sakshi-10',
    name: 'The Raas Gota Patti Flared Sharara Ensemble',
    price: 42000,
    category: 'Women',
    subCategory: 'Bridal Lehengas',
    sizes: ['XS', 'S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1651132164857-b61aa4cf7472?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Vibrant mustard ochre pure georgette silk featuring intricate marodi and authentic Jaipur gota patti geometric borders. Paired with a hand-tied bandhani silk dupatta.',
    featured: false,
    rating: 4.9
  },
  {
    id: 'sakshi-11',
    name: 'The Regent Obsidian Velvet Tuxedo Bandhgala',
    price: 58000,
    category: 'Men',
    subCategory: 'Suits & Jackets',
    sizes: ['38', '40', '42', '44'],
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
      'https://plus.unsplash.com/premium_photo-1682090774051-77cdd6b1e7cd?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'A modern black-tie masterpiece. Rich obsidian micro-velvet with pure mulberry silk satin lapel piping, sculptured chest canvas, and subtle tone-on-tone matte resham cuffs.',
    featured: true,
    rating: 5.0
  },
  {
    id: 'sakshi-12',
    name: 'The Sitara Sheer Organza Cape Lehenga',
    price: 88000,
    category: 'Women',
    subCategory: 'Bridal Lehengas',
    sizes: ['XS', 'S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1651132133386-a64fbf794081?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Contemporary cocktail bridal lehenga in dusty lavender tissue organza. Features 3D laser-cut petals, hand-embroidered Swarovski crystals, and a floor-length sheer dramatic cape.',
    featured: true,
    rating: 5.0
  }
];

// Alias for zero-breaking backwards compatibility
export const MOCK_PRODUCTS = PRODUCTS;
