import type User from '../models/User';
import AuthService from '../services/authService';
import type { Request, Response } from 'express';
import { ApiResponse, HttpStatusCode } from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export default class authController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const { accessToken, refreshToken } = await AuthService.loginUser(
        email,
        password
      );
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 3600 * 1000 * 24 * 7,
        sameSite: 'strict',
      });
      return res.status(200).json({ accessToken });
    } catch (error: any) {
      console.error(error);
      return ApiResponse.unauthorized(res, error.message);
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
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return ApiResponse.forbidden(res, 'No refresh token found');
    }

    try {
      const { accessToken, newRefreshToken } =
        await AuthService.refreshAccessToken(refreshToken);
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        maxAge: 600 * 1000,
        sameSite: 'strict',
      });
      return ApiResponse.ok(res, 'Token refreshed successfully', {
        accessToken,
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
