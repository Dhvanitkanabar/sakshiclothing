import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  slug: z.string().min(1).optional(),
  parentCategory: z.string().nullable().optional(), // ObjectId or null
  parent: z.string().nullable().optional(), // Alias used by some form submissions
  description: z.string().optional(),
  image: z.any().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
  seo: z.any().optional()
});

export const updateCategorySchema = createCategorySchema.partial();

