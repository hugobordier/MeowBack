import PetsitterController from '../controllers/PetsitterController';
import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import { authenticate } from '../middleware/authMiddleware';
import petSitterAuth from '@/middleware/petSitterAuth';

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
    description: 'Create a new Petsitter',
    summary: 'Add a new Petsitter',
    tags: ['Petsitter'],
    security: true,
    requestBody: {
      description: 'Petsitter data to be added',
      required: true,
      schema: {
        type: 'object',
        properties: {
          bio: { type: 'string', example: 'Experienced pet sitter' },
          hourly_rate: { type: 'number', example: 15 },
          experience: { type: 'number', example: 5 },
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
            example: [
              {
                day: 'Monday',
                intervals: [
                  { start_time: '09:00:00', end_time: '12:00:00' },
                  { start_time: '14:00:00', end_time: '18:00:00' },
                ],
              },
              {
                day: 'Tuesday',
                intervals: [
                  { start_time: '09:00:00', end_time: '12:00:00' },
                  { start_time: '14:00:00', end_time: '18:00:00' },
                ],
              },
            ],
          },
        },
        required: ['hourly_rate'],
      },
    },
    responses: {
      '201': {
        description: 'Petsitter created successfully',
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Petsitter créé avec succès',
            },
            petsitter: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '60d5f84d071f9c44b14f9d8f' },
                user_id: {
                  type: 'string',
                  example: '7c1ab762-96d9-4340-921f-72817af3917e',
                },
                hourly_rate: { type: 'number', example: 15 },
              },
            },
          },
        },
      },
      '400': { description: 'Bad request' },
      '401': { description: 'Unauthorized' },
      '409': {
        description: 'Conflict - Petsitter already exists for this user',
      },
      '500': { description: 'Internal server error' },
    },
  },
  PetsitterController.createPetSitter,
  authenticate,
  petSitterAuth
);

swaggerRouter.route('/:id').patch(
  {
    description: 'Update Petsitter data',
    summary: 'Update existing Petsitter',
    tags: ['Petsitter'],
    security: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: false,
        description: 'ID of the Petsitter to update',
        schema: {
          type: 'string',
          example: '7c1ab762-96d9-4340-921f-72817af3917e',
        },
      },
    ],
    requestBody: {
      description: 'Updated Petsitter data',
      required: true,
      schema: {
        type: 'object',
        properties: {
          bio: { type: 'string', example: 'Updated bio information' },
          hourly_rate: { type: 'number', example: 20 },
          experience: { type: 'number', example: 6 },
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
    responses: {
      '200': {
        description: 'Petsitter updated successfully',
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Petsitter mis à jour avec succès',
            },
            petsitter: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                user_id: { type: 'string' },
                bio: { type: 'string' },
                experience: { type: 'number' },
                hourly_rate: { type: 'number' },
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
      '404': { description: 'Petsitter not found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetsitterController.updatePetSitter,
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
