import type User from '../models/User';
import AuthService from '../services/authService';
import type { Request, Response } from 'express';
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
      res.status(200).json({ accessToken });
    } catch (error: any) {
      console.error(error);

      res.status(401).json({ error: error.message });
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
      gender,
      city,
      country,
      profilePicture,
      bio,
      bankInfo,
      rating,
      phoneNumber,
      address,
      identityDocument,
      insuranceCertificate,
      isAdmin,
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
        gender,
        city,
        country,
        profilePicture,
        bio,
        bankInfo,
        rating,
        phoneNumber,
        address,
        identityDocument,
        insuranceCertificate,
        isAdmin
      );
      res.status(200).json(user);
    } catch (error: any) {
      console.error(error);
      res.status(401).json({ error: error.message });
    }
  }

  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(403).json({ error: 'No refresh token found' });
    }

    try {
      const { accessToken, newRefreshToken } =
        await AuthService.refreshAccessToken(refreshToken);
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        maxAge: 600 * 1000,
        sameSite: 'strict',
      });
      res.json({ accessToken });
    } catch (error) {
      res.status(403).json({ error: 'Invalid refresh token' });
    }
  }

  static async test(req: Request, res: Response) {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      console.error(error);
      throw new ApiError(500, 'Impossible de refresh');
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      res.status(200).json({ message: 'Email sent' });
    } catch (error: any) {
      console.error(error);
      res.status(401).json({ error: error.message });
    }
  }

  static async verifyResetCode(req: Request, res: Response) {
    try {
      const { email, code, password } = req.body;
      await AuthService.verifyResetCode(email, code, password);
      res.status(200).json({ message: 'Reset code is valid' });
    } catch (error: any) {
      console.error(error);
      res
        .status(error.statusCode || 400)
        .json(new ApiError(400, error.message));
    }
  }
}
