import { DataTypes, Model } from 'sequelize';
import db from '../config/config';
import User from './User';

class NotificationToken extends Model {
  declare id: string;
  declare user_id: string;
  declare expo_push_token: string;

  declare createdAt: Date;
  declare updatedAt: Date;
}

NotificationToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    expo_push_token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize: db,
    tableName: 'notification_tokens',
    timestamps: true,
  }
);

User.hasMany(NotificationToken, { foreignKey: 'user_id', as: 'notificationTokens' });
NotificationToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default NotificationToken;
