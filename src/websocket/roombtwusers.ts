
import { io } from '../index';

const users: { [userId: string]: string } = {};


io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Associer un userId au socket
    socket.on("register", (userId: string) => {
        users[userId] = socket.id;
        console.log(`User ${userId} is registered with socket ${socket.id}`);
    });

    // Envoyer un message privé
    socket.on("private_message", ({ recipientId, message }) => {
        const recipientSocketId = users[recipientId];

        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receive_message", {
                sender: socket.id,
                message
            });
            console.log(`Message sent from ${socket.id} to ${recipientId}: ${message}`);
        } else {
            socket.emit("error", `User ${recipientId} is not connected`);
        }
    });

    // Déconnexion
    socket.on("disconnect", () => {
        const userId = Object.keys(users).find(key => users[key] === socket.id);
        if (userId) {
            delete users[userId];
            console.log(`User ${userId} disconnected`);
        }
    });
});

console.log("Server running on port 3000");





// io.on('connection', (socket) => {
//     console.log(`User connected: ${socket.id}`);
    
//     socket.onAny((event, ...args) => {
//         console.log(` Event received: ${event}`, args);
//     });

//     // Rejoindre une room
//     socket.on('join_room', (room) => {
//       if (typeof room !== 'string' || room.trim() === "") {
//           socket.emit('error', 'Invalid room ID');
//           return;
//       }
//       socket.join(room);
//       console.log(`User ${socket.id} joined room ${room}`);
//       socket.emit('room_joined', `You have joined room ${room}`);
//     });
  
//     // Quitter une room
//     socket.on('leave_room', (room) => {
//       socket.leave(room);
//       console.log(`User ${socket.id} left room ${room}`);
//       socket.emit('room_left', `You have left room ${room}`);
//     });



  
//         // Recevoir un message
//         socket.on('message', (rawData) => {
//           try {
//               const parsedData = JSON.parse(rawData);
//               console.log(`Event received: ${parsedData.emit}`, parsedData.data);
  
//               if (parsedData.emit === "send_message") {
//                   const { room, message } = parsedData.data;
  
//                   if (!room || typeof message !== 'string' || message.trim() === "") {
//                       socket.emit('error', 'Invalid message data');
//                       return;
//                   }
  
//                   console.log(`Message envoyé à la room ${room}: ${message}`);
  
//                   // Envoyer le message aux autres utilisateurs de la room, sauf l'émetteur
//                   socket.to(room).emit("receive_message", { message, sender: socket.id });
//               }
//           } catch (error) {
//               console.error("Erreur de parsing du message:", error);
//               socket.emit('error', 'Invalid message format');
//           }
//       });
  
//       socket.on('disconnect', () => {
//           console.log(`User disconnected: ${socket.id}`);
//       });
//   })