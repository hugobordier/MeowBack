import { OAuth2Client, LoginTicket } from 'google-auth-library';
import User from '@/models/User';
import dotenv from 'dotenv';
import ApiError from '@utils/ApiError';
import jwt from 'jsonwebtoken';

dotenv.config();

interface GoogleUserData {
  googleId: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  emailVerified: boolean;
}

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_SECRET
);

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET as string;

class GoogleAuthService {
  static async authenticateWithGoogle(
    idToken: string
  ): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    try {
      const ticket = await this.verifyGoogleToken(idToken);
      if (!ticket) {
        throw ApiError.unauthorized('Token Google invalide');
      }

      const userData = this.extractGoogleUserData(ticket);
      const user = await this.findOrCreateGoogleUser(userData);

      const accessToken = jwt.sign({ id: user.id }, accessTokenSecret, {
        expiresIn: '1h',
      });
      const refreshToken = jwt.sign({ id: user.id }, refreshTokenSecret, {
        expiresIn: '7d',
      });

      return { user, accessToken, refreshToken };
    } catch (error) {
      console.error('[GoogleAuthService] authenticateWithGoogle error:', error);
      if (error instanceof ApiError) throw error;
      throw ApiError.internal(
        "Erreur interne lors de l'authentification Google"
      );
    }
  }

  private static async verifyGoogleToken(
    idToken: string
  ): Promise<LoginTicket> {
    try {
      return await googleClient.verifyIdToken({
        idToken,
        audience: [
          process.env.GOOGLE_CLIENT_ID as string,
          process.env.GOOGLE_ANDROID_CLIENT_ID as string,
          process.env.GOOGLE_IOS_CLIENT_ID as string,
        ],
      });
    } catch (error) {
      console.error('[GoogleAuthService] verifyGoogleToken error:', error);
      throw ApiError.unauthorized('Échec de la vérification du token Google');
    }
  }

  private static extractGoogleUserData(ticket: LoginTicket): GoogleUserData {
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw ApiError.badRequest(
        "Impossible d'obtenir les informations d'utilisateur depuis Google"
      );
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || '',
      firstName: payload.given_name || '',
      lastName: payload.family_name || '',
      profilePicture: payload.picture || '',
      emailVerified: payload.email_verified ?? false,
    };
  }

  private static async findOrCreateGoogleUser(
    userData: GoogleUserData
  ): Promise<User> {
    try {
      let user = await User.findOne({ where: { googleId: userData.googleId } });

      if (!user) {
        user = await User.findOne({ where: { email: userData.email } });
      }

      if (user) {
        let updated = false;

        if (!user.googleId) {
          user.googleId = userData.googleId;
          updated = true;
        }

        if (!user.profilePicture && userData.profilePicture) {
          user.profilePicture = userData.profilePicture;
          updated = true;
        }

        if (updated) await user.save();
        return user;
      }

      const newUser = await User.create({
        email: userData.email,
        username: userData.email.split('@')[0],
        lastName: userData.lastName,
        firstName: userData.firstName,
        googleId: userData.googleId,
        profilePicture: userData.profilePicture,
        password: 'google', // à ajuster selon ton modèle
        age: 18,
        birthDate: new Date('2000-01-01'),
        phoneNumber: '0000000000',
      });

      return newUser;
    } catch (error) {
      console.error('[GoogleAuthService] findOrCreateGoogleUser error:', error);
      throw ApiError.internal(
        "Erreur lors de la recherche ou création de l'utilisateur Google"
      );
    }
  }
}

export default GoogleAuthService;
