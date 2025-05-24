import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import { authenticate } from '@/middleware/authMiddleware';
import UserAmisController from '@/controllers/UserAmisController';
import { validateSchema } from '@/middleware/validateSchema';
import { UserAmiscreateSchema, UserAmispatchSchema, UserAmisResponseSchema } from '@/schema/UserAmisSchema';

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route('/').post(
  {
    description: 'Create a new friend request',
    summary: 'Add a friend request',
    tags: ['Amis'],
    security: true,
    requestBody: {
      description: 'Friend data to be added',
      required: true,
      schema: {
        type: 'object',
        properties: {
          friend_id: { type: 'string',format:"uuid",example:"51b28e48-2133-4822-b515-294f840d3e81"},
        },
        required: ['friend_id'],
      },
    },
    responses: {
      '201': {
        description: 'Friend request created successfully',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
            user_id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
            friend_id: { type: 'string', format: 'uuid', example: '15987b72-70c7-454e-ab06-21751706384b' },
            statusdemande: { type: 'string', enum: ['accepted', 'refused', 'pending'], example: 'pending'},
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

  
  swaggerRouter.route('/:id').get(
    {
      description: 'Get friend request by ID',
      summary: 'Retrieve a friend request by its unique identifier',
      tags: ['Amis'],
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
        '200': { description: 'friend request found' },
        '404': { description: 'friend request not found' },
        '400': { description: 'No friend request for this ID' },
        '500': { description: 'Internal server error'}
      },
    },
    UserAmisController.getUserAmiById,
    authenticate
  );

  swaggerRouter.route('/').get(
    {
      description: 'Get all friend requests',
      summary: 'Retrieve a list of all friend requests',
      tags: ['Amis'],
      security:true,
      responses: {
        '200': { description: 'List of friend requests retrieved successfully' },
        '400': { description: 'Bad request' },
        '500': { description: 'Internal server error' },
      },
    },
    UserAmisController.getAllUserAmisForAUser,
    authenticate
  );
  
    swaggerRouter.route('/ReponseDemande/:iddemandeur').patch(
    {
      description: 'Respond to a friend request',
      summary: 'Respond to an existing friend request',
      tags: ['Amis'],
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
        description: 'friend request data to be updated by response',
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
          description: 'Response to friend request successfull',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'friend request mise à jour avec succès' },
              UserAmis: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
                  user_id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
                  friend_id: { type: 'string', format: 'uuid', example: '15987b72-70c7-454e-ab06-21751706384b' },
                  statusdemande: { type: 'string', enum: ['accepted', 'refused', 'pending'], example: 'pending'},
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '404': { description: 'friend request not found' },
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
      description: 'Update a friend request',
      summary: 'Modify details of an existing friend request',
      tags: ['Amis'],
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
        description: 'friend request data to be updated',
        required: true,
        schema: {
          type: 'object',
            properties: {
            user_id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
            friend_id: { type: 'string', format: 'uuid', example: '15987b72-70c7-454e-ab06-21751706384b' },
            statusdemande: { type: 'string', enum: ['accepted', 'refused', 'pending'], example: 'pending'},
          },
        },
      },
      responses: {
        '200': {
          description: 'friend request updated successfully',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'friend request mise à jour avec succès' },
              UserAmis: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
                  user_id: { type: 'string', format: 'uuid', example: '003a8b60-0032-4528-82b0-50307c161d56' },
                  friend_id: { type: 'string', format: 'uuid', example: '15987b72-70c7-454e-ab06-21751706384b' },
                  statusdemande: { type: 'string', enum: ['accepted', 'refused', 'pending'], example: 'pending'},
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '404': { description: 'friend request not found' },
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
      description: 'Delete a friend request',
      summary: 'Remove a friend request from the database',
      tags: ['Amis'],
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
        '200': { description: 'friend request deleted successfully' },
        '400': { description: 'Bad request' },
        '404': { description: 'friend request not found' },
        '500': { description: 'Internal serveur error' },
      },
    },
    UserAmisController.deleteDemandeAmi,
    authenticate
  );
  
  export default swaggerRouter;