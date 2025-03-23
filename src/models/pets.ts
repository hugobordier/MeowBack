import { DataTypes, Model } from 'sequelize';
import db from '../config/config';

class pets extends Model {
  declare id: string;
  declare name: string;
  declare breed: string;
  declare age: number;
  declare species: string;
  declare allergy: string;
  declare weight: number;
  declare diet: string;
  declare description: string;  
  declare photo_url: string;
  declare gender : string;
  declare neutered: boolean;
  declare color: string;
  declare user_id: string;

}

pets.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 25], 
      },
    },
    breed: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      validate: {
        min: 0, 
      },
    },
    species: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    allergy: {
      type: DataTypes.TEXT,
      allowNull: true, 
      validate: {
        len: [2, 100], 
      },
    },
    weight: {
      type: DataTypes.FLOAT, 
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    diet: {
      type: DataTypes.TEXT, 
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT, 
      allowNull: true,
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'hermaphrodite'), 
      allowNull: false,
    },
    neutered: {
      type: DataTypes.BOOLEAN, 
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: 'pets', 
    timestamps: false,
  }
);
  
  export default pets;
  