import type { Request, Response } from 'express';
import { ApiResponse, HttpStatusCode } from '../utils/ApiResponse';
import PetSitterRatingService from '../services/PetSitterRatingService';
import PetSitterRating from '@/models/PetSitterRating';

class PetSitterRatingController {
  static async createRating(req: Request, res: Response): Promise<Response> {
    try {
      const { pet_sitter_id, rating } = req.body;

      if (!req.user || !req.user.id) {
        return ApiResponse.unauthorized(
          res,
          'Utilisateur non authentifié ou ID utilisateur manquant'
        );
      }

      const user_id = req.user.id;

      if (rating === undefined) {
        return ApiResponse.badRequest(res, 'La note est requise');
      }

      const parsedRating = parseFloat(rating);
      if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        return ApiResponse.badRequest(
          res,
          'La note doit être un nombre entre 0 et 5'
        );
      }

      const newRating = await PetSitterRatingService.createRating(
        user_id,
        pet_sitter_id,
        parsedRating
      );

      return ApiResponse.created(res, 'Évaluation créée avec succès', {
        rating: {
          id: newRating.id,
          pet_sitter_id: newRating.pet_sitter_id,
          rating: newRating.rating,
        },
      });
    } catch (error) {
      console.error('Error in createRating controller:', error);

      if (error instanceof Error) {
        if (error.message.includes("existe déjà pour l'utilisateur")) {
          return ApiResponse.badRequest(res, error.message);
        }

        // Pour les erreurs de validation
        if (error.message.includes('Validation')) {
          return ApiResponse.badRequest(res, error.message);
        }

        return ApiResponse.internalServerError(
          res,
          error.message || "Erreur lors de la création de l'évaluation",
          { error }
        );
      }

      return ApiResponse.internalServerError(res, 'Erreur interne du serveur');
    }
  }

  static async updateRating(req: Request, res: Response): Promise<Response> {
    const { rating_id } = req.params;
    const { rating } = req.body;

    try {
      if (!rating_id) {
        return ApiResponse.badRequest(res, "ID de l'évaluation requis");
      }

      if (rating === undefined) {
        return ApiResponse.badRequest(res, 'La note est requise');
      }

      const parsedRating = parseFloat(rating);
      if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        return ApiResponse.badRequest(
          res,
          'La note doit être un nombre entre 0 et 5'
        );
      }

      const [updated, updatedRating] =
        await PetSitterRatingService.updateRating(rating_id, parsedRating);

      if (!updated) {
        return ApiResponse.notFound(
          res,
          `Évaluation avec ID ${rating_id} non trouvée`
        );
      }

      return ApiResponse.ok(res, 'Évaluation mise à jour avec succès', {
        rating: updatedRating,
      });
    } catch (error) {
      console.error(
        `Error in updateRating controller for ID ${rating_id}:`,
        error
      );

      if (error instanceof Error) {
        if (error.message.includes('Validation')) {
          return ApiResponse.badRequest(res, error.message);
        }

        return ApiResponse.internalServerError(
          res,
          error.message || "Erreur lors de la mise à jour de l'évaluation",
          { error }
        );
      }

      return ApiResponse.internalServerError(res, 'Erreur interne du serveur');
    }
  }

  static async getRatingsForPetSitter(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { pet_sitter_id } = req.params;

    try {
      if (!pet_sitter_id) {
        return ApiResponse.badRequest(res, 'ID du pet sitter requis');
      }

      const ratings =
        await PetSitterRatingService.getRatingsForPetSitter(pet_sitter_id);

      if (!ratings || ratings.length === 0) {
        return ApiResponse.notFound(
          res,
          `Aucune évaluation trouvée pour le pet sitter avec ID ${pet_sitter_id}`
        );
      }

      return ApiResponse.ok(res, 'Évaluations récupérées avec succès', {
        ratings,
      });
    } catch (error) {
      console.error(
        `Error in getRatingsForPetSitter controller for pet sitter ID ${pet_sitter_id}:`,
        error
      );

      return ApiResponse.internalServerError(
        res,
        error instanceof Error ? error.message : 'Erreur interne du serveur',
        { error }
      );
    }
  }

  static async deleteRating(req: Request, res: Response): Promise<Response> {
    const { rating_id } = req.params;

    try {
      if (!rating_id) {
        return ApiResponse.badRequest(res, "ID de l'évaluation requis");
      }

      const deleted = await PetSitterRatingService.deleteRating(rating_id);

      if (!deleted) {
        return ApiResponse.notFound(
          res,
          `Évaluation avec ID ${rating_id} non trouvée`
        );
      }

      return ApiResponse.ok(res, 'Évaluation supprimée avec succès');
    } catch (error) {
      console.error(
        `Error in deleteRating controller for rating ID ${rating_id}:`,
        error
      );

      if (error instanceof Error) {
        return ApiResponse.internalServerError(
          res,
          error.message || "Erreur lors de la suppression de l'évaluation",
          { error }
        );
      }

      return ApiResponse.internalServerError(res, 'Erreur interne du serveur');
    }
  }
}

export default PetSitterRatingController;
