import { z } from 'zod';

export const petImageSchema = z.object({
  id: z.string().uuid().optional(),
  pet_id : z.string().uuid(),
  url_image: z.string().min(1, "L'url de l'image est requise"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();

export const petImagePatchSchema = z.object({
  id: z.string().uuid().min(1, "L'id de l'image est requis").optional(),
  pet_id : z.string().uuid().min(1, "L'id de l'animal est requis").optional(),
  url_image: z.string().min(1, "L'url de l'image est requise"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();
