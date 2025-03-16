import { DataTypes, Model } from 'sequelize';
import db from '../config/config';

class PetSitterRating extends Model {
  declare id: string;
  declare pet_sitter_id: string;
  declare user_id: string;
  declare rating: number;
  declare createdAt: Date;
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
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
  }
);

export default PetSitterRating;
