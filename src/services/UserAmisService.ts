import PetImage from '../models/PetImage'; 
import ApiError from '@utils/ApiError';
import CloudinaryService from './CloudinaryService';
import path from 'path';
import { FolderName } from '@/config/cloudinary.config';
import UserAmis from '@/models/UserAmis';
import User from '@/models/User';


class UserAmisService {
    static async createRequestAmi(user_id: string): Promise<UserAmis> {
        try {
            if (!user_id) {
                throw ApiError.badRequest("ID de l'user requis");
            }
          const newreqami = await UserAmis.create({
            user_id: user_id,
            friend_id: null,
            status:null,
            });
      

            return newreqami;
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

        static async getUserAmi(id: string): Promise<UserAmis>  {
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


    static async getAllUserAmis({ userId,page, perPage }: { page: number, perPage: number ,userId: string}): Promise<{ userAmis: UserAmis[]; total: number }> {
        try {
            const offset = (page - 1) * perPage;
            const userAmis = await UserAmis.findAll({limit:perPage,offset:offset, where: { user_id: userId }});
            if (userAmis.length === 0) {
              throw ApiError.notFound("Demande d'amis inexistantes pour ce user");
            }
            const totalAmis = await UserAmis.count({ where: { user_id: userId } });
  
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
    static async ResponseToFriendRequest(id:string,friend_id: string,): Promise<[boolean, UserAmis | null]>{
        try {
            if (!id) {
                throw ApiError.badRequest('ID de la demande UserAmi requis');
            }
            if (!friend_id) {
                throw ApiError.badRequest("ID de l'ami requis");
            }
    
            const userami = await UserAmis.findByPk(id);
    
            if (!userami) {
                throw ApiError.notFound("Demande d'amis non trouvée");
            }

            const [updated] = await UserAmis.update({friend_id}, {where: {id}});
            const updatedrequestami = updated > 0 ? await UserAmis.findByPk(id) : null;

            return [updated>0 , updatedrequestami];
            
          } catch (error) {
            console.error("Erreur dans updateDemandeAmiResOfFriend : ",error);
            if (error instanceof ApiError) {
              throw error;
            }throw ApiError.internal(
              'Erreur inconnue dans updateDemandeAmiResOfFriend'
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
