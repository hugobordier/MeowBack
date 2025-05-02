import { z } from 'zod';

export const petImageSchema = z.object({
  id: z.string().uuid().optional(),
  url_image: z.string().min(1, "L'url de l'image est requise"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();

export const petImagePatchSchema = z.object({
  id: z.string().uuid().min(1, "L'id de l'image remplacée est requis"),
  //pet_id : z.string().uuid().min(1, "L'url du pet est requise"),
  url_image: z.string().min(1, "L'url de l'image est requise"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();
