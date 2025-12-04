import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO } from '@/types/socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('🔌 Initializing Socket.IO server...');

    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    // Socket.IO event handlers
    io.on('connection', (socket) => {
      console.log(`✅ Socket connected: ${socket.id}`);

      // Join user to their own room
      socket.on('join', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(` User ${userId} joined room user:${userId}`);
      });

      // Join event room
      socket.on('join-event', (eventId: string) => {
        socket.join(`event:${eventId}`);
        console.log(`📅 Socket ${socket.id} joined event:${eventId}`);
      });

      // Leave event room
      socket.on('leave-event', (eventId: string) => {
        socket.leave(`event:${eventId}`);
        console.log(`👋 Socket ${socket.id} left event:${eventId}`);
      });

      // Join chat room
      socket.on('join-chat', (chatId: string) => {
        socket.join(`chat:${chatId}`);
        console.log(`💬 Socket ${socket.id} joined chat:${chatId}`);
      });

      // Leave chat room
      socket.on('leave-chat', (chatId: string) => {
        socket.leave(`chat:${chatId}`);
        console.log(`👋 Socket ${socket.id} left chat:${chatId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`❌ Socket disconnected: ${socket.id}`);
      });

      // Typing indicator
      socket.on('typing', ({ chatId, userId, isTyping }) => {
        socket.to(`chat:${chatId}`).emit('user-typing', { userId, isTyping });
      });

      // Send message (example)
      socket.on('send-message', (message) => {
        io.to(`chat:${message.chatId}`).emit('new-message', message);
      });
    });

    res.socket.server.io = io;
    console.log('✅ Socket.IO server initialized');
  } else {
    console.log('Socket.IO server already running');
  }

  res.end();
};

export default SocketHandler;
