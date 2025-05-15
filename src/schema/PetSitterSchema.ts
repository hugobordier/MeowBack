import { z } from 'zod';

export const availableTimeSlots = [
  'Matin',
  'Après-midi',
  'Soir',
  'Nuit',
] as const;

export const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const animalTypesEnum = [
  'Chat',
  'Chien',
  'Oiseau',
  'Rongeur',
  'Reptile',
  'Poisson',
  'Furet',
  'Cheval',
  'Autre',
] as const;

export const availableServices = [
  'Promenade',
  'Alimentation',
  'Jeux',
  'Soins',
  'Toilettage',
  'Dressage',
  'Garderie',
  'Médication',
  'Nettoyage',
  'Transport',
] as const;

// Schema pour availability
const availabilitySchema = z
  .array(
    z.object({
      day: z.enum(daysOfWeek),
      intervals: z.array(z.enum(availableTimeSlots)),
    })
  )
  .optional();

export const petSitterSchema = z
  .object({
    bio: z.string().optional(),
    experience: z
      .number()
      .int("L'expérience doit être un nombre entier")
      .min(0, "L'expérience ne peut pas être négative")
      .optional(),
    hourly_rate: z
      .number()
      .min(0, 'Le tarif horaire doit être un nombre positif'),

    availability: availabilitySchema,

    animal_types: z.array(z.enum(animalTypesEnum)).optional(),
    services: z.array(z.enum(availableServices)).optional(),
  })
  .strict();
