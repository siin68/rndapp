"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';

type SocketIOClient = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextType {
  socket: SocketIOClient | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

let globalSocket: SocketIOClient | null = null;

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<SocketIOClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current && globalSocket?.connected) {
      setSocket(globalSocket);
      setIsConnected(true);
      return;
    }
    initialized.current = true;

    if (globalSocket && !globalSocket.connected) {
      globalSocket.removeAllListeners();
      globalSocket.disconnect();
      globalSocket = null;
    }

    const socketInstance: SocketIOClient = io(process.env.NEXT_PUBLIC_SITE_URL || '', {
      path: '/api/socket/io',
      addTrailingSlash: false,
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.io.on('reconnect', () => {
      setIsConnected(true);
      window.dispatchEvent(new CustomEvent('socket-reconnected'));
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        socketInstance.connect();
      }
    });

    socketInstance.on('connect_error', () => {
      setIsConnected(false);
    });

    globalSocket = socketInstance;
    setSocket(socketInstance);

    const handleUnload = () => {
      globalSocket?.disconnect();
      globalSocket = null;
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
