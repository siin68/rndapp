"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
} from "@/components/ui";
import { getHobbyById, getLocationById, fetchEvents } from "@/lib/data";
import { useSession } from "next-auth/react";

// Icons
const CalendarIcon = ({ className }: { className?: string }) => (
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
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);
const MapPinIcon = ({ className }: { className?: string }) => (
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
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
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
const CrownIcon = ({ className }: { className?: string }) => (
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
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

interface Event {
  id: string;
  title: string;
  description?: string;
  image?: string;
  date: Date | string;
  hobbyId: string;
  locationId: string;
  hostId: string;
  maxParticipants: number;
  status: string;
  participants?: any[];
  _count?: { participants: number };
  host?: {
    id: string;
    name: string;
    image?: string;
  };
  hobbies?: Array<{
    hobby: {
      id: string;
      name: string;
      icon: string;
    };
    isPrimary: boolean;
  }>;
}

export default function MyEventsPage() {
  const t = useTranslations("dashboard.myEvents");
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"created" | "joined" | "history">(
    "created"
  );

  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
  const [historyEvents, setHistoryEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserEvents() {
      if (!session?.user?.id) return;

      try {
        const [hosted, participating] = await Promise.all([
          fetchEvents({ type: "hosted", userId: session.user.id }),
          fetchEvents({ type: "participating", userId: session.user.id }),
        ]);

        setCreatedEvents(hosted || []);
        setJoinedEvents(participating || []);

        // For history, we'll get closed events from hosted events
        const closedEvents = (hosted || []).filter(
          (e: any) => e.status === "CLOSED"
        );
        setHistoryEvents(closedEvents);
      } catch (error) {
        console.error("Error fetching user events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserEvents();
  }, [session?.user?.id]);

  const getActiveEvents = () => {
    switch (activeTab) {
      case "created":
        return createdEvents;
      case "joined":
        return joinedEvents;
      case "history":
        return historyEvents;
      default:
        return [];
    }
  };

  const tabs = [
    { id: "created", label: t("tabs.created"), icon: "✨" },
    { id: "joined", label: t("tabs.joined"), icon: "🎟️" },
    { id: "history", label: t("tabs.history"), icon: "📜" },
  ] as const;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse delay-700" />

      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-purple-100/80 text-purple-600 text-xs font-bold tracking-widest uppercase backdrop-blur-sm border border-purple-200">
            Your Schedule
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 drop-shadow-sm">
            {t("title")}
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-lg mx-auto">
            Manage your hosted events and upcoming adventures.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-full inline-flex border border-white/40 shadow-lg shadow-purple-100/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2
                  ${
                    activeTab === tab.id
                      ? "bg-white text-gray-800 shadow-md scale-105"
                      : "text-gray-500 hover:text-gray-700 hover:bg-white/30"
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getActiveEvents().map((event) => {
            const primaryHobby =
              event.hobbies?.find((h) => h.isPrimary)?.hobby ||
              event.hobbies?.[0]?.hobby ||
              getHobbyById(event.hobbyId);
            const location = getLocationById(event.locationId);
            const isHost = event.hostId === session?.user?.id;
            const participantCount =
              event._count?.participants || event.participants?.length || 0;

            return (
              <Card
                key={event.id}
                onClick={() => {
                  // If user is the host, redirect to edit page
                  if (isHost) {
                    router.push(`/dashboard/create-invite?edit=${event.id}`);
                  } else {
                    router.push(`/event/${event.id}`);
                  }
                }}
                className="group relative border-0 bg-white/80 backdrop-blur-xl hover:bg-white rounded-[2rem] shadow-xl shadow-purple-50/50 hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full hover:-translate-y-1 ring-1 ring-white/50"
              > 
                <div className="h-32 relative overflow-hidden shrink-0">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300" />
                  )}

                  <div className="absolute inset-0 bg-black/20"></div>

                  <div className="absolute top-4 left-4">
                    <Avatar className="w-12 h-12 border-2 border-white/80 shadow-lg">
                      <AvatarImage
                        src={
                          event.host?.image ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.hostId}`
                        }
                        alt={event.host?.name || "Host"}
                      />
                      <AvatarFallback className="bg-white/90 text-gray-700 font-bold">
                        {(event.host?.name || "H").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="absolute top-4 right-4">
                    <Badge
                      className={`
                       border-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md
                       ${
                         event.status === "OPEN"
                           ? "bg-green-400/90 text-white"
                           : "bg-gray-400/90 text-white"
                       }
                     `}
                    >
                      {event.status === "OPEN" ? "Upcoming" : "Past"}
                    </Badge>
                  </div>

                  {isHost && (
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-amber-300/95 text-amber-900 border-0 px-2 py-1 gap-1 shadow-sm backdrop-blur-md font-bold text-[10px]">
                        <CrownIcon className="w-3 h-3" /> Host
                      </Badge>
                    </div>
                  )}

                  <div className="absolute -bottom-4 -right-4 text-7xl opacity-30 transform rotate-12 transition-transform group-hover:scale-110 text-white/80">
                    {primaryHobby?.icon}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-1 flex items-center gap-1">
                      {primaryHobby?.name}
                    </div>
                    <h3 className="font-extrabold text-xl text-gray-800 leading-tight group-hover:text-purple-600 transition-colors">
                      {event.title}
                    </h3>
                    {event.host?.name && (
                      <p className="text-sm text-gray-500 mt-1">
                        by {event.host.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/50 p-2.5 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-xs uppercase tracking-wide">
                          Date
                        </span>
                        <span className="font-medium">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/50 p-2.5 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                        <MapPinIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="font-bold text-gray-800 text-xs uppercase tracking-wide">
                          Location
                        </span>
                        <span className="font-medium truncate">
                          {location?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage
                          src={
                            event.host?.image ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.hostId}`
                          }
                          alt={event.host?.name || "Host"}
                        />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-[10px] font-bold">
                          {(event.host?.name || "H").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-gray-500">
                        {isHost
                          ? "You're hosting"
                          : `by ${event.host?.name || "Host"}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      <UsersIcon className="w-3 h-3" />
                      <span>
                        {participantCount}/{event.maxParticipants}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {getActiveEvents().length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-purple-100 mb-6 text-4xl">
              {activeTab === "created"
                ? "📝"
                : activeTab === "joined"
                ? "🎫"
                : "🕰️"}
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">
              {activeTab === "created"
                ? "No Events Hosted Yet"
                : activeTab === "joined"
                ? "No Upcoming Plans"
                : "History is Clean"}
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm">
              {activeTab === "created"
                ? "Ready to bring people together? Create your first event now!"
                : "Explore the community and find your next adventure."}
            </p>
            <Button
              onClick={() =>
                router.push(
                  activeTab === "joined"
                    ? "/dashboard/open-invites"
                    : "/dashboard/create-invite"
                )
              }
              className="rounded-full h-12 px-8 bg-gray-900 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              {activeTab === "joined" ? "Browse Events" : "Create Event"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
