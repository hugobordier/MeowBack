import type { Request, Response } from 'express';
import { ApiResponse } from '@utils/ApiResponse';
import UserAmisService from '@/services/UserAmisService';

class UserAmisController{
    static async createRequestAmi(req: Request, res: Response) {
        try{
            
            const { friend_id } = req.body;
            
            if (!req.user?.id) {
                return ApiResponse.badRequest(res, "Well t'as pas ta carte d'identitée");
            }
            if (!friend_id) {
                return ApiResponse.badRequest(res, "Id de l'ami à envoyer la demande requis");
            }
            const newdemande = await UserAmisService.createRequestAmi(req.user?.id,friend_id);

            return ApiResponse.created(res,"Demande d'ami ajoutée avec succès",newdemande);
        }catch (error:any) {
            return ApiResponse.internalServerError(res, "Erreur lors de la création de la demande",error.message);
        }
    };


    static async getUserAmiById (req: Request, res: Response) {
        try{
            const { id } = req.params;
            if (!id) {
                return ApiResponse.badRequest(res, "ID de la demande d'ami requis");
            }
            
            const demande = await UserAmisService.getUserAmiById(id);
            if (!demande) {
                return ApiResponse.notFound(res, "demande d'ami non trouvée.");
            }
            if (demande?.user_id !== req.user?.id){
                return ApiResponse.badRequest(res,"pas ta demande")
            }
            return ApiResponse.ok(res,"demande d'ami récupérée",demande);
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
            const perPage = parseInt(req.query.perPage as string) || 10;

            const {userAmis,total} = await UserAmisService.getAllUserAmisForAUser({userId: req.user!.id,page,perPage});
            const pagination= ApiResponse.createPagination( total, page, perPage);

            return ApiResponse.ok(res,"Toutes les demandes d'amis pour l'utilisateur courant ont été récupérées",userAmis,pagination);
        } catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de getAllUserAmisForAUser");
        }
    }

    


    static async deleteDemandeAmi (req: Request, res: Response) {
        try{
            const { id } = req.params;
            
            if (!id) {
                return ApiResponse.badRequest(res, "ID de la demande d'ami requis");
            }
            const demandeami = await UserAmisService.getUserAmiById(id);
            if (!demandeami) {
                return ApiResponse.notFound(res, "Demande d'ami non trouvée.");
            }

            if (demandeami?.user_id !== req.user?.id){
                return ApiResponse.badRequest(res,"pas ta demande")
            }

            const deleted = await UserAmisService.deleteDemandeAmi(id);
            if (!deleted) {
                return ApiResponse.notFound(res,"Demande d'ami non trouvée");
              }
            return ApiResponse.ok(res, "Demande d'ami supprimée avec succès.");
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
                return ApiResponse.ok(res, "Pas de demande d'ami en attente",reponsedemande);
            }
            return ApiResponse.ok(res, "Demande d'ami résolue",reponsedemande);
        } catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de la réponse à la demande d'ami");
        }
    }

    static async updateDemandeAmiWithAllParameters(req: Request, res: Response) {
        try {
            const { id } = req.params;  
            if (!id){
                return ApiResponse.badRequest(res,"ID de la demande d'ami requis");
            }


            const updatedfriendrequest = await UserAmisService.updateDemandeAmiWithAllParameters(id, req.body);
            return ApiResponse.ok(res, "Demande d'ami mis à jour",updatedfriendrequest);
        } catch (error) {
            return ApiResponse.internalServerError(res, "Erreur lors de la mise à jour");
        }
    }
}
export default UserAmisController;