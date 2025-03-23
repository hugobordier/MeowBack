import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import PetController from '../controllers/PetController';
import { authenticate } from '@/middleware/authMiddleware';

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route('/Create').post(
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
          user_id: { type: 'string', format: 'uuid', example: '7c1ab762-96d9-4340-921f-72817af3917e' },
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
      '400': { description: 'Bad request' },
    },
  },
  PetController.createPet
);

  
  swaggerRouter.route('/GetPet/:id').get(
    {
      description: 'Get a pet by ID',
      summary: 'Retrieve a pet by its unique identifier',
      tags: ['Pets'],
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
        '500': { description: 'Internal server error'}
      },
    },
    PetController.getPetById
  );

  swaggerRouter.route('/pets').get(
    {
      description: 'Get all pets',
      summary: 'Retrieve a list of all pets',
      tags: ['Pets'],
      responses: {
        '200': { description: 'List of pets retrieved successfully' },
        '500': { description: 'Internal server error' },
      },
    },
    PetController.getAllPets
  );
  
  swaggerRouter.route('/Update/:id').put(
    {
      description: 'Update a pet',
      summary: 'Modify details of an existing pet',
      tags: ['Pets'],
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
            user_id: { type: 'string', format: 'uuid', example: '7c1ab762-96d9-4340-921f-72817af3917e' },
          },
          required: [
            'name',
            'breed',
            'age',
            'species',
            'weight',
            'diet',
            'gender',
            'user_id',
          ],
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
                  user_id: { type: 'string', example: '7c1ab762-96d9-4340-921f-72817af3917e' },
                },
              },
            },
          },
        },
        '404': { description: 'Pet not found' },
        '500': { description: 'Internal server error' },
      },
    },
    PetController.updatePet
  );

  swaggerRouter.route('/pets/:id').delete(
    {
      description: 'Delete a pet',
      summary: 'Remove a pet from the database',
      tags: ['Pets'],
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
        '404': { description: 'Pet not found' },
      },
    },
    PetController.deletePet
  );
  
  
  export default swaggerRouter;