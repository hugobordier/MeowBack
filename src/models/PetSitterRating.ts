import { DataTypes, Model } from 'sequelize';
import db from '../config/config';
import User from './User';
import PetSitter from './PetSitter';

class PetSitterRating extends Model {
  declare id: string;
  declare pet_sitter_id: string;
  declare user_id: string;
  declare rating: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

PetSitterRating.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    pet_sitter_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pet_sitters',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 5,
      },
    },
  },
  {
    sequelize: db,
    tableName: 'pet_sitter_ratings',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['pet_sitter_id', 'user_id'],
      },
    ],
  }
);

User.hasMany(PetSitterRating, { foreignKey: 'user_id', as: 'ratings' });
PetSitterRating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

PetSitter.hasMany(PetSitterRating, {
  foreignKey: 'pet_sitter_id',
  as: 'ratings',
});
PetSitterRating.belongsTo(PetSitter, {
  foreignKey: 'pet_sitter_id',
  as: 'petSitter',
});

export default PetSitterRating;
