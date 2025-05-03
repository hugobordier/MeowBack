import type { AvailabilityDay } from '@/types/type';
import pets from '@/models/pets';
import { Op, ValidationError } from 'sequelize';
import type { UUID } from 'crypto';
import CloudinaryService from './CloudinaryService';
import path from 'path';
import { FolderName } from '@/config/cloudinary.config';
import ApiError from '@utils/ApiError';

interface PetsResponse {
  pets: pets[];  
  total: number; 
}

class PetService {
    static async createPet(data: Partial<pets>,user_id? : string): Promise<pets> {
        try {
          if (!user_id) {
            throw new Error("L'ID utilisateur est requis");
          }
    
          data.user_id = user_id;
          if (!data.name || data.name.trim().length < 3) {
            throw new Error("Le nom de l'animal doit avoir au moins 3 caractères");
          }
          if (!data.breed){
            throw new Error("La race de l'animal doit être répertoriée")
          }
    
          if (data.weight !== undefined && data.weight < 0) {
            throw new Error("Le poids doit être un nombre positif");
          }
    
          if (data.age !== undefined && data.age < 0) {
            throw new Error("L'âge doit être un nombre positif");
          }
          if (!data.species){
            throw new Error("L'espèce de l'animal doit être répertoriée")
          }
          if (!data.diet){
            throw new Error("Le régime alimentaire de l'animal doit être répertorié")
          }
          if (!data.gender){
            throw new Error("Le genre de l'animal doit être répertorié")
          }
    
          const pet = await pets.create(data);
          return pet;
        } catch (error) {
          console.error("Erreur dans createPet:", error);
    
          if (error instanceof ValidationError) {
            const validationErrors = error.errors.map((err) => err.message).join(", ");
            throw new Error(`Validation échouée: ${validationErrors}`);
          }
    
          throw error;
        }
      }
    
      static async updatePet(id: string, data: Partial<pets>): Promise<[boolean, pets | null]> {
        try {
          if (!id) {
            throw new Error("ID du pet non spécifié pour la mise à jour");
          }
    
          const pet = await pets.findByPk(id);
          if (!pet) {
            return [false, null];
          }
    
          if (!data.name || data.name.trim().length < 3) {
            throw new Error("Le nom de l'animal doit avoir au moins 3 caractères");
          }
          if (!data.breed){
            throw new Error("La race de l'animal doit être répertoriée")
          }
    
          if (data.weight !== undefined && data.weight < 0) {
            throw new Error("Le poids doit être un nombre positif");
          }
    
          if (data.age !== undefined && data.age < 0) {
            throw new Error("L'âge doit être un nombre positif");
          }
          if (!data.species){
            throw new Error("L'espèce de l'animal doit être répertoriée")
          }
          if (!data.diet){
            throw new Error("Le régime alimentaire de l'animal doit être répertorié")
          }
          if (!data.gender){
            throw new Error("Le genre de l'animal doit être répertorié")
          }
    
          const [updated] = await pets.update(data, { where: { id } });
    
          const updatedPet = updated > 0 ? await pets.findByPk(id) : null;
    
          return [updated > 0, updatedPet];
        } catch (error) {
          console.error(`Erreur dans updatePet(${id}):`, error);
    
          if (error instanceof ValidationError) {
            const validationErrors = error.errors.map((err) => err.message).join(", ");
            throw new Error(`Validation échouée pour le pet ID ${id}: ${validationErrors}`);
          }
    
          throw error;
        }
      }
    
      static async deletePet(id: string): Promise<boolean> {
        try {
          if (!id) {
            throw new Error("ID du pet requis pour la suppression");
          }
    
          const deleted = await pets.destroy({ where: { id } });

          return deleted > 0;
        } catch (error) {
          console.error(`Erreur dans la suppression du pet(${id}):`, error);
          throw error;
        }
      }
    
      static async getPetById(id: string): Promise<pets | null> {
        try {
          if (!id) {
            throw new Error("ID du pet requis pour la récupération");
          }
          const pet = await pets.findByPk(id)
          if (!pet) {
            return null;
          }
    
          return pet;

        } catch (error) {
          console.error(`Erreur dans la récupération pour l'animal(${id}):`, error);
          throw error;
        }
      }
  
      static async getAllPets({ page, perPage }: { page: number, perPage: number }): Promise<PetsResponse> {
        try {
          const offset = (page - 1) * perPage;
          const listPets = await pets.findAll({limit:perPage,offset:offset,});
          const totalpets = await pets.count();

          return{
            pets : listPets,
            total : totalpets
          };
        } catch (error) {
          console.error("Erreur dans getAllPets:", error);
          throw error;
        }
      }

      static async uploadImagePetProfile(petId: string, file: Express.Multer.File) {
        try {
          const pet = await pets.findByPk(petId);
    
          if (!pet) {
            throw ApiError.notFound("Pet non trouvé");
          }
    
          const fileExtension = path.extname(file.originalname);
          const newFileName = `${petId}${fileExtension}`;
          file.originalname = newFileName;
    
          const uploadResult = await CloudinaryService.uploadImage(file, petId, {
            folder: FolderName.PROFILE_PICTURES_PET as string,
          });
    
          await pet.update({
            photo_url: uploadResult.secure_url,
          });
          return uploadResult.secure_url;
        } catch (error) {
          console.error(
            "Erreur lors de la mise à jour de l'image de profil:",
            error
          );
          return {
            success: false,
            message: "Une erreur est survenue lors de l'upload",
          };
        }
      }



      static async deletePetImageProfile  (id: string): Promise<boolean>{
        try {
            const pet = await pets.findByPk(id);
            if (!pet) {
                throw ApiError.notFound("Ce pet n'existe pas");
            }
            
            await pet.update({ photo_url: null });
            await CloudinaryService.deleteImage(id,FolderName.PROFILE_PICTURES_PET);

            return true;
        } catch (error) {
            console.error('Erreur dans deletePetImageProfile',error);
            if (error instanceof ApiError) {
              throw error;
            }
            throw ApiError.internal(
              'Erreur inconnue dans deletePetImageProfile'
            );
          }
    }
    }
    
    
    export default PetService;
