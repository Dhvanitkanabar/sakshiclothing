import { z } from 'zod';

export const bannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  image: z.object({
    url: z.string().url(),
    publicId: z.string().optional()
  }),
  mobileImage: z.object({
    url: z.string().url(),
    publicId: z.string().optional()
  }).optional(),
  redirectUrl: z.string().optional(),
  displayOrder: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  homepageSection: z.enum(['hero', 'trending', 'featured', 'bottom', 'popup']).optional(),
  isActive: z.boolean().optional()
});

export const updateBannerSchema = bannerSchema.partial();

export const announcementSchema = z.object({
  announcementBar: z.array(z.object({
    text: z.string(),
    link: z.string().optional(),
    isActive: z.boolean().optional()
  }))
});
