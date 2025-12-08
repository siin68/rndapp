"use client";

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/contexts/SocketContext';

export default function SocketListener() {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();

  const joinRoom = useCallback(() => {
    if (!socket || !isConnected || !session?.user?.id) {
      return;
    }
    socket.emit('join', session.user.id);
  }, [socket, isConnected, session?.user?.id]);

  useEffect(() => {
    if (!socket || !isConnected || !session?.user?.id) {
      return;
    }

    joinRoom();

    const handleFocus = () => {
      if (socket.connected) {
        joinRoom();
      }
    };

    const handleReconnect = () => {
      joinRoom();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('socket-reconnected', handleReconnect);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('socket-reconnected', handleReconnect);
    };
  }, [socket, isConnected, session?.user?.id, joinRoom]);

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    const handleNotification = (notification: any) => {
      window.dispatchEvent(new CustomEvent('socket-notification', { detail: notification }));
    };

    const handleEventJoined = (data: any) => {
      window.dispatchEvent(new CustomEvent('event-joined', { detail: data }));
    };

    const handleEventLeft = (data: any) => {
      window.dispatchEvent(new CustomEvent('event-left', { detail: data }));
    };

    const handleFriendRequestReceived = (data: any) => {
      window.dispatchEvent(new CustomEvent('friend-request-received', { detail: data }));
    };

    const handleFriendRequestAccepted = (data: any) => {
      window.dispatchEvent(new CustomEvent('friend-request-accepted', { detail: data }));
    };

    const handleChatMemberJoined = (data: any) => {
      window.dispatchEvent(new CustomEvent('chat-member-joined', { detail: data }));
    };

    const handleChatMemberLeft = (data: any) => {
      window.dispatchEvent(new CustomEvent('chat-member-left', { detail: data }));
    };

    const handleNewMessage = (data: any) => {
      window.dispatchEvent(new CustomEvent('new-message', { detail: data }));
    };

    // Event join request handlers (for host to receive join requests)
    const handleEventJoinRequest = (data: any) => {
      window.dispatchEvent(new CustomEvent('event-join-request', { detail: data }));
    };

    // Event request accepted/rejected handlers (for user to receive response)
    const handleEventRequestAccepted = (data: any) => {
      window.dispatchEvent(new CustomEvent('event-request-accepted', { detail: data }));
    };

    const handleEventRequestRejected = (data: any) => {
      window.dispatchEvent(new CustomEvent('event-request-rejected', { detail: data }));
    };

    socket.on('notification', handleNotification);
    socket.on('event-joined', handleEventJoined);
    socket.on('event-left', handleEventLeft);
    socket.on('friend-request-received', handleFriendRequestReceived);
    socket.on('friend-request-accepted', handleFriendRequestAccepted);
    socket.on('chat-member-joined', handleChatMemberJoined);
    socket.on('chat-member-left', handleChatMemberLeft);
    socket.on('new-message', handleNewMessage);
    socket.on('event-join-request', handleEventJoinRequest);
    socket.on('event-request-accepted', handleEventRequestAccepted);
    socket.on('event-request-rejected', handleEventRequestRejected);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('event-joined', handleEventJoined);
      socket.off('event-left', handleEventLeft);
      socket.off('friend-request-received', handleFriendRequestReceived);
      socket.off('friend-request-accepted', handleFriendRequestAccepted);
      socket.off('chat-member-joined', handleChatMemberJoined);
      socket.off('chat-member-left', handleChatMemberLeft);
      socket.off('new-message', handleNewMessage);
      socket.off('event-join-request', handleEventJoinRequest);
      socket.off('event-request-accepted', handleEventRequestAccepted);
      socket.off('event-request-rejected', handleEventRequestRejected);
    };
  }, [socket, isConnected]);

  return null;
}
