import PetSitterReview from '@/models/PetiSitterReviews';
import { ValidationError } from 'sequelize';
import User from '@/models/User';
import PetSitter from '@/models/PetSitter';
import ApiError from '@utils/ApiError';
import PetSitterService from './PetsitterService';
import type { PetSitterReviewResponse } from '@/types/type';
import PetSitterRating from '@/models/PetSitterRating';

class PetSitterReviewService {
  static async createReview(
    user_id: string,
    pet_sitter_id: string,
    message: string
  ): Promise<PetSitterReview> {
    try {
      if (!user_id || !pet_sitter_id) {
        throw ApiError.badRequest(
          'ID utilisateur et ID pet sitter requis pour créer un avis'
        );
      }

      const petsitter = await PetSitterService.getPetSitterById(pet_sitter_id);

      if (!petsitter) {
        throw ApiError.badRequest(`Aucun petsitter pour l'id ${pet_sitter_id}`);
      }

      if (!message || message === '') {
        throw ApiError.badRequest('Le message est requis');
      }

      return await PetSitterReview.create({
        user_id,
        pet_sitter_id,
        message,
      });
    } catch (error) {
      console.error('Error in createReview:', error);

      if (error instanceof ValidationError) {
        const validationErrors = error.errors
          .map((err) => err.message)
          .join(', ');
        throw ApiError.badRequest(
          `Validation échouée lors de la création de l'avis: ${validationErrors}`
        );
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internal("Erreur inconnue lors de la création de l'avis");
    }
  }

  static async updateReview(
    review_id: string,
    message: string
  ): Promise<[boolean, PetSitterReview | null]> {
    try {
      if (!review_id) {
        throw ApiError.badRequest(
          "ID de l'avis non spécifié pour la mise à jour"
        );
      }

      const petSitterReview = await PetSitterReview.findByPk(review_id);
      if (!petSitterReview) {
        return [false, null];
      }

      if (!message) {
        throw ApiError.badRequest('Le message est requis');
      }

      const [updated] = await PetSitterReview.update(
        { message },
        {
          where: { id: review_id },
        }
      );

      const updatedReview =
        updated > 0 ? await PetSitterReview.findByPk(review_id) : null;

      return [updated > 0, updatedReview];
    } catch (error) {
      console.error(`Error in updateReview(${review_id}):`, error);

      if (error instanceof ValidationError) {
        const validationErrors = error.errors
          .map((err) => err.message)
          .join(', ');
        throw ApiError.badRequest(
          `Validation échouée lors de la mise à jour de l'avis ID ${review_id}: ${validationErrors}`
        );
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internal(
        `Erreur inconnue lors de la mise à jour de l'avis ID ${review_id}`
      );
    }
  }

  static async getReviewsForPetSitter(
    pet_sitter_id: string,
    page: number,
    limit: number
  ): Promise<{ reviews: PetSitterReviewResponse[]; total: number }> {
    try {
      if (!pet_sitter_id) {
        throw ApiError.badRequest('ID du pet sitter non spécifié');
      }

      const offset = (page - 1) * limit;

      const { rows: reviewsData, count: total } =
        await PetSitterReview.findAndCountAll({
          where: { pet_sitter_id },
          include: [
            {
              model: User,
              as: 'user',
              attributes: [
                'id',
                'username',
                'firstName',
                'lastName',
                'profilePicture',
              ],
            },
          ],
          limit,
          offset,
          order: [['createdAt', 'DESC']],
        });

      const userIds = reviewsData.map((review: any) => review.user_id);
      const ratings = await PetSitterRating.findAll({
        where: {
          pet_sitter_id,
          user_id: userIds,
        },
      });

      const ratingsMap = new Map(
        ratings.map((rating: any) => [rating.user_id, rating.rating])
      );

      const reviews: PetSitterReviewResponse[] = reviewsData.map(
        (review: any) => ({
          id: review.id,
          pet_sitter_id: review.pet_sitter_id,
          user_id: review.user_id,
          user_first_name: review.user?.firstName || '',
          user_last_name: review.user?.lastName || '',
          user_username: review.user?.username || '',
          user_picture: review.user?.profilePicture || '',
          pet_sitter_rating: ratingsMap.get(review.user_id) || 0,
          message: review.message,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        })
      );

      return { reviews, total };
    } catch (error) {
      console.error(
        `Error in getReviewsForPetSitter(${pet_sitter_id}):`,
        error
      );

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internal(
        `Erreur inconnue lors de la récupération des avis pour le pet sitter ID ${pet_sitter_id}`
      );
    }
  }

  static async getReviewsByUser(user_id: string): Promise<PetSitterReview[]> {
    try {
      if (!user_id) {
        throw ApiError.badRequest('ID utilisateur non spécifié');
      }

      return await PetSitterReview.findAll({
        where: { user_id },
        include: [
          {
            model: PetSitter,
            as: 'petSitter',
            attributes: ['id', 'username'],
          },
        ],
      });
    } catch (error) {
      console.error(`Error in getReviewsByUser(${user_id}):`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(
        `Erreur inconnue lors de la récupération des avis pour l'utilisateur ID ${user_id}`
      );
    }
  }

  static async deleteReview(review_id: string): Promise<boolean> {
    try {
      if (!review_id) {
        throw ApiError.badRequest(
          "ID de l'avis non spécifié pour la suppression"
        );
      }

      const petSitterReview = await PetSitterReview.findByPk(review_id);
      if (!petSitterReview) {
        return false;
      }

      const deleted = await PetSitterReview.destroy({
        where: { id: review_id },
      });

      return deleted > 0;
    } catch (error) {
      console.error(`Error in deleteReview(${review_id}):`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(
        `Erreur inconnue lors de la suppression de l'avis ID ${review_id}`
      );
    }
  }
}

export default PetSitterReviewService;
