'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/contexts/SocketContext';
import { Button, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { ArrowLeft, Send, Paperclip, Info, Users } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  type: string;
  timestamp: string;
  sender: {
    id: number;
    name: string;
    image?: string;
  };
}

interface ChatData {
  id: number;
  type: string;
  name: string;
  event?: {
    id: number;
    title: string;
    image?: string;
    status: string;
  };
  participants: {
    id: number;
    name: string;
    image?: string;
  }[];
  messages: Message[];
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  
  const [chat, setChat] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchChat = useCallback(async () => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/chats/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setChat(data.data);
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!socket || !isConnected || !params?.id) return;

    const chatId = params.id as string;
    socket.emit('join-chat', chatId);

    socket.on('new-message', (data: { chatId: string; message: Message }) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    return () => {
      socket.emit('leave-chat', chatId);
      socket.off('new-message');
    };
  }, [socket, isConnected, params?.id]);

  const handleSend = async () => {
    if (!message.trim() || !params?.id || sending) return;
    
    setSending(true);
    try {
      const response = await fetch(`/api/chats/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#FAFAFA] items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">💬</div>
          <h2 className="text-xl font-bold text-gray-800">Chat not found</h2>
          <Button onClick={() => router.back()} variant="outline">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const currentUserId = session?.user?.id;

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] relative overflow-hidden">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-rose-100/40 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      <header className="flex-none px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-20 sticky top-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()} 
              className="rounded-full w-10 h-10 hover:bg-gray-100 text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => chat.event?.id && router.push(`/event/${chat.event.id}`)}
            >
              <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-2 ring-rose-50">
                <AvatarImage src={chat.event?.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${chat.id}`} />
                <AvatarFallback className="bg-gradient-to-br from-rose-100 to-purple-100 text-purple-600">
                  {chat.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-bold text-gray-900 text-sm leading-tight">{chat.name}</h1>
                <p className="text-xs font-medium text-green-500 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {chat.participants.length} members
                </p>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-gray-900">
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto px-4 py-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.sender.id.toString() === currentUserId?.toString();
              const isSequence = index > 0 && messages[index - 1].sender.id === msg.sender.id;
              const isSystemMessage = msg.type === 'SYSTEM';

              if (isSystemMessage) {
                return (
                  <div key={msg.id} className="text-center py-2">
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''} ${isSequence ? 'mt-1' : 'mt-4'}`}
                >
                  {!isCurrentUser ? (
                    !isSequence ? (
                      <Avatar className="w-8 h-8 self-end mb-1 ring-2 ring-white shadow-sm">
                        <AvatarImage src={msg.sender.image} alt={msg.sender.name} />
                        <AvatarFallback className="bg-gray-100 text-gray-500 text-xs font-bold">
                          {msg.sender.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8" />
                    )
                  ) : null}

                  <div className="group relative max-w-[80%]">
                    {!isCurrentUser && !isSequence && (
                      <span className="text-[10px] text-gray-400 ml-1 mb-1 block">
                        {msg.sender.name}
                      </span>
                    )}
                    
                    <div
                      className={`
                        px-4 py-2.5 text-sm leading-relaxed shadow-sm
                        ${isCurrentUser 
                          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl rounded-tr-sm' 
                          : 'bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-tl-sm'}
                      `}
                    >
                      {msg.content}
                    </div>
                    
                    <div className={`
                      text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-0 
                      ${isCurrentUser ? '-left-12' : '-right-12'} translate-y-[-50%] top-[50%]
                    `}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="flex-none p-4 pb-6 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-30">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full w-10 h-10 mb-1 text-gray-400 hover:text-rose-500 hover:bg-rose-50 shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <div className="flex-1">
            <div className="relative group">
              <div className="absolute -inset-[3px] bg-gradient-to-r from-rose-300 via-pink-300 to-purple-300 rounded-[28px] opacity-0 group-focus-within:opacity-50 blur-sm transition-opacity" />
              
              <div className="relative bg-white rounded-[24px] border border-gray-200 group-focus-within:border-white flex items-center px-5 py-3 shadow-sm">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full bg-transparent border-none focus:ring-0 focus:outline-none p-0 text-sm placeholder:text-gray-400 font-medium resize-none leading-relaxed text-gray-700"
                  rows={1}
                  style={{ minHeight: '24px', maxHeight: '120px' }}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className={`
              rounded-full w-12 h-12 shrink-0 shadow-md transition-all flex items-center justify-center mb-0.5
              ${message.trim() && !sending
                ? 'bg-gradient-to-tr from-rose-500 to-purple-600 text-white hover:shadow-lg hover:scale-105' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'}
            `}
          >
            <Send className={`w-5 h-5 ${sending ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}