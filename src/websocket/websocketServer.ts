import { Server } from 'socket.io';
import { handlePrivateMessages } from './roombtwusers';
import User from '@/models/User';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserService from '@/services/UserService';
import Messenger from '@/models/Messenger';

dotenv.config();
console.log("🔥 Serveur WEBSOCKET démarré (c'est le bon fichier) !");
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET as string;


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
        console.log('❌ Aucun token fourni');
        socket.emit("invalid-token", "Aucun token fourni.");
        socket.disconnect();
        return;
      }
      let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, accessTokenSecret) as JwtPayload;
    } catch (err: any) {
      if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
        const refreshToken = socket.handshake.query.refreshToken;
        if (!refreshToken || typeof refreshToken !== "string") {
        console.error("❌ Aucun refresh token fourni");
        socket.emit("invalid-token", "Aucun refresh token.");
        socket.disconnect();
        return;
      }
      try {
        const refreshPayload = jwt.verify(refreshToken, refreshTokenSecret) as JwtPayload;
          const userId = refreshPayload.id;

      
          const newAccessToken = jwt.sign({ id: userId }, accessTokenSecret, {
            expiresIn: "1h",
          });

      // Envoie au client
      socket.emit("new-access-token", newAccessToken);
      decoded = jwt.verify(newAccessToken, accessTokenSecret) as JwtPayload;

      console.log("♻️ AccessToken régénéré via refreshToken");

        } catch (refreshError) {
          console.error("❌ Refresh token invalide :", refreshError);
          socket.emit("invalid-token", "Session expirée.");
          socket.disconnect();
          return;
        }
      } else {
        console.error("❌ Erreur JWT inconnue :", err);
        socket.emit("invalid-token", "Token invalide.");
        socket.disconnect();
        return;
      } 
    }
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
    
    socket.on('message', async (msg) => { //Qd user envoie msg
      console.log('event message bien recu:', msg);
      const username = socket.data.user.username || 'inconnu';
      const senderId = socket.data.user.id;
      const recipientSocketId = users[msg.to];
      console.log('Tentative d\'insertion message', senderId, msg);

      console.log("Message reçu :", msg.message);
      console.log("Destinataire :", msg.to);
      console.log(`De : ${username}`);
      
      try{
        await Messenger.create({ //remplir la BDD
          sender: senderId,
          recipientId: msg.to,
          message: msg.message,
          msgTimestamp: new Date(),
          isRead: false,
        });
        console.log('Message enregistré dans la BDD');
      }catch (e){
        console.log('Erreur lors de l insertion du msg dans la bdd', e);
      }
      io.to(recipientSocketId).emit('message',{
        from: username,
        to: msg.to,
        message: msg.message
      }); 
      console.log(`👽 Message privé envoyé à ${recipientSocketId} :`, msg);
      // Envoie le message à tout le monde: io.emit(eventName, args   )
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