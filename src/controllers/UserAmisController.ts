import type { Request, Response } from 'express';
import { ApiResponse } from '@utils/ApiResponse';
import UserAmisService from '@/services/UserAmisService';
import ApiError from '@utils/ApiError';
import Pet from '@/models/pets';
class UserAmisController{
    static async createRequestAmi(req: Request, res: Response) {
        try{
            
            const { petsitter_id,message,petidtable } = req.body;
            if (!req.user?.id) {
                return ApiResponse.badRequest(res, "Well t'as pas ta carte d'identitée");
            }
            if (!petsitter_id) {
                return ApiResponse.badRequest(res, "Id de l'ami à envoyer la demande requis");
            }
            if(petidtable && Array.isArray(petidtable) && petidtable.length > 0){
                if (petidtable.length > 5) {
                    return ApiResponse.badRequest(res, "Tu ne peux pas faire de demande de petsitting pour plus de 5 pets");
                }
                const pettableuser = await Pet.findAll({where: {user_id: req.user?.id}});
                const idpetsuser = pettableuser.map(pet => pet.id);
                for (let i=0;i<petidtable.length;i++){
                    if (!idpetsuser.includes(petidtable[i])) {
                        return ApiResponse.badRequest(res, "Tu ne peux pas faire de demande de petsitting pour des pets qui ne t'appartiennent pas");
                    }
                }}
            const newdemande = await UserAmisService.createRequestAmi(req.user?.id,petsitter_id,message,petidtable);
            let pets: Pet[] = [];
            if (newdemande.petidtable && newdemande.petidtable.length > 0) {
                pets = await Pet.findAll({ where: { id: newdemande.petidtable } });
            }
            const response = {
                ...newdemande.toJSON(),
                petidtable: pets
            };
            return ApiResponse.created(res,"Demande de petsitting ajoutée avec succès",response);
        }catch (error:any) {
            return ApiResponse.internalServerError(res, "Erreur lors de la création de la demande",error.message);
        }
    };


    static async getUserAmiById (req: Request, res: Response) {
        try{
            const { id } = req.params;
            if (!id) {
                return ApiResponse.badRequest(res, "ID de la Demande de petsitting requis");
            }
            
            const demande = await UserAmisService.getUserAmiById(id);
            if (!demande) {
                return ApiResponse.notFound(res, "Demande de petsitting non trouvée.");
            }
            if (demande?.user_id !== req.user?.id){
                return ApiResponse.badRequest(res,"pas ta demande")
            }

            let pets: Pet[] = [];
            if (demande.petidtable && demande.petidtable.length > 0) {
                pets = await Pet.findAll({ where: { id: demande.petidtable } });
            }
            const response = {
                ...demande.toJSON(),
                petidtable: pets
            };
            return ApiResponse.ok(res,"Demande de petsitting récupérée",response);
        }catch (error:any) {
            return ApiResponse.internalServerError(res, "Erreur lors de getUserAmiById",error.message);
        }
        
    }

    static async getAllUserAmisForAUser(req: Request, res: Response) {
        try {
            if(!req.user?.id){
                return ApiResponse.badRequest(res,"L'id utilisateur est inexistant")
            }
            const page = parseInt(req.query.page as string) || 1;
            const perPage = parseInt(req.query.limit as string) || 10;

            const {userAmis,total} = await UserAmisService.getAllUserAmisForAUser({userId: req.user!.id,page,perPage});
            const pagination= ApiResponse.createPagination( total, page, perPage);

            // Ajout du tableau de pets pour chaque demande
            const userAmisWithPets = await Promise.all(userAmis.map(async (demande) => {
                let pets: Pet[] = [];
                if (demande.petidtable && demande.petidtable.length > 0) {
                    pets = await Pet.findAll({ where: { id: demande.petidtable } });
                }
                return {
                    ...demande.toJSON(),
                    petidtable: pets
                };
            }));

            return ApiResponse.ok(res,"Toutes les demandes de petsitting envoyées pour l'utilisateur courant ont été récupérées",userAmisWithPets,pagination);
        } catch (error) {
            if(error instanceof ApiError){
                return ApiResponse.notFound(res,"Pas de Demande de petsitting trouvée")
            }
            return ApiResponse.internalServerError(res, "Erreur lors de getAllUserAmisForAUser");
        }
    }

    static async getAllUserAmisForAPetsitter(req: Request, res: Response) {
        try {
            if(!req.user?.id){
                return ApiResponse.badRequest(res,"L'id utilisateur est inexistant")
            }
            const page = parseInt(req.query.page as string) || 1;
            const perPage = parseInt(req.query.limit as string) || 10;
            
            const {userAmis,total} = await UserAmisService.getAllUserAmisForAPetsitter({currentuserid: req.user!.id,page,perPage});
            const pagination= ApiResponse.createPagination( total, page, perPage);

            // Ajout du tableau de pets pour chaque demande
            const userAmisWithPets = await Promise.all(userAmis.map(async (demande) => {
                let pets: Pet[] = [];
                if (demande.petidtable && demande.petidtable.length > 0) {
                    pets = await Pet.findAll({ where: { id: demande.petidtable } });
                }
                return {
                    ...demande.toJSON(),
                    petidtable: pets
                };
            }));

            return ApiResponse.ok(res,"Toutes les demandes de petsitting reçues pour l'utilisateur courant ont été récupérées",userAmisWithPets,pagination);
        } catch (error) {
            if(error instanceof ApiError){
                return ApiResponse.notFound(res,"Pas de Demande de petsitting trouvée")
            }
            return ApiResponse.internalServerError(res, "Erreur lors de getAllUserAmisForAPetsitter");
        }
    }

    static async getAlldemandeamis(req: Request, res: Response) {
        try {
            if(!req.user?.id){
                return ApiResponse.badRequest(res,"L'id utilisateur est inexistant")
            }
            const page = parseInt(req.query.page as string) || 1;
            const perPage = parseInt(req.query.limit as string) || 10;

            const {userAmis,total} = await UserAmisService.getAllUserAmis({page,perPage});
            const pagination= ApiResponse.createPagination( total, page, perPage);

            // Ajout du tableau de pets pour chaque demande
            const userAmisWithPets = await Promise.all(userAmis.map(async (demande) => {
                let pets: Pet[] = [];
                if (demande.petidtable && demande.petidtable.length > 0) {
                    pets = await Pet.findAll({ where: { id: demande.petidtable } });
                }
                return {
                    ...demande.toJSON(),
                    petidtable: pets
                };
            }));

            return ApiResponse.ok(res,"Toutes les demandes d'amis ont été récupérées",userAmisWithPets,pagination);
        } catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de getAlldemandeamis");
        }
    }

    


    static async deleteDemandeAmi (req: Request, res: Response) {
        try{
            const { id } = req.params;
            
            if (!id) {
                return ApiResponse.badRequest(res, "ID de la Demande de petsitting requis");
            }
            const demandeami = await UserAmisService.getUserAmiById(id);
            if (!demandeami) {
                return ApiResponse.notFound(res, "Demande de petsitting non trouvée.");
            }

            if (demandeami?.user_id !== req.user?.id){
                return ApiResponse.badRequest(res,"pas ta demande")
            }

            const deleted = await UserAmisService.deleteDemandeAmi(id);
            if (!deleted) {
                return ApiResponse.notFound(res,"Demande de petsitting non trouvée");
              }
            return ApiResponse.ok(res, "Demande de petsitting supprimée avec succès.");
        }catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de la suppression");
        }
    }

    static async ResponseToFriendRequest(req: Request, res: Response) {
        try {

            if (!req.user?.id){
                return ApiResponse.badRequest(res,"id utilisateur requis");
            }
            const {iddemandeur} = req.params;
            const {statusdemande}= req.body;
            if (!iddemandeur){
                return ApiResponse.badRequest(res,"id du demandeur requis");
            }
            const reponsedemande = await UserAmisService.ResponseToFriendRequest(req.user?.id, statusdemande,iddemandeur);
            if (reponsedemande[0] === false && reponsedemande[1] === null) {
                return ApiResponse.ok(res, "Pas de Demande de petsitting en attente",reponsedemande);
            }
            return ApiResponse.ok(res, "Demande de petsitting résolue",reponsedemande);
        } catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de la réponse à la Demande de petsitting");
        }
    }

    static async updateDemandeAmiWithAllParameters(req: Request, res: Response) {
        try {
            const { id } = req.params;  
            if (!id){
                return ApiResponse.badRequest(res,"ID de la Demande de petsitting requis");
            }
            if(req.body.petidtable && Array.isArray(req.body.petidtable) && req.body.petidtable.length > 0){
                if (req.body.petidtable.length > 5) {
                    return ApiResponse.badRequest(res, "Tu ne peux pas faire de demande de petsitting pour plus de 5 pets");
                }
                const pettableuser = await Pet.findAll({where: {user_id: req.user?.id}});
                const idpetsuser = pettableuser.map(pet => pet.id);
                for (let i=0;i<req.body.petidtable.length;i++){
                    if (!idpetsuser.includes(req.body.petidtable[i])) {
                        return ApiResponse.badRequest(res, "Tu ne peux pas faire de demande de petsitting pour des pets qui ne t'appartiennent pas");
                    }
                }}
            const [success, updatedfriendrequest] = await UserAmisService.updateDemandeAmiWithAllParameters(id, req.body);
            if (!success || !updatedfriendrequest) {
                return ApiResponse.notFound(res, "Demande de petsitting non trouvée");
            }
            let pets: Pet[] = [];
            if (updatedfriendrequest.petidtable && updatedfriendrequest.petidtable.length > 0) {
                pets = await Pet.findAll({ where: { id: updatedfriendrequest.petidtable } });
            }
            const response = {
                ...updatedfriendrequest.toJSON(),
                petidtable: pets
            };
            return ApiResponse.ok(res, "Demande de petsitting mis à jour", response);
        } catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de la mise à jour");
        }
    }
}
export default UserAmisController;