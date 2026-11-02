import { z } from 'zod';
import { PRODUCT_STATUS } from '../constants/index.js';

const imageSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().optional(),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional(),
  displayOrder: z.number().optional()
});

const variantSchema = z.object({
  color: z.string().optional().or(z.literal('')),
  size: z.string().optional().or(z.literal('')),
  sku: z.string().optional().or(z.literal('')),
  barcode: z.string().optional().or(z.literal('')),
  price: z.number().min(0),
  discount: z.number().min(0).optional(),
  stock: z.number().min(0),
  weight: z.number().optional()
});

export const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(1).optional().or(z.literal('')),
  shortDescription: z.string().max(300).optional(),
  description: z.string().min(10),
  category: z.string(), // ObjectId string
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(imageSchema).optional(),
  thumbnail: imageSchema.optional(),
  pricing: z.object({
    basePrice: z.number().min(0),
    discountPrice: z.number().min(0).optional()
  }),
  inventory: z.object({
    lowStockThreshold: z.number().optional()
  }).optional(),
  variants: z.array(variantSchema).optional(),
  status: z.enum([
    PRODUCT_STATUS.DRAFT, 
    PRODUCT_STATUS.PUBLISHED, 
    PRODUCT_STATUS.ARCHIVED, 
    PRODUCT_STATUS.DELETED, 
    PRODUCT_STATUS.OUT_OF_STOCK
  ]).optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isNewArrival: z.boolean().optional()
});

export const updateProductSchema = createProductSchema.partial();
