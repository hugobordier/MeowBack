import { z } from 'zod';
import { statusDemande } from '@/types/enumStatusAmis';
const statusDemandeSchema = z.nativeEnum(statusDemande);

export const UserAmiscreateSchema = z.object({
    petsitter_id: z.string().uuid(),
    message: z.string().trim().max(255, "Le message ne peut pas dépasser 255 caractères").optional(),
}).strict();

export const UserAmispatchSchema = z.object({
    user_id: z.string().uuid().optional(),
    petsitter_id: z.string().uuid(),
    statusdemande: statusDemandeSchema.default(statusDemande.Pending),
    message: z.string().trim().max(255).optional(),
}).strict();

export const UserAmisResponseSchema = z.object({
    statusdemande: statusDemandeSchema.default(statusDemande.Pending),
    message: z.string().trim().max(255, "Le message ne peut pas dépasser 255 caractères").optional(),
}).strict();
