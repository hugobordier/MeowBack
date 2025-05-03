import { DataTypes, Model } from 'sequelize';
import db from '../config/config';
import pets from './pets';

class PetImage extends Model {
  declare id: string;;
  declare pet_id: string;
  declare url_image: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

PetImage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    pet_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pets', 
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    url_image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: 'pet_images',
    timestamps: true,
  }
);

pets.hasMany(PetImage, { foreignKey: 'pet_id', as: 'images' });
PetImage.belongsTo(pets, { foreignKey: 'pet_id', as: 'pet' });

export default PetImage;
