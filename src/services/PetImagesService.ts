import PetImage from '../models/PetImage'; 
import ApiError from '@utils/ApiError';
import CloudinaryService from './CloudinaryService';
import path from 'path';
import { FolderName } from '@/config/cloudinary.config';


class PetImagesService {
    static async createPetImage(petId: string, file: Express.Multer.File): Promise<PetImage> {
        try {
          const petImage = await PetImage.create({
            pet_id: petId,
            url_image: "",
            });
            const fileExtension = path.extname(file.originalname);
            const newFileName = `${petImage.id}${fileExtension}`;
            file.originalname = newFileName;
      
            const uploadResult = await CloudinaryService.uploadImage(file, petImage.id, {
              folder: FolderName.PET_PICTURES as string,
            });
      
            await petImage.update({url_image: uploadResult.secure_url,});

            return petImage;
        } catch (error) {
            console.error('Erreur dans createPetImage',error);
            if (error instanceof ApiError) {
              throw error;
            }
            throw ApiError.internal(
              'Erreur inconnue dans createPetImage'
            );
          }
        }

        static async getPetImageById(id: string): Promise<PetImage>  {
            try {
              if (!id) {
                throw ApiError.badRequest('Image ID est requis.');
              }
          
              const petImage = await PetImage.findByPk(id);
          
              if (!petImage) {
                throw ApiError.notFound('Pet image pas trouvée.');
              }
          
              return petImage;
            } catch (error) {
              console.error('Erreur dans getPetImageById',error);
              if (error instanceof ApiError) {
                throw error;
              } 
              throw ApiError.internal('Erreur inconnue dans getPetImageById');
          }
          }


    static async getPetImages ({ petId,page, perPage }: { page: number, perPage: number ,petId: string}): Promise<{ petImages: PetImage[]; total: number }> {
        try {
            const offset = (page - 1) * perPage;
            const petImages = await PetImage.findAll({limit:perPage,offset:offset, where: { pet_id: petId }});
            if (petImages.length === 0) {
              throw ApiError.notFound("Images inexistantes pour ce pet.");
            }
            const totalImages = await PetImage.count({ where: { pet_id: petId } });
  
            return{
              petImages,
              total : totalImages
            };

        } catch (error) {
            console.error('Erreur dans getPetImages',error);
            if (error instanceof ApiError) {
              throw error;
            }
            throw ApiError.internal(
              'Erreur inconnue dans getPetImages'
            );
          }
    }

    static async deletePetImage  (id: string): Promise<boolean>{
        try {

            if (!id) {
                throw ApiError.notFound("Cette image n'existe pas");
            }

            const deleted = await PetImage.destroy({ where: { id } });
            await CloudinaryService.deleteImage(id,FolderName.PET_PICTURES);

            return deleted > 0;
        } catch (error) {
            console.error('Erreur dans deletePetImage',error);
            if (error instanceof ApiError) {
              throw error;
            }
            throw ApiError.internal(
              'Erreur inconnue dans deletePetImage'
            );
          }
    }

    static async updateImage(id: string, file: Express.Multer.File): Promise<PetImage> {
        try {
            if (!id) {
                throw ApiError.badRequest('Image ID is required.');
            }
    
            if (!file) {
                throw ApiError.badRequest('La nouvelle image est requise');
            }
    
            const petImage = await PetImage.findByPk(id);
    
            if (!petImage) {
                throw ApiError.notFound('Pet image not found.');
            }
            
            const fileExtension = path.extname(file.originalname);
            const newFileName = `${id}${fileExtension}`;
            file.originalname = newFileName;
      
            const uploadResult = await CloudinaryService.uploadImage(file, id, {
              folder: FolderName.PET_PICTURES as string,
            });
      
            await petImage.update({url_image: uploadResult.secure_url,});
      
            return petImage;
          } catch (error) {
            console.error("Erreur lors de la mise à jour de l'image de profil:",error);
            if (error instanceof ApiError) {
              throw error;
            }throw ApiError.internal(
              'Erreur inconnue dans updatePetImage'
            )
    }
  }

  static async deleteAllImagesForAPet  (petId: string): Promise<boolean>{
    try {

        if (!petId) {
            throw ApiError.notFound("Ce pet n'existe pas");
        }
        const petImages = await PetImage.findAll({ where: { pet_id: petId }});

        for (const image of petImages) {
          try {
            await CloudinaryService.deleteImage(image.id, FolderName.PET_PICTURES);
          } catch (error) {
            console.error("Erreur lors de la suppression dans Cloudinary :", error);
            
            if (error instanceof ApiError) {
              throw error;
            }
            
            throw ApiError.notFound('Erreur de suppression dans Cloudinary');
          }
        }
        
        
        const deleted = await PetImage.destroy({ where: { pet_id:petId } });
        return deleted > 0;
    } catch (error) {
        console.error('Erreur dans deleteAllImagesForAPet',error);
        if (error instanceof ApiError) {
          throw error;
        }
        throw ApiError.internal(
          'Erreur inconnue dans deleteAllImagesForAPet'
        );
      }
}
}
export default PetImagesService;
