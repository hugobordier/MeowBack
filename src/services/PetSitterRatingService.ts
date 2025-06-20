import PetSitterRating from '../models/PetSitterRating';
import { ValidationError } from 'sequelize';
import User from '@/models/User';
import ApiError from '@utils/ApiError';
import PetSitterService from './PetsitterService';
import PetSitter from '@/models/PetSitter';

class PetSitterRatingService {
  static async createRating(
    user_id: string,
    pet_sitter_id: string,
    rating: number
  ): Promise<PetSitterRating> {
    try {
      if (!user_id || !pet_sitter_id) {
        throw ApiError.badRequest(
          'ID utilisateur et ID pet sitter requis pour créer une évaluation'
        );
      }

      const petsitter = await PetSitterService.getPetSitterById(pet_sitter_id);

      if (!petsitter) {
        throw ApiError.badRequest(`Aucun petsitter pour l'id ${pet_sitter_id}`);
      }

      if (rating < 0 || rating > 5) {
        throw ApiError.badRequest('La note doit être un nombre entre 0 et 5');
      }

      const existingRating = await PetSitterRating.findOne({
        where: { user_id, pet_sitter_id },
      });

      let res: PetSitterRating;

      if (existingRating) {
        // Mettre à jour l'évaluation existante
        await existingRating.update({ rating });
        res = existingRating;
        console.log(
          `Évaluation mise à jour pour l'utilisateur ${user_id} et le pet sitter ${pet_sitter_id}`
        );
      } else {
        // Créer une nouvelle évaluation
        res = await PetSitterRating.create({
          user_id,
          pet_sitter_id,
          rating,
        });
        console.log(
          `Nouvelle évaluation créée pour l'utilisateur ${user_id} et le pet sitter ${pet_sitter_id}`
        );
      }

      // Recalculer la moyenne après création/mise à jour
      const allRatings = await PetSitterRating.findAll({
        where: { pet_sitter_id },
      });

      console.log(
        'Toutes les évaluations:',
        allRatings.map((r) => r.rating)
      );

      const ps = await PetSitter.findByPk(pet_sitter_id);
      const user = await User.findByPk(ps?.user_id);

      if (user) {
        const total = allRatings.reduce((acc, r) => acc + Number(r.rating), 0);
        console.log('Total des notes:', total);

        const average = parseFloat((total / allRatings.length).toFixed(2));
        console.log('Nouvelle moyenne:', average);

        await user.update({ rating: average });
        console.log(`Rating du pet sitter mis à jour: ${average}`);
      }

      return res;
    } catch (error) {
      console.error('Error in createRating:', error);

      if (error instanceof ValidationError) {
        const validationErrors = error.errors
          .map((err) => err.message)
          .join(', ');
        throw ApiError.badRequest(
          `Validation échouée lors de la création de l'évaluation: ${validationErrors}`
        );
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internal(
        "Erreur inconnue lors de la création de l'évaluation"
      );
    }
  }

  static async updateRating(
    rating_id: string,
    rating: number
  ): Promise<[boolean, PetSitterRating | null]> {
    try {
      if (!rating_id) {
        throw ApiError.badRequest(
          "ID de l'évaluation non spécifié pour la mise à jour"
        );
      }

      const petSitterRating = await PetSitterRating.findByPk(rating_id);
      if (!petSitterRating) {
        return [false, null];
      }

      if (rating < 0 || rating > 5) {
        throw ApiError.badRequest('La note doit être un nombre entre 0 et 5');
      }

      const [updated] = await PetSitterRating.update(
        { rating },
        {
          where: { id: rating_id },
        }
      );

      const updatedRating =
        updated > 0 ? await PetSitterRating.findByPk(rating_id) : null;

      return [updated > 0, updatedRating];
    } catch (error) {
      console.error(`Error in updateRating(${rating_id}):`, error);

      if (error instanceof ValidationError) {
        const validationErrors = error.errors
          .map((err) => err.message)
          .join(', ');
        throw ApiError.badRequest(
          `Validation échouée lors de la mise à jour de l'évaluation ID ${rating_id}: ${validationErrors}`
        );
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internal(
        `Erreur inconnue lors de la mise à jour de l'évaluation ID ${rating_id}`
      );
    }
  }

  static async getRatingsForPetSitter(
    pet_sitter_id: string
  ): Promise<PetSitterRating[]> {
    try {
      if (!pet_sitter_id) {
        throw ApiError.badRequest('ID du pet sitter non spécifié');
      }

      return await PetSitterRating.findAll({
        where: { pet_sitter_id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username'],
          },
        ],
      });
    } catch (error) {
      console.error(
        `Error in getRatingsForPetSitter(${pet_sitter_id}):`,
        error
      );
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(
        `Erreur inconnue lors de la récupération des évaluations pour le pet sitter ID ${pet_sitter_id}`
      );
    }
  }

  static async deleteRating(rating_id: string): Promise<boolean> {
    try {
      if (!rating_id) {
        throw ApiError.badRequest(
          "ID de l'évaluation non spécifié pour la suppression"
        );
      }

      const petSitterRating = await PetSitterRating.findByPk(rating_id);
      if (!petSitterRating) {
        return false;
      }

      const deleted = await PetSitterRating.destroy({
        where: { id: rating_id },
      });

      return deleted > 0;
    } catch (error) {
      console.error(`Error in deleteRating(${rating_id}):`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(
        `Erreur inconnue lors de la suppression de l'évaluation ID ${rating_id}`
      );
    }
  }
}

export default PetSitterRatingService;
