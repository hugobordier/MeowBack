import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL as string;

const db = new Sequelize(
  'postgresql://neondb_owner:npg_5OCjEl1GSIub@ep-young-forest-a9picu0i-pooler.gwc.azure.neon.tech/neondb?sslmode=require',
  {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
      },
    },
  }
);

// const db = new Sequelize('meowdb', 'hugo', 'admin', {
//   host: 'localhost',
//   dialect: 'postgres',
// });

//test

export default db;
