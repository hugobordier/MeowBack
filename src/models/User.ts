import { DataTypes, Model } from 'sequelize';
import db from '../config/config';

class User extends Model {
  declare id: string;
  declare username: string;
  declare email: string;
  declare password: string;
  declare isAdmin: boolean;
  declare lastName: string;
  declare firstName: string;
  declare age: number;
  declare birthDate: Date;
  declare city: string;
  declare country: string;
  declare gender: string;
  declare profilePicture: string;
  declare bio: string;
  declare bankInfo: string;
  declare rating: number;
  declare phoneNumber: string;
  declare address: string;
  declare identityDocument: string;
  declare resetcode?: string;
  declare resetcodeexpire?: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 25],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100],
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['Male', 'Female', 'Other', 'Helicopter']],
      },
    },
    profilePicture: {
      type: DataTypes.STRING, // Stocke une URL
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bankInfo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 5,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[0-9+()\s-]+$/i,
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    identityDocument: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    resetcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetcodeexpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
