import express from 'express';
import cors from 'cors';
import db from './config/config';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import defaultRouter from './routes';

const app = express();

const port = 3000;

app.use(cookieParser());
app.use(express.json());
app.use('/', defaultRouter.getRouter());

const allowedOrigins = [
  'http://localhost:3000',
  'exp://jmvvxtg-anonymous-8081.exp.direct',
  'exp://192.168.1.42:8081',
  'exp://172.20.10.3:8081',
  'exp://172.20.10.13:8081',
];

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(
  '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(defaultRouter.getSwaggerSpec())
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

async function startServer() {
  try {
    await db.authenticate();
    console.log(
      'Connection to the database has been established successfully.'
    );
    await db.sync();
    console.log('Database synced successfully.');

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
