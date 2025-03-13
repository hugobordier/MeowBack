import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 3000 });

// Structure pour stocker les rooms
const rooms: { [key: string]: Set<WebSocket> } = {};

wss.on('connection', (ws) => {
    console.log('Nouvelle connexion WebSocket');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.type === 'join') {
                const room = data.room;
                if (!rooms[room]) {
                    rooms[room] = new Set();
                }
                rooms[room].add(ws);
                console.log(`Client ajouté à la room: ${room}`);
            }

            if (data.type === 'leave') {
                const room = data.room;
                rooms[room]?.delete(ws);
                console.log(`Client retiré de la room: ${room}`);
            }

            if (data.type === 'message') {
                const room = data.room;
                const text = data.text;

                if (rooms[room]) {
                    rooms[room].forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ room, text }));
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Erreur de traitement du message:', error);
        }
    });

    ws.on('close', () => {
        // Supprimer le client de toutes les rooms
        for (const room in rooms) {
            rooms[room].delete(ws);
        }
    });
});

console.log("Serveur WebSocket démarré sur ws://localhost:3000");
