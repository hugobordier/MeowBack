import type { AvailabilityDay } from '@/types/type';
import pets from '@/models/pets';
import { Op, ValidationError } from 'sequelize';

<<<<<<< HEAD
interface PetsResponse {
  pets: pets[];  
  total: number; 
}

=======
>>>>>>> origin/hippo/crudpet
class PetService {
    static async createPet(data: Partial<pets>): Promise<pets> {
        try {
          if (!data.user_id) {
            throw new Error("ID utilisateur requis pour créer un animal");
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
    
          return await pets.findByPk(id);
        } catch (error) {
          console.error(`Erreur dans la récupération pour l'animal(${id}):`, error);
          throw error;
        }
      }
    

<<<<<<< HEAD
      static async getAllPets({ page, perPage }: { page: number, perPage: number }): Promise<PetsResponse> {
        try {
          const offset = (page - 1) * perPage;
          const listPets = await pets.findAll({limit:perPage,offset:offset,});
          const totalpets = await pets.count();

          return{
            pets : listPets,
            total : totalpets
          };
=======
      static async getAllPets(): Promise<pets[]> {
        try {
          return await pets.findAll();
>>>>>>> origin/hippo/crudpet
        } catch (error) {
          console.error("Erreur dans getAllPets:", error);
          throw error;
        }
      }
    }
    
    export default PetService;
