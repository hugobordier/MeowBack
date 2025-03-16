import AuthController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import authController from '../controllers/authController';

const swaggerRouter = new SwaggerRouter();
swaggerRouter.route('/register').post(
  {
    description: 'User registration',
    summary: 'Register a new user',
    security: false,
    requestBody: {
      description: 'Request body containing the user registration information',
      required: true,
      schema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'The username of the user',
            example: 'john_doe',
          },
          email: {
            type: 'string',
            description: 'The email address of the user',
            example: 'john.doe@mail.com',
          },
          password: {
            type: 'string',
            description: 'The password for the user account',
            example: 'securePassword123',
          },
          lastName: {
            type: 'string',
            description: 'The user’s last name',
            example: 'Doe',
          },
          firstName: {
            type: 'string',
            description: 'The user’s first name',
            example: 'John',
          },
          age: {
            type: 'integer',
            description: 'The user’s age',
            example: 25,
          },
          birthDate: {
            type: 'string',
            format: 'date',
            description: 'The user’s birth date',
            example: '1998-05-15',
          },
          city: {
            type: 'string',
            description: 'The city where the user resides',
            example: 'Paris',
          },
          country: {
            type: 'string',
            description: 'The country where the user resides',
            example: 'France',
          },
          gender: {
            type: 'string',
            description: 'The gender of the user',
            example: 'Male',
          },
          profilePicture: {
            type: 'string',
            description: 'URL to the user’s profile picture',
            example: 'http://example.com/profile.jpg',
          },
          bio: {
            type: 'string',
            description: 'A short bio or description of the user',
            example: 'Software developer passionate about tech.',
          },
          bankInfo: {
            type: 'string',
            description: 'The user’s bank information (sensitive)',
            example: 'IBAN: FR7612345678901234567890123',
          },
          rating: {
            type: 'number',
            format: 'float',
            description: 'The user’s rating (out of 5)',
            example: 4.5,
          },
          phoneNumber: {
            type: 'string',
            description: 'The user’s phone number',
            example: '06 12 34 56 78',
          },
          address: {
            type: 'string',
            description: 'The user’s postal address',
            example: '10 Rue de la République, 75001 Paris',
          },
          identityDocument: {
            type: 'string',
            description: 'URL to the user’s identity document',
            example: 'http://example.com/identity.jpg',
          },
          insuranceCertificate: {
            type: 'string',
            description: 'URL to the user’s insurance certificate',
            example: 'http://example.com/insurance.jpg',
          },
          isAdmin: {
            type: 'boolean',
            description: 'Indicates if the user is an admin',
            example: false,
          },
        },
        required: [
          'username',
          'email',
          'password',
          'lastName',
          'firstName',
          'age',
          'birthDate',
          'phoneNumber',
        ],
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
    security: false,
    requestBody: {
      description: 'User login credentials',
      required: true,
      schema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'mail',
            example: 'john.doe@mail.com',
          },
          password: {
            type: 'string',
            description: 'mot de passe',
            example: 'SecurePassword123',
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
    security: false,
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

swaggerRouter.route('/me').get(
  {
    description: 'Test authentication and ensure user is logged in.',
    summary: 'Test user authentication',
    security: true,
    responses: {
      '200': { description: 'User is authenticated and test successful.' },
      '401': { description: 'Unauthorized, user not authenticated.' },
    },
  },
  AuthController.test,
  authenticate
);

swaggerRouter.route('/forgot-password').post(
  {
    description: 'Send a password reset link to the user’s email address.',
    summary: 'Forgot password',
    security: false,
    requestBody: {
      description: 'User email address',
      required: true,
      schema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'The email address of the user',
            example: 'email@email.com',
          },
        },
        required: ['email'],
      },
    },
    responses: {
      '200': { description: 'Password reset link sent successfully.' },
      '400': { description: 'Bad request, invalid email address.' },
      '404': { description: 'Not found, user not found.' },
    },
  },

  AuthController.forgotPassword
);

swaggerRouter.route('/verify-reset-code').post(
  {
    description: 'Verify the password reset code sent to the user’s email.',
    summary: 'Verify reset code',
    security: false,
    requestBody: {
      description: 'User email and reset code',
      required: true,
      schema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'The email address of the user',
            example: 'email@email.com',
          },
          code: {
            type: 'string',
            description: 'The reset code received by the user',
            example: '123456',
          },
          password: {
            type: 'string',
            description: 'The rnew password',
            example: 'password',
          },
        },
        required: ['email', 'code', 'password'],
      },
    },
    responses: {
      '200': { description: 'Reset code is valid.' },
      '400': { description: 'Bad request, invalid email or code.' },
      '404': { description: 'Not found, user not found or code expired.' },
    },
  },

  AuthController.verifyResetCode
);

swaggerRouter.route('/delete-user').delete(
  {
    description: 'Delete a user account by their email.',
    summary: 'Delete user account',
    security: true,
    responses: {
      '200': { description: 'User deleted successfully.' },
      '400': { description: 'Bad request, invalid email.' },
      '404': { description: 'Not found, user not found.' },
    },
  },
  AuthController.deleteUser,
  authenticate
);

swaggerRouter.route('/update-user').patch(
  {
    description:
      'Update user information. The user can update one or multiple fields.',
    summary: 'Update user',
    security: true,
    requestBody: {
      description:
        'Fields to update (send only the fields that need to be modified)',
      required: true,
      schema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'New username (must be unique)',
            example: 'new_johndoe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'New email',
            example: 'new.email@mail.com',
          },
          password: {
            type: 'string',
            description: 'New password',
            example: 'NewSecurePassword123',
          },
          lastName: {
            type: 'string',
            description: 'Updated last name',
            example: 'Doe',
          },
          firstName: {
            type: 'string',
            description: 'Updated first name',
            example: 'John',
          },
          age: {
            type: 'integer',
            description: 'Updated age',
            example: 26,
          },
          birthDate: {
            type: 'string',
            format: 'date',
            description: 'Updated birth date',
            example: '1997-10-20',
          },
          city: {
            type: 'string',
            description: 'Updated city',
            example: 'Lyon',
          },
          country: {
            type: 'string',
            description: 'Updated country',
            example: 'France',
          },
          gender: {
            type: 'string',
            description: 'Updated gender',
            example: 'Male',
          },
          profilePicture: {
            type: 'string',
            description: 'Updated profile picture URL',
            example: 'http://example.com/new_profile.jpg',
          },
          bio: {
            type: 'string',
            description: 'Updated bio',
            example: 'Tech enthusiast and full-stack developer.',
          },
          bankInfo: {
            type: 'string',
            description: 'Updated bank information (sensitive)',
            example: 'IBAN: FR7612345678901234567890123',
          },
          rating: {
            type: 'number',
            format: 'float',
            description: 'Updated rating (out of 5)',
            example: 4.8,
          },
          phoneNumber: {
            type: 'string',
            description: 'Updated phone number',
            example: '06 98 76 54 32',
          },
          address: {
            type: 'string',
            description: 'Updated postal address',
            example: '15 Avenue des Champs-Élysées, 75008 Paris',
          },
          identityDocument: {
            type: 'string',
            description: 'Updated identity document URL',
            example: 'http://example.com/new_identity.jpg',
          },
          insuranceCertificate: {
            type: 'string',
            description: 'Updated insurance certificate URL',
            example: 'http://example.com/new_insurance.jpg',
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'User updated successfully',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'User updated successfully',
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '123e4567-e89b-12d3-a456-426614174000',
                },
                username: { type: 'string', example: 'new_johndoe' },
                email: { type: 'string', example: 'new.email@mail.com' },
                profilePicture: {
                  type: 'string',
                  example: 'http://example.com/new_profile.jpg',
                },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      '400': {
        description: 'Bad request (invalid fields or username already taken)',
      },
      '401': { description: 'Unauthorized (missing or invalid token)' },
      '404': { description: 'User not found' },
      '500': { description: 'Internal server error' },
    },
  },

  authController.updateUser,
  authenticate
);

swaggerRouter.route('/logout').post(
  {
    description: 'Log out the user and invalidate the refresh token.',
    summary: 'Logout',
    security: true,
    responses: {
      '200': { description: 'User logged out successfully.' },
      '401': { description: 'Unauthorized, missing or invalid token.' },
    },
  },
  AuthController.logout,
  authenticate
);

export default swaggerRouter;
