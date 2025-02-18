import express from 'express';
import AuthController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import SwaggerRouter from '../swagger-builder/SwaggerRouter';

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route('/register').post(
  {
    description: 'User registration',
    summary: 'Register a new user',
    requestBody: {
      description: 'Request body containing the string to concatenate',
      required: true,
      schema: {
        type: 'object',
        properties: {
          pseudo: {
            type: 'string',
            description: 'pseudo',
            example: 'test',
          },
          email: {
            type: 'string',
            description: 'mail',
            example: 'test@mail.fr',
          },
          mdp: {
            type: 'string',
            description: 'mot de passe',
            example: 'motdepasses',
          },
        },
      },
    },
    responses: {
      '200': { description: 'User successfully registered' },
      '400': { description: 'Bad request' },
    },
  },
  AuthController.register
);
swaggerRouter.route('/login').post(
  {
    description: 'Authenticate a user and get an access token.',
    summary: 'Login with user credentials',
    requestBody: {
      description: 'User login credentials',
      required: true,
      schema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'mail',
            example: 'test@mail.fr',
          },
          mdp: {
            type: 'string',
            description: 'mot de passe',
            example: 'motdepasses',
          },
        },
        required: ['email', 'password'],
      },
    },
    responses: {
      '200': {
        description: 'User successfully authenticated, token returned.',
        schema: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
      '400': { description: 'Bad request, invalid credentials.' },
      '401': { description: 'Unauthorized, authentication failed.' },
    },
  },
  AuthController.login
);

swaggerRouter.route('/refresh').post(
  {
    description: 'Refresh the authentication token using a refresh token.',
    summary: 'Refresh authentication token',
    requestBody: {
      description: 'Refresh token to obtain new access token',
      required: true,
      schema: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' },
        },
        required: ['refreshToken'],
      },
    },
    responses: {
      '200': {
        description: 'New access token successfully issued.',
        schema: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
          },
        },
      },
      '400': { description: 'Bad request, invalid refresh token.' },
      '401': { description: 'Unauthorized, invalid or expired refresh token.' },
    },
  },
  AuthController.refresh
);

swaggerRouter.route('/test').get(
  {
    description: 'Test authentication and ensure user is logged in.',
    summary: 'Test user authentication',
    responses: {
      '200': { description: 'User is authenticated and test successful.' },
      '401': { description: 'Unauthorized, user not authenticated.' },
    },
  },
  AuthController.test,
  authenticate
);

export default swaggerRouter;
