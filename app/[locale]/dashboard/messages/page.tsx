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

const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

interface Friend {
  friendshipId: string;
  createdAt: string;
  friend: {
    id: string;
    name: string;
    image?: string;
    bio?: string;
    lastActive?: string;
    hobbies: Array<{
      hobby: {
        id: string;
        name: string;
        emoji: string;
      };
    }>;
  };
}

export default function MessagesPage() {
  const t = useTranslations("dashboard.messages");
  const router = useRouter();
  const pathname = usePathname();
  const locale = (pathname ? pathname.split("/")[1] : "") || "en";
  const { data: session } = useSession();

  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(true);

  // Fetch chats
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

  // Fetch friends
  useEffect(() => {
    async function fetchFriends() {
      if (!session?.user?.id) return;

      try {
        setFriendsLoading(true);
        const response = await fetch(
          `/api/mutual-matches?userId=${session.user.id}`
        );
        const data = await response.json();

        if (data.success) {
          setFriends(data.data || []);
        } else {
          console.error("Failed to fetch friends:", data.error);
          setFriends([]);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
        setFriends([]);
      } finally {
        setFriendsLoading(false);
      }
    }

    fetchFriends();
  }, [session?.user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse delay-700" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Friends List */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-120px)] overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-purple-50">
                <div className="flex items-center gap-2 mb-1">
                  <UsersIcon className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-black text-gray-900">Friends</h2>
                  <span className="ml-auto text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {friends.length}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Your mutual matches</p>
              </div>

              {/* Mobile: Horizontal Scroll, Desktop: Vertical */}
              <div className="overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto lg:max-h-[calc(100vh-220px)]">
                {friendsLoading ? (
                  // Loading skeleton
                  <div className="flex lg:flex-col gap-3 p-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex lg:flex-row flex-col items-center gap-3 animate-pulse min-w-[120px] lg:min-w-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2 hidden lg:block">
                          <div className="h-4 bg-gray-200 rounded w-24" />
                          <div className="h-3 bg-gray-200 rounded w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : friends.length === 0 ? (
                  // Empty state
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-3">💔</div>
                    <p className="text-sm text-gray-600 mb-4">
                      No friends yet
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/hobby-match")}
                      className="bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs px-4 py-2 rounded-full font-semibold"
                    >
                      <HeartIcon className="w-4 h-4 mr-1" />
                      Find Matches
                    </Button>
                  </div>
                ) : (
                  // Friends list - Horizontal on mobile, Vertical on desktop
                  <div className="flex lg:flex-col gap-2 p-3 overflow-x-auto lg:overflow-x-visible">
                    {friends.map((friendship) => {
                      const friend = friendship.friend;
                      return (
                        <div
                          key={friendship.friendshipId}
                          className="flex lg:flex-row flex-col items-center lg:items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-rose-50 hover:to-purple-50 transition-all cursor-pointer group min-w-[120px] lg:min-w-0"
                          onClick={() => router.push(`/profile/${friend.id}`)}
                        >
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-16 h-16 lg:w-12 lg:h-12 border-2 border-white shadow-sm">
                              <AvatarImage
                                src={friend.image || ""}
                                alt={friend.name}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                                {friend.name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0 text-center lg:text-left">
                            <h3 className="font-bold text-sm text-gray-900 truncate group-hover:text-purple-600 transition">
                              {friend.name}
                            </h3>
                            <div className="hidden lg:flex items-center gap-1 text-xs text-gray-500">
                              <HeartIcon className="w-3 h-3 text-rose-500" />
                              <span>{formatDate(friendship.createdAt)}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/profile/${friend.id}`);
                            }}
                            className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white rounded-lg"
                          >
                            <UserIcon className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Side - Messages/Chats */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircleIcon className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-black text-gray-900">Messages</h1>
              </div>
              <p className="text-sm text-gray-600">
                Your conversations from events
              </p>
            </div>

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
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-100 mb-6">
                  <MessageCircleIcon className="w-10 h-10 text-rose-400" />
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-2">
                  No conversations yet
                </h3>
                <p className="text-gray-500 mb-8 max-w-sm">
                  Join an event to start chatting with your squad!
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
        </div>
      </div>
    </div>
  );
}
