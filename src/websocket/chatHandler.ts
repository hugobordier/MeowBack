import { Socket, Server } from 'socket.io';

export const handleChat = (socket: Socket, io: Server): void => {
  socket.on('sendMessage', (data: { username: string; message: string }) => {
    console.log(`💬 Message reçu : ${data.username} - ${data.message}`);
    io.emit('receiveMessage', data); // Envoie le message à tous les utilisateurs
  });
};
