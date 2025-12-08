import { Server as ServerIO } from 'socket.io';
import { Server as HttpServer } from 'http';

declare global {
  var socketIO: ServerIO | undefined;
  var httpServer: HttpServer | undefined;
}

export const setSocketIO = (socketIO: ServerIO, httpServer?: HttpServer) => {
  global.socketIO = socketIO;
  if (httpServer) {
    global.httpServer = httpServer;
  }
};

export const getSocketIO = (): ServerIO | null => {
  if (global.socketIO) {
    return global.socketIO;
  }
  
  if (global.httpServer && (global.httpServer as any).io) {
    global.socketIO = (global.httpServer as any).io;
    return global.socketIO ?? null;
  }
  
  return null;
};

const emitViaApi = async (room: string, event: string, data: any) => {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/socket/emit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, event, data }),
    });
    await response.json();
  } catch (error) {
  }
};

export const socketEmit = {
  toUser: async (userId: string, event: string, data: any) => {
    const room = `user:${userId}`;
    const io = getSocketIO();
    
    console.log(`[socketEmit.toUser] room=${room}, io=${!!io}`);
    
    if (io) {
      const sockets = io.sockets.adapter.rooms.get(room);
      console.log(`[socketEmit.toUser] sockets in room: ${sockets?.size || 0}`);
      io.to(room).emit(event, data);
    } else {
      console.log(`[socketEmit.toUser] no io, using API fallback`);
      await emitViaApi(room, event, data);
    }
  },

  toEvent: async (eventId: string, event: string, data: any) => {
    const room = `event:${eventId}`;
    const io = getSocketIO();
    if (io) {
      io.to(room).emit(event, data);
    } else {
      await emitViaApi(room, event, data);
    }
  },

  toChat: async (chatId: string, event: string, data: any) => {
    const room = `chat:${chatId}`;
    const io = getSocketIO();
    if (io) {
      io.to(room).emit(event, data);
    } else {
      await emitViaApi(room, event, data);
    }
  },

  toAll: async (event: string, data: any) => {
    const io = getSocketIO();
    if (io) {
      io.emit(event, data);
    }
  },
};
