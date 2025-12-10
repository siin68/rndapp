'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, Paperclip, Info, Users, ChevronDown, MoreVertical, Phone, Video, Calendar, Plus, Clock } from 'lucide-react';

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
    hostId: number;
    location?: {
      id: number;
      name: string;
    };
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
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showSubEvents, setShowSubEvents] = useState(false);
  const [showCreateSubEvent, setShowCreateSubEvent] = useState(false);
  const [subEvents, setSubEvents] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const initialScrollDoneRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchChat = useCallback(async () => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/chats/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setChat(data.data);
        setMessages(data.data.messages || []);
        
        if (data.data.event?.id) {
          const subEventsRes = await fetch(`/api/events/${data.data.event.id}/sub-events`);
          const subEventsData = await subEventsRes.json();
          if (subEventsData.success) {
            setSubEvents(subEventsData.data || []);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    // Reset state when chat ID changes
    setLoading(true);
    setMessages([]);
    setChat(null);
    initialScrollDoneRef.current = false;
    
    fetchChat();
  }, [fetchChat]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 150;
      isNearBottomRef.current = nearBottom;
      
      if (nearBottom) {
        setHasNewMessage(false);
      }
    }
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
      setHasNewMessage(false);
      isNearBottomRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!loading && messages.length > 0 && !initialScrollDoneRef.current) {
      setTimeout(() => {
        scrollToBottom(false);
        initialScrollDoneRef.current = true;
      }, 100);
    }
  }, [loading, messages.length, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  useEffect(() => {
    if (!socket || !isConnected || !params?.id) return;

    const chatId = params.id as string;
    socket.emit('join-chat', chatId);

    const handleNewMessage = (data: { chatId: string; senderId?: number; message: Message }) => {
      const isOwnMessage = data.senderId?.toString() === session?.user?.id?.toString();
      if (isOwnMessage) {
        return;
      }
      
      if (data.chatId === chatId) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) {
            return prev;
          }
          return [...prev, data.message];
        });
        
        if (isNearBottomRef.current) {
          setTimeout(() => scrollToBottom(true), 50);
        } else {
          setHasNewMessage(true);
        }
      }
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.emit('leave-chat', chatId);
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, isConnected, params?.id, scrollToBottom, session?.user?.id]);

  const handleSend = async () => {
    if (!message.trim() || !params?.id || sending) return;
    
    const messageContent = message.trim();
    setSending(true);
    setMessage(''); // Clear input ngay lập tức
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    try {
      const response = await fetch(`/api/chats/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Optimistic update - hiển thị tin nhắn ngay lập tức
        const newMessage: Message = {
          id: data.data.id,
          content: data.data.content,
          type: data.data.type,
          timestamp: data.data.timestamp,
          sender: data.data.sender,
        };
        
        setMessages(prev => {
          // Kiểm tra xem message đã tồn tại chưa (có thể socket đã gửi về trước)
          if (prev.some(m => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
        
        // Scroll to bottom sau khi gửi
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Có thể thêm toast notification ở đây
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] bg-slate-50 items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="text-7xl animate-bounce">💬</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy đoạn chat</h2>
            <p className="text-slate-500">Cuộc hội thoại này không tồn tại hoặc bạn không có quyền truy cập.</p>
          </div>
          <Button onClick={() => router.back()} className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl py-6">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const currentUserId = session?.user?.id;

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 relative overflow-hidden font-sans">
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-rose-200/30 to-orange-100/30 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-violet-200/30 to-blue-100/30 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <header className="flex-none px-4 py-3 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm z-30 sticky top-0 transition-all duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()} 
              className="rounded-full w-10 h-10 hover:bg-slate-200/50 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            {(() => {
              const isEventChat = chat.type === 'EVENT' && chat.event;
              const otherParticipant = chat.participants.find(
                (p) => p.id.toString() !== currentUserId?.toString()
              );
              
              const avatarSrc = isEventChat 
                ? chat.event?.image 
                : otherParticipant?.image;
              const avatarFallback = isEventChat 
                ? (chat.event?.title?.charAt(0) || '📅') 
                : (otherParticipant?.name?.charAt(0) || 'U');
              const displayName = isEventChat 
                ? chat.event?.title 
                : otherParticipant?.name || chat.name;
              const clickHandler = isEventChat 
                ? () => chat.event?.id && router.push(`/event/${chat.event.id}`)
                : () => otherParticipant?.id && router.push(`/profile/${otherParticipant.id}`);
              
              return (
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={clickHandler}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-2 ring-rose-50">
                      <AvatarImage src={avatarSrc || `https://api.dicebear.com/7.x/shapes/svg?seed=${chat.id}`} />
                      <AvatarFallback className={isEventChat 
                        ? "bg-gradient-to-br from-rose-100 to-purple-100 text-purple-600" 
                        : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold"
                      }>
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    {!isEventChat && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                    {isEventChat && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                        <Users className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900 text-sm leading-tight">{displayName}</h1>
                    <p className="text-xs font-medium text-green-500 flex items-center gap-1">
                      {isEventChat ? (
                        <>
                          <Users className="w-3 h-3" />
                          {chat.participants.length} members
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          Online
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-1">
            {chat.event && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSubEvents(!showSubEvents)}
                className="relative rounded-full text-violet-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                {subEvents.filter(subEvent => new Date(subEvent.date) > new Date()).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {subEvents.filter(subEvent => new Date(subEvent.date) > new Date()).length}
                  </span>
                )}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-full text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-full text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {showSubEvents && chat.event && (
        <div className="flex-none bg-white border-b border-slate-200 shadow-sm z-20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-600" />
                Cuộc hẹn ({subEvents.filter(subEvent => new Date(subEvent.date) > new Date()).length})
              </h3>
              {chat.event.hostId === session?.user?.id && (
                <Button
                  onClick={() => setShowCreateSubEvent(true)}
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tạo hẹn
                </Button>
              )}
            </div>
            
            {subEvents.filter(subEvent => new Date(subEvent.date) > new Date()).length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Chưa có cuộc hẹn nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                {subEvents.filter(subEvent => new Date(subEvent.date) > new Date()).map((subEvent) => (
                  <div
                    key={subEvent.id}
                    onClick={() => router.push(`/event/${subEvent.id}`)}
                    className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-3 border border-violet-100 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <h4 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-violet-700 transition-colors">
                      {subEvent.title}
                    </h4>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-violet-500" />
                        {new Date(subEvent.date).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-violet-500" />
                        {subEvent.participants?.length || 0}/{subEvent.maxParticipants} người
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto px-4 py-6 z-10 scrollbar-thin" ref={scrollRef} onScroll={handleScroll}>
        {hasNewMessage && (
          <button
            onClick={() => scrollToBottom(true)}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all animate-bounce"
          >
            <ChevronDown className="w-4 h-4" />
            Tin nhắn mới
          </button>
        )}
        
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-slate-300 ml-1" />
              </div>
              <p className="font-medium">Chưa có tin nhắn nào.</p>
              <p className="text-sm">Hãy bắt đầu cuộc trò chuyện ngay!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.sender.id.toString() === currentUserId?.toString();
              const isSequence = index > 0 && messages[index - 1].sender.id === msg.sender.id;
              const isLastInSequence = index === messages.length - 1 || messages[index + 1].sender.id !== msg.sender.id;
              const isSystemMessage = msg.type === 'SYSTEM';

              if (isSystemMessage) {
                return (
                  <div key={msg.id} className="flex justify-center my-4 animate-in fade-in zoom-in-95 duration-300">
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-200/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/50 shadow-sm">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 w-full group ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${isSequence ? 'mt-1' : 'mt-4'} animate-in slide-in-from-bottom-2 duration-300`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 flex flex-col justify-end shrink-0">
                      {!isSequence ? (
                        <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm">
                          <AvatarImage src={msg.sender.image} alt={msg.sender.name} className="object-cover" />
                          <AvatarFallback className="bg-slate-200 text-slate-500 text-[10px] font-bold">
                            {msg.sender.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : <div className="w-8" />}
                    </div>
                  )}

                  <div className={`relative max-w-[85%] sm:max-w-[70%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {!isCurrentUser && !isSequence && (
                      <span className="text-[11px] font-medium text-slate-500 ml-3 mb-1 block">
                        {msg.sender.name}
                      </span>
                    )}
                    
                    <div
                      className={`
                        px-4 py-2.5 text-[15px] leading-relaxed break-words shadow-sm transition-all duration-200 relative
                        ${isCurrentUser 
                          ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-none hover:shadow-md' 
                          : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none hover:shadow-md'}
                      `}
                    >
                      {msg.content}
                    </div>
                    
                    <div className={`
                      text-[10px] font-medium text-slate-300 mt-1 px-1 transition-opacity duration-200
                      ${isLastInSequence ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div className="h-2" ref={messagesEndRef} />
        </div>
      </div>
      {/* Input Area */}
      <div className="flex-none p-3 sm:p-4 bg-white/80 backdrop-blur-2xl border-t border-white/20 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-4xl mx-auto flex items-end gap-2 sm:gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:flex rounded-full w-10 h-10 mb-0.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="relative group bg-slate-100 hover:bg-white focus-within:bg-white transition-colors rounded-[24px] border border-transparent focus-within:border-violet-200 focus-within:ring-4 focus-within:ring-violet-100/50">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none px-4 sm:px-5 py-3 text-[15px] placeholder:text-slate-400 font-normal resize-none leading-relaxed text-slate-800 max-h-[120px] overflow-y-auto"
                rows={1}
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className={`
              rounded-full w-11 h-11 sm:w-12 sm:h-12 shrink-0 shadow-sm transition-all duration-300 flex items-center justify-center mb-0.5
              ${message.trim() && !sending
                ? 'bg-violet-600 text-white hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-200 hover:scale-105 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            <Send className={`w-5 h-5 ml-0.5 ${sending ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Create Sub-Event Modal */}
      {showCreateSubEvent && chat.event && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
            onClick={() => setShowCreateSubEvent(false)}
          />
          <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[70] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-600" />
                Tạo cuộc hẹn mới
              </h2>
              <button
                onClick={() => setShowCreateSubEvent(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                try {
                  // Upload image if provided
                  let imageUrl = null;
                  const imageFile = formData.get('image') as File;
                  if (imageFile && imageFile.size > 0) {
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', imageFile);
                    
                    const uploadRes = await fetch('/api/upload', {
                      method: 'POST',
                      body: uploadFormData,
                    });
                    
                    const uploadData = await uploadRes.json();
                    if (uploadData.success && uploadData.data) {
                      imageUrl = uploadData.data.url;
                    }
                  }
                  
                  const response = await fetch(`/api/events/${chat.event?.id}/sub-events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: formData.get('title'),
                      description: formData.get('description'),
                      date: formData.get('date'),
                      maxParticipants: parseInt(formData.get('maxParticipants') as string) || 10,
                      hostId: session?.user?.id,
                      image: imageUrl,
                    }),
                  });

                  const data = await response.json();
                  if (data.success) {
                    setSubEvents([...subEvents, data.data]);
                    setShowCreateSubEvent(false);
                  }
                } catch (error) {
                  console.error('Error creating sub-event:', error);
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Tên cuộc hẹn *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="VD: Gặp mặt cafe chiều thứ 7"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Mô tả chi tiết về cuộc hẹn..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Ngày & Giờ *
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Ảnh banner
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Số người tối đa
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  defaultValue={10}
                  min={2}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setShowCreateSubEvent(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Tạo cuộc hẹn
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}