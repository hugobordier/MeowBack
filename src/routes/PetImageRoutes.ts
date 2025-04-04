import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import PetImagesController from '@/controllers/PetImagesController';
import { authenticate } from '@/middleware/authMiddleware';
import { validateSchema } from '@/middleware/validateSchema';
import { petImageSchema } from '@/schema/PetImageSchema';

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route('/pets/:petId/images').post(
  {
    description: 'Upload an image for a pet',
    summary: 'Add a new image to a pet',
    tags: ['Pet Images'],
    security: true,
    requestBody: {
      description: 'Image data',
      required: true,
      schema: {
        type: 'object',
        properties: {
          url_image: { type: 'string', example: 'https://example.com/dog.jpg' },
        },
        required: ['url_image'],
      },
    },
    responses: {
      '201': { description: 'Image uploaded successfully' },
      '400': { description: 'Invalid data' },
      '404': { description: 'Pet not found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetImagesController.createPetImage,
  validateSchema(PetImageSchema),
  authenticate
);

swaggerRouter.route('/pets/:petId/images').get(
  {
    description: 'Get all images of a pet',
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

swaggerRouter.route('/pets/:petId/images/:imageId').delete(
  {
    description: 'Delete an image of a pet',
    summary: 'Remove a specific image from a pet',
    tags: ['Pet Images'],
    security: true,
    parameters: [
      {
        in: 'path',
        name: 'petId',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
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

swaggerRouter.route('/pets/:petId/images/:imageId').patch(
  {
    description: 'Update an image of a pet',
    summary: 'Modify an existing image of a pet',
    tags: ['Pet Images'],
    security: true,
    parameters: [
      {
        in: 'path',
        name: 'petId',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        in: 'path',
        name: 'imageId',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    requestBody: {
      description: 'Updated image data',
      required: true,
      schema: {
        type: 'object',
        properties: {
          url_image: { type: 'string', example: 'https://example.com/new-image.jpg' },
        },
        required: ['url_image'],
      },
    },
    responses: {
      '200': { description: 'Image updated successfully' },
      '400': { description: 'Invalid request' },
      '404': { description: 'Image not found' },
      '500': { description: 'Internal server error' },
    },
  },
  PetImagesController.updatePetImage,
  validateSchema(petImageSchema),
  authenticate
);

export default swaggerRouter;
