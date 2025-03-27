import { z } from 'zod';

export const userSchema = z
  .object({
    id: z.string().uuid().optional(),
    username: z
      .string()
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
      .max(25, "Le nom d'utilisateur ne peut pas dépasser 25 caractères"),
    lastName: z.string().min(1, 'Le nom de famille est requis'),
    firstName: z.string().min(1, 'Le prénom est requis'),
    email: z.string().email("L'adresse e-mail n'est pas valide"),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères'),
    age: z.number().int().min(0, "L'âge doit être un nombre positif"),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (AAAA-MM-JJ)'),
    city: z.string().optional(),
    country: z.string().optional(),
    gender: z
      .enum(['Male', 'Female', 'Other', 'Helicopter'], {
        errorMap: () => ({ message: 'Genre invalide' }),
      })
      .optional(),
    profilePicture: z
      .string()
      .url("L'URL de la photo de profil est invalide")
      .optional(),
    bio: z.string().optional(),
    bankInfo: z.string().optional(),
    rating: z
      .number()
      .min(0, 'La note minimale est 0')
      .max(5, 'La note maximale est 5')
      .optional(),
    phoneNumber: z
      .string()
      .regex(/^[0-9+()\s-]+$/i, 'Le numéro de téléphone est invalide'),
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
    username: z
      .string()
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
      .max(25, "Le nom d'utilisateur ne peut pas dépasser 25 caractères")
      .optional(),
    lastName: z.string().min(1, 'Le nom de famille est requis').optional(),
    firstName: z.string().min(1, 'Le prénom est requis').optional(),
    email: z.string().email("L'adresse e-mail n'est pas valide").optional(),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères')
      .optional(),
    age: z
      .number()
      .int()
      .min(0, "L'âge doit être un nombre positif")
      .optional(),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (AAAA-MM-JJ)')
      .optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    gender: z
      .enum(['Male', 'Female', 'Other', 'Helicopter'], {
        errorMap: () => ({ message: 'Genre invalide' }),
      })
      .optional(),
    bio: z.string().optional(),
    bankInfo: z.string().optional(),
    rating: z
      .number()
      .min(0, 'La note minimale est 0')
      .max(5, 'La note maximale est 5')
      .optional(),
    phoneNumber: z
      .string()
      .regex(/^[0-9+()\s-]+$/i, 'Le numéro de téléphone est invalide')
      .optional(),
    address: z.string().optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email("L'adresse e-mail est invalide"),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  })
  .strict();
