import { DataTypes, Model } from 'sequelize';
import db from '../config/config';
import User from './User';
import PetSitter from './PetSitter';

class PetSitterReview extends Model {
  declare id: string;
  declare pet_sitter_id: string;
  declare user_id: string;
  declare message: string;
  declare createdAt: Date;
  declare updatedAt: Date;
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: 'pet_sitter_reviews',
    timestamps: true,
  }
);

User.hasMany(PetSitterReview, { foreignKey: 'user_id', as: 'reviews' });
PetSitterReview.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

PetSitter.hasMany(PetSitterReview, {
  foreignKey: 'pet_sitter_id',
  as: 'reviews',
});
PetSitterReview.belongsTo(PetSitter, {
  foreignKey: 'pet_sitter_id',
  as: 'petSitter',
});

export default PetSitterReview;
