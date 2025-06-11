import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import NotificationTokenController from '@/controllers/NotificationTokenController';
import { authenticate } from '@/middleware/authMiddleware';
import { validateSchema } from '@/middleware/validateSchema';
import { notificationTokenSchema } from '@/schema/NotificationTokenSchema';

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route('/notification-tokens').post(
  {
    description: 'Create a new Expo push notification token',
    summary: 'Add an Expo push token',
    tags: ['NotificationTokens'],
    security: true,
    requestBody: {
      description: 'Expo push token to be added',
      required: true,
      schema: {
        type: 'object',
        properties: {
          expo_push_token: { type: 'string', example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' },
        },
        required: ['expo_push_token'],
      },
    },
    responses: {
      '201': {
        description: 'Notification token created successfully',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            expo_push_token: { type: 'string' },
            user_id: { type: 'string', format: 'uuid' },
          },
        },
      },
      '400': { description: 'Bad request' },
      '401': { description: 'Unauthorized' },
      '500': { description: 'Internal server error' },
    },
  },
  NotificationTokenController.createToken,
  validateSchema(notificationTokenSchema),
  authenticate
);

swaggerRouter.route('/notification-tokens/user').get(
  {
    description: 'Get all notification tokens for the current user',
    summary: 'Retrieve a list of Expo push tokens for the authenticated user',
    tags: ['NotificationTokens'],
    security: true,
    responses: {
      '200': {
        description: 'List of notification tokens retrieved successfully',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              expo_push_token: { type: 'string' },
              user_id: { type: 'string', format: 'uuid' },
            },
          },
        },
      },
      '401': { description: 'Unauthorized' },
      '500': { description: 'Internal server error' },
    },
  },
  NotificationTokenController.getTokensByUser,
  authenticate
);

export default swaggerRouter;
