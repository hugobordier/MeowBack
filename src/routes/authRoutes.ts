import AuthController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import { validateSchema } from '@/middleware/validateSchema';
import { loginSchema, userSchema } from '@/schema/UserSchema';

const swaggerRouter = new SwaggerRouter();
swaggerRouter.route('/register').post(
  {
    description: 'User registration',
    summary: 'Register a new user',
    tags: ['Auth'],
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
          phoneNumber: {
            type: 'string',
            description: 'The user’s phone number',
            example: '06 12 34 56 78',
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
  AuthController.register,
  validateSchema(userSchema)
);

swaggerRouter.route('/google').get(
  {
    description: 'Redirection vers la page de connexion Google OAuth',
    summary: 'Initier le flux de connexion OAuth avec Google',
    tags: ['Auth'],
    security: false,
    responses: {
      '302': {
        description: 'Redirection vers Google pour authentification',
        schema: {
          Location: {
            schema: {
              type: 'string',
              format: 'uri',
            },
            description: 'URL de redirection vers Google OAuth',
          },
        },
      },
      '400': {
        description: 'Paramètres de requête invalides',
        schema: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: "Message d'erreur détaillé",
              example: 'Invalid redirect_uri',
            },
          },
        },
      },
      '500': {
        description: 'Erreur serveur (configuration manquante)',
        schema: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: "Message d'erreur serveur",
              example: 'Missing GOOGLE_CLIENT_ID environment variable',
            },
          },
        },
      },
    },
  },
  AuthController.getAuthRedirect
);

swaggerRouter.route('/callback').get(
  {
    description: 'Callback pour le processus OAuth Google',
    summary:
      'Traite le retour de Google OAuth et récupère les infos utilisateur',
    tags: ['Auth'],
    security: false,
    parameters: [
      {
        name: 'code',
        in: 'query',
        description: "Code d'autorisation fourni par Google",
        required: true,
      },
      {
        name: 'state',
        in: 'query',
        description: 'État de la requête OAuth pour vérification',
        required: true,
      },
      {
        name: 'scope',
        in: 'query',
        description: "Scopes autorisés par l'utilisateur",
        required: false,
      },
    ],
    responses: {
      '200': {
        description: 'Informations utilisateur récupérées avec succès',
        schema: {
          type: 'object',
          properties: {
            sub: {
              type: 'string',
              description: "ID unique de l'utilisateur",
              example: '110169484474386276334',
            },
            name: {
              type: 'string',
              description: "Nom complet de l'utilisateur",
              example: 'John Doe',
            },
            given_name: {
              type: 'string',
              description: "Prénom de l'utilisateur",
              example: 'John',
            },
            family_name: {
              type: 'string',
              description: "Nom de famille de l'utilisateur",
              example: 'Doe',
            },
            picture: {
              type: 'string',
              description: 'URL de la photo de profil',
              example: 'https://lh3.googleusercontent.com/a/photo.jpg',
            },
            email: {
              type: 'string',
              description: "Adresse email de l'utilisateur",
              example: 'john.doe@gmail.com',
            },
            email_verified: {
              type: 'boolean',
              description: "Indique si l'email a été vérifié",
              example: true,
            },
            locale: {
              type: 'string',
              description: "Langue préférée de l'utilisateur",
              example: 'fr',
            },
          },
        },
      },
      '400': {
        description: 'Paramètres de requête invalides',
        schema: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: "Message d'erreur détaillé",
              example: 'Invalid state parameter',
            },
          },
        },
      },
      '500': {
        description:
          "Erreur serveur lors de l'échange du token ou récupération des infos",
        schema: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: "Message d'erreur serveur",
              example: 'Failed to authenticate with Google',
            },
          },
        },
      },
    },
  },
  AuthController.handleGoogleCallback
);

swaggerRouter.route('/login').post(
  {
    description: 'Authenticate a user and get an access token.',
    summary: 'Login with user credentials',
    security: false,
    tags: ['Auth'],
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
            example: 'securePassword123',
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
  AuthController.login,
  validateSchema(loginSchema)
);

swaggerRouter.route('/refresh').post(
  {
    description: 'Refresh the authentication token using a refresh token.',
    summary: 'Refresh authentication token',
    security: false,
    tags: ['Auth'],
    requestBody: {
      description: 'User login credentials refresh',
      required: true,
      schema: {
        type: 'object',
        properties: {
          refreshToken: {
            type: 'string',
            description: 'refresh token',
            example: 'refresh token',
          },
        },
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

swaggerRouter.route('/me').get(
  {
    description: 'Test authentication and ensure user is logged in.',
    summary: 'Test user authentication',
    tags: ['Auth'],
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
    tags: ['Auth'],
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
    tags: ['Auth'],
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

swaggerRouter.route('/logout').post(
  {
    description: 'Log out the user and invalidate the refresh token.',
    summary: 'Logout',
    tags: ['Auth'],
    security: true,
    responses: {
      '200': { description: 'User logged out successfully.' },
      '401': { description: 'Unauthorized, missing or invalid token.' },
    },
  },
  AuthController.logout
);

export default swaggerRouter;
