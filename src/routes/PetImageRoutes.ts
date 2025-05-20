import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import PetImagesController from '@/controllers/PetImagesController';
import { authenticate } from '@/middleware/authMiddleware';

import { uploadMiddleware } from '@/middleware/uploadMiddleware';


const swaggerRouter = new SwaggerRouter();

swaggerRouter.route('/:petId').post(
  
  {
    description: 'Upload an image entity for a pet',
    summary: 'Add a new image to a pet',
    tags: ['Pet Images'],
    security: true,
    parameters: [
      {
        in: 'path',
        name: 'petId',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    requestBody: {
      
      contentType: 'multipart/form-data',
      required: true,
      description: "Image data",
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
      '201': { description: 'Image updated successfully' ,
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: "Photo ajoutée avec succès",
            },
            url_image: {
              type: 'string',
              example: 'https://example.com/uploads/photoanimal.jpg',
            },
          },
        },
      },
      '400': { description: 'Invalid request'},
      '404': { description: 'Image not found' },
      '500': { description: 'Internal server error' },  
    },
  },
  PetImagesController.createPetImage,
  uploadMiddleware,
  authenticate
);

swaggerRouter.route('/:petId').get(
  {
    description: 'Get all images entities of a pet',
    summary: 'Retrieve all images for a specific pet',
    tags: ['Pet Images'],
    security: true,
    parameters: [
      {
        in: 'path',
        name: 'petId',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    responses: {
      '200': { description: 'List of images retrieved successfully' },
      '400': { description: 'Invalid request' },
      '404': { description: 'No images found for this pet' },
      '500': { description: 'Internal server error' },
    },
  },
  PetImagesController.getPetImages,
  authenticate
);

swaggerRouter.route('/OneImage/:id').get(
  {
    description: 'Get an image by ID',
    summary: 'Retrieve an image of a pet by its unique identifier',
    tags: ['Pet Images'],
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
      '200': { description: 'Image found' },
      '404': { description: 'Image not found' },
      '400': { description: 'No Image for this ID' },
      '500': { description: 'Internal server error'}
    },
  },
  PetImagesController.getPetImageById,
  authenticate
);

swaggerRouter.route('/:imageId').delete(
  {
    description: 'Delete an image entity of a pet',
    summary: 'Remove a specific image from a pet',
    tags: ['Pet Images'],
    security: true,
    parameters: [
      {
        in: 'path',
        name: 'imageId',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    responses: {
      '200': { description: 'Image deleted successfully' },
      '400': { description: 'Invalid request' },
      '404': { description: 'Image not found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetImagesController.deletePetImage,
  authenticate
);

swaggerRouter.route('/:imageId').patch(
  {
    description: 'Update an image entity of a pet',
    summary: 'Modify an existing image of a pet',
    tags: ['Pet Images'],
    security: true,
    parameters: [
      {
        in: 'path',
        name: 'imageId',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    requestBody: {
      
      contentType: 'multipart/form-data',
      required: true,
      description: "Image data",
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
      '201': { description: 'Image updated successfully' ,
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: "Photo modifiée avec succès",
            },
            url_image: {
              type: 'string',
              example: 'https://example.com/uploads/photoanimal.jpg',
            },
          },
        },
      },
      '400': { description: 'Invalid request' },
      '404': { description: 'Image not found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetImagesController.updateImage,
  uploadMiddleware,
  authenticate
);

swaggerRouter.route('/Execute-Order-66/:petId').delete(
  {
    description: 'Delete all Images ',
    summary: 'Remove all Images for a pet',
    tags: ['Pet Images'],
    security: true,
    parameters: [
      {
        in: 'path',
        name: 'petId',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    responses: {
      '200': { description: 'Images deleted permanantly' },
      '400': { description: 'Invalid request' },
      '404': { description: 'Images not found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetImagesController.deleteAllImagesForAPet,
  authenticate
);

export default swaggerRouter;
