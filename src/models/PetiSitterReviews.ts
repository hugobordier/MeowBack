import { DataTypes, Model } from 'sequelize';
import db from '../config/config';

class PetSitterReview extends Model {
  declare id: string;
  declare pet_sitter_id: string | null;
  declare user_id: string | null;
  declare message: string;
  declare createdAt: Date;
}

PetSitterReview.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    pet_sitter_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'pet_sitters',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: db,
    tableName: 'pet_sitter_reviews',
    timestamps: true,
  }
);

export default PetSitterReview;
