import { Router } from 'express';
import PetSitterReviewController from '@/controllers/PetSitterReviewController';
import { authenticate } from '@/middleware/authMiddleware';
import SwaggerRouter from '@/swagger-builder/SwaggerRouter';

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route('/').post(
  {
    description: 'Create a review for a pet sitter',
    summary: 'Create pet sitter review',
    tags: ['PetSitterReviews'],
    security: true,
    requestBody: {
      description: 'Review data to be added',
      required: true,
      schema: {
        type: 'object',
        properties: {
          pet_sitter_id: {
            type: 'string',
            example: '7c1ab762-96d9-4340-921f-72817af3917e',
          },
          message: { type: 'string', example: 'Great pet sitter!' },
        },
        required: ['pet_sitter_id', 'message'],
      },
    },
    responses: {
      '201': {
        description: 'Review created successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Review created successfully' },
            review: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '60d5f84d071f9c44b14f9d8f' },
                pet_sitter_id: {
                  type: 'string',
                  example: '7c1ab762-96d9-4340-921f-72817af3917e',
                },
                message: { type: 'string', example: 'Great pet sitter!' },
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
  PetSitterReviewController.createReview,
  authenticate
);

swaggerRouter.route('/:review_id').put(
  {
    description: 'Update a review for a pet sitter',
    summary: 'Update pet sitter review',
    tags: ['PetSitterReviews'],
    security: true,
    requestBody: {
      description: 'Review data to be updated',
      required: true,
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Updated review message' },
        },
        required: ['message'],
      },
    },
    responses: {
      '200': {
        description: 'Review updated successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Review updated successfully' },
            review: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '60d5f84d071f9c44b14f9d8f' },
                pet_sitter_id: {
                  type: 'string',
                  example: '7c1ab762-96d9-4340-921f-72817af3917e',
                },
                message: { type: 'string', example: 'Updated review message' },
              },
            },
          },
        },
      },
      '400': { description: 'Bad request' },
      '401': { description: 'Unauthorized' },
      '404': { description: 'Review not found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetSitterReviewController.updateReview,
  authenticate
);

swaggerRouter.route('/petsitter/:pet_sitter_id').get(
  {
    description: 'Get all reviews for a pet sitter with pagination',
    summary: 'Fetch paginated pet sitter reviews',
    tags: ['PetSitterReviews'],
    security: true,
    parameters: [
      {
        name: 'pet_sitter_id',
        in: 'path',
        required: true,
        description: 'ID of the pet sitter',
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        description: 'Number of reviews per page',
      },
      {
        name: 'page',
        in: 'query',
        required: false,
        description: 'Page number to fetch',
      },
    ],
    responses: {
      '200': {
        description: 'Reviews retrieved successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            total: { type: 'integer', example: 35 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            reviews: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '60d5f84d071f9c44b14f9d8f' },
                  user_id: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                  },
                  message: { type: 'string', example: 'Great pet sitter!' },
                },
              },
            },
          },
        },
      },
      '400': { description: 'Bad request' },
      '404': { description: 'No reviews found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetSitterReviewController.getReviewsForPetSitter,
  authenticate
);

swaggerRouter.route('/user/:user_id').get(
  {
    description: 'Get all reviews left by a user',
    summary: 'Fetch user reviews',
    tags: ['PetSitterReviews'],
    security: true,
    responses: {
      '200': {
        description: 'Reviews retrieved successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            reviews: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '60d5f84d071f9c44b14f9d8f' },
                  pet_sitter_id: {
                    type: 'string',
                    example: '7c1ab762-96d9-4340-921f-72817af3917e',
                  },
                  message: { type: 'string', example: 'Great pet sitter!' },
                },
              },
            },
          },
        },
      },
      '400': { description: 'Bad request' },
      '404': { description: 'No reviews found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetSitterReviewController.getReviewsByUser,
  authenticate
);

swaggerRouter.route('/:review_id').delete(
  {
    description: 'Delete a user review for a pet sitter',
    summary: 'Remove review',
    tags: ['PetSitterReviews'],
    security: true,
    responses: {
      '200': {
        description: 'Review deleted successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Review deleted successfully' },
          },
        },
      },
      '400': { description: 'Bad request' },
      '401': { description: 'Unauthorized' },
      '404': { description: 'Review not found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetSitterReviewController.deleteReview,
  authenticate
);

export default swaggerRouter;
