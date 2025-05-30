import type { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import PetSitterReviewService from '../services/PetSitterReviewService';
import ApiError from '@utils/ApiError';
import PetSitterService from '@/services/PetsitterService';

class PetSitterReviewController {
  static async createReview(req: Request, res: Response): Promise<Response> {
    try {
      const { pet_sitter_id, message } = req.body;

      if (!req.user || !req.user.id) {
        return ApiResponse.unauthorized(
          res,
          'Utilisateur non authentifié ou ID utilisateur manquant'
        );
      }

      if (!PetSitterService.getPetSitterById(pet_sitter_id)) {
        return ApiResponse.badRequest(res, 'Pet sitter introuvable');
      }

      const user_id = req.user.id;

      if (!message) {
        return ApiResponse.badRequest(res, 'Le message est requis');
      }

      const newReview = await PetSitterReviewService.createReview(
        user_id,
        pet_sitter_id,
        message
      );

      return ApiResponse.created(res, 'Avis créé avec succès', {
        review: {
          id: newReview.id,
          pet_sitter_id: newReview.pet_sitter_id,
          message: newReview.message,
        },
      });
    } catch (error: any) {
      console.error('Error in createReview controller:', error);

      if (error instanceof ApiError) {
        return ApiResponse.handleApiError(res, error);
      }

      return ApiResponse.internalServerError(
        res,
        "Erreur inconnue lors de la création de l'avis"
      );
    }
  }

  static async updateReview(req: Request, res: Response): Promise<Response> {
    const { review_id } = req.params;
    const { message } = req.body;

    try {
      if (!review_id) {
        return ApiResponse.badRequest(res, "ID de l'avis requis");
      }

      if (!message) {
        return ApiResponse.badRequest(res, 'Le message est requis');
      }

      const [updated, updatedReview] =
        await PetSitterReviewService.updateReview(review_id, message);

      if (!updated) {
        return ApiResponse.notFound(
          res,
          `Avis avec ID ${review_id} non trouvé`
        );
      }

      return ApiResponse.ok(res, 'Avis mis à jour avec succès', {
        review: updatedReview,
      });
    } catch (error: any) {
      console.error(
        `Error in updateReview controller for ID ${review_id}:`,
        error
      );

      if (error instanceof ApiError) {
        return ApiResponse.handleApiError(res, error);
      }

      return ApiResponse.internalServerError(
        res,
        `Erreur inconnue lors de la mise à jour de l'avis ID ${review_id}`
      );
    }
  }

  static async getReviewsForPetSitter(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { pet_sitter_id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      if (!pet_sitter_id) {
        return ApiResponse.badRequest(res, 'ID du pet sitter requis');
      }

      const { reviews, total } =
        await PetSitterReviewService.getReviewsForPetSitter(
          pet_sitter_id,
          page,
          limit
        );

      if (!reviews || reviews.length === 0) {
        return ApiResponse.notFound(
          res,
          `Aucun avis trouvé pour le pet sitter avec ID ${pet_sitter_id}`
        );
      }

      const pagination = ApiResponse.createPagination(total, page, limit);

      return ApiResponse.ok(res, 'Avis récupérés avec succès', {
        reviews,
        ...pagination,
      });
    } catch (error: any) {
      console.error(
        `Error in getReviewsForPetSitter controller for pet sitter ID ${pet_sitter_id}:`,
        error
      );

      if (error instanceof ApiError) {
        return ApiResponse.handleApiError(res, error);
      }

      return ApiResponse.internalServerError(
        res,
        `Erreur inconnue lors de la récupération des avis pour le pet sitter ID ${pet_sitter_id}`
      );
    }
  }

  static async getReviewsByUser(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { user_id } = req.params;

    try {
      if (!user_id) {
        return ApiResponse.badRequest(res, 'ID utilisateur requis');
      }

      const reviews = await PetSitterReviewService.getReviewsByUser(user_id);

      if (!reviews || reviews.length === 0) {
        return ApiResponse.notFound(
          res,
          `Aucun avis trouvé pour l'utilisateur avec ID ${user_id}`
        );
      }

      return ApiResponse.ok(res, 'Avis récupérés avec succès', {
        reviews,
      });
    } catch (error: any) {
      console.error(
        `Error in getReviewsByUser controller for user ID ${user_id}:`,
        error
      );

      if (error instanceof ApiError) {
        return ApiResponse.handleApiError(res, error);
      }

      return ApiResponse.internalServerError(
        res,
        `Erreur inconnue lors de la récupération des avis pour l'utilisateur ID ${user_id}`
      );
    }
  }

  static async deleteReview(req: Request, res: Response): Promise<Response> {
    const { review_id } = req.params;

    try {
      if (!review_id) {
        return ApiResponse.badRequest(res, "ID de l'avis requis");
      }

      const deleted = await PetSitterReviewService.deleteReview(review_id);

      if (!deleted) {
        return ApiResponse.notFound(
          res,
          `Avis avec ID ${review_id} non trouvé`
        );
      }

      return ApiResponse.ok(res, 'Avis supprimé avec succès');
    } catch (error: any) {
      console.error(
        `Error in deleteReview controller for review ID ${review_id}:`,
        error
      );

      if (error instanceof ApiError) {
        return ApiResponse.handleApiError(res, error);
      }

      return ApiResponse.internalServerError(
        res,
        `Erreur inconnue lors de la suppression de l'avis ID ${review_id}`
      );
    }
  }
}

export default PetSitterReviewController;
