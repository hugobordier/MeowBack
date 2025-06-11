import type { Request, Response } from 'express';
import PetService from '@/services/PetService';
import PetImagesService from '../services/PetImagesService';
import { ApiResponse } from '@utils/ApiResponse';

class PetImagesController{
    static async createPetImage(req: Request, res: Response) {
        try{
            
            const { petId } = req.params;

            if (!petId) {
                return ApiResponse.badRequest(res, "ID de l'animal requis");
            }

            const pet = await PetService.getPetById(petId)
            if (pet?.user_id !== req.user?.id){
                return ApiResponse.badRequest(res,"pas ton pet ")
            }

            if (!pet) {
                return ApiResponse.notFound(res, 'Pet non trouvé.');
            }

            if (!req.file) {
                return ApiResponse.badRequest(res, 'Aucun fichier uploadé.');
            }
            const newPetImage = await PetImagesService.createPetImage(petId, req.file);

            return ApiResponse.created(res,"Image ajoutée avec succès",newPetImage);
        }catch (error:any) {
            return ApiResponse.internalServerError(res, "Erreur lors de l'upload de l'image",error.message);
        }
    };


    static async getPetImageById (req: Request, res: Response) {
        try{
            const { id } = req.params;
            if (!id) {
                return ApiResponse.badRequest(res, "ID de l'image requis");
            }
            
            const Image = await PetImagesService.getPetImageById(id);
            if (!Image) {
                return ApiResponse.notFound(res, 'Image non trouvée.');
            }
            return ApiResponse.ok(res,"Image récupérée",Image);
        }catch (error:any) {
            return ApiResponse.internalServerError(res, "Erreur lors de getPetImageById",error.message);
        }
        
    }

    static async getPetImages(req: Request, res: Response) {
        try {
            const { petId } = req.params;

            const page = parseInt(req.query.page as string) || 1;
            const perPage = parseInt(req.query.limit as string) || 10;

            const {petImages,total} = await PetImagesService.getPetImages({petId,page,perPage});
            const pagination= ApiResponse.createPagination( total, page, perPage);
            if(!petId){
                return ApiResponse.badRequest(res,"id de l'animal requis")
            }
            return ApiResponse.ok(res,"Toutes les images pour le pet ont été récupérées",petImages,pagination);
        } catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de getPetImageById");
        }
    }

    


    static async deletePetImage (req: Request, res: Response) {
        try{
            const { imageId } = req.params;
            
            if (!imageId) {
                return ApiResponse.badRequest(res, "ID de l'image requis");
            }
            const Image = await PetImagesService.getPetImageById(imageId);
            if (!Image) {
                return ApiResponse.notFound(res, 'Image non trouvée.');
            }

            const petID = Image.pet_id;
            const pet = await PetService.getPetById(petID);

            if (!pet) {
                return ApiResponse.notFound(res, 'Pet non trouvé.');
            }
            if (pet?.user_id !== req.user?.id){
                return ApiResponse.badRequest(res,"pas ton pet")
            }

            const deleted = await PetImagesService.deletePetImage(imageId);
            if (!deleted) {
                return ApiResponse.notFound(res,"Image non trouvée");
              }
            return ApiResponse.ok(res, 'Image supprimée avec succès.');
        }catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de la suppression");
        }
    }

    static async updateImage(req: Request, res: Response) {
        try {
            const { imageId } = req.params;  
            if (!imageId){
                return ApiResponse.badRequest(res,"ID de l'image requis");
            }
            if (!req.file){
                return ApiResponse.badRequest(res,"Nouvelle image requise");
            }
            const ImageOriginale = PetImagesService.getPetImageById(imageId);
            const petID=(await ImageOriginale).pet_id
            const pet = await PetService.getPetById(petID);

            if (!pet) {
                return ApiResponse.notFound(res, "Pet de l'image non trouvé.");
            }
            
            if (pet?.user_id !== req.user?.id){
                return ApiResponse.badRequest(res,"pas ton pet");
            }

            const updatedPetImage = await PetImagesService.updateImage(imageId, req.file);
            return ApiResponse.ok(res, 'Image mise à jour avec succès.',updatedPetImage);
        } catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de la mise à jour de l'image");
        }
    }

    static async deleteAllImagesForAPet(req:Request,res:Response){
        try{
            const {petId} = req.params
            if(!petId){
                return ApiResponse.badRequest(res, "ID du pet requis");
            }
            console.log("petid : ",petId);
            const pet = await PetService.getPetById(petId);

            if (!pet) {
                return ApiResponse.notFound(res, 'Pet non trouvé.');
            }
            if (pet?.user_id !== req.user?.id){
                return ApiResponse.badRequest(res,"pas ton pet");
            }

            const deleted = await PetImagesService.deleteAllImagesForAPet(petId);
            if (!deleted) {
                return ApiResponse.notFound(res,"Images non trouvées pour ce pet");
              }
            return ApiResponse.ok(res, 'Images supprimées avec succès.');
        }catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de la suppression");
        }
    }
}
export default PetImagesController;