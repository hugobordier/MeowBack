import NotificationToken from '@/models/NotificationToken'; // modèle Sequelize pour tokens
import ApiError from '@utils/ApiError';

class NotificationTokenService {
  static async upsertToken(userId: string, token: string): Promise<void> {
    if (!userId) throw new ApiError(400, "L'ID utilisateur est requis");
    if (!token) throw new ApiError(400, "Le token est requis");

    const existing = await NotificationToken.findOne({ where: { user_id: userId } });

    if (existing) {
      await NotificationToken.update({ expo_push_token: token }, { where: { user_id: userId } });
    } else {
      await NotificationToken.create({ user_id: userId, expo_push_token: token });
    }
  }

  // Récupérer le token par userId
  static async getTokenByUserId(userId: string): Promise<string | null> {
    if (!userId) throw new ApiError(400, "L'ID utilisateur est requis");

    const record = await NotificationToken.findOne({ where: { user_id: userId } });
    return record ? record.expo_push_token : null;
  }

  // Supprimer le token (ex: déconnexion, ou désinscription)
  static async deleteToken(userId: string): Promise<boolean> {
    if (!userId) throw new ApiError(400, "L'ID utilisateur est requis");

    const deleted = await NotificationToken.destroy({ where: { user_id: userId } });
    return deleted > 0;
  }
}

export default NotificationTokenService;
