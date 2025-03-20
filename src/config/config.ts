import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL as string;

// //la db en ligne
const db = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
    },
  },
});

// travailler avec la db locale
// const db = new Sequelize('meowdb', 'hugo', 'admin', {
//   host: 'localhost',
//   dialect: 'postgres',
// });

//test

export default db;
