import User from '../models/User';
import AuthService from '../services/authService';
import GoogleAuthService from '@/services/GoogleAuthService';
import type { Request, Response } from 'express';
import { ApiResponse, HttpStatusCode } from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { Op } from 'sequelize';

export default class authController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username: email }],
        },
      });

      if (!user) {
        return ApiResponse.unauthorized(res, 'Utilisateur non trouvé');
      }

      if (user.password === 'google') {
        return ApiResponse.unauthorized(
          res,
          'Ce compte a été créé via Google. Veuillez définir un mot de passe pour vous connecter.'
        );
      }

      const { accessToken, refreshToken } = await AuthService.loginUser(
        email,
        password
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 3600 * 1000 * 24 * 7,
        sameSite: 'strict',
      });

      return res.status(200).json({ accessToken, refreshToken });
    } catch (error: any) {
      console.error(error);
      return ApiResponse.unauthorized(res, error.message);
    }
  }

  static async loginWithGoogle(req: Request, res: Response) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return ApiResponse.badRequest(
          res,
          'Le jeton Google (idToken) est requis'
        );
      }

      const result = await GoogleAuthService.authenticateWithGoogle(idToken);

      return ApiResponse.ok(res, 'Authentification Google réussie', {
        user: {
          id: result.user._id,
          email: result.user.email,
          name: result.user.name,
          avatar: result.user.profilePicture,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error: any) {
      console.error('[AuthController] Google auth error:', error);

      if (error.name === 'GoogleVerificationError') {
        return ApiResponse.unauthorized(
          res,
          "Échec de l'authentification Google"
        );
      }

      return ApiResponse.internalServerError(
        res,
        "Une erreur est survenue lors de l'authentification"
      );
    }
  }

  static async register(req: Request, res: Response) {
    const {
      username,
      email,
      password,
      lastName,
      firstName,
      age,
      birthDate,
      phoneNumber,
    } = req.body as User;
    try {
      const user = await AuthService.registerUser(
        username,
        email,
        password,
        lastName,
        firstName,
        age,
        birthDate,
        phoneNumber
      );
      return ApiResponse.created(res, 'User registered successfully', user);
    } catch (error: any) {
      console.error(error);
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async refresh(req: Request, res: Response) {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return ApiResponse.forbidden(res, 'No refresh token found');
    }

    try {
      const { accessToken, newRefreshToken } =
        await AuthService.refreshAccessToken(refreshToken);

      return res.status(200).json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      return ApiResponse.forbidden(res, 'Invalid refresh token');
    }
  }

  static async test(req: Request, res: Response) {
    try {
      return ApiResponse.ok(res, 'User data retrieved successfully', req.user);
    } catch (error) {
      console.error(error);
      throw new ApiError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        'Impossible de refresh'
      );
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      return ApiResponse.ok(res, 'Email sent');
    } catch (error: any) {
      console.error(error);
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async verifyResetCode(req: Request, res: Response) {
    try {
      const { email, code, password } = req.body;
      await AuthService.verifyResetCode(email, code, password);
      return ApiResponse.ok(res, 'Reset code is valid');
    } catch (error: any) {
      console.error(error);
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const uuid = req.user!.id;
      await AuthService.deleteUser(uuid);
      return ApiResponse.ok(res, 'User has been deleted successfully');
    } catch (error: any) {
      console.error(error);
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const updateData = req.body;

      if (!updateData || Object.keys(updateData).length === 0) {
        return ApiResponse.badRequest(
          res,
          'Aucune donnée fournie pour la mise à jour.'
        );
      }

      const updatedUser = await AuthService.updateUser(userId, updateData);
      return ApiResponse.ok(res, 'User updated successfully', {
        user: updatedUser,
      });
    } catch (error: any) {
      console.error(error);
      return ApiResponse.internalServerError(res, error.message);
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('refreshToken');
    return ApiResponse.ok(res, 'User has been logged out');
  }
}
