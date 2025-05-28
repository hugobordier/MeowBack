import { DataTypes, Model } from 'sequelize';
import db from '../config/config';
import type { AvailabilityDay } from '@/types/type';
import User from './User';

class PetSitter extends Model {
  declare id: string;
  declare user_id: string;
  declare bio: string;
  declare experience: number;
  declare hourly_rate: number;

  declare available_days: string[];
  declare available_slots: string[];
  declare animal_types: string[];
  declare services: string[];

  declare latitude: number | null;
  declare longitude: number | null;

  declare createdAt: Date;
  declare updatedAt: Date;
}

PetSitter.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    // 🧼 Tous les ENUMS remplacés par TEXT[]
    available_days: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: [],
    },
    available_slots: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: [],
    },
    animal_types: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: [],
    },
    services: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: [],
    },

    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      validate: {
        min: -90,
        max: 90,
      },
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      validate: {
        min: -180,
        max: 180,
      },
    },
  },
  {
    sequelize: db,
    tableName: 'pet_sitters',
    timestamps: true,
  }
);

User.hasOne(PetSitter, { foreignKey: 'user_id', as: 'petsitter' });
PetSitter.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default PetSitter;
