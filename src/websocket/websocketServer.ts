import { Server } from 'socket.io';
import http from 'http';
import { handleChat } from './chatHandler.ts';
import { handleUser } from './userHandler.ts';

let io: Server;

export const initWebSocket = (server: http.Server): void => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  console.log('✅ WebSocket server ready');
  server.listen(3001, () => {
    console.log('🚀 WebSocket server running on port 3001');
  });

  io.on('connection', (socket) => {
    console.log(`🟢 Connexion WebSocket : ${socket.id}`);

    handleChat(socket, io);
    handleUser(socket, io);

    socket.on('disconnect', () => {
      console.log(`🔴 Déconnexion WebSocket : ${socket.id}`);
    });
  });
};

export const getIO = (): Server => io;
