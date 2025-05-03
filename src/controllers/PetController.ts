import type { Request, Response } from 'express';
import { petSchema } from "@/schema/PetSchema";
import PetService from '@/services/PetService';
import { ApiResponse } from '@utils/ApiResponse';
import { ZodError } from 'zod'; 

class PetController{

    static async createPet(req: Request, res: Response) {
      try {
        
        const newPet = await PetService.createPet(req.body,req.user?.id );
        return ApiResponse.created(res,"Animal créé avec succès",newPet);

      } catch (error) {
            return ApiResponse.internalServerError(res,"Erreur lors de la crétion de l'animal");
      }
    }


    static async getAllPets(req: Request, res: Response) {
      try {

        const page = parseInt(req.query.page as string) || 1;
        const perPage = parseInt(req.query.perPage as string) || 10;

        const {pets,total} = await PetService.getAllPets({page,perPage});
        const pagination= ApiResponse.createPagination( total, page, perPage);

        return ApiResponse.ok(res,"données récupérées", pets,pagination);

      } catch (error) {
        return ApiResponse.internalServerError(res,"Erreur lors de la récupération des animaux");
      }
    }
    
  
    static async getPetById(req: Request, res: Response) {
      try {
        const { id } = req.params;

        if (!id) {
          return ApiResponse.badRequest(res, "ID de l'animal requis");
        }

        const pet = await PetService.getPetById(id)

        if (!pet) {
          return ApiResponse.notFound(res,"Animal non trouvé");
        }
        return ApiResponse.ok(res,"Animal récupéré",pet);
      } catch (error) {
        return ApiResponse.internalServerError(res,"Erreur lors de la récupération de l'animal");
      }
    }
  
    static async updatePet(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const pet = await PetService.getPetById(id)
        if (pet?.user_id !== req.user?.id){
          return ApiResponse.badRequest(res,"pas ton pet ")
        }
        const updatedPet = await PetService.updatePet(id, req.body);
        if (!updatedPet) {
          return ApiResponse.notFound(res,"Animal non trouvé");
        }
        return ApiResponse.ok(res,"Animal mis à jour",updatedPet);
      } catch (error) {
        return ApiResponse.internalServerError(res,"Erreur lors de la mise à jour de l'animal");
      }
    }
  
    static async deletePet(req: Request, res: Response) {
      try {
        const { id } = req.params;

        if (!id) {
          return ApiResponse.badRequest(res, "ID de l'animal requis");
        }

        const pet = await PetService.getPetById(id)
        if (pet?.user_id !== req.user?.id){
          return ApiResponse.badRequest(res,"pas ton pet")
        }

        const deleted = await PetService.deletePet(id);
        if (!deleted) {
          return ApiResponse.notFound(res,"Animal non trouvé");
        }
        return ApiResponse.ok(res,"Animal supprimé avec succès" );
      } catch (error) {
        return ApiResponse.internalServerError(res,"Erreur lors de la suppression de l'animal");
      }
    }

    static async uploadImagePetProfile(req: Request, res: Response) {
      try{
          
          const { id } = req.params;

          if (!id) {
              return ApiResponse.badRequest(res, "ID de l'animal requis");
          }

          const pet = await PetService.getPetById(id)
          if (pet?.user_id !== req.user?.id){
              return ApiResponse.badRequest(res,"pas ton pet ")
          }

          if (!pet) {
              return ApiResponse.notFound(res, 'Pet non trouvé.');
          }

          if (!req.file) {
              return ApiResponse.badRequest(res, 'Aucun fichier uploadé.');
          }
          const photo_url = await PetService.uploadImagePetProfile(id, req.file);

          return ApiResponse.created(res,"Image de profil ajoutée avec succès",photo_url);
      }catch (error:any) {
          return ApiResponse.internalServerError(res, "Erreur lors de l'upload de l'image de profil",error.message);
      }
  };

    static async deletePetImageProfile (req: Request, res: Response) {
      try{
          const { id } = req.params;
          
          if (!id) {
              return ApiResponse.badRequest(res, "ID du pet requis");
          }
          const Pet = await PetService.getPetById(id);
          if (!Pet) {
              return ApiResponse.notFound(res, 'Pet non trouvé.');
          }

          if (Pet?.user_id !== req.user?.id){
              return ApiResponse.badRequest(res,"pas ton pet")
          }

          const success= await PetService.deletePetImageProfile(id);
          if (!success) {
              return ApiResponse.notFound(res,"Suppression échouée");
            }
          return ApiResponse.ok(res, 'Image supprimée avec succès.');
      }catch (error) {
          return ApiResponse.internalServerError(res, "Erreur lors de la suppression");
      }
  }
  }
  
export default PetController;