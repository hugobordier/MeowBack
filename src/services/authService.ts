import bcrypt from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';
import { UniqueConstraintError, ValidationError } from 'sequelize';

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

export default class AuthService {
  static async loginUser(email: string, mdp: string) {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const validPassword = await bcrypt.compare(mdp, user.mdp);
    if (!validPassword) {
      throw new Error('Mot de passe incorrect');
    }

    const accessToken = jwt.sign(user.dataValues, accessTokenSecret, {
      expiresIn: '1m',
    });
    const refreshToken = jwt.sign(user.dataValues, refreshTokenSecret, {
      expiresIn: '10m',
    });

    return { accessToken, refreshToken };
  }

  static async registerUser(pseudo: string, email: string, mdp: string) {
    try {
      const hashedPassword = await bcrypt.hash(mdp, 10);
      const user = await User.create({ pseudo, email, mdp: hashedPassword });
      return user.dataValues;
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error('Email ou pseudo déjà utilisé');
      }
      if (error instanceof ValidationError) {
        const messages = error.errors.map((err) => {
          if (err.path === 'pseudo') {
            return 'Le pseudo doit contenir entre 3 et 25 caractères.';
          }
          if (err.path === 'email') {
            return 'L’email n’est pas valide.';
          }
          if (err.path === 'mdp') {
            return 'Le mot de passe doit contenir entre 1 et 100 caractères.';
          }
          return err.message; // Autres messages d’erreur génériques
        });
        throw new Error(messages.join(' '));
      }
      throw new Error('Erreur lors de la création de l’utilisateur');
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    const decodedToken = jwt.verify(refreshToken, refreshTokenSecret);
    //@ts-ignore
    const userId = decodedToken.userId as string;

    const accessToken = jwt.sign({ userId: userId }, accessTokenSecret, {
      expiresIn: '1m',
    });
    const newRefreshToken = jwt.sign({ userId: userId }, refreshTokenSecret, {
      expiresIn: '10m',
    });

    return { accessToken, newRefreshToken };
  }
}
