import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL as string;

const db = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
    },
  },
});

// const db = new Sequelize('meowdb', 'hugo', 'admin', {
//   host: 'localhost',
//   dialect: 'postgres',
//   dialectOptions: {
//     ssl: false,
//   },
// });

//test

export default db;
