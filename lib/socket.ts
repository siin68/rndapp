import { Server as ServerIO } from 'socket.io';

declare global {
  var socketIO: ServerIO | undefined;
}

export const setSocketIO = (socketIO: ServerIO) => {
  global.socketIO = socketIO;
};

export const getSocketIO = (): ServerIO | null => {
  return global.socketIO || null;
};

export const socketEmit = {
  toUser: (userId: string, event: string, data: any) => {
    const io = global.socketIO;
    if (io) {
      io.to(`user:${userId}`).emit(event, data);
    }
  },

  toEvent: (eventId: string, event: string, data: any) => {
    const io = global.socketIO;
    if (io) {
      io.to(`event:${eventId}`).emit(event, data);
    }
  },

  toChat: (chatId: string, event: string, data: any) => {
    const io = global.socketIO;
    if (io) {
      io.to(`chat:${chatId}`).emit(event, data);
    }
  },

  toAll: (event: string, data: any) => {
    const io = global.socketIO;
    if (io) {
      io.emit(event, data);
    }
  },
};
