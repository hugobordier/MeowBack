import { DataTypes, Model } from 'sequelize';
import db from '../config/config';

class User extends Model {
  declare id: number;
  declare pseudo: string;
  declare email: string;
  declare mdp: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pseudo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 25],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    mdp: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
  },
  {
    sequelize: db,
    tableName: 'users',
  }
);

export default User;
