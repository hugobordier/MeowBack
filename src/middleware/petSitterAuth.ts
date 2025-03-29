import { ApiResponse } from '@utils/ApiResponse';
import type { Request, Response, NextFunction } from 'express';

const petSitterAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Utilisateur non authentifié');
    }

    const { identityDocument, bankInfo, profilePicture } = req.user;
    const missingFields = [];

    if (!identityDocument) missingFields.push("document d'identité");
    if (!bankInfo) missingFields.push('informations bancaires');
    if (!profilePicture) missingFields.push('photo de profil');

    if (missingFields.length > 0) {
      return ApiResponse.forbidden(
        res,
        `Accès refusé : ${missingFields.join(', ')} manquant(s)`
      );
    }

    next();
  } catch (error: any) {
    console.error(
      "Erreur dans le middleware d'authentification pet-sitter:",
      error
    );
    return ApiResponse.internalServerError(
      res,
      "Erreur d'autorisation",
      error.message
    );
  }
};

export default petSitterAuth;
