import { z } from 'zod';
import { statusDemande } from '@/types/enumStatusAmis';
const statusDemandeSchema = z.nativeEnum(statusDemande);

export const UserAmiscreateSchema = z.object({
    friend_id: z.string().uuid(),
}).strict();

export const UserAmispatchSchema = z.object({
    user_id: z.string().uuid().optional(),
    friend_id: z.string().uuid(),
    statusdemande: statusDemandeSchema.default(statusDemande.Pending),
}).strict();

export const UserAmisResponseSchema = z.object({
    statusdemande: statusDemandeSchema.default(statusDemande.Pending),
}).strict();
