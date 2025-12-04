import { Server as ServerIO } from 'socket.io';

let io: ServerIO | null = null;

/**
 * Get Socket.IO instance (for API routes)
 * This allows you to emit events from server-side API routes
 */
export const getSocketIO = async (): Promise<ServerIO> => {
  if (io) return io;

  // Initialize socket by making a request to the socket endpoint
  try {
    await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/socket/io`);
    
    // Wait a bit for socket to initialize
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // The io instance should now be available globally
    // This is a simplified version - you may need to adjust based on your setup
    return io as unknown as ServerIO;
  } catch (error) {
    console.error('Failed to get Socket.IO instance:', error);
    throw error;
  }
};

/**
 * Set Socket.IO instance (called from socket handler)
 */
export const setSocketIO = (socketIO: ServerIO) => {
  io = socketIO;
};

/**
 * Helper functions to emit events
 */
export  const socketEmit = {
  // Send notification to a specific user
  toUser: (userId: string, event: string, data: any) => {
    if (io) {
      io.to(`user:${userId}`).emit(event, data);
    }
  },

  // Broadcast to an event room
  toEvent: (eventId: string, event: string, data: any) => {
    if (io) {
      io.to(`event:${eventId}`).emit(event, data);
    }
  },

  // Broadcast to a chat room
  toChat: (chatId: string, event: string, data: any) => {
    if (io) {
      io.to(`chat:${chatId}`).emit(event, data);
    }
  },

  // Broadcast to everyone
  toAll: (event: string, data: any) => {
    if (io) {
      io.emit(event, data);
    }
  },
};
