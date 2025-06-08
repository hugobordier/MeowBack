import { connect } from 'http2';
import { connected } from 'process';
import	{initWebSocket } from './websocketServer';
import type { Server, Socket } from 'socket.io';

const users: { [userId: string]: string } = {}; //dans la cte chaque clé userID  est une string, et à chaque clé est associé une autre valeur string
const connectedUsers: Set<string> = new Set();

export const handlePrivateMessages = (socket: Socket, io: Server): void => {
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

        
    };