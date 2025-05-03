import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export enum FolderName {
  PROFILE_PICTURES = 'profile_pictures',
  PET_PICTURES = 'pet_pictures',
  MESSAGE_PICTURES = 'message_pictures',
  PETSITTER_PICTURES = 'petsitter_pictures',
  IDENTITY_DOCUMENT = 'identity_document',
  PROFILE_PICTURES_PET = 'profile_pictures_pet',
}

export default cloudinary;
