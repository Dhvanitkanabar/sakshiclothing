import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  logo: z.object({
    url: z.string().url().optional(),
    publicId: z.string().optional()
  }).optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional()
});

export const updateBrandSchema = createBrandSchema.partial();
