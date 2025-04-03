import PetImage from '../models/PetImage'; 
import ApiError from '@utils/ApiError';


class PetImagesService {
    static async createPetImage(petId: string, urlImage: string): Promise<PetImage> {
        try {
            const petImage = await PetImage.create({
            pet_id: petId,
            url_image: urlImage,
            });

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

        static async getPetImageById(imageId: string): Promise<PetImage>  {
            try {
              if (!imageId) {
                throw ApiError.badRequest('Image ID est requis.');
              }
          
              const petImage = await PetImage.findByPk(imageId);
          
              if (!petImage) {
                throw ApiError.notFound('Pet image pas trouvée.');
              }
          
              return petImage;
            } catch (error) {
            
            console.error('Erreur dans getPetImageById',error);
            if (error instanceof ApiError) {
              throw error;
            }
            throw ApiError.internal(
              'Erreur inconnue dans getPetImageById'
            );
          }
          }


    static async getPetImages (petId: string): Promise<PetImage[]>  {
        try {
            const petImages = await PetImage.findAll({ where: { pet_id: petId }});

            if (!petImages) {
                throw ApiError.notFound('images inexistantes pour ce pet.');
              }
            return petImages;
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

    static async deletePetImage  (imageId: string): Promise<boolean>{
        try {

            if (!imageId) {
                throw ApiError.notFound("Cette image n'existe pas");
            }

            const deleted = await PetImage.destroy({ where: { imageId } });
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

    static async updatePetImage(imageId: string, newUrlImage: string): Promise<PetImage> {
        try {
            if (!imageId) {
                throw ApiError.badRequest('Image ID is required.');
            }
    
            if (!newUrlImage) {
                throw ApiError.badRequest('New image URL is required.');
            }
    
            const petImage = await PetImage.findByPk(imageId);
    
            if (!petImage) {
                throw ApiError.notFound('Pet image not found.');
            }
    
            petImage.url_image = newUrlImage;
            await petImage.save();
    
            return petImage;
        } catch (error) {
            console.error('Erreur dans updatePetImage',error);
            if (error instanceof ApiError) {
              throw error;
            }
            throw ApiError.internal(
              'Erreur inconnue dans updatePetImage'
            );
          }
    }
}
export default PetImagesService;
