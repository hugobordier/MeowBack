import { DataTypes, Model } from 'sequelize';
import db from '../config/config';
import User from './User';

class UserAmis extends Model {
  declare id: string;
  declare user_id: string;
  declare friend_id: string;
  declare status:boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserAmis.init(
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
        model: 'User', 
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    friend_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'User', 
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull:true,
    },
  },
  {
    sequelize: db,
    tableName: 'UserAmis',
    timestamps: true,
  }
);


User.hasMany(UserAmis, { foreignKey: 'user_id', as: 'amisAjoutes' });
UserAmis.belongsTo(User, { foreignKey: 'user_id', as: 'auteur' });

User.hasMany(UserAmis, { foreignKey: 'friend_id', as: 'demandesRecues' });
UserAmis.belongsTo(User, { foreignKey: 'friend_id', as: 'amiCible' });

export default UserAmis;
