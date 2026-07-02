import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string()
    .min(10, 'Phone must be at least 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  houseNumber: z.string().min(1, 'House number is required'),
  street: z.string().min(3, 'Street is required'),
  area: z.string().min(2, 'Area is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().default('India'),
  pincode: z.string()
    .length(6, 'Pincode must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Pincode must be numeric'),
  landmark: z.string().optional(),
  addressType: z.enum(['Home', 'Work', 'Other']).default('Home'),
  isDefault: z.boolean().optional()
});

export const updateAddressSchema = addressSchema.partial();
