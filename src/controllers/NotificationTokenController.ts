import NotificationTokenService from '@/services/NotificationTokenSetvice';
import type { Request, Response } from 'express';
import { ApiResponse } from '@utils/ApiResponse';
import ApiError from '@utils/ApiError';

class NotificationTokenController {
  static async createToken(req : Request, res : Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.unauthorized(res, 'Utilisateur non authentifié');
      }
      const { expo_push_token } = req.body;

      await NotificationTokenService.upsertToken(userId, expo_push_token);
      return ApiResponse.created(res, 'Token créé/mis à jour avec succès');
    } catch (error : any) {
      console.error('Error in createToken:', error);
      if (error instanceof ApiError) {
        return ApiResponse.handleApiError(res, error);
      }
      return ApiResponse.internalServerError(res, 'Erreur serveur', error.message);
    }
  }

  static async getTokensByUser(req : Request, res : Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.unauthorized(res, 'Utilisateur non authentifié');
      }
      const token = await NotificationTokenService.getTokenByUserId(userId);
      return ApiResponse.ok(res, 'Token récupéré avec succès', { token });
    } catch (error : any) {
      console.error('Error in getTokensByUser:', error);
      if (error instanceof ApiError) {
        return ApiResponse.handleApiError(res, error);
      }
      return ApiResponse.internalServerError(res, 'Erreur serveur', error.message);
    }
  }
}

export default NotificationTokenController;
