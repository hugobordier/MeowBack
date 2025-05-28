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

    available_days: z.array(z.enum(daysOfWeek)).optional(),
    available_slots: z.array(z.enum(availableTimeSlots)).optional(),

    animal_types: z.array(z.enum(animalTypesEnum)).optional(),
    services: z.array(z.enum(availableServices)).optional(),

    latitude: z
      .number()
      .min(-90, 'Latitude doit être >= -90')
      .max(90, 'Latitude doit être <= 90')
      .nullable()
      .optional(),

    longitude: z
      .number()
      .min(-180, 'Longitude doit être >= -180')
      .max(180, 'Longitude doit être <= 180')
      .nullable()
      .optional(),
  })
  .strict();

export const getPetSittersQuerySchema = z.strictObject({
  page: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) =>
      val === null || val === undefined ? undefined : Number(val)
    )
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'Page doit être un nombre',
    }),

  limit: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) =>
      val === null || val === undefined ? undefined : Number(val)
    )
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'Limit doit être un nombre',
    }),

  search: z.string().nullable().optional(),

  minRate: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) =>
      val === null || val === undefined ? undefined : Number(val)
    )
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'minRate doit être un nombre',
    }),

  maxRate: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) =>
      val === null || val === undefined ? undefined : Number(val)
    )
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'maxRate doit être un nombre',
    }),

  minExperience: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) =>
      val === null || val === undefined ? undefined : Number(val)
    )
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'minExperience doit être un nombre',
    }),

  availability_days: z
    .union([
      z.string(),
      z.array(
        z.enum([
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ])
      ),
    ])
    .nullable()
    .optional()
    .transform((val) => {
      if (val === null) return undefined;
      return typeof val === 'string' ? [val] : val;
    }),

  availability_intervals: z
    .union([
      z.string(),
      z.array(z.enum(['Matin', 'Après-midi', 'Soir', 'Nuit'])),
    ])
    .nullable()
    .optional()
    .transform((val) => {
      if (val === null) return undefined;
      return typeof val === 'string' ? [val] : val;
    }),

  animal_types: z
    .union([
      z.string(),
      z.array(
        z.enum([
          'Chat',
          'Chien',
          'Oiseau',
          'Rongeur',
          'Reptile',
          'Poisson',
          'Furet',
          'Cheval',
          'Autre',
        ])
      ),
    ])
    .nullable()
    .optional()
    .transform((val) => {
      if (val === null) return undefined;
      return typeof val === 'string' ? [val] : val;
    }),

  services: z
    .union([
      z.string(),
      z.array(
        z.enum([
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
        ])
      ),
    ])
    .nullable()
    .optional()
    .transform((val) => {
      if (val === null) return undefined;
      return typeof val === 'string' ? [val] : val;
    }),

  latitude: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) =>
      val === undefined || val === null ? undefined : Number(val)
    )
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'Latitude doit être un nombre',
    }),

  longitude: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) =>
      val === undefined || val === null ? undefined : Number(val)
    )
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'Longitude doit être un nombre',
    }),

  radius: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) =>
      val === undefined || val === null ? undefined : Number(val)
    )
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'Radius doit être un nombre',
    }),
});
