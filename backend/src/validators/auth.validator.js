import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().regex(passwordRegex, 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character'),
  phone: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().regex(passwordRegex, 'New password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character')
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});
