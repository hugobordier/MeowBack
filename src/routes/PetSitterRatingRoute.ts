import { Router } from 'express';
import PetSitterRatingController from '@/controllers/PetSitterRatingController';
import { authenticate } from '@/middleware/authMiddleware';
import SwaggerRouter from '@/swagger-builder/SwaggerRouter';

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route('/').post(
  {
    description: 'Create a rating for a pet sitter',
    summary: 'Create pet sitter rating',
    tags: ['PetSitterRatings'],
    security: true,
    requestBody: {
      description: 'Rating data to be added',
      required: true,
      schema: {
        type: 'object',
        properties: {
          pet_sitter_id: {
            type: 'string',
            example: '7c1ab762-96d9-4340-921f-72817af3917e',
          },
          rating: { type: 'number', example: 4.5 },
        },
        required: ['pet_sitter_id', 'rating'],
      },
    },
    responses: {
      '201': {
        description: 'Rating created successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Rating created successfully' },
            rating: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '60d5f84d071f9c44b14f9d8f' },
                pet_sitter_id: {
                  type: 'string',
                  example: '7c1ab762-96d9-4340-921f-72817af3917e',
                },
                rating: { type: 'number', example: 4.5 },
              },
            },
          },
        },
      },
      '400': { description: 'Bad request' },
      '401': { description: 'Unauthorized' },
      '500': { description: 'Internal server error' },
    },
  },
  PetSitterRatingController.createRating,
  authenticate
);

swaggerRouter.route('/:rating_id').put(
  {
    description: 'Update a rating for a pet sitter',
    summary: 'Update pet sitter rating',
    tags: ['PetSitterRatings'],
    security: true,
    requestBody: {
      description: 'Rating data to be updated',
      required: true,
      schema: {
        type: 'object',
        properties: {
          rating: { type: 'number', example: 4.5 },
        },
        required: ['rating'],
      },
    },
    responses: {
      '200': {
        description: 'Rating updated successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Rating updated successfully' },
            rating: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '60d5f84d071f9c44b14f9d8f' },
                pet_sitter_id: {
                  type: 'string',
                  example: '7c1ab762-96d9-4340-921f-72817af3917e',
                },
                rating: { type: 'number', example: 4.5 },
              },
            },
          },
        },
      },
      '400': { description: 'Bad request' },
      '401': { description: 'Unauthorized' },
      '404': { description: 'Rating not found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetSitterRatingController.updateRating,
  authenticate
);

swaggerRouter.route('/:pet_sitter_id').get(
  {
    description: 'Get all ratings for a pet sitter',
    summary: 'Fetch pet sitter ratings',
    tags: ['PetSitterRatings'],
    security: true,
    responses: {
      '200': {
        description: 'Ratings retrieved successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            ratings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '60d5f84d071f9c44b14f9d8f' },
                  user_id: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                  },
                  rating: { type: 'number', example: 4.5 },
                },
              },
            },
          },
        },
      },
      '400': { description: 'Bad request' },
      '404': { description: 'No ratings found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetSitterRatingController.getRatingsForPetSitter,
  authenticate
);

swaggerRouter.route('/:rating_id').delete(
  {
    description: 'Delete a user rating for a pet sitter',
    summary: 'Remove rating',
    tags: ['PetSitterRatings'],
    security: true,
    responses: {
      '200': {
        description: 'Rating deleted successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Rating deleted successfully' },
          },
        },
      },
      '400': { description: 'Bad request' },
      '401': { description: 'Unauthorized' },
      '404': { description: 'Rating not found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetSitterRatingController.deleteRating,
  authenticate
);

export default swaggerRouter;
