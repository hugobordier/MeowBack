import { z } from 'zod';

export const userSchema = z
  .object({
    id: z.string().uuid().optional(),
    username: z.string().min(3).max(25),
    lastName: z.string().min(1),
    firstName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    age: z.number().int().min(0),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    city: z.string().optional(),
    country: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other', 'Helicopter']).optional(),
    profilePicture: z.string().url().optional(),
    bio: z.string().optional(),
    bankInfo: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    phoneNumber: z.string().regex(/^[0-9+()\s-]+$/i, 'Invalid phone number'),
    address: z.string().optional(),
    identityDocument: z.string().optional(),
    isAdmin: z.boolean().default(false),
    resetcode: z.string().optional(),
    resetcodeexpires: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    id: z.string().uuid().optional(),
    username: z.string().min(3).max(25).optional(),
    lastName: z.string().min(1).optional(),
    firstName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).max(100).optional(),
    age: z.number().int().min(0).optional(),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
      .optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other', 'Helicopter']).optional(),
    bio: z.string().optional(),
    bankInfo: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    phoneNumber: z
      .string()
      .regex(/^[0-9+()\s-]+$/i, 'Invalid phone number')
      .optional(),
    address: z.string().optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string(),
    password: z.string().min(8).max(100),
  })
  .strict();
