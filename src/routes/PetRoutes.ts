import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import PetController from '../controllers/PetController';
import { authenticate } from '@/middleware/authMiddleware';
import { validateSchema } from '@/middleware/validateSchema';
import { petPatchSchema, petSchema } from '@/schema/PetSchema';
import { uploadMiddleware } from '@/middleware/uploadMiddleware';

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route('/').post(
  {
    description: 'Create a new pet',
    summary: 'Add a new pet',
    tags: ['Pets'],
    security: true,
    requestBody: {
      description: 'Pet data to be added',
      required: true,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Buddy' },
          breed: { type: 'string', example: 'German shepherd' },
          age: { type: 'number', example: 3 },
          species: { type: 'string', example: 'Dog' },
          allergy: { type: 'string', example: 'None' },
          weight: { type: 'number', example: 25.5 },
          diet: { type: 'string', example: 'Grain-free kibble' },
          description: { type: 'string', example: 'Very playful and friendly.' },
          photo_url: { type: 'string', example: 'http://example.com/buddy.jpg' },
          gender: { type: 'string', enum: ['Male', 'Female', 'hermaphrodite'], example: 'Male' },
          neutered: { type: 'boolean', example: true },
          color: { type: 'string', example: 'Golden' },
        },
        required: ['name', 'breed', 'age', 'species', 'weight', 'diet', 'user_id'],
      },
    },
    responses: {
      '201': {
        description: 'Pet created successfully',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '60d5f84d071f9c44b14f9d8f' },
            name: { type: 'string', example: 'Buddy' },
            age: { type: 'number', example: 3 },
            species: { type: 'string', example: 'Dog' },
          },
        },
      },
      '400': { description: 'Bad request données incorrectes' },
    },
  },
  PetController.createPet,
  validateSchema(petSchema),
  authenticate
);

  
  swaggerRouter.route('/ByID/:id').get(
    {
      description: 'Get a pet by ID',
      summary: 'Retrieve a pet by its unique identifier',
      tags: ['Pets'],
      security:true,
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        '200': { description: 'Pet found' },
        '404': { description: 'Pet not found' },
        '400': { description: 'No Pet for this ID' },
        '500': { description: 'Internal server error'}
      },
    },
    PetController.getPetById,
    authenticate
  );
  
  swaggerRouter.route('/user').get(
    {
      description: 'Get all pets for the current user',
      summary: 'Retrieve a list of all pets for the current user',
      tags: ['Pets'],
      security:true,
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
      ],
      responses: {
        '200': { description: 'List of pets retrieved successfully' },
        '400': { description: 'Bad request' },
        '500': { description: 'Internal server error' },
      },
    },
    PetController.getAllPetsForAUser,
    authenticate
  );

  swaggerRouter.route('/').get(
    {
      description: 'Get all pets',
      summary: 'Retrieve a list of all pets',
      tags: ['Pets'],
      security:true,
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
      ],
      responses: {
        '200': { description: 'List of pets retrieved successfully' },
        '400': { description: 'Bad request' },
        '500': { description: 'Internal server error' },
      },
    },
    PetController.getAllPets,
    authenticate
  );
  
  swaggerRouter.route('/:id').patch(
    {
      description: 'Update a pet',
      summary: 'Modify details of an existing pet',
      tags: ['Pets'],
      security:true,
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        description: 'Pet data to be updated',
        required: true,
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Max' },
            breed: { type: 'string', example: 'Golden Retriever' },
            age: { type: 'number', example: 4 },
            species: { type: 'string', example: 'Dog' },
            allergy: { type: 'string', example: 'Pollen' },
            weight: { type: 'number', example: 26.0 },
            diet: { type: 'string', example: 'Grain-free kibble' },
            description: { type: 'string', example: 'Very friendly and loves to play' },
            photo_url: { type: 'string', example: 'https://example.com/photo.jpg' },
            gender: { type: 'string', enum: ['Male', 'Female', 'hermaphrodite'], example: 'Male' },
            neutered: { type: 'boolean', example: true },
            color: { type: 'string', example: 'Golden' },
          },

        },
      },
      responses: {
        '200': {
          description: 'Pet updated successfully',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Pet mis à jour avec succès' },
              pet: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '60d5f84d071f9c44b14f9d8f' },
                  name: { type: 'string', example: 'Max' },
                  breed: { type: 'string', example: 'Golden Retriever' },
                  age: { type: 'number', example: 4 },
                  species: { type: 'string', example: 'Dog' },
                  allergy: { type: 'string', example: 'Pollen' },
                  weight: { type: 'number', example: 26.0 },
                  diet: { type: 'string', example: 'Grain-free kibble' },
                  description: { type: 'string', example: 'Very friendly and loves to play' },
                  photo_url: { type: 'string', example: 'https://example.com/photo.jpg' },
                  gender: { type: 'string', example: 'Male' },
                  neutered: { type: 'boolean', example: true },
                  color: { type: 'string', example: 'Golden' },
                },
              },
            },
          },
        },
        '404': { description: 'Pet not found' },
        '400': { description: 'Bad request' },
        '500': { description: 'Internal server error' },
      },
    },
    PetController.updatePet,
    validateSchema(petPatchSchema),
    authenticate
  );

  swaggerRouter.route('/pets/:id').delete(
    {
      description: 'Delete a pet',
      summary: 'Remove a pet from the database',
      tags: ['Pets'],
      security:true,
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        '200': { description: 'Pet deleted successfully' },
        '400': { description: 'Bad request' },
        '404': { description: 'Pet not found' },
        '500': { description: 'Internal serveur error' },
      },
    },
    PetController.deletePet,
    authenticate
  );


  swaggerRouter.route('/PhotoProfil/:id').patch(
    {
      description: "Enregistrer une photo de profil pour un animal",
      summary: "Téléverser une photo de profil pour un animal",
      tags: ['Pets'],
      security: true,
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        contentType: 'multipart/form-data',
        required: true,
        description: "Fichier de la photo de profil à télécharger",
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
          description: "photo de profil enregistrée avec succès",
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: "photo de profil enregistrée avec succès",
              },
              documentUrl: {
                type: 'string',
                example: 'https://example.com/uploads/photoanimal.jpg',
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
    PetController.uploadImagePetProfile,
    uploadMiddleware,
    authenticate
  );
  
  swaggerRouter.route('/PhotoProfil/:id').delete(
    {
      description: "Supprimer photo de profil d'un pet",
      summary: "Supprimer une photo de profil",
      tags: ['Pets'],
      security: true,
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        '200': {
          description: "photo de profil supprimée avec succès",
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: "photo de profil supprimée avec succès",
              },
            },
          },
        },
        '400': {
          description: 'Requête invalide',
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Aucune photo de profil à supprimer ou requête incorrecte',
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
    PetController.deletePetImageProfile,
    authenticate
  );
  
  
  export default swaggerRouter;