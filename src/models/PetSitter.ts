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

  declare available_days: (
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday'
  )[];

  declare available_slots: ('Matin' | 'Après-midi' | 'Soir' | 'Nuit')[];

  declare latitude: number | null;
  declare longitude: number | null;

  declare animal_types: (
    | 'Chat'
    | 'Chien'
    | 'Oiseau'
    | 'Rongeur'
    | 'Reptile'
    | 'Poisson'
    | 'Furet'
    | 'Cheval'
    | 'Autre'
  )[];

  declare services: (
    | 'Promenade'
    | 'Alimentation'
    | 'Jeux'
    | 'Soins'
    | 'Toilettage'
    | 'Dressage'
    | 'Garderie'
    | 'Médication'
    | 'Nettoyage'
    | 'Transport'
  )[];

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
    available_days: {
      type: DataTypes.ARRAY(
        DataTypes.ENUM(
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        )
      ),
      allowNull: true,
      defaultValue: [],
    },
    available_slots: {
      type: DataTypes.ARRAY(
        DataTypes.ENUM('Matin', 'Après-midi', 'Soir', 'Nuit')
      ),
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
    animal_types: {
      type: DataTypes.ARRAY(
        DataTypes.ENUM(
          'Chat',
          'Chien',
          'Oiseau',
          'Rongeur',
          'Reptile',
          'Poisson',
          'Furet',
          'Cheval',
          'Autre'
        )
      ),
      allowNull: true,
      defaultValue: [],
    },
    services: {
      type: DataTypes.ARRAY(
        DataTypes.ENUM(
          'Promenade',
          'Alimentation',
          'Jeux',
          'Soins',
          'Toilettage',
          'Dressage',
          'Garderie',
          'Médication',
          'Nettoyage',
          'Transport'
        )
      ),
      allowNull: true,
      defaultValue: [],
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
