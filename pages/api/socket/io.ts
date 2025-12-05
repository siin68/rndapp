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
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      socket.on('join', (userId: string) => {
        socket.join(`user:${userId}`);
      });

      socket.on('join-event', (eventId: string) => {
        socket.join(`event:${eventId}`);
      });

      socket.on('leave-event', (eventId: string) => {
        socket.leave(`event:${eventId}`);
      });

      socket.on('join-chat', (chatId: string) => {
        socket.join(`chat:${chatId}`);
      });

      socket.on('leave-chat', (chatId: string) => {
        socket.leave(`chat:${chatId}`);
      });

      socket.on('disconnect', () => {});

      socket.on('typing', ({ chatId, userId, isTyping }) => {
        socket.to(`chat:${chatId}`).emit('user-typing', { userId, isTyping });
      });

      socket.on('send-message', (message) => {
        io.to(`chat:${message.chatId}`).emit('new-message', message);
      });
    });

    res.socket.server.io = io;
    const { setSocketIO } = require('@/lib/socket');
    setSocketIO(io);
  }

  res.end();
};

export default SocketHandler;
