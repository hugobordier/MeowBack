import { Server } from 'socket.io';
import { handlePrivateMessages } from './roombtwusers';
import User from '@/models/User';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserService from '@/services/UserService';

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;


const users: { [userId: string]: string } = {};
const connectedUsers: Set<string> = new Set();
const socketIdIsUserId: { [socketId: string]: string } = {}; 

export const initWebSocket = (io: Server): void => {

  console.log('✅ WebSocket server ready');

  io.on('connection', async (socket) => {
    const token = socket.handshake.query.accessToken as string;

    console.log('🟢 Nouvelle connexion socket:', socket.id);
    console.log('🆔 Token reçu:', token);
  
    try{
      if (!token) {
        console.log(`❌ Aucun token fourni`);
        socket.emit("invalid-token", "Aucun token fourni.");
        socket.disconnect();
        return;
      }
      const decoded = jwt.verify(token, accessTokenSecret) as JwtPayload;
      const userId = decoded.id;
      const user = await UserService.getUserById(userId); 

      if (!user) {
        console.log(`❌ Tentative avec un ID inexistant : ${userId}`);
        socket.emit("invalid-user", "Utilisateur introuvable.");
        socket.disconnect();
        return;

      }else if(users[userId]){
        console.log(`⛔️ User ${userId} est déjà connecté avec socket ${users[userId]}`);
        socket.emit("already-connected", `User ${userId} est déjà connecté`);
        socket.disconnect();
        return;

      } else{
          users[userId] = socket.id;
          socketIdIsUserId[socket.id] = userId;
          connectedUsers.add(userId);
          socket.data.user = user;
          console.log(`✅ Connexion utilisateur ${userId} avec socket ID ${socket.id}`);
          io.emit('online-users', Array.from(connectedUsers));
      }
      }catch(error)
      {
        console.error("Erreur enregistrement WebSocket :", error);
        socket.emit("server-error", "Erreur serveur.");
      }
    

    socket.on('join', (roomID) => {
      socket.join(roomID);
      console.log(`${socket.id} a rejoint le chat ${roomID}`);
    });
    
    socket.on('message', (msg) => { //Qd user envoie msg
      const username = socket.data.user?.username || 'inconnu';
      console.log("Message reçu :", msg);
      console.log("Destinataire :", msg.to);
      console.log(`De : ${username}`);
      io.emit('message', msg); // Envoie le message à tout le monde: io.emit(eventName, args   )
    });
    handlePrivateMessages(socket, io); //pour le chat privé
    socket.on('disconnect', () => {
      const username = socket.data.user?.username || 'inconnu';
      const userId = socketIdIsUserId[socket.id];
      console.log(`🔴 Déconnexion utilisateur : ${username}`);
      if (userId) {
      delete users[userId];
      connectedUsers.delete(userId);
      delete socketIdIsUserId[socket.id];
      io.emit('online-users', Array.from(connectedUsers));
    }
  });

    
  });

  io.engine.on('connection_error', (err) => {
    console.log('🚨 Erreur WebSocket :', err);
  });

  console.log('📡 WebSocket server initialized !');
};//verifier accesstoken
//envoyeraccesstoken
//deduire en fonction de ca le userid
//