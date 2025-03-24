import { Op } from 'sequelize';
import User from '../models/User';
import bcrypt from 'bcryptjs';

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
      return null;
    }

    await user.update(updateData);
    return user;
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
}

export default UserService;
