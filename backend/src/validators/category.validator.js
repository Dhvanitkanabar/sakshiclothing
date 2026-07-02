import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2),
  parentCategory: z.string().nullable().optional(), // ObjectId or null
  description: z.string().optional(),
  image: z.object({
    url: z.string().url().optional(),
    publicId: z.string().optional()
  }).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional()
  }).optional()
});

export const updateCategorySchema = createCategorySchema.partial();
