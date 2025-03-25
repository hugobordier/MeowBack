import UserController from '../controllers/UserController';
import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import { authenticate } from '../middleware/authMiddleware';
import adminAuth from '@/middleware/adminAuth';
import {
  multipleUploadMiddleware,
  uploadMiddleware,
} from '@/middleware/uploadMiddleware';
//import { adminAuth } from '../middleware/adminMiddleware'; a implem

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route('/profile').get(
  {
    description: 'Obtenir les informations du profil utilisateur connecté',
    summary: 'Profil utilisateur',
    tags: ['User'],
    security: true,
    responses: {
      '200': {
        description: 'Profil utilisateur récupéré avec succès',
        schema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            username: { type: 'string', example: 'johndoe' },
            email: { type: 'string', example: 'john.doe@mail.com' },
            lastName: { type: 'string', example: 'Doe' },
            firstName: { type: 'string', example: 'John' },
            age: { type: 'integer', example: 25 },
            birthDate: {
              type: 'string',
              format: 'date',
              example: '1998-10-20',
            },
            city: { type: 'string', example: 'Paris' },
            country: { type: 'string', example: 'France' },
            gender: { type: 'string', example: 'Male' },
            profilePicture: {
              type: 'string',
              example: 'http://example.com/profile.jpg',
            },
            bio: { type: 'string', example: 'Tech enthusiast and traveler.' },
            rating: { type: 'number', example: 4.5 },
            phoneNumber: { type: 'string', example: '06 12 34 56 78' },
            address: {
              type: 'string',
              example: '15 Rue de la Paix, 75002 Paris',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      '401': { description: 'Non autorisé (token manquant ou invalide)' },
      '404': { description: 'Utilisateur non trouvé' },
      '500': { description: 'Erreur serveur' },
    },
  },
  UserController.getUserProfile,
  authenticate
);

swaggerRouter.route('/:id').get(
  {
    description: "Obtenir les informations d'un utilisateur par son ID",
    summary: 'Obtenir utilisateur par ID',
    tags: ['User'],
    security: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: "ID de l'utilisateur",
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      '200': {
        description: 'Utilisateur récupéré avec succès',
        schema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            username: { type: 'string', example: 'johndoe' },
            email: { type: 'string', example: 'john.doe@mail.com' },
            lastName: { type: 'string', example: 'Doe' },
            firstName: { type: 'string', example: 'John' },
            profilePicture: {
              type: 'string',
              example: 'http://example.com/profile.jpg',
            },
            bio: { type: 'string', example: 'Tech enthusiast and traveler.' },
            rating: { type: 'number', example: 4.5 },
          },
        },
      },
      '401': { description: 'Non autorisé (token manquant ou invalide)' },
      '403': { description: 'Accès refusé (accès non autorisé)' },
      '404': { description: 'Utilisateur non trouvé' },
      '500': { description: 'Erreur serveur' },
    },
  },
  UserController.getUserById,
  authenticate
);

swaggerRouter.route('/').get(
  {
    description: 'Obtenir la liste de tous les utilisateurs (admin uniquement)',
    summary: 'Liste des utilisateurs',
    tags: ['User'],
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
    ],
    responses: {
      '200': {
        description: 'Liste des utilisateurs récupérée avec succès',
        schema: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  lastName: { type: 'string' },
                  firstName: { type: 'string' },
                  profilePicture: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                totalItems: { type: 'integer' },
                totalPages: { type: 'integer' },
                currentPage: { type: 'integer' },
                itemsPerPage: { type: 'integer' },
              },
            },
          },
        },
      },
      '401': { description: 'Non autorisé (token manquant ou invalide)' },
      '403': { description: 'Accès refusé (rôle admin requis)' },
      '500': { description: 'Erreur serveur' },
    },
  },
  UserController.getAllUsers,
  authenticate
  //adminAuth
);

swaggerRouter.route('/update').patch(
  {
    description:
      "Mettre à jour les informations utilisateur. L'utilisateur peut mettre à jour un ou plusieurs champs.",
    summary: 'Mettre à jour utilisateur',
    tags: ['User'],
    security: true,
    requestBody: {
      description:
        'Champs à mettre à jour (envoyer uniquement les champs à modifier)',
      required: true,
      schema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: "Nouveau nom d'utilisateur (doit être unique)",
            example: 'new_johndoe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Nouvel email',
            example: 'new.email@mail.com',
          },
          password: {
            type: 'string',
            description: 'Nouveau mot de passe',
            example: 'NewSecurePassword123',
          },
          lastName: {
            type: 'string',
            description: 'Nom de famille mis à jour',
            example: 'Doe',
          },
          firstName: {
            type: 'string',
            description: 'Prénom mis à jour',
            example: 'John',
          },
          age: {
            type: 'integer',
            description: 'Âge mis à jour',
            example: 26,
          },
          birthDate: {
            type: 'string',
            format: 'date',
            description: 'Date de naissance mise à jour',
            example: '1997-10-20',
          },
          city: {
            type: 'string',
            description: 'Ville mise à jour',
            example: 'Lyon',
          },
          country: {
            type: 'string',
            description: 'Pays mis à jour',
            example: 'France',
          },
          gender: {
            type: 'string',
            description: 'Genre mis à jour',
            example: 'Male',
          },
          profilePicture: {
            type: 'string',
            description: 'URL de la photo de profil mise à jour',
            example: 'http://example.com/new_profile.jpg',
          },
          bio: {
            type: 'string',
            description: 'Biographie mise à jour',
            example: 'Tech enthusiast and full-stack developer.',
          },
          bankInfo: {
            type: 'string',
            description: 'Informations bancaires mises à jour (sensible)',
            example: 'IBAN: FR7612345678901234567890123',
          },
          rating: {
            type: 'number',
            format: 'float',
            description: 'Note mise à jour (sur 5)',
            example: 4.8,
          },
          phoneNumber: {
            type: 'string',
            description: 'Numéro de téléphone mis à jour',
            example: '06 98 76 54 32',
          },
          address: {
            type: 'string',
            description: 'Adresse postale mise à jour',
            example: '15 Avenue des Champs-Élysées, 75008 Paris',
          },
          identityDocument: {
            type: 'string',
            description: "URL du document d'identité mis à jour",
            example: 'http://example.com/new_identity.jpg',
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Utilisateur mis à jour avec succès',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Utilisateur mis à jour avec succès',
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
        description:
          "Requête invalide (champs invalides ou nom d'utilisateur déjà pris)",
      },
      '401': { description: 'Non autorisé (token manquant ou invalide)' },
      '404': { description: 'Utilisateur non trouvé' },
      '500': { description: 'Erreur serveur' },
    },
  },
  UserController.updateUser,
  authenticate
);

swaggerRouter.route('/delete').delete(
  {
    description: 'Supprimer un compte utilisateur par son email.',
    summary: 'Supprimer compte utilisateur',
    tags: ['User'],
    security: true,
    responses: {
      '200': { description: 'Utilisateur supprimé avec succès.' },
      '400': { description: 'Requête invalide, email invalide.' },
      '404': { description: 'Non trouvé, utilisateur non trouvé.' },
    },
  },
  UserController.deleteUser,
  authenticate
);

swaggerRouter.route('/admin/delete/:id').delete(
  {
    description: 'Supprimer un utilisateur par son ID (admin uniquement)',
    summary: 'Supprimer utilisateur (admin)',
    tags: ['Admin'],
    security: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: "ID de l'utilisateur à supprimer",
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      '200': {
        description: 'Utilisateur supprimé avec succès',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Utilisateur supprimé avec succès',
            },
          },
        },
      },
      '401': { description: 'Non autorisé (token manquant ou invalide)' },
      '403': { description: 'Accès refusé (rôle admin requis)' },
      '404': { description: 'Utilisateur non trouvé' },
      '500': { description: 'Erreur serveur' },
    },
  },
  UserController.adminDeleteUser,
  authenticate,
  adminAuth
);

swaggerRouter.route('/profilePicture').patch(
  {
    description: "Mettre à jour la photo de profil de l'utilisateur",
    summary: 'Mettre à jour la photo de profil',
    tags: ['User'],
    security: true,
    requestBody: {
      contentType: 'multipart/form-data',
      required: true,
      description: 'Fichier de photo de profil à télécharger',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Photo de profil mise à jour avec succès',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Photo de profil mise à jour avec succès',
            },
            profilePictureUrl: {
              type: 'string',
              example: 'https://example.com/uploads/profile-picture.jpg',
            },
          },
        },
      },
      '400': {
        description: 'Requête invalide (fichier manquant ou format incorrect)',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Format de fichier invalide ou taille maximale dépassée',
            },
          },
        },
      },
      '401': {
        description: 'Non autorisé (token manquant ou invalide)',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: "Token d'authentification manquant ou invalide",
            },
          },
        },
      },
      '500': {
        description: 'Erreur serveur',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Erreur interne du serveur',
            },
          },
        },
      },
    },
  },
  UserController.updateProfilePicture,
  uploadMiddleware,
  authenticate
);

swaggerRouter.route('/profilePicture').delete(
  {
    description: "Supprime la photo de profil de l'utilisateur connecté",
    summary: 'Supprimer la photo de profil',
    tags: ['User'],
    security: true,
    responses: {
      '200': {
        description: 'Photo de profil supprimée avec succès',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Photo de profil supprimée avec succès',
            },
          },
        },
      },
      '401': {
        description: 'Non autorisé (token manquant ou invalide)',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: "Token d'authentification manquant ou invalide",
            },
          },
        },
      },
      '404': {
        description: 'Aucune photo de profil à supprimer',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Aucune photo de profil trouvée pour cet utilisateur',
            },
          },
        },
      },
      '500': {
        description: 'Erreur serveur',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Erreur interne du serveur',
            },
          },
        },
      },
    },
  },
  UserController.deleteProfilePicture,
  authenticate
);

export default swaggerRouter;
