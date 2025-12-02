"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
} from "@/components/ui";
import { useSession } from "next-auth/react";

// Icons
const MessageCircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export default function MessagesPage() {
  const t = useTranslations("dashboard.messages");
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
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
        console.error("Error fetching chats:", error);
        setChats([]);
      } finally {
        setLoading(false);
      }
    }

    fetchChats();
  }, [session?.user?.id]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse delay-700" />

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
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
          : chats.map((chat: any) => {
              const otherParticipant = chat.participants.find(
                (p: any) => p.id !== session?.user?.id
              );

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
                          <AvatarImage
                            src={otherParticipant?.image || ""}
                            alt={otherParticipant?.name || ""}
                          />
                          <AvatarFallback>
                            {otherParticipant?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition">
                            {chat.event?.title || "Direct Message"}
                          </h3>
                          <span className="text-xs text-gray-400 ml-2">
                            {chat.lastMessage
                              ? new Date(
                                  chat.lastMessage.timestamp
                                ).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          💬 with {otherParticipant?.name || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {!loading && chats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-100 mb-6 text-4xl text-rose-400">
            <MessageCircleIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-gray-800 mb-2">
            No conversations found
          </h3>
          <p className="text-gray-500 mb-8 max-w-sm">
            Join an event to start chatting with your future squad!
          </p>
          <Button
            onClick={() => router.push("/dashboard/open-invites")}
            className="rounded-full h-12 px-8 bg-gray-900 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Find Events
          </Button>
        </div>
      )}
    </div>
  );
}
