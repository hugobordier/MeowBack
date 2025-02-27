import { Server } from 'socket.io';
import http from 'http';
import { handleChat } from './chatHandler.ts';
import { handleUser } from './userHandler.ts';

export const initWebSocket = (server: http.Server): void => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  console.log('✅ WebSocket server ready');

  io.on('connection', (socket) => {
    console.log(`🟢 Connexion WebSocket : ${socket.id}`);

    // handleChat(socket, io);
    // handleUser(socket, io);

    socket.on('join', (username) => {
      console.log(`${username} a rejoint le chat`);
    });

    socket.on('message', (msg) => {
      console.log(`Message reçu : ${msg}`);
      io.emit('message', msg); // Envoie le message à tous les clients
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Déconnexion WebSocket : ${socket.id}`);
    });
  });

  io.engine.on('connection_error', (err) => {
    console.log('🚨 Erreur WebSocket :', err);
  });

  console.log('📡 WebSocket server initialized !');
};
