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
                throw new Error('Could not create pet image');
        }
        }

        static async getPetImageById(imageId: string): Promise<PetImage>  {
            try {
              if (!imageId) {
                throw ApiError.badRequest('Image ID is required.');
              }
          
              const petImage = await PetImage.findByPk(imageId);
          
              if (!petImage) {
                throw ApiError.notFound('Pet image not found.');
              }
          
              return petImage;
            } catch (error) {
              throw error; 
            }
          }


    static async getPetImages (petId: string): Promise<PetImage[]>  {
        try {
            const petImages = await PetImage.findAll({ where: { pet_id: petId }});

            return petImages;
        } catch (error) {
                throw new Error('Could not fetch pet images');
        }
    }

    static async deletePetImage  (imageId: string): Promise<boolean>{
        try {

            if (!imageId) {
                throw new Error("Cette image n'existe pas");
            }

            const deleted = await PetImage.destroy({ where: { imageId } });
            return deleted > 0;
        } catch (error) {
            throw new Error('Could not delete pet image');
        }
    }

    static async updatePetImage(imageId: string, newUrlImage: string): Promise<PetImage> {
        try {
            const petImage = await PetImage.findByPk(imageId);

            if (!petImage) {
                throw new Error('Pet image not found');
            }

            petImage.url_image = newUrlImage;
            await petImage.save();
            return petImage;
        } catch (error) {
            throw new Error('Could not update pet image');
        }
    }
}
export default PetImagesService;
