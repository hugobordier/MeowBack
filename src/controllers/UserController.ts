import type { Request, Response } from 'express';
import UserService from '../services/UserService';
import { ApiResponse, HttpStatusCode } from '../utils/ApiResponse';

class UserController {
  static async getUserProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const user = await UserService.getUserById(userId);

      if (!user) {
        return ApiResponse.notFound(res, 'Utilisateur non trouvé');
      }

      return ApiResponse.ok(res, 'Utilisateur trouvé', user);
    } catch (error: any) {
      console.error('Error in getUserProfile:', error);
      return ApiResponse.internalServerError(
        res,
        'Erreur serveur',
        error.message
      );
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserService.getUserById(id);

      if (!user) {
        return ApiResponse.notFound(res, 'Utilisateur non trouvé');
      }

      const publicUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        lastName: user.lastName,
        firstName: user.firstName,
        age: user.age,
        adress: user.address,
        city: user.city,
        country: user.country,
        profilePicture: user.profilePicture,
        bio: user.bio,
        rating: user.rating,
        phoneNumber: user.phoneNumber,
      };

      return ApiResponse.ok(res, 'Utilisateur trouvé', publicUser);
    } catch (error: any) {
      console.error('Error in getUserById:', error);
      return ApiResponse.internalServerError(
        res,
        'Erreur serveur',
        error.message
      );
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';

      const { users, totalItems } = await UserService.getAllUsers(
        page,
        limit,
        search
      );

      const pagination = ApiResponse.createPagination(totalItems, page, limit);

      return ApiResponse.ok(
        res,
        'Données récupérées avec succès',
        users,
        pagination
      );
    } catch (error: any) {
      console.error('Error in getAllUsers:', error);
      return ApiResponse.internalServerError(
        res,
        'Erreur serveur',
        error.message
      );
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const updateData = { ...req.body };

      delete updateData.password;
      delete updateData.isAdmin;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const updatedUser = await UserService.updateUser(userId, updateData);

      if (!updatedUser) {
        return ApiResponse.notFound(res, 'Utilisateur non trouvé');
      }

      const userResponse = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        lastName: updatedUser.lastName,
        firstName: updatedUser.firstName,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        updatedAt: updatedUser.updatedAt,
      };

      return ApiResponse.ok(
        res,
        'Utilisateur mis à jour avec succès',
        userResponse
      );
    } catch (error: any) {
      console.error('Error in updateUser:', error);

      if (error.name === 'ValidationError') {
        return ApiResponse.badRequest(res, 'Données invalides', error.errors);
      }

      return ApiResponse.internalServerError(
        res,
        'Erreur serveur',
        error.message
      );
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user!.id;

      if (newPassword !== confirmPassword) {
        return ApiResponse.badRequest(
          res,
          'Les mots de passe ne correspondent pas'
        );
      }

      if (newPassword.length < 8) {
        return ApiResponse.badRequest(
          res,
          'Le mot de passe doit contenir au moins 8 caractères'
        );
      }

      const isPasswordChanged = await UserService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      if (!isPasswordChanged) {
        return ApiResponse.unauthorized(res, 'Mot de passe actuel incorrect');
      }

      return ApiResponse.ok(res, 'Mot de passe mis à jour avec succès');
    } catch (error: any) {
      console.error('Error in changePassword:', error);
      return ApiResponse.internalServerError(
        res,
        'Erreur serveur',
        error.message
      );
    }
  }

  /**
   * Supprimer son propre compte utilisateur
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const result = await UserService.deleteUser(userId);

      if (!result.success) {
        return ApiResponse.notFound(res, 'Utilisateur non trouvé');
      }

      return ApiResponse.ok(res, 'Utilisateur supprimé avec succès');
    } catch (error: any) {
      console.error('Error in deleteUser:', error);
      return ApiResponse.internalServerError(
        res,
        'Erreur serveur',
        error.message
      );
    }
  }

  /**
   * Admin peut supprimer n'importe quel utilisateur par ID
   */
  static async adminDeleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await UserService.deleteUser(id);

      if (!result.success) {
        return ApiResponse.notFound(res, 'Utilisateur non trouvé');
      }

      return ApiResponse.ok(res, 'Utilisateur supprimé avec succès');
    } catch (error: any) {
      console.error('Error in adminDeleteUser:', error);
      return ApiResponse.internalServerError(
        res,
        'Erreur serveur',
        error.message
      );
    }
  }
  static async updateProfilePicture(req: Request, res: Response) {
    const userId = req.user!.id; // On récupère l'ID de l'utilisateur depuis les paramètres de l'URL
    const file = req.file; // Le fichier envoyé dans la requête

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: 'Aucun fichier image fourni' });
    }

    try {
      // Appeler la méthode UserService pour mettre à jour l'image de profil
      const result = await UserService.updateProfilePicture(userId, file);

      if (result.success) {
        return res
          .status(200)
          .json({ success: true, profilePicture: result.profilePicture });
      } else {
        return res
          .status(400)
          .json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de l'image de profil:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la mise à jour de l'image de profil",
      });
    }
  }
}

export default UserController;
