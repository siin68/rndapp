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

const TrashIcon = ({ className }: { className?: string }) => (
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
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22.5l-.394-1.933a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
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
        icon: string;
      };
    }>;
  };
}

interface LikeReceived {
  id: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
    age?: number;
    bio?: string;
  };
}

export default function MessagesPage() {
  const t = useTranslations("dashboard.messages");
  const router = useRouter();
  const pathname = usePathname();
  const locale = (pathname ? pathname.split("/")[1] : "") || "en";
  const { data: session } = useSession();

  const [chats, setChats] = useState<any[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [likesReceived, setLikesReceived] = useState<LikeReceived[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [likesLoading, setLikesLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedLikeUser, setSelectedLikeUser] = useState<LikeReceived | null>(null);

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

  // Fetch likes received
  useEffect(() => {
    async function fetchLikesReceived() {
      if (!session?.user?.id) return;

      try {
        setLikesLoading(true);
        const response = await fetch(
          `/api/likes-received?userId=${session.user.id}`
        );
        const data = await response.json();

        if (data.success) {
          setLikesReceived(data.data || []);
        } else {
          console.error("Failed to fetch likes:", data.error);
          setLikesReceived([]);
        }
      } catch (error) {
        console.error("Error fetching likes:", error);
        setLikesReceived([]);
      } finally {
        setLikesLoading(false);
      }
    }

    fetchLikesReceived();
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

  const handleUnfriend = async (friendshipId: string, friendName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa ${friendName} khỏi danh sách bạn bè?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/mutual-matches?friendshipId=${friendshipId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
      } else {
        alert("Không thể xóa bạn bè. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error unfriending:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  const handleChatWithFriend = async (friendId: string) => {
    if (!session?.user?.id) return;

    try {
      // Convert friendId to number for comparison
      const friendIdNum = parseInt(friendId, 10);
      
      const existingChat = chats.find((chat: any) => {
        const participants = chat.participants || [];
        return chat.type === "DIRECT" && participants.some((p: any) => parseInt(p.id, 10) === friendIdNum);
      });

      if (existingChat) {
        router.push(`/${locale}/chat/${(existingChat as any).id}`);
      } else {
        const response = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            friendId: friendId,
          }),
        });

        const data = await response.json();

        if (data.success && data.data) {
          // Add the new chat to the local state so it appears in the list
          setChats((prev: any) => [data.data, ...prev]);
          
          // Navigate to the chat
          router.push(`/${locale}/chat/${data.data.id}`);
        } else {
          alert("Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");
        }
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  const handleLikeClick = (like: LikeReceived) => {
    setSelectedLikeUser(like);
    setShowPremiumModal(true);
  };

  const handlePremiumConfirm = () => {
    if (selectedLikeUser) {
      // TODO: In future, check if user has premium
      // For now, just redirect to hobby-match with the user
      router.push(`/${locale}/dashboard/hobby-match?userId=${selectedLikeUser.user.id}`);
      setShowPremiumModal(false);
    }
  };

  const maskName = (name: string) => {
    if (!name || name.length === 0) return "???";
    return name.charAt(0) + "...";
  };

  return (
    <div className="w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse delay-700" />

      <div className="max-w-7xl mx-auto">
        {/* Mobile Layout - Stacked vertically */}
        <div className="lg:hidden space-y-4">
          {/* 1. Friends - Horizontal scroll */}
          <Card className="overflow-hidden">
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
            <div className="overflow-x-auto">
              {friendsLoading ? (
                <div className="flex gap-3 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-3 animate-pulse min-w-[90px]">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-3xl mb-2">💔</div>
                  <p className="text-xs text-gray-600">No friends yet</p>
                </div>
              ) : (
                <div className="flex gap-3 p-3 overflow-x-auto snap-x snap-mandatory pb-4">
                  {friends.map((friendship) => {
                    const friend = friendship.friend;
                    return (
                      <div key={friendship.friendshipId} className="flex-shrink-0 snap-center">
                        <div className="flex flex-col items-center gap-2 min-w-[90px] max-w-[90px]">
                          <div className="relative">
                            <div onClick={() => router.push(`/${locale}/profile/${friend.id}`)} className="cursor-pointer">
                              <Avatar className="w-16 h-16 border-2 border-white shadow-md hover:border-purple-400 transition-all hover:scale-105">
                                <AvatarImage src={friend.image || ""} alt={friend.name} />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                                  {friend.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="text-center w-full">
                            <p onClick={() => router.push(`/${locale}/profile/${friend.id}`)} className="font-semibold text-xs text-gray-900 truncate px-1 cursor-pointer hover:text-purple-600">
                              {friend.name}
                            </p>
                            <button
                              onClick={() => handleUnfriend(friendship.friendshipId, friend.name)}
                              className="mt-1 text-[10px] text-red-500 hover:text-red-600 font-medium"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* 2. Likes You - Horizontal scroll */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center gap-2 mb-1">
                <HeartIcon className="w-5 h-5 text-rose-500" />
                <h2 className="text-lg font-black text-gray-900">Likes You</h2>
                <span className="ml-auto text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-full">
                  {likesReceived.length}
                </span>
              </div>
              <p className="text-xs text-gray-600">People who liked you</p>
            </div>
            <div className="overflow-x-auto">
              {likesLoading ? (
                <div className="flex gap-3 p-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse min-w-[100px]">
                      <div className="aspect-square bg-gray-200 rounded-2xl mb-2" />
                    </div>
                  ))}
                </div>
              ) : likesReceived.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-3xl mb-2">💝</div>
                  <p className="text-xs text-gray-600">No likes yet</p>
                </div>
              ) : (
                <div className="flex gap-3 p-3 overflow-x-auto snap-x snap-mandatory pb-4">
                  {likesReceived.map((like) => (
                    <div key={like.id} onClick={() => handleLikeClick(like)} className="cursor-pointer flex-shrink-0 snap-center">
                      <div className="min-w-[100px] max-w-[100px]">
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 bg-gradient-to-br from-rose-100 to-pink-100">
                          <div className="absolute inset-0">
                            <Avatar className="w-full h-full rounded-none">
                              <AvatarImage src={like.user.image || ""} alt={like.user.name} className="blur-lg scale-110" />
                              <AvatarFallback className="w-full h-full rounded-none bg-gradient-to-br from-rose-200 to-pink-200 text-3xl text-white">
                                ?
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <SparklesIcon className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                          </div>
                          {like.user.age && (
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                              <span className="text-xs font-bold text-gray-800">{like.user.age}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-center text-xs font-semibold text-gray-700">{maskName(like.user.name)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* 3. Messages - Vertical scroll */}
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircleIcon className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-black text-gray-900">Messages</h1>
              </div>
              <p className="text-sm text-gray-600">Your conversations from events</p>
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
              ) : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl shadow-rose-100 mb-4">
                    <MessageCircleIcon className="w-8 h-8 text-rose-400" />
                  </div>
                  <h3 className="text-lg font-black text-gray-800 mb-2">No conversations yet</h3>
                  <p className="text-gray-500 mb-6 text-sm">Join an event to start chatting!</p>
                  <Button
                    onClick={() => router.push("/dashboard/open-invites")}
                    className="rounded-full px-6 bg-gray-900 text-white font-bold"
                  >
                    Find Events
                  </Button>
                </div>
              ) : (
                chats.map((chat: any) => {
                  const currentUserId = session?.user?.id;
                  const otherParticipant = chat.participants.find(
                    (p: any) => String(p.id) !== String(currentUserId)
                  );
                  const isEventChat = chat.type === 'EVENT' && chat.event;
                  const avatarSrc = isEventChat ? chat.event?.image : otherParticipant?.image;
                  const avatarAlt = isEventChat ? chat.event?.title : otherParticipant?.name;
                  const avatarFallback = isEventChat ? (chat.event?.title?.charAt(0) || '📅') : (otherParticipant?.name?.charAt(0) || 'U');
                  
                  return (
                    <Card key={chat.id} onClick={() => router.push(`/${locale}/chat/${chat.id}`)} className="cursor-pointer hover:shadow-lg transition-all group">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={avatarSrc || ""} alt={avatarAlt || ""} />
                              <AvatarFallback className={isEventChat ? "bg-gradient-to-br from-rose-100 to-purple-100 text-purple-600" : ""}>
                                {avatarFallback}
                              </AvatarFallback>
                            </Avatar>
                            {isEventChat ? (
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                                <UsersIcon className="w-2.5 h-2.5 text-white" />
                              </div>
                            ) : (
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition">
                                {chat.event?.title || otherParticipant?.name || "Direct Message"}
                              </h3>
                              <span className="text-xs text-gray-400 ml-2">
                                {chat.lastMessage ? new Date(chat.lastMessage.timestamp).toLocaleDateString() : ""}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">
                              {isEventChat 
                                ? `👥 ${chat.participants.length} members` 
                                : `💬 with ${otherParticipant?.name || "Unknown User"}`}
                            </p>
                            <p className="text-sm text-gray-600 truncate">{chat.lastMessage?.content || "No messages yet"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout - 4 columns grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
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

              <div className="overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto lg:max-h-[calc(100vh-220px)]">
                {friendsLoading ? (
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
                  <div className="flex lg:flex-col gap-3 p-3 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none pb-4">
                    {friends.map((friendship) => {
                      const friend = friendship.friend;
                      return (
                        <div
                          key={friendship.friendshipId}
                          className="flex-shrink-0 lg:flex-shrink snap-center"
                        >
                          {/* Mobile Layout - Vertical Card */}
                          <div className="lg:hidden flex flex-col items-center gap-2 min-w-[90px] max-w-[90px]">
                            <div className="relative">
                              <div 
                                onClick={() => router.push(`/${locale}/profile/${friend.id}`)}
                                className="cursor-pointer"
                              >
                                <Avatar className="w-16 h-16 border-2 border-white shadow-md hover:border-purple-400 transition-all hover:scale-105">
                                  <AvatarImage src={friend.image || ""} alt={friend.name} />
                                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                                    {friend.name?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="text-center w-full">
                              <p onClick={() => router.push(`/${locale}/profile/${friend.id}`)} className="font-semibold text-xs text-gray-900 truncate px-1 cursor-pointer hover:text-purple-600">
                                {friend.name}
                              </p>
                              <button
                                onClick={() => handleUnfriend(friendship.friendshipId, friend.name)}
                                className="mt-1 text-[10px] text-red-500 hover:text-red-600 font-medium"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>

                          {/* Desktop Layout - Horizontal Row */}
                          <div className="hidden lg:flex items-center gap-3 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-rose-50 hover:to-purple-50 transition-all group w-full">
                            <div 
                              onClick={() => router.push(`/${locale}/profile/${friend.id}`)}
                              className="relative flex-shrink-0 cursor-pointer"
                            >
                              <Avatar className="w-11 h-11 border-2 border-white shadow-sm hover:border-purple-300 transition-all hover:scale-105">
                                <AvatarImage src={friend.image || ""} alt={friend.name} />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm">
                                  {friend.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>

                            <div 
                              onClick={() => router.push(`/${locale}/profile/${friend.id}`)}
                              className="flex-1 min-w-0 cursor-pointer"
                            >
                              <h3 className="font-bold text-sm text-gray-900 truncate group-hover:text-purple-600 transition">
                                {friend.name}
                              </h3>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <HeartIcon className="w-3 h-3 text-rose-500" />
                                <span className="text-[10px]">{formatDate(friendship.createdAt)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChatWithFriend(friend.id);
                                }}
                                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                title="Nhắn tin"
                              >
                                <MessageCircleIcon className="w-4 h-4 text-purple-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnfriend(friendship.friendshipId, friend.name);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                                title="Xóa bạn"
                              >
                                <TrashIcon className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Middle - Messages/Chats */}
          <div className="lg:col-span-2 lg:max-h-[calc(100vh-120px)] lg:flex lg:flex-col">
            <div className="mb-4 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircleIcon className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-black text-gray-900">Messages</h1>
              </div>
              <p className="text-sm text-gray-600">
                Your conversations from events
              </p>
            </div>

            <div className="space-y-3 lg:overflow-auto lg:flex-1 scrollbar-thin">
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
                    const currentUserId = session?.user?.id;
                    const otherParticipant = chat.participants.find(
                      (p: any) => String(p.id) !== String(currentUserId)
                    );
                    const isEventChat = chat.type === 'EVENT' && chat.event;
                    const avatarSrc = isEventChat ? chat.event?.image : otherParticipant?.image;
                    const avatarAlt = isEventChat ? chat.event?.title : otherParticipant?.name;
                    const avatarFallback = isEventChat ? (chat.event?.title?.charAt(0) || '📅') : (otherParticipant?.name?.charAt(0) || 'U');

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
                                  src={avatarSrc || ""}
                                  alt={avatarAlt || ""}
                                />
                                <AvatarFallback className={isEventChat ? "bg-gradient-to-br from-rose-100 to-purple-100 text-purple-600" : ""}>
                                  {avatarFallback}
                                </AvatarFallback>
                              </Avatar>
                              {isEventChat ? (
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <UsersIcon className="w-2.5 h-2.5 text-white" />
                                </div>
                              ) : (
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition">
                                  {chat.event?.title || otherParticipant?.name || "Direct Message"}
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
                                {isEventChat 
                                  ? `👥 ${chat.participants.length} members` 
                                  : `💬 with ${otherParticipant?.name || "Unknown User"}`}
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

          {/* Right Sidebar - Likes You */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-120px)] overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
                <div className="flex items-center gap-2 mb-1">
                  <HeartIcon className="w-5 h-5 text-rose-500" />
                  <h2 className="text-lg font-black text-gray-900">Likes You</h2>
                  <span className="ml-auto text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-full">
                    {likesReceived.length}
                  </span>
                </div>
                <p className="text-xs text-gray-600">People who liked you</p>
              </div>

              <div className="overflow-y-auto max-h-[calc(100vh-220px)] p-4">
                {likesLoading ? (
                  // Loading skeleton
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-square bg-gray-200 rounded-2xl mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-12 mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : likesReceived.length === 0 ? (
                  // Empty state
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">💝</div>
                    <p className="text-sm text-gray-600 mb-2">No likes yet</p>
                    <p className="text-xs text-gray-500">
                      Start swiping to get likes!
                    </p>
                  </div>
                ) : (
                  // Likes grid
                  <div className="grid grid-cols-2 gap-3">
                    {likesReceived.map((like) => (
                      <div
                        key={like.id}
                        onClick={() => handleLikeClick(like)}
                        className="cursor-pointer group"
                      >
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 bg-gradient-to-br from-rose-100 to-pink-100">
                          {/* Blurred avatar */}
                          <div className="absolute inset-0">
                            <Avatar className="w-full h-full rounded-none">
                              <AvatarImage
                                src={like.user.image || ""}
                                alt={like.user.name}
                                className="blur-lg scale-110"
                              />
                              <AvatarFallback className="w-full h-full rounded-none bg-gradient-to-br from-rose-200 to-pink-200 text-4xl text-white">
                                ?
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          {/* Premium overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
                            <SparklesIcon className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
                          </div>
                          {/* Age badge */}
                          {like.user.age && (
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                              <span className="text-xs font-bold text-gray-800">
                                {like.user.age}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Masked name */}
                        <p className="text-center text-xs font-semibold text-gray-700">
                          {maskName(like.user.name)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Premium Modal */}
        {showPremiumModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full shadow-2xl border-0 bg-white">
              <CardContent className="pt-6 pb-6 bg-white">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <SparklesIcon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    Upgrade to Premium
                  </h3>
                  <p className="text-gray-600 mb-6">
                    See who likes you and match instantly! Unlock unlimited swipes and more features.
                  </p>
                  
                  <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl p-5 mb-6 border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <p className="text-sm text-gray-700 text-left">See who likes you</p>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <p className="text-sm text-gray-700 text-left">Unlimited swipes</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <p className="text-sm text-gray-700 text-left">No ads</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowPremiumModal(false)}
                      className="flex-1 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePremiumConfirm}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold shadow-lg border-0"
                    >
                      OK
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
