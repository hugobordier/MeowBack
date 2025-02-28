import bcrypt from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';
import { UniqueConstraintError, ValidationError } from 'sequelize';

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET as string;

export default class AuthService {
  static async loginUser(email: string, password: string) {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Mot de passe incorrect');
    }

    const accessToken = jwt.sign(user.dataValues, accessTokenSecret, {
      expiresIn: '60m',
    });
    const refreshToken = jwt.sign(user.dataValues, refreshTokenSecret, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  static async registerUser(
    username: string,
    email: string,
    password: string,
    lastName: string,
    firstName: string,
    age: number,
    birthDate: Date,
    gender: string,
    city: string,
    country: string,
    profilePicture: string | null,
    bio: string | null,
    bankInfo: string | null,
    rating: number | null,
    phoneNumber: string,
    address: string,
    identityDocument: string | null,
    insuranceCertificate: string | null,
    isAdmin: boolean | null
  ) {
    try {
      if (password.length < 1 || password.length > 100) {
        throw new Error(
          'Le mot de passe doit contenir entre 1 et 100 caractères.'
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
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
      });

      return user.dataValues;
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error('Email ou pseudo déjà utilisé');
      }
      if (error instanceof ValidationError) {
        const messages = error.errors.map((err) => {
          switch (err.path) {
            case 'username':
              return 'Le pseudo doit contenir entre 3 et 25 caractères.';
            case 'email':
              return 'L’email n’est pas valide.';
            case 'phoneNumber':
              return 'Le numéro de téléphone n’est pas valide.';
            default:
              return err.message;
          }
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
