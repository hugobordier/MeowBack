import { z } from 'zod';

export const petSitterSchema = z.object({
  bio: z.string().optional(),
  experience: z
    .number()
    .int("L'expérience doit être un nombre entier")
    .min(0, "L'expérience ne peut pas être négative")
    .optional(),
  hourly_rate: z
    .number()
    .min(0, 'Le tarif horaire doit être un nombre positif'),
  availability: z.any().optional(),
  createdAt: z.date({ invalid_type_error: 'La date de création est invalide' }),
  updatedAt: z.date({
    invalid_type_error: 'La date de mise à jour est invalide',
  }),
});
