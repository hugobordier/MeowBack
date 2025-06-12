import { z } from 'zod';

export const petSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(3, "Le nom de l'animal doit avoir au moins 3 caractères")
    .max(25, "Le nom de l'animal ne peut pas dépasser 25 caractères"),
  breed: z.string().min(1, "La race de l'animal est requise"),
  age: z
    .number()
    .int("L'âge doit être un nombre entier")
    .min(0, "L'âge ne peut pas être négatif"),
  species: z.string().min(1, "L'espèce de l'animal est requise"),
  allergy: z.string().max(100, "L'allergie ne peut pas dépasser 100 caractères").optional(),
  weight: z
    .number()
    .min(0, "Le poids doit être un nombre positif"),
  diet: z.string().optional(),
  description: z.string().optional(),
  photo_url: z.string().url("L'URL de la photo doit être valide").optional(),
  gender: z.enum(["Male", "Female", "hermaphrodite"]).refine(
    (value) => ["Male", "Female", "hermaphrodite"].includes(value),
    {
      message: "Le genre doit être 'Male', 'Female' ou 'hermaphrodite'",
    }
  ),
  
  neutered: z.boolean().optional(),
  color: z.string().optional(),
}).strict();

export const petPatchSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(3, "Le nom de l'animal doit avoir au moins 3 caractères")
    .max(25, "Le nom de l'animal ne peut pas dépasser 25 caractères")
    .optional(),
  breed: z.string().trim().min(1, "La race de l'animal est requise").optional(),
  age: z
    .number()
    .int("L'âge doit être un nombre entier")
    .min(0, "L'âge ne peut pas être négatif")
    .max(100, "L'âge semble irréaliste")
    .optional(),
  species: z.string().trim().min(1, "L'espèce de l'animal est requise").optional(),
  allergy: z
    .string()
    .trim()
    .max(100, "L'allergie ne peut pas dépasser 100 caractères")
    .optional(),
  weight: z
    .number()
    .min(0.1, "Le poids doit être supérieur à 0")
    .max(200, "Le poids semble irréaliste")
    .optional(),
  diet: z.string().trim().optional(),
  description: z
    .string()
    .trim()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional(),
  photo_url: z.string().url("L'URL de la photo doit être valide").optional(),
  gender: z.enum(["Male", "Female", "Hermaphrodite"]).optional(),
  neutered: z.boolean().optional(),
  color: z.string().trim().max(50, "La couleur ne peut pas dépasser 50 caractères").optional(),
}).strict();
