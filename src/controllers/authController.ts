import User from '../models/User';
import AuthService from '../services/authService';
import type { Request, Response } from 'express';
import { ApiResponse, HttpStatusCode } from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { Op } from 'sequelize';
import querystring from 'querystring';
import dotenv from 'dotenv';
import axios from 'axios';
import GoogleAuthService from '@/services/GoogleAuthService';

dotenv.config();

const BASE_URL = process.env.BASE_URL as string;

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

      if (user.password === 'googlegoogle') {
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

  static async getAuthRedirect(req: Request, res: Response) {
    const redirectUri = `${BASE_URL}/authRoutes/callback`;
    const scope = 'openid email profile';
    const { scheme } = req.query as { scheme: string };
    const state = scheme;

    if (!redirectUri) {
      return res.status(400).json({
        error: 'Missing redirect_uri',
      });
    }
    console.log('state', state);
    if (!state) {
      return res.status(400).json({
        error: 'Missing state',
      });
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        error: 'Missing GOOGLE_CLIENT_ID environment variable',
      });
    }

    const queryParams = querystring.stringify({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      success: 'true',
      response_type: 'code',
      scope: scope,
      state: state,
      access_type: 'offline',
      prompt: 'consent',
      scheme: scheme,
    });

    const authUrl = `${GOOGLE_AUTH_ENDPOINT}?${queryParams}`;

    console.log(authUrl);

    return res.redirect(authUrl);
  }

  static async handleGoogleCallback(req: Request, res: Response) {
    const { code, state } = req.query;

    const codeStr = Array.isArray(code) ? code[0] : (code as string);
    const stateStr = Array.isArray(state) ? state[0] : (state as string);

    if (!stateStr) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    if (!codeStr) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    try {
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      const GOOGLE_SECRET = process.env.GOOGLE_SECRET;

      if (!GOOGLE_CLIENT_ID || !GOOGLE_SECRET) {
        return res.status(500).json({
          error: 'Missing Google OAuth credentials in environment variables',
        });
      }

      const tokenRequestData = {
        code: codeStr as string,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_SECRET,
        redirect_uri: `${BASE_URL}/authRoutes/callback`,
        grant_type: 'authorization_code',
      };

      console.log('redirect url :', tokenRequestData.redirect_uri);

      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        querystring.stringify(tokenRequestData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token } = tokenResponse.data;

      const userInfoResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const userInfo = userInfoResponse.data;

      const { user, accessToken, refreshToken } =
        await GoogleAuthService.findOrCreateUser(userInfo);

      // res.redirect(
      //   `exp://7gjsi3u-kikipaul-8081.exp.direct/--/(auth)/home?accessToken=${accessToken}&refreshToken=${refreshToken}&user_id=${user.id}`
      // ); // a changer avec app sheme de l'app
      res.redirect(
        `${state}?accessToken=${accessToken}&refreshToken=${refreshToken}&user_id=${user.id}`
      );
    } catch (error) {
      console.error('Error processing Google callback:', error);

      if (axios.isAxiosError(error)) {
        const axiosError = error;
        if (axiosError.response) {
          // res.redirect('exp://7gjsi3u-kikipaul-8081.exp.direct/--/(auth)/home'); // a changer avec app sheme de l'app
          res.redirect(`${state}`);
        }
      }

      // res.redirect('exp://7gjsi3u-kikipaul-8081.exp.direct/--/(auth)/home'); // a changer avec app sheme de l'app
      res.redirect(`${state}`);
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
