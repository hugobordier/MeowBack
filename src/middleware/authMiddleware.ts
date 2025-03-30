import jwt, { type JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { Request, Response, NextFunction } from 'express';
import type User from '../models/User';
import { ApiResponse } from '@utils/ApiResponse';
import UserService from '@/services/UserService';

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET as string;

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) {
    jwt.verify(token, accessTokenSecret, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Accès interdit, pas de token' });
      } else {
        const { iat, exp, ...userData } = decoded as JwtPayload;
        req.user = (await UserService.getUserById(userData.id)) as User;
        next();
      }
    });
  } else {
    return res.status(401).json({ error: 'Accès interdit, pas de token' });
    //throw ApiError.unauthorized('Accès interdit, pas de token');
  }
};
