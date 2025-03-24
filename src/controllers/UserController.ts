import type { Request, Response } from 'express';
import UserService from '../services/UserService';

class UserController {
  static async getUserProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const user = await UserService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      return res.status(200).json(user);
    } catch (error: any) {
      console.error('Error in getUserProfile:', error);
      return res
        .status(500)
        .json({ message: 'Erreur serveur', error: error.message });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserService.getUserById(id);

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
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

      return res.status(200).json(publicUser);
    } catch (error: any) {
      console.error('Error in getUserById:', error);
      return res
        .status(500)
        .json({ message: 'Erreur serveur', error: error.message });
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

      const totalPages = Math.ceil(totalItems / limit);

      return res.status(200).json({
        sucess: true,
        message: 'données récupérees avec succes',
        users,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    } catch (error: any) {
      console.error('Error in getAllUsers:', error);
      return res
        .status(500)
        .json({ message: 'Erreur serveur', error: error.message });
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
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
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

      return res.status(200).json({
        message: 'Utilisateur mis à jour avec succès',
        user: userResponse,
      });
    } catch (error: any) {
      console.error('Error in updateUser:', error);

      if (error.name === 'ValidationError') {
        return res
          .status(400)
          .json({ message: 'Données invalides', errors: error.errors });
      }

      return res
        .status(500)
        .json({ message: 'Erreur serveur', error: error.message });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user!.id;

      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({ message: 'Les mots de passe ne correspondent pas' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          message: 'Le mot de passe doit contenir au moins 8 caractères',
        });
      }

      const isPasswordChanged = await UserService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      if (!isPasswordChanged) {
        return res
          .status(401)
          .json({ message: 'Mot de passe actuel incorrect' });
      }

      return res
        .status(200)
        .json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error: any) {
      console.error('Error in changePassword:', error);
      return res
        .status(500)
        .json({ message: 'Erreur serveur', error: error.message });
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
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      return res
        .status(200)
        .json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error: any) {
      console.error('Error in deleteUser:', error);
      return res
        .status(500)
        .json({ message: 'Erreur serveur', error: error.message });
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
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      return res
        .status(200)
        .json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error: any) {
      console.error('Error in adminDeleteUser:', error);
      return res
        .status(500)
        .json({ message: 'Erreur serveur', error: error.message });
    }
  }
}

export default UserController;
