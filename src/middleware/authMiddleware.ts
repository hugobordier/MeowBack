import jwt, { type JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { Request, Response, NextFunction } from 'express';
import type User from '../models/User';

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string;

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token)
    return res.status(401).json({ error: 'Accès interdit, pas de token' });

  jwt.verify(token, accessTokenSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token invalide' });
    }
    req.user = decoded as User;
    next();
  });
};
