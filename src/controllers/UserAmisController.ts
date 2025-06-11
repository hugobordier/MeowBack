import type { Request, Response } from 'express';
import { ApiResponse } from '@utils/ApiResponse';
import UserAmisService from '@/services/UserAmisService';
import ApiError from '@utils/ApiError';

class UserAmisController{
    static async createRequestAmi(req: Request, res: Response) {
        try{
            
            const { petsitter_id,message } = req.body;
            
            if (!req.user?.id) {
                return ApiResponse.badRequest(res, "Well t'as pas ta carte d'identitée");
            }
            if (!petsitter_id) {
                return ApiResponse.badRequest(res, "Id de l'ami à envoyer la demande requis");
            }
            const newdemande = await UserAmisService.createRequestAmi(req.user?.id,petsitter_id,message);

            return ApiResponse.created(res,"Demande de petsitting ajoutée avec succès",newdemande);
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
            return ApiResponse.ok(res,"Demande de petsitting récupérée",demande);
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

            return ApiResponse.ok(res,"Toutes les demandes de petsitting envoyés pour l'utilisateur courant ont été récupérées",userAmis,pagination);
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

            return ApiResponse.ok(res,"Toutes les demandes de petsitting reçues pour l'utilisateur courant ont été récupérées",userAmis,pagination);
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

            return ApiResponse.ok(res,"Toutes les demandes d'amis ont été récupérées",userAmis,pagination);
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


            const updatedfriendrequest = await UserAmisService.updateDemandeAmiWithAllParameters(id, req.body);
            return ApiResponse.ok(res, "Demande de petsitting mis à jour",updatedfriendrequest);
        } catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de la mise à jour");
        }
    }
}
export default UserAmisController;