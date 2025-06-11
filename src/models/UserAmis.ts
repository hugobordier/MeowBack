import { DataTypes, Model } from 'sequelize';
import db from '../config/config';
import User from './User';
import PetSitter from './PetSitter';
import Pet from './pets';

class UserAmis extends Model {
  declare id: string;
  declare user_id: string;
  declare petsitter_id: string;
  declare statusdemande: 'accepted' | 'refused' | 'pending';
  declare message:string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare petidtable:string[];
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
    petsitter_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'PetSitter', 
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    statusdemande: {
      type: DataTypes.ENUM('accepted', 'refused', 'pending'),
      allowNull: false,
      defaultValue: 'pending',
    },
      message: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    petidtable: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true,
    }
  },
  {
    sequelize: db,
    tableName: 'UserAmis',
    timestamps: true,
  }
);


User.hasMany(UserAmis, { foreignKey: 'user_id', as: 'amisAjoutes' });
UserAmis.belongsTo(User, { foreignKey: 'user_id', as: 'auteur' });

PetSitter.hasMany(UserAmis, { foreignKey: 'petsitter_id', as: 'demandesRecues' });
UserAmis.belongsTo(PetSitter, { foreignKey: 'petsitter_id', as: 'amiCible' });

export default UserAmis;
