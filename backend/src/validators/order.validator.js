import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  variantId: z.string().min(1, 'Variant ID required'),
  quantity: z.number().int().positive('Quantity must be a positive integer')
});

export const checkoutSchema = z.object({
  shippingAddressId: z.string().min(1, 'Shipping address is required'),
  isFromCart: z.boolean().optional(),
  items: z.array(orderItemSchema).optional(),
  couponCode: z.string().optional()
});

export const buyNowSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  variantId: z.string().min(1, 'Variant ID required'),
  quantity: z.number().int().positive().default(1),
  shippingAddressId: z.string().min(1, 'Shipping address is required')
});

export const updateStatusSchema = z.object({
  status: z.enum([
    'pending', 'processing', 'packed', 'shipped', 'outForDelivery',
    'delivered', 'cancelled', 'returned', 'refunded'
  ]),
  note: z.string().optional()
});

export const updateTrackingSchema = z.object({
  tracking: z.object({
    courierName: z.string().optional(),
    trackingNumber: z.string().optional(),
    trackingUrl: z.string().url().optional()
  })
});
