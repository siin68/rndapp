"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/contexts/SocketContext';

export default function TestSocketPage() {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  useEffect(() => {
    if (!socket || !isConnected) {
      addLog('Socket not connected');
      return;
    }

    addLog(`Socket connected! User ID: ${session?.user?.id}`);

    const handleNewLike = (data: any) => {
      addLog(`Received new-like: ${JSON.stringify(data)}`);
    };

    const handleMatchFound = (data: any) => {
      addLog(`Received match-found: ${JSON.stringify(data)}`);
    };

    const handleNotification = (data: any) => {
      addLog(`Received notification: ${JSON.stringify(data)}`);
    };

    const handleNewMessage = (data: any) => {
      addLog(`Received new-message: ${JSON.stringify(data)}`);
    };

    socket.on('new-like', handleNewLike);
    socket.on('match-found', handleMatchFound);
    socket.on('notification', handleNotification);
    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-like', handleNewLike);
      socket.off('match-found', handleMatchFound);
      socket.off('notification', handleNotification);
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, isConnected, session?.user?.id]);

  const testEmit = async () => {
    if (!session?.user?.id) {
      addLog('No user session');
      return;
    }

    addLog('Testing socket emit to self...');
    
    try {
      const response = await fetch('/api/socket/emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: `user:${session.user.id}`,
          event: 'test-event',
          data: { message: 'Test message', timestamp: Date.now() }
        }),
      });
      
      const result = await response.json();
      addLog(`Emit result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`Emit error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Socket Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">User ID: {session?.user?.id || 'Not logged in'}</p>
          <p className="text-sm text-gray-600">Socket ID: {socket?.id || 'N/A'}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <button
            onClick={testEmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Socket Emit
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Event Logs</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs font-mono bg-gray-50 p-2 rounded">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
