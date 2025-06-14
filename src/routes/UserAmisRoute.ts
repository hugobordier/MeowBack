import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import { authenticate } from '@/middleware/authMiddleware';
import UserAmisController from '@/controllers/UserAmisController';
import { validateSchema } from '@/middleware/validateSchema';
import { UserAmiscreateSchema, UserAmispatchSchema, UserAmisResponseSchema } from '@/schema/UserAmisSchema';

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route('/').post(
  {
    description: 'Create a new petsitting request',
    summary: 'Add a petsitting request',
    tags: ['Demande de Petsitting'],
    security: true,
    requestBody: {
      description: 'petsitting data to be added',
      required: true,
      schema: {
        type: 'object',
        properties: {
          petsitter_id: { type: 'string',format:"uuid",example:"4f330bea-b96c-47d3-82ac-b6de6a577a6a"},
          message:{type:'string',example:"Salut pignouf"},
          petidtable: {
            type: 'array',
            items: { type: 'string', format: 'uuid', example: 'ed4244cc-e986-4a01-abfd-3d606dbf227c' },
            example: [
              "38a5ad1a-ef05-42f4-b5c6-44e38a7c8734",
              "0e9db21b-e95b-492b-a6f9-1bfab45e6ebe"
            ]
          },
        },
        required: ['petsitter_id'],
      },
    },
    responses: {
      '201': {
        description: 'petsitting request created successfully',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
            user_id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
            petsitter_id: { type: 'string', format: 'uuid', example: '4f330bea-b96c-47d3-82ac-b6de6a577a6a' },
            statusdemande: { type: 'string', enum: ['accepted', 'refused', 'pending'], example: 'pending'},
            message: { type: 'string', example: 'Salut' },
            petidtable: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid', example: 'ed4244cc-e986-4a01-abfd-3d606dbf227c' },
                name: { type: 'string', example: 'Miaou' },
                breed: { type: 'string', example: 'Siamois' },
                age: { type: 'integer', example: 3 },
                species: { type: 'string', example: 'Chat' },
                allergy: { type: 'string', example: 'aucune' },
                weight: { type: 'number', example: 4.2 },
                diet: { type: 'string', example: 'croquettes' },
                description: { type: 'string', example: 'Très joueur' },
                photo_url: { type: 'string', example: 'https://example.com/photo.jpg' },
                gender: { type: 'string', enum: ['Male', 'Female', 'hermaphrodite'], example: 'Male' },
                neutered: { type: 'boolean', example: true },
                color: { type: 'string', example: 'gris' },
                user_id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' }
              }
            },
            example: [
              {
                id: "ed4244cc-e986-4a01-abfd-3d606dbf227c",
                name: "Miaou",
                breed: "Siamois",
                age: 3,
                species: "Chat",
                allergy: "aucune",
                weight: 4.2,
                diet: "croquettes",
                description: "Très joueur",
                photo_url: "https://example.com/photo.jpg",
                gender: "Male",
                neutered: true,
                color: "gris",
                user_id: "003a8b60-0032-4528-82b0-50307c161d56"
              },
              {
                id: "f7ff2ad9-4d57-4091-8ea1-e231cc02da51",
                name: "Gribouille",
                breed: "Persan",
                age: 5,
                species: "Chat",
                allergy: "pollen",
                weight: 5.1,
                diet: "pâtée",
                description: "Calme et affectueux",
                photo_url: "https://example.com/photo2.jpg",
                gender: "Female",
                neutered: false,
                color: "blanc",
                user_id: "003a8b60-0032-4528-82b0-50307c161d56"
              }
            ]
          },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      '400': { description: 'Bad request données incorrectes' },
      '500': { description: 'Internal server error' }, 
    },
  },
  UserAmisController.createRequestAmi,
  validateSchema(UserAmiscreateSchema),
  authenticate
);

  
  swaggerRouter.route('/ById/:id').get(
    {
      description: 'Get petsitting request by ID',
      summary: 'Retrieve a petsitting request by its unique identifier',
      tags: ['Demande de Petsitting'],
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
        '200': { description: 'petsitting request found' },
        '404': { description: 'petsitting request not found' },
        '400': { description: 'No petsitting request for this ID' },
        '500': { description: 'Internal server error'}
      },
    },
    UserAmisController.getUserAmiById,
    authenticate
  );

    swaggerRouter.route('/user/').get(
    {
      description: 'Get all petsitting requests for the current user',
      summary: 'Retrieve a list of all petsitting requests for the current user',
      tags: ['Demande de Petsitting'],
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
        '200': { description: 'List of petsitting requests for the current user retrieved successfully' },
        '400': { description: 'Bad request' },
        '500': { description: 'Internal server error' },
      },
    },
    UserAmisController.getAllUserAmisForAUser,
    authenticate
  );
      swaggerRouter.route('/petsitter/').get(
    {
      description: 'Get all petsitter requests for a petsitter',
      summary: 'Retrieve a list of all petsitting requests recieved if you have a petsitter acount',
      tags: ['Demande de Petsitting'],
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
        '200': { description: 'List of petsitting requests for the petsitter retrieved successfully' },
        '400': { description: 'Bad request' },
        '500': { description: 'Internal server error' },
      },
    },
    UserAmisController.getAllUserAmisForAPetsitter,
    authenticate
  );
  
  swaggerRouter.route('/').get(
    {
      description: 'Get all petsitting requests',
      summary: 'Retrieve a list of all petsitting requests',
      tags: ['Demande de Petsitting'],
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
        '200': { description: 'List of petsitting requests retrieved successfully' },
        '400': { description: 'Bad request' },
        '500': { description: 'Internal server error' },
      },
    },
    UserAmisController.getAlldemandeamis,
    authenticate
  );

  
  
    swaggerRouter.route('/ReponseDemande/:iddemandeur').patch(
    {
      description: 'Respond to a petsitting request',
      summary: 'Respond to an existing petsitting request',
      tags: ['Demande de Petsitting'],
      security:true,
       parameters: [
        {
          in: 'path',
          name: 'iddemandeur',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        description: 'petsitting request data to be updated by response',
        required: true,
        schema: {
          type: 'object',
            properties: {
            statusdemande: { type: 'string', enum: ['accepted', 'refused', 'pending'], example: 'accepted'},
          },
        },
      },
      responses: {
        '200': {
          description: 'Response to petsitting request successfull',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'petsitting request mise à jour avec succès' },
              UserAmis: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
                  user_id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
                  petsitter_id: { type: 'string', format: 'uuid', example: '4f330bea-b96c-47d3-82ac-b6de6a577a6a' },
                  statusdemande: { type: 'string', enum: ['accepted', 'refused', 'pending'], example: 'pending'},
                  message: { type: 'string', example: 'Salut' },
                  petidtable: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid', example: 'ed4244cc-e986-4a01-abfd-3d606dbf227c' },
                      name: { type: 'string', example: 'Miaou' },
                      breed: { type: 'string', example: 'Siamois' },
                      age: { type: 'integer', example: 3 },
                      species: { type: 'string', example: 'Chat' },
                      allergy: { type: 'string', example: 'aucune' },
                      weight: { type: 'number', example: 4.2 },
                      diet: { type: 'string', example: 'croquettes' },
                      description: { type: 'string', example: 'Très joueur' },
                      photo_url: { type: 'string', example: 'https://example.com/photo.jpg' },
                      gender: { type: 'string', enum: ['Male', 'Female', 'hermaphrodite'], example: 'Male' },
                      neutered: { type: 'boolean', example: true },
                      color: { type: 'string', example: 'gris' },
                      user_id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' }
                    }
                  },
                  example: [
                    {
                      id: "ed4244cc-e986-4a01-abfd-3d606dbf227c",
                      name: "Miaou",
                      breed: "Siamois",
                      age: 3,
                      species: "Chat",
                      allergy: "aucune",
                      weight: 4.2,
                      diet: "croquettes",
                      description: "Très joueur",
                      photo_url: "https://example.com/photo.jpg",
                      gender: "Male",
                      neutered: true,
                      color: "gris",
                      user_id: "003a8b60-0032-4528-82b0-50307c161d56"
                    },
                    {
                      id: "f7ff2ad9-4d57-4091-8ea1-e231cc02da51",
                      name: "Gribouille",
                      breed: "Persan",
                      age: 5,
                      species: "Chat",
                      allergy: "pollen",
                      weight: 5.1,
                      diet: "pâtée",
                      description: "Calme et affectueux",
                      photo_url: "https://example.com/photo2.jpg",
                      gender: "Female",
                      neutered: false,
                      color: "blanc",
                      user_id: "003a8b60-0032-4528-82b0-50307c161d56"
                    }
                  ]
                },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '404': { description: 'petsitting request not found' },
        '400': { description: 'Bad request' },
        '500': { description: 'Internal server error' },
      },
    },
    UserAmisController.ResponseToFriendRequest,
    validateSchema(UserAmisResponseSchema),
    authenticate
  );


  swaggerRouter.route('/:id').patch(
    {
      description: 'Update a petsitting request',
      summary: 'Modify details of an existing petsitting request',
      tags: ['Demande de Petsitting'],
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
        description: 'petsitting request data to be updated',
        required: true,
        schema: {
          type: 'object',
            properties: {
            user_id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
            petsitter_id: { type: 'string', format: 'uuid', example: '4f330bea-b96c-47d3-82ac-b6de6a577a6a' },
            statusdemande: { type: 'string', enum: ['accepted', 'refused', 'pending'], example: 'pending'},
            message: { type: 'string', example: 'Salut' },
            petidtable: {
              type: 'array',
              items: { type: 'string', format: 'uuid', example: 'ed4244cc-e986-4a01-abfd-3d606dbf227c' },
              example: [
                "2145a17d-a34e-4871-b9e7-2bb4c25c3779",
                "0e9db21b-e95b-492b-a6f9-1bfab45e6ebe"
              ]
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'petsitting request updated successfully',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'petsitting request mise à jour avec succès' },
              UserAmis: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
                  user_id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
                  petsitter_id: { type: 'string', format: 'uuid', example: '4f330bea-b96c-47d3-82ac-b6de6a577a6a' },
                  statusdemande: { type: 'string', enum: ['accepted', 'refused', 'pending'], example: 'pending'},
                  message: { type: 'string', example: 'Salut' },
                  petidtable: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid', example: 'ed4244cc-e986-4a01-abfd-3d606dbf227c' },
                      name: { type: 'string', example: 'Miaou' },
                      breed: { type: 'string', example: 'Siamois' },
                      age: { type: 'integer', example: 3 },
                      species: { type: 'string', example: 'Chat' },
                      allergy: { type: 'string', example: 'aucune' },
                      weight: { type: 'number', example: 4.2 },
                      diet: { type: 'string', example: 'croquettes' },
                      description: { type: 'string', example: 'Très joueur' },
                      photo_url: { type: 'string', example: 'https://example.com/photo.jpg' },
                      gender: { type: 'string', enum: ['Male', 'Female', 'hermaphrodite'], example: 'Male' },
                      neutered: { type: 'boolean', example: true },
                      color: { type: 'string', example: 'gris' },
                      user_id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' }
                    }
                  },
                  example: [
                    {
                      id: "ed4244cc-e986-4a01-abfd-3d606dbf227c",
                      name: "Miaou",
                      breed: "Siamois",
                      age: 3,
                      species: "Chat",
                      allergy: "aucune",
                      weight: 4.2,
                      diet: "croquettes",
                      description: "Très joueur",
                      photo_url: "https://example.com/photo.jpg",
                      gender: "Male",
                      neutered: true,
                      color: "gris",
                      user_id: "003a8b60-0032-4528-82b0-50307c161d56"
                    },
                    {
                      id: "f7ff2ad9-4d57-4091-8ea1-e231cc02da51",
                      name: "Gribouille",
                      breed: "Persan",
                      age: 5,
                      species: "Chat",
                      allergy: "pollen",
                      weight: 5.1,
                      diet: "pâtée",
                      description: "Calme et affectueux",
                      photo_url: "https://example.com/photo2.jpg",
                      gender: "Female",
                      neutered: false,
                      color: "blanc",
                      user_id: "003a8b60-0032-4528-82b0-50307c161d56"
                    }
                  ]
                },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '404': { description: 'petsitting request not found' },
        '400': { description: 'Bad request' },
        '500': { description: 'Internal server error' },
      },
    },
    UserAmisController.updateDemandeAmiWithAllParameters,
    validateSchema(UserAmispatchSchema),
    authenticate
  );

  swaggerRouter.route('/:id').delete(
    {
      description: 'Delete a petsitting request',
      summary: 'Remove a petsitting request from the database',
      tags: ['Demande de Petsitting'],
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
        '200': { description: 'petsitting request deleted successfully' },
        '400': { description: 'Bad request' },
        '404': { description: 'petsitting request not found' },
        '500': { description: 'Internal serveur error' },
      },
    },
    UserAmisController.deleteDemandeAmi,
    authenticate
  );
  
  export default swaggerRouter;