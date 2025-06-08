import ApiError from '@utils/ApiError';
import UserAmis from '@/models/UserAmis';
import { statusDemande } from '@/types/enumStatusAmis';
import User from '@/models/User';
import PetSitterRatingService from './PetSitterRatingService';
import PetSitterService from './PetsitterService';


class UserAmisService {
    static async createRequestAmi(userID: string,petsitterID:string,messagevalue:string): Promise<UserAmis> {
        try {
            if (!userID) {
                throw ApiError.badRequest("ID de l'user requis");
            }
            const existing = await UserAmis.findOne({where: {user_id:petsitterID,petsitter_id:userID}})
            const existing2 = await UserAmis.findOne({where: {user_id:userID,petsitter_id:petsitterID}})
            if(userID==petsitterID){
              throw ApiError.badRequest("On ne peut pas se faire une demande de petsitting à soi-même");
            }
            if(!existing && !existing2){
              const newreqami = await UserAmis.create({
              user_id: userID,
              petsitter_id: petsitterID,
              statusdemande:"pending",
              message:messagevalue,
              });

              return newreqami;
            }
            throw ApiError.badRequest("La demande de petsitting existe déjà");

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
              throw ApiError.notFound("Il n'y actuellement aucune demande de petsitting dans la db");
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
              throw ApiError.notFound("Demande de petsitting inexistantes pour ce user");
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

        static async getAllUserAmisForAPetsitter({ currentuserid,page, perPage }: { page: number, perPage: number ,currentuserid: string}): Promise<{ userAmis: UserAmis[]; total: number }> {
        try {
            const petsitter = await PetSitterService.getPetSitterByUserId(currentuserid);
            if(!petsitter){
              throw ApiError.badRequest("L'utilisateur courant n'a pas de compte petsitter")
            }
            const offset = (page - 1) * perPage;
            const userAmis = await UserAmis.findAll({limit:perPage,offset:offset, where: { petsitter_id: petsitter?.id }});
            if (userAmis.length === 0) {
              throw ApiError.notFound("Demande de petsitting inexistantes pour ce user");
            }
            const totalAmis = await UserAmis.count({ where: { petsitter_id: petsitter?.id } });
  
            return{
              userAmis,
              total : totalAmis
            };

        } catch (error) {
            console.error('Erreur dans getAllUserAmisForAPetsitter',error);
            if (error instanceof ApiError) {
              throw error;
            }
            throw ApiError.internal(
              'Erreur inconnue dans getAllUserAmisForAPetsitter'
            );
          }
    }

    static async deleteDemandeAmi  (id: string): Promise<boolean>{
        try {

            if (!id) {
                throw ApiError.notFound("Cette Demande de petsitting n'existe pas");
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
            const petsitter = await PetSitterService.getPetSitterByUserId(currentuserid);
            if(!petsitter){
              throw ApiError.badRequest("L'utilisateur courant n'a pas de compte petsitter")
            }
            const userami = await UserAmis.findOne({where:{user_id:iddemandeur,petsitter_id:petsitter?.id,statusdemande:statusDemande.Pending}});
            if(!userami){
              return [false,null]
            }

            const [updated] = await UserAmis.update({statusdemande:status_demande}, {where: {petsitter_id:petsitter?.id,user_id:iddemandeur}});
            const updatedrequestami = updated > 0 ? await UserAmis.findOne({where:{petsitter_id:petsitter?.id,user_id:iddemandeur}}) : null;

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
                throw ApiError.notFound('demande de petsitting not found.');
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
