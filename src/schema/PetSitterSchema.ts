import { z } from 'zod';

export const petSitterSchema = z.object({
  bio: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  hourly_rate: z.number().min(0),
  availability: z.any().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
