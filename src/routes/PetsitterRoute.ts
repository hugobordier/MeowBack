import PetsitterController from '../controllers/PetsitterController';
import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import { authenticate } from '../middleware/authMiddleware';
import petSitterAuth from '@/middleware/petSitterAuth';
import { validateSchema } from '@/middleware/validateSchema';
import {
  animalTypesEnum,
  availableServices,
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
        name: 'dayAvailable',
        in: 'query',
        required: false,
        description: 'Filter by day of availability',
        schema: {
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
          example: 'Saturday',
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
                  example: 'Monday',
                },
                intervals: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['Matin', 'Après-midi', 'Soir', 'Nuit'],
                  },
                  example: ['Après-midi'],
                },
              },
              required: ['day', 'intervals'],
            },
            example: [
              {
                day: 'Monday',
                intervals: ['Matin', 'Soir'],
              },
            ],
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
                    example: 'Monday',
                  },
                  intervals: {
                    type: 'array',
                    items: {
                      type: 'string',
                      enum: ['Matin', 'Après-midi', 'Soir', 'Nuit'],
                    },
                    example: ['Matin', 'Soir'],
                  },
                },
                required: ['day', 'intervals'],
              },
              example: [
                {
                  day: 'Monday',
                  intervals: ['Matin', 'Soir'],
                },
              ],
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
        required: true,
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
          },
          hourly_rate: {
            type: 'number',
            example: 20,
          },
          experience: {
            type: 'number',
            example: 7,
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
                  example: 'Monday',
                },
                intervals: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['Matin', 'Après-midi', 'Soir', 'Nuit'],
                  },
                  example: ['Après-midi'],
                },
              },
              required: ['day', 'intervals'],
            },
            example: [
              {
                day: 'Monday',
                intervals: ['Matin', 'Soir'],
              },
            ],
          },
        },
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
                        example: 'Friday',
                      },
                      intervals: {
                        type: 'array',
                        items: {
                          type: 'string',
                          enum: ['Matin', 'Après-midi', 'Soir', 'Nuit'],
                        },
                        example: ['Matin', 'Soir'],
                      },
                    },
                    required: ['day', 'intervals'],
                  },
                  example: [
                    {
                      day: 'Friday',
                      intervals: ['Matin', 'Nuit'],
                    },
                  ],
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
  validateSchema(petSitterSchema),
  authenticate,
  petSitterAuth
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
