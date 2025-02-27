import { Socket, Server } from 'socket.io';

const users: Record<string, string> = {};

export const handleUser = (socket: Socket, io: Server): void => {
  socket.on('join', (username: string) => {
    users[socket.id] = username;
    io.emit('userList', Object.values(users));
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('userList', Object.values(users));
  });
};
