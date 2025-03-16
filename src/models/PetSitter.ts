import { DataTypes, Model } from 'sequelize';
import db from '../config/config';
import type { AvailabilityDay } from '@/types/type';
class PetSitter extends Model {
  declare id: string;
  declare user_id: string;
  declare bio: string;
  declare experience: number;
  declare hourly_rate: number;
  declare availability: AvailabilityDay[] | null;
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
    availability: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        isValidAvailability(value: AvailabilityDay[] | null) {
          if (value === null) return;

          if (!Array.isArray(value)) {
            throw new Error('Availability must be an array.');
          }

          const validDays: AvailabilityDay['day'][] = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ];

          value.forEach((entry) => {
            if (!entry.day || !validDays.includes(entry.day)) {
              throw new Error(`Invalid day: ${entry.day}`);
            }

            if (!Array.isArray(entry.intervals)) {
              throw new Error('Intervals must be an array.');
            }

            entry.intervals.forEach((interval) => {
              if (
                !interval.start_time ||
                !interval.end_time ||
                typeof interval.start_time !== 'string' ||
                typeof interval.end_time !== 'string'
              ) {
                throw new Error(
                  'Invalid time format. start_time and end_time must be strings in TIME format (HH:mm:ss).'
                );
              }

              if (interval.start_time >= interval.end_time) {
                throw new Error('start_time must be before end_time.');
              }
            });
          });
        },
      },
    },
  },
  {
    sequelize: db,
    tableName: 'pet_sitters',
    timestamps: true,
  }
);

export default PetSitter;
