
import { io } from '../index';

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    socket.onAny((event, ...args) => {
        console.log(` Event received: ${event}`, args);
    });

    // Rejoindre une room
    socket.on('join_room', (room) => {
      if (typeof room !== 'string' || room.trim() === "") {
          socket.emit('error', 'Invalid room ID');
          return;
      }
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
      socket.emit('room_joined', `You have joined room ${room}`);
    });
  
    // Quitter une room
    socket.on('leave_room', (room) => {
      socket.leave(room);
      console.log(`User ${socket.id} left room ${room}`);
      socket.emit('room_left', `You have left room ${room}`);
    });



  
        // Recevoir un message
        socket.on('message', (rawData) => {
          try {
              const parsedData = JSON.parse(rawData);
              console.log(`Event received: ${parsedData.emit}`, parsedData.data);
  
              if (parsedData.emit === "send_message") {
                  const { room, message } = parsedData.data;
  
                  if (!room || typeof message !== 'string' || message.trim() === "") {
                      socket.emit('error', 'Invalid message data');
                      return;
                  }
  
                  console.log(`Message envoyé à la room ${room}: ${message}`);
  
                  // Envoyer le message aux autres utilisateurs de la room, sauf l'émetteur
                  socket.to(room).emit("receive_message", { message, sender: socket.id });
              }
          } catch (error) {
              console.error("Erreur de parsing du message:", error);
              socket.emit('error', 'Invalid message format');
          }
      });
  
      socket.on('disconnect', () => {
          console.log(`User disconnected: ${socket.id}`);
      });
  })