import { Server as ServerIO } from 'socket.io';
import { NextApiResponse } from 'next';
import { Server as NetServer, Socket } from 'net';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export interface ServerToClientEvents {
  'new-message': (message: any) => void;
  'user-typing': (data: { userId: string; isTyping: boolean }) => void;
  'event-updated': (event: any) => void;
  'event-joined': (data: { eventId: string; userId: string }) => void;
  'event-left': (data: { eventId: string; userId: string }) => void;
  'notification': (notification: any) => void;
  'match-found': (match: any) => void;
  'friend-request-received': (data: { friendRequest: any }) => void;
  'friend-request-accepted': (data: { friendRequestId: string; friendship: any }) => void;
  'chat-member-joined': (data: { chatId: string; userId: string; userName: string }) => void;
  'chat-member-left': (data: { chatId: string; userId: string; userName: string }) => void;
  'event-join-request': (data: any) => void;
  'event-request-accepted': (data: any) => void;
  'event-request-rejected': (data: any) => void;
  'new-like': (data: { message: string; likerName: string; likerImage?: string; likerId: number; createdAt: string }) => void;
}

export interface ClientToServerEvents {
  join: (userId: string) => void;
  'join-event': (eventId: string) => void;
  'leave-event': (eventId: string) => void;
  'join-chat': (chatId: string) => void;
  'leave-chat': (chatId: string) => void;
  typing: (data: { chatId: string; userId: string; isTyping: boolean }) => void;
  'send-message': (message: any) => void;
}
