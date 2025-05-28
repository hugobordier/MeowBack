import PetsitterController from '../controllers/PetsitterController';
import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import { authenticate } from '../middleware/authMiddleware';
import petSitterAuth from '@/middleware/petSitterAuth';
import { validateQuery, validateSchema } from '@/middleware/validateSchema';
import {
  animalTypesEnum,
  availableServices,
  getPetSittersQuerySchema,
  petSitterSchema,
} from '@/schema/PetSitterSchema';

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route('/').get(
  {
    description: 'Fetch data for Petsitter with optional filtering',
    summary: 'Retrieve Petsitter data',
    tags: ['Petsitter'],
    security: true,
    parameters: [
      {
        name: 'page',
        in: 'query',
        required: false,
        description: 'Numéro de page',
        schema: {
          type: 'integer',
          default: 1,
        },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        description: "Nombre d'éléments par page",
        schema: {
          type: 'integer',
          default: 10,
        },
      },
      {
        name: 'search',
        in: 'query',
        required: false,
        description:
          'Terme de recherche (recherche dans username, email, firstName, lastName)',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'minRate',
        in: 'query',
        required: false,
        description: 'Minimum hourly rate filter',
        schema: {
          type: 'number',
          example: 10,
        },
      },
      {
        name: 'maxRate',
        in: 'query',
        required: false,
        description: 'Maximum hourly rate filter',
        schema: {
          type: 'number',
          example: 50,
        },
      },
      {
        name: 'minExperience',
        in: 'query',
        required: false,
        description: 'Minimum years of experience filter',
        schema: {
          type: 'number',
          example: 2,
        },
      },
      {
        name: 'availability_days',
        in: 'query',
        required: false,
        description: 'Filtrer par un ou plusieurs jours de disponibilité',
        schema: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
          },
          example: ['Saturday', 'Sunday'],
        },
      },
      {
        name: 'availability_intervals',
        in: 'query',
        required: false,
        description: 'Filtrer par un ou plusieurs créneaux de disponibilité',
        schema: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['Matin', 'Après-midi', 'Soir', 'Nuit'],
          },
          example: ['Matin', 'Soir'],
        },
      },
      {
        name: 'animal_types',
        in: 'query',
        required: false,
        description: 'Filtrer par types d’animaux gardés (peut être multiple)',
        schema: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'Chat',
              'Chien',
              'Oiseau',
              'Rongeur',
              'Reptile',
              'Poisson',
              'Furet',
              'Cheval',
              'Autre',
            ],
          },
          example: ['Chien', 'Chat'],
        },
      },
      {
        name: 'services',
        in: 'query',
        required: false,
        description: 'Filtrer par services proposés (peut être multiple)',
        schema: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
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
            ],
          },
          example: ['Promenade', 'Toilettage'],
        },
      },
      {
        name: 'latitude',
        in: 'query',
        required: false,
        description: 'Latitude pour filtrage par proximité',
        schema: {
          type: 'number',
          example: 48.8566,
        },
      },
      {
        name: 'longitude',
        in: 'query',
        required: false,
        description: 'Longitude pour filtrage par proximité',
        schema: {
          type: 'number',
          example: 2.3522,
        },
      },
      {
        name: 'radius',
        in: 'query',
        required: false,
        description: 'Rayon de recherche en kilomètres autour des coordonnées',
        schema: {
          type: 'number',
          example: 10,
        },
      },
    ],
    responses: {
      '200': {
        description: 'Petsitter data retrieved successfully',
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Données récupérées avec succès',
            },
            count: {
              type: 'number',
              example: 2,
            },
            petsitters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  user_id: {
                    type: 'string',
                    example: '012c4e7f-5b86-4d49-a105-bd9978e9d18b',
                  },
                  bio: { type: 'string', example: 'Experienced pet sitter' },
                  experience: { type: 'number', example: 5 },
                  hourly_rate: { type: 'number', example: 15 },
                  latitude: { type: 'number', example: 48.8566 },
                  longitude: { type: 'number', example: 2.3522 },
                  animal_types: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Chien', 'Chat'],
                  },
                  services: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Promenade', 'Garderie'],
                  },
                  availability: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        day: {
                          type: 'string',
                          enum: [
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                            'Sunday',
                          ],
                        },
                        intervals: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              start_time: {
                                type: 'string',
                                example: '09:00:00',
                              },
                              end_time: { type: 'string', example: '12:00:00' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '400': { description: 'Bad request' },
      '500': { description: 'Internal server error' },
    },
  },
  PetsitterController.getPetSitters,
  validateQuery(getPetSittersQuerySchema),
  authenticate
);

swaggerRouter.route('/:id').get(
  {
    description: 'Fetch data for a specific Petsitter by ID',
    summary: 'Retrieve Petsitter data by ID',
    tags: ['Petsitter'],
    security: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: false,
        description: 'ID of the Petsitter to fetch',
        schema: {
          type: 'string',
          example: '7c1ab762-96d9-4340-921f-72817af3917e',
        },
      },
    ],
    responses: {
      '200': {
        description: 'Petsitter data retrieved successfully',
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Données récupérées avec succès',
            },
            petsitter: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                user_id: { type: 'string' },
                bio: { type: 'string', example: 'Experienced pet sitter' },
                experience: { type: 'number', example: 5 },
                hourly_rate: { type: 'number', example: 15 },
                availability: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      day: {
                        type: 'string',
                        enum: [
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                          'Sunday',
                        ],
                      },
                      intervals: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            start_time: { type: 'string', example: '09:00:00' },
                            end_time: { type: 'string', example: '12:00:00' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '400': { description: 'Bad request' },
      '404': { description: 'Petsitter not found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetsitterController.getPetSitterById,
  authenticate
);

swaggerRouter.route('/user/:id').get(
  {
    description: 'Fetch Petsitter data by User ID',
    summary: 'Retrieve Petsitter by User ID',
    tags: ['Petsitter'],
    security: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: false,
        description: 'User ID to fetch associated Petsitter',
        schema: {
          type: 'string',
          example: '7c1ab762-96d9-4340-921f-72817af3917e',
        },
      },
    ],
    responses: {
      '200': {
        description: 'Petsitter data retrieved successfully',
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Données récupérées avec succès',
            },
            petsitter: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                user_id: { type: 'string' },
                bio: { type: 'string', example: 'Experienced pet sitter' },
                experience: { type: 'number', example: 5 },
                hourly_rate: { type: 'number', example: 15 },
                availability: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      day: { type: 'string' },
                      intervals: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            start_time: { type: 'string' },
                            end_time: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '400': { description: 'Bad request' },
      '404': { description: 'Petsitter not found for specified user' },
      '500': { description: 'Internal server error' },
    },
  },
  PetsitterController.getPetSitterByUserId,
  authenticate
);

swaggerRouter.route('/').post(
  {
    description: 'Créer un nouveau pet sitter',
    summary: 'Ajouter un pet sitter',
    tags: ['Petsitter'],
    security: true,
    requestBody: {
      description: 'Données du pet sitter à ajouter',
      required: true,
      schema: {
        type: 'object',
        properties: {
          bio: {
            type: 'string',
            example: 'Updated bio',
          },
          hourly_rate: {
            type: 'number',
            example: 20,
          },
          experience: {
            type: 'number',
            example: 7,
          },
          available_days: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ],
            },
            example: ['Monday', 'Wednesday'],
          },
          available_slots: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['Matin', 'Après-midi', 'Soir', 'Nuit'],
            },
            example: ['Matin', 'Soir'],
          },
          latitude: {
            type: 'number',
            format: 'float',
            nullable: true,
            example: 48.8566,
          },
          longitude: {
            type: 'number',
            format: 'float',
            nullable: true,
            example: 2.3522,
          },
          animal_types: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'Chat',
                'Chien',
                'Oiseau',
                'Rongeur',
                'Reptile',
                'Poisson',
                'Furet',
                'Cheval',
                'Autre',
              ],
            },
            example: ['Rongeur'],
          },
          services: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
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
              ],
            },
            example: ['Toilettage'],
          },
        },
        required: ['hourly_rate'],
      },
    },
    responses: {
      '201': {
        description: 'Pet sitter créé avec succès',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'abc123' },
            bio: { type: 'string', example: 'J’adore les animaux' },
            experience: { type: 'number', example: 5 },
            hourly_rate: { type: 'number', example: 20 },
            available_days: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                  'Sunday',
                ],
              },
              example: ['Monday', 'Wednesday'],
            },
            available_slots: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['Matin', 'Après-midi', 'Soir', 'Nuit'],
              },
              example: ['Matin', 'Soir'],
            },
            latitude: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 48.8566,
            },
            longitude: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 2.3522,
            },
            animal_types: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'Chat',
                  'Chien',
                  'Oiseau',
                  'Rongeur',
                  'Reptile',
                  'Poisson',
                  'Furet',
                  'Cheval',
                  'Autre',
                ],
              },
              example: ['Chien', 'Furet'],
            },
            services: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
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
                ],
              },
              example: ['Promenade', 'Soins'],
            },
          },
        },
      },
      '400': { description: 'Requête invalide' },
    },
  },
  PetsitterController.createPetSitter,
  validateSchema(petSitterSchema),
  authenticate,
  petSitterAuth
);

swaggerRouter.route('/:id').patch(
  {
    description: 'Update existing Petsitter data',
    summary: 'Update Petsitter by ID',
    tags: ['Petsitter'],
    security: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        description: 'Petsitter ID to update',
        schema: { type: 'string' },
      },
    ],
    requestBody: {
      description: 'Fields to update',
      required: true,
      schema: {
        type: 'object',
        properties: {
          bio: {
            type: 'string',
            example: 'Updated bio',
            nullable: true,
          },
          hourly_rate: {
            type: 'number',
            example: 20,
            minimum: 0,
          },
          experience: {
            type: 'integer',
            example: 7,
            minimum: 0,
            nullable: true,
          },
          animal_types: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'Chat',
                'Chien',
                'Oiseau',
                'Rongeur',
                'Reptile',
                'Poisson',
                'Furet',
                'Cheval',
                'Autre',
              ],
            },
            example: ['Rongeur'],
            nullable: true,
          },
          services: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
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
              ],
            },
            example: ['Toilettage'],
            nullable: true,
          },
          available_days: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ],
            },
            example: ['Monday', 'Wednesday'],
            nullable: true,
          },
          available_slots: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['Matin', 'Après-midi', 'Soir', 'Nuit'],
            },
            example: ['Matin', 'Soir'],
            nullable: true,
          },
          latitude: {
            type: 'number',
            minimum: -90,
            maximum: 90,
            nullable: true,
            example: 48.8566,
          },
          longitude: {
            type: 'number',
            minimum: -180,
            maximum: 180,
            nullable: true,
            example: 2.3522,
          },
        },
        additionalProperties: false,
      },
    },
    responses: {
      '200': {
        description: 'Petsitter updated successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: {
              type: 'string',
              example: 'Petsitter mis à jour avec succès',
            },
            petsitter: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'abc123' },
                user_id: { type: 'string', example: 'user123' },
                bio: { type: 'string', example: 'Updated bio' },
                hourly_rate: { type: 'number', example: 20 },
                experience: { type: 'number', example: 7 },
                animal_types: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: [
                      'Chat',
                      'Chien',
                      'Oiseau',
                      'Rongeur',
                      'Reptile',
                      'Poisson',
                      'Furet',
                      'Cheval',
                      'Autre',
                    ],
                  },
                  example: ['Chien', 'Chat'],
                },
                services: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: [
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
                    ],
                  },
                  example: ['Promenade', 'Toilettage'],
                },
                available_days: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: [
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                      'Sunday',
                    ],
                  },
                  example: ['Monday', 'Wednesday'],
                },
                available_slots: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['Matin', 'Après-midi', 'Soir', 'Nuit'],
                  },
                  example: ['Matin', 'Soir'],
                },
                latitude: {
                  type: 'number',
                  nullable: true,
                  example: 48.8566,
                },
                longitude: {
                  type: 'number',
                  nullable: true,
                  example: 2.3522,
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-05-15T10:00:00Z',
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-05-15T10:00:00Z',
                },
              },
            },
          },
        },
      },
      '400': { description: 'Bad request' },
      '401': { description: 'Unauthorized' },
      '404': { description: 'Petsitter not found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetsitterController.updatePetSitter,
  authenticate,
  petSitterAuth,
  validateSchema(petSitterSchema)
);

swaggerRouter.route('/:id').delete(
  {
    description: 'Delete a Petsitter',
    summary: 'Remove a Petsitter from the system',
    tags: ['Petsitter'],
    security: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: false,
        description: 'ID of the Petsitter to fetch',
        schema: {
          type: 'string',
          example: '7c1ab762-96d9-4340-921f-72817af3917e',
        },
      },
    ],
    responses: {
      '200': {
        description: 'Petsitter deleted successfully',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Petsitter supprimé avec succès',
            },
          },
        },
      },
      '400': { description: 'Bad request' },
      '404': { description: 'Petsitter not found' },
    },
  },
  PetsitterController.deletePetSitter,
  authenticate
);

export default swaggerRouter;
