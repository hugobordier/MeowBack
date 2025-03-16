import bcrypt from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';
import { Op, UniqueConstraintError, ValidationError } from 'sequelize';
import { sendEmail } from '../utils/sendMail';
import ApiError from '../utils/ApiError';

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
      expiresIn: '1h',
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
        resetcode: null,
        resetcodeexpires: null,
      });

      return user.dataValues;
    } catch (error: any) {
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
      console.log(error);
      throw new Error('Erreur lors de la création de l’utilisateur');
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    const decodedToken = jwt.verify(refreshToken, refreshTokenSecret);
    //@ts-ignore
    const userId = decodedToken.userId as string;

    const accessToken = jwt.sign({ userId: userId }, accessTokenSecret, {
      expiresIn: '1h',
    });
    const newRefreshToken = jwt.sign({ userId: userId }, refreshTokenSecret, {
      expiresIn: '7d',
    });

    return { accessToken, newRefreshToken };
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const resetcode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetcodeexpires = new Date(Date.now() + 1000 * 60 * 10);

    await sendEmail(email, resetcode);

    await user.update({ resetcode, resetcodeexpires });
  }

  static async verifyResetCode(
    email: string,
    code: string,
    newPassword: string
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    if (user.resetcode !== code) {
      throw ApiError.badRequest('Incorrect reset code');
    }

    if (new Date(user.dataValues.resetcodeexpires) < new Date()) {
      throw ApiError.badRequest('Reset code has expired');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
      resetcode: null,
      resetcodeexpires: null,
    });

    return { message: 'Password successfully reset' };
  }

  static async deleteUser(uuid: string) {
    try {
      const user = await User.findByPk(uuid);

      if (!user) {
        throw ApiError.notFound('No user found');
      }
      await user.destroy();

      return { message: 'User sucessfully deleted' };
    } catch (error: any) {
      console.error(error);
      throw ApiError.internal('An error occurred while deleting the user');
    }
  }

  static async updateUser(userId: string, updateData: any) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    if (updateData.username) {
      const existingUser = await User.findOne({
        where: {
          username: updateData.username,
          id: { [Op.ne]: userId },
        },
      });

      if (existingUser) {
        throw { statusCode: 400, message: 'Username already taken' };
      }
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await user.update(updateData);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      updatedAt: user.updatedAt,
    };
  }
}
