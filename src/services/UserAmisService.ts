import ApiError from '@utils/ApiError';
import UserAmis from '@/models/UserAmis';
import { statusDemande } from '@/types/enumStatusAmis';
import User from '@/models/User';


class UserAmisService {
    static async createRequestAmi(userID: string,friendID:string,messagevalue:string): Promise<UserAmis> {
        try {
            if (!userID) {
                throw ApiError.badRequest("ID de l'user requis");
            }
            const existing = await UserAmis.findOne({where: {user_id:friendID,friend_id:userID}})
            const existing2 = await UserAmis.findOne({where: {user_id:userID,friend_id:friendID}})
            if(userID==friendID){
              throw ApiError.badRequest("On ne peut pas se demander soit même en ami");
            }
            if(!existing && !existing2){
              const newreqami = await UserAmis.create({
              user_id: userID,
              friend_id: friendID,
              statusdemande:"pending",
              message:messagevalue,
              });

              return newreqami;
            }
            throw ApiError.badRequest("La demande d'ami existe déjà");

        } catch (error) {
            console.error('Erreur dans createRequestAmi',error);
            if (error instanceof ApiError) {
              throw error;
            }
            throw ApiError.internal(
              'Erreur inconnue dans createRequestAmi'
            );
          }
        }

        static async getUserAmiById(id: string): Promise<UserAmis>  {
            try {
              if (!id) {
                throw ApiError.badRequest('UserAmi ID est requis.');
              }
          
              const userami = await UserAmis.findByPk(id);
          
              if (!userami) {
                throw ApiError.notFound('Demande UserAmis non trouvée.');
              }
          
              return userami;
            } catch (error) {
              console.error('Erreur dans getUserAmi',error);
              if (error instanceof ApiError) {
                throw error;
              } 
              throw ApiError.internal('Erreur inconnue dans getUserAmi');
          }
          }


    static async getAllUserAmis({ page, perPage }: { page: number, perPage: number}): Promise<{ userAmis: UserAmis[]; total: number }> {
        try {
            const offset = (page - 1) * perPage;
            const userAmis = await UserAmis.findAll({limit:perPage,offset:offset});
            if (userAmis.length === 0) {
              throw ApiError.notFound("Il n'y actuellement aucune demande d'ami dans la db");
            }
            const totalAmis = await UserAmis.count();
  
            return{
              userAmis,
              total : totalAmis
            };

        } catch (error) {
            console.error('Erreur dans getAllUserAmis',error);
            if (error instanceof ApiError) {
              throw error;
            }
            throw ApiError.internal(
              'Erreur inconnue dans getAllUserAmis'
            );
          }
    }


    static async getAllUserAmisForAUser({ userId,page, perPage }: { page: number, perPage: number ,userId: string}): Promise<{ userAmis: UserAmis[]; total: number }> {
        try {
            const offset = (page - 1) * perPage;
            const userAmis = await UserAmis.findAll({limit:perPage,offset:offset, where: { user_id: userId }});
            if (userAmis.length === 0) {
              throw ApiError.notFound("Demande d'ami inexistantes pour ce user");
            }
            const totalAmis = await UserAmis.count({ where: { user_id: userId } });
  
            return{
              userAmis,
              total : totalAmis
            };

        } catch (error) {
            console.error('Erreur dans getAllUserAmisForAUser',error);
            if (error instanceof ApiError) {
              throw error;
            }
            throw ApiError.internal(
              'Erreur inconnue dans getAllUserAmisForAUser'
            );
          }
    }

    static async deleteDemandeAmi  (id: string): Promise<boolean>{
        try {

            if (!id) {
                throw ApiError.notFound("Cette demande d'ami n'existe pas");
            }

            const deleted = await UserAmis.destroy({ where: { id } });
            return deleted > 0;
        } catch (error) {
            console.error('Erreur dans deleteDemandeAmi',error);
            if (error instanceof ApiError) {
              throw error;
            }
            throw ApiError.internal(
              'Erreur inconnue dans deleteDemandeAmi'
            );
          }
    }
    static async ResponseToFriendRequest(currentuserid:string,status_demande: statusDemande ,iddemandeur:string): Promise<[boolean, UserAmis | null]>{
        try {
            if (!currentuserid) {
                throw ApiError.badRequest('ID de utilisateur requis');
            }
            if (!iddemandeur) {
                throw ApiError.badRequest("ID du demandeur d'ami requis");
            }
            const userami = await UserAmis.findOne({where:{user_id:iddemandeur,friend_id:currentuserid,statusdemande:statusDemande.Pending}});
            if(!userami){
              return [false,null]
            }

            const [updated] = await UserAmis.update({statusdemande:status_demande}, {where: {friend_id:currentuserid,user_id:iddemandeur}});
            const updatedrequestami = updated > 0 ? await UserAmis.findOne({where:{friend_id:currentuserid,user_id:iddemandeur}}) : null;

            return [updated>0 , updatedrequestami];
            
          } catch (error) {
            console.error("Erreur dans ResponseToFriendRequest : ",error);
            if (error instanceof ApiError) {
              throw error;
            }throw ApiError.internal(
              'Erreur inconnue dans ResponseToFriendRequest'
            )
    }
  }

    static async updateDemandeAmiWithAllParameters(id: string,data: Partial<UserAmis>): Promise<[boolean, UserAmis | null]> {
        try {
            if (!id) {
                throw ApiError.badRequest('ID de la demande UserAmi requis');
            }
    
            const userami = await UserAmis.findByPk(id);
    
            if (!userami) {
                throw ApiError.notFound('Pet image not found.');
            }
      
            const [updated] = await UserAmis.update(data, {where: {id}});

            const updatedUserAmi = updated > 0 ? await UserAmis.findByPk(id) : null;

            return [updated>0,updatedUserAmi];
          } catch (error) {
            console.error("Erreur dans updateDemandeAmi : ",error);
            if (error instanceof ApiError) {
              throw error;
            }throw ApiError.internal(
              'Erreur inconnue dans updateDemandeAmi'
            )
    }
  }
}
export default UserAmisService;
