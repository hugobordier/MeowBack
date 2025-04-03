import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import PetService from '@/services/PetService';
import PetImagesService from '../services/PetImagesService';
import { ApiResponse } from '@utils/ApiResponse';

class PetImagesController{
    static async createPetImage(req: Request, res: Response) {
        try{
            const { petId, urlImage } = req.body;
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
            const newPetImage = await PetImagesService.createPetImage(petId, urlImage);
            // pet.photo_url = `/uploads/${req.file.filename}`;
            // await pet.save();
            return ApiResponse.created(res,"Image ajoutée avec succès",newPetImage);
            // return ApiResponse.ok(res, 'Image uploadée avec succès.', { imageUrl: pet.photo_url });
        }catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de l'upload de l'image");
        }
    };


    static async getPetImageById (req: Request, res: Response) {
        try{
            const { imageId } = req.params;
            if (!imageId) {
                return ApiResponse.badRequest(res, "ID de l'image requis");
            }
        
            const Image = await PetImagesService.getPetImageById(imageId);
            if (!Image) {
                return ApiResponse.notFound(res, 'Image non trouvée.');
            }
            return ApiResponse.ok(res,"Image récupérée",Image);
            // const imagePath = path.join(__dirname, '..', pet.photo_url);
            // if (!fs.existsSync(imagePath)) {
            //     return ApiResponse.notFound(res, 'Fichier introuvable.');
            // }
        
            // return ApiResponse.ok(res,"Fichier récupéré",imagePath);
            }catch (error) {
                return ApiResponse.internalServerError(res, "Erreur lors de getPetImageById");
            }
        
    };

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
        
            // const imagePath = path.join(__dirname, '..', pet.photo_url);
            // if (fs.existsSync(imagePath)) {
            //     fs.unlinkSync(imagePath); 
            // }
        
            // pet.photo_url = "null";
            // await pet.save();
            return ApiResponse.ok(res, 'Image supprimée avec succès.');
        }catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de l'upload de l'image");
        }
    };
}
export default PetImagesController;