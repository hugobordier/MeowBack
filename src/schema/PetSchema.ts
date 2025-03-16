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
  allergy: z.string().min(2, "L'allergie doit contenir au moins 2 caractères").max(100, "L'allergie ne peut pas dépasser 100 caractères").optional(),
  weight: z
    .number()
    .min(0, "Le poids doit être un nombre positif"),
  diet: z.string().min(1, "Le régime alimentaire est requis"),
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
  user_id: z.string().uuid("L'ID utilisateur doit être un UUID valide"),
});
