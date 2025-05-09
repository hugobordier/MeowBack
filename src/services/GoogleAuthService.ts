import User from '@/models/User';
import dotenv from 'dotenv';
import ApiError from '@utils/ApiError';
import jwt from 'jsonwebtoken';

dotenv.config();

interface GoogleUserData {
  sub: string;
  email: string;
  name: string;
  given_name: string;
  picture: string;
  email_verified: boolean;
}

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET as string;

class GoogleAuthService {
  static async findOrCreateUser(googleUser: GoogleUserData) {
    const { sub: googleId, name, given_name, email, picture } = googleUser;

    let user = await User.findOne({ where: { email } });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      const accessToken = jwt.sign({ id: user.id }, accessTokenSecret, {
        expiresIn: '1h',
      });
      const refreshToken = jwt.sign({ id: user.id }, refreshTokenSecret, {
        expiresIn: '7d',
      });
      return { user, accessToken, refreshToken };
    }

    let firstName = given_name || name;
    let lastName = given_name.split(' ')[given_name.split(' ').length - 1];

    if (name) {
      const nameParts = name.trim().split(' ');
      if (nameParts.length > 1) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        lastName = 'GoogleUser';
      }
    }

    let baseUsername = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '');
    let username = baseUsername;
    let counter = 1;
    while (await User.findOne({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const randomAge = Math.floor(Math.random() * 40) + 18;
    const fixedBirthDate = new Date('1990-01-01');

    user = await User.create({
      username,
      email,
      password: 'googlegoogle',
      firstName,
      lastName,
      age: randomAge,
      birthDate: fixedBirthDate,
      profilePicture: picture,
      googleId,
      phoneNumber: '0000000000',
    });

    const accessToken = jwt.sign({ id: user.id }, accessTokenSecret, {
      expiresIn: '1h',
    });
    const refreshToken = jwt.sign({ id: user.id }, refreshTokenSecret, {
      expiresIn: '7d',
    });

    return { user, accessToken, refreshToken };
  }
}

export default GoogleAuthService;
