import express from 'express';
import cors from 'cors';
import db from './config/config';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import defaultRouter from './routes';
import { Server, Socket } from 'socket.io';
import http from 'http';
import { initWebSocket } from './websocket/websocketServer';
import webhook from 'webhook';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
      origin: '*',
      methods: ['GET', 'POST'],
  },
});
initWebSocket(io);
export { io, server };

const port = 3000;

app.use(cookieParser());
app.use(express.json());
app.use('/', defaultRouter.getRouter());

const allowedOrigins = [
  'http://localhost:3000',
  'exp://jmvvxtg-anonymous-8081.exp.direct',
  'exp://grr9zza-kikipaul-8081.exp.direct',
  'exp://192.168.1.42:8081',
  'exp://172.20.10.3:8081',
  'exp://172.20.10.13:8081',
  'https://meowback-production.up.railway.app',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use('/webhook', webhook);
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

    server.listen(port, '0.0.0.0', () => {
      console.log(`✅Server running on port ${port}`);
    });

    await import('./websocket/roombtwusers');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();