"use client";

import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useSession } from 'next-auth/react';

/**
 * Hook to automatically join user's personal room on socket connect
 */
export const useSocketUser = () => {
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();

  useEffect(() => {
    if (socket && isConnected && session?.user?.id) {
      socket.emit('join', String(session.user.id));
      console.log(`👤 Joined user room: ${session.user.id}`);
    }
  }, [socket, isConnected, session?.user?.id]);

  return { socket, isConnected };
};

/**
 * Hook to join/leave an event room
 */
export const useSocketEvent = (eventId: string | null) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (socket && isConnected && eventId) {
      socket.emit('join-event', eventId);
      console.log(`📅 Joined event room: ${eventId}`);

      return () => {
        socket.emit('leave-event', eventId);
        console.log(`👋 Left event room: ${eventId}`);
      };
    }
  }, [socket, isConnected, eventId]);

  return { socket, isConnected };
};

/**
 * Hook to join/leave a chat room
 */
export const useSocketChat = (chatId: string | null) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (socket && isConnected && chatId) {
      socket.emit('join-chat', chatId);
      console.log(`💬 Joined chat room: ${chatId}`);

      return () => {
        socket.emit('leave-chat', chatId);
        console.log(`👋 Left chat room: ${chatId}`);
      };
    }
  }, [socket, isConnected, chatId]);

  return { socket, isConnected };
};

/**
 * Hook to listen for new messages in a chat
 */
export const useSocketMessages = (
  chatId: string | null,
  onMessage: (message: any) => void
) => {
  const { socket, isConnected } = useSocketChat(chatId);

  useEffect(() => {
    if (socket && isConnected) {
      socket.on('new-message', onMessage);

      return () => {
        socket.off('new-message', onMessage);
      };
    }
  }, [socket, isConnected, onMessage]);

  return { socket, isConnected };
};

/**
 * Hook to listen for typing indicators
 */
export const useSocketTyping = (
  chatId: string | null,
  onTyping: (data: { userId: string; isTyping: boolean }) => void
) => {
  const { socket, isConnected } = useSocketChat(chatId);

  useEffect(() => {
    if (socket && isConnected) {
      socket.on('user-typing', onTyping);

      return () => {
        socket.off('user-typing', onTyping);
      };
    }
  }, [socket, isConnected, onTyping]);

  const sendTyping = (userId: string, isTyping: boolean) => {
    if (socket && chatId) {
      socket.emit('typing', { chatId, userId, isTyping });
    }
  };

  return { sendTyping, socket, isConnected };
};

/**
 * Hook to listen for notifications
 */
export const useSocketNotifications = (
  onNotification: (notification: any) => void
) => {
  const { socket, isConnected } = useSocketUser();

  useEffect(() => {
    if (socket && isConnected) {
      socket.on('notification', onNotification);

      return () => {
        socket.off('notification', onNotification);
      };
    }
  }, [socket, isConnected, onNotification]);

  return { socket, isConnected };
};
