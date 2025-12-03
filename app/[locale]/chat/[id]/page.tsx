'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { getChatById, getEventById, getUserById, getMessagesByChatId } from '@/lib/data';

// Icons
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
const SendIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);
const PaperclipIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
);
const InfoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('chat');
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const chat = getChatById(params.id as string);
  
  // Auto-scroll to bottom on load and new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.id]); // Dependency on chat ID to reset scroll

  if (!chat) {
    return (
       <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">💬</div>
          <h2 className="text-xl font-bold text-gray-800">Chat not found</h2>
          <Button onClick={() => router.push(`/dashboard/messages`)} variant="outline">
            Return to Inbox
          </Button>
        </div>
      </div>
    );
  }

  const event = getEventById(chat.eventId);
  const messages = getMessagesByChatId(chat.id);
  const currentUserId = '1';

  const handleSend = () => {
    if (!message.trim()) return;
    console.log('Sending message:', message);
    setMessage('');
  };

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
                 <ArrowLeftIcon className="w-5 h-5" />
               </Button>
               
               <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push(`/event/${event?.id}`)}>
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-2 ring-rose-50">
                    <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${event?.id}`} />
                    <AvatarFallback className="bg-gradient-to-br from-rose-100 to-purple-100 text-purple-600">
                       {event?.title.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-bold text-gray-900 text-sm leading-tight">{event?.title}</h1>
                    <p className="text-xs font-medium text-green-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      {chat.participants.length} Active
                    </p>
                  </div>
               </div>
            </div>

            <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-gray-900">
               <InfoIcon className="w-5 h-5" />
            </Button>
         </div>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-6" ref={scrollRef}>
         <div className="max-w-3xl mx-auto space-y-6">
             <div className="text-center py-4">
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  Today
                </span>
             </div>

            {messages.map((msg, index) => {
              const sender = getUserById(msg.senderId);
              const isCurrentUser = msg.senderId === currentUserId;
              const isSequence = index > 0 && messages[index - 1].senderId === msg.senderId;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''} ${isSequence ? 'mt-1' : 'mt-4'}`}
                >
                  {!isCurrentUser && !isSequence && (
                    <Avatar className="w-8 h-8 self-end mb-1 ring-2 ring-white shadow-sm">
                      <AvatarImage src={sender?.image} alt={sender?.name || ''} />
                      <AvatarFallback className="bg-gray-100 text-gray-500 text-xs font-bold">
                        {sender?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!isCurrentUser && isSequence && <div className="w-8" />}

                  <div className={`group relative max-w-[80%]`}>
                    {!isCurrentUser && !isSequence && (
                      <span className="text-[10px] text-gray-400 ml-1 mb-1 block">
                        {sender?.name}
                      </span>
                    )}
                    
                    <div
                      className={`
                        px-5 py-3 text-sm leading-relaxed shadow-sm
                        ${isCurrentUser 
                          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-[1.25rem] rounded-tr-sm' 
                          : 'bg-white text-gray-700 border border-gray-100 rounded-[1.25rem] rounded-tl-sm'}
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
            })}
         </div>
      </div>
      <div className="flex-none p-4 pb-6 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-30">
         <div className="max-w-3xl mx-auto flex items-end gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full w-10 h-10 mb-1 text-gray-400 hover:text-rose-500 hover:bg-rose-50 shrink-0 transition-colors"
            >
               <PaperclipIcon className="w-6 h-6" />
            </Button>
            
            <div className="flex-1">
               <div className="relative group">
                  <div className="absolute -inset-[3px] bg-gradient-to-r from-rose-300 via-pink-300 to-purple-300 rounded-[28px] opacity-0 group-focus-within:opacity-50 blur-sm transition-opacity duration-300"></div>
                  
                  <div className="relative bg-white rounded-[24px] border border-gray-200 group-focus-within:border-white flex items-center px-5 py-3 shadow-sm transition-all">
                     <textarea
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleSend();
                         }
                       }}
                       placeholder={t('typePlaceholder', { defaultValue: 'Type a message...' })}
                       className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm placeholder:text-gray-400 font-medium resize-none leading-relaxed text-gray-700"
                       rows={1}
                       style={{ minHeight: '24px', maxHeight: '120px' }}
                     />
                  </div>
               </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`
                rounded-full w-12 h-12 shrink-0 shadow-md transition-all duration-300 flex items-center justify-center mb-0.5
                ${message.trim() 
                  ? 'bg-gradient-to-tr from-rose-500 to-purple-600 text-white hover:shadow-lg hover:shadow-rose-200 hover:scale-105 active:scale-95' 
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'}
              `}
            >
              <SendIcon className="w-5 h-5 ml-0.5" />
            </Button>
         </div>
      </div>
    </div>
  );
}