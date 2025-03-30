import {
  ForeignKeyConstraintError,
  Op,
  UniqueConstraintError,
  ValidationError,
} from 'sequelize';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import CloudinaryService from './CloudinaryService';
import path from 'path';
import { FolderName } from '@/config/cloudinary.config';
import ApiError from '@utils/ApiError';
import { IDVerificationService } from '@/config/idAnalyzer.config';

class UserService {
  static async getUserById(id: string) {
    return await User.findByPk(id);
  }

  static async getUserByEmail(email: string) {
    return await User.findOne({ where: { email } });
  }

  static async getUserByUsername(username: string) {
    return await User.findOne({ where: { username } });
  }

  static async getAllUsers(page: number, limit: number, search: string) {
    const offset = (page - 1) * limit;
    let whereClause = {};

    if (search) {
      whereClause = {
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { firstName: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      attributes: {
        exclude: ['password', 'resetcode', 'resetcodeexpires', 'bankInfo'],
      },
    });

    const formattedUsers = rows.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      lastName: user.lastName,
      firstName: user.firstName,
      age: user.age,
      adress: user.address,
      city: user.city,
      country: user.country,
      profilePicture: user.profilePicture,
      bio: user.bio,
      rating: user.rating,
      phoneNumber: user.phoneNumber,
    }));

    return {
      users: formattedUsers,
      totalItems: count,
    };
  }

  static async updateUser(userId: string, updateData: Partial<User>) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw ApiError.notFound(`User not found with id : ${userId}`);
    }
    try {
      await user.update(updateData);
      return user;
    } catch (error) {
      if (error instanceof ValidationError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));
        throw ApiError.badRequest('Validation failed', { validationErrors });
      }

      if (error instanceof UniqueConstraintError) {
        const duplicateFields = error.errors.map((err) => err.path);
        throw ApiError.conflict(
          `Duplicate values for: ${duplicateFields.join(', ')}`
        );
      }

      if (error instanceof ForeignKeyConstraintError) {
        throw ApiError.badRequest('Invalid reference to related entity');
      }

      throw ApiError.internal(
        'An unexpected error occurred during user update'
      );
    }
  }

  static async deleteUser(userId: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      return { success: false };
    }

    await user.destroy();
    return { success: true };
  }

  static async updateAdminStatus(userId: string, isAdmin: boolean) {
    const user = await User.findByPk(userId);

    if (!user) {
      return { success: false };
    }

    await user.update({ isAdmin });
    return { success: true };
  }

  static async getPublicProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'username',
        'firstName',
        'lastName',
        'profilePicture',
        'bio',
        'rating',
        'city',
        'country',
      ],
    });

    return user;
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return false;
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return false;
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await user.update({ password: hashedPassword });

      return true;
    } catch (error) {
      console.error('Error in UserService.changePassword:', error);
      return false;
    }
  }

  static async updateProfilePicture(userId: string, file: Express.Multer.File) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return { success: false, message: 'Utilisateur non trouvé' };
      }

      const fileExtension = path.extname(file.originalname);
      const newFileName = `${userId}${fileExtension}`;
      file.originalname = newFileName;

      const uploadResult = await CloudinaryService.uploadImage(file, userId, {
        folder: FolderName.PROFILE_PICTURES as string,
      });

      await user.update({
        profilePicture: uploadResult.secure_url,
      });

      return { success: true, profilePicture: uploadResult.secure_url };
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de l'image de profil:",
        error
      );
      return {
        success: false,
        message: "Une erreur est survenue lors de l'upload",
      };
    }
  }

  static async deleteProfilePicture(userId: string) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw ApiError.notFound('Utilisateur non trouvé');
      }

      const publicId = FolderName.PROFILE_PICTURES + '/' + userId;

      await CloudinaryService.deleteImage(publicId);

      await user.update({ profilePicture: null });

      return { success: true, profilePicture: null };
    } catch (error: any) {
      console.error(
        "Erreur lors de la mise à jour de l'image de profil:",
        error
      );
      return {
        success: false,
        message: `Une erreur est survenue lors de l'upload : ${error.message}`,
      };
    }
  }

  static async updateIdentityDocument(user: User, file: Express.Multer.File) {
    try {
      const response = await IDVerificationService.verifyID(file, user);

      console.log('jmet le rep ici', response);

      if (!response.authenticationScore || response.authenticationScore < 0.5) {
        throw ApiError.badRequest(
          "Le document n'est pas valide ",
          response.errors
        );
      }

      if (!response.isNameMatch) {
        throw ApiError.badRequest(
          'Le nom ou le prénom ne correspondent pas, veuillez verifié vos informations personnels',
          response.errors
        );
      }

      if (!response.isAgeVerified) {
        throw ApiError.badRequest(
          "L'age ne correspond pas, veuillez verifié vos informations personnel",
          response.errors
        );
      }
      const fileExtension = path.extname(file.originalname);
      const newFileName = `${user.id}${fileExtension}`;
      file.originalname = newFileName;

      const uploadResult = await CloudinaryService.uploadImage(
        response.croppedDocument ? response.croppedDocument : file,
        user.id,
        {
          folder: FolderName.IDENTITY_DOCUMENT as string,
        }
      );

      await user.update({
        identityDocument: uploadResult.secure_url,
      });

      return { success: true, identityDocument: uploadResult.secure_url };
    } catch (error: any) {
      console.error(
        "Erreur lors de la mise à jour de l'image de profil:",
        error
      );
      throw ApiError.badRequest(
        error.message || "Erreur lors de la mise à jour de l'image de profil"
      );
    }
  }

  static async deleteIdentityDocument(userId: string) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw ApiError.notFound('Utilisateur non trouvé');
      }

      const publicId = FolderName.IDENTITY_DOCUMENT + '/' + userId;

      await CloudinaryService.deleteImage(publicId);

      await user.update({ identityDocument: null });

      return { success: true, identityDocument: null };
    } catch (error: any) {
      console.error(
        "Erreur lors de la mise à jour de l'image de profil:",
        error
      );
      return {
        success: false,
        message: `Une erreur est survenue lors de l'upload : ${error.message}`,
      };
    }
  }
}

export default UserService;
