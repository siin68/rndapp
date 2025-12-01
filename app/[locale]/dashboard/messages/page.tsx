'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { useSession } from 'next-auth/react';

export default function MessagesPage() {
  const t = useTranslations('dashboard.messages');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const { data: session } = useSession();
  
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChats() {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/chats?userId=${session.user.id}`);
        const data = await response.json();
        
        if (data.success) {
          setChats(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        setChats([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchChats();
  }, [session?.user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Your conversation threads
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          chats.map((chat: any) => {
            const otherParticipant = chat.participants.find((p: any) => p.id !== session?.user?.id);

            return (
              <Card
                key={chat.id}
                onClick={() => router.push(`/${locale}/chat/${chat.id}`)}
                className="cursor-pointer hover:shadow-lg transition-all group"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={otherParticipant?.image || ''} alt={otherParticipant?.name || ''} />
                        <AvatarFallback>{otherParticipant?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition">
                          {chat.event?.title || 'Direct Message'}
                        </h3>
                        <span className="text-xs text-gray-400 ml-2">
                          {chat.lastMessage ? new Date(chat.lastMessage.timestamp).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        💬 with {otherParticipant?.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {!loading && chats.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500">Start connecting with others through events!</p>
        </div>
      )}
    </div>
  );
}
