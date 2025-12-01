"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui";
import { getHobbyById, getLocationById, fetchEvents } from "@/lib/data";
import { useSession } from "next-auth/react";

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
const HeartHandshakeIcon = ({ className }: { className?: string }) => (
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
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  hobbyId: string;
  locationId: string;
  hostId: string;
  maxParticipants: number;
  status: string;
  participants?: any[];
  _count?: { participants: number };
}

export default function OpenInvitesPage() {
  const t = useTranslations("dashboard.openInvites");
  const router = useRouter();
  const { data: session } = useSession();

  const [openEvents, setOpenEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpenEvents() {
      try {
        const events = await fetchEvents({ limit: 20 });
        setOpenEvents(events || []);
      } catch (error) {
        console.error("Error fetching open events:", error);
        setOpenEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOpenEvents();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-rose-100/80 text-rose-600 text-xs font-bold tracking-widest uppercase backdrop-blur-sm border border-rose-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Live Invites
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 drop-shadow-sm">
            {t("title")}
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
            Discover your crowd, join the vibe, and make real connections.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <Card
                  key={i}
                  className="border-0 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-rose-100/50 overflow-hidden flex flex-col h-full animate-pulse"
                >
                  <div className="h-36 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))
            : openEvents.map((event) => {
                const hobby = getHobbyById(event.hobbyId);
                const location = getLocationById(event.locationId);
                const participantCount =
                  event._count?.participants || event.participants?.length || 0;
                const spotsLeft = event.maxParticipants - participantCount;

                return (
                  <Card
                    key={event.id}
                    onClick={() => router.push(`/event/${event.id}`)}
                    className="group relative border-0 bg-white/80 backdrop-blur-xl hover:bg-white rounded-[2rem] shadow-xl shadow-rose-100/50 hover:shadow-2xl hover:shadow-rose-200/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full ring-1 ring-white/50 hover:-translate-y-1"
                  >
                    {/* Visual Header */}
                    <div className="h-36 bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 relative overflow-hidden shrink-0">
                      <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>

                      {/* Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-white/25 backdrop-blur-md text-white border-0 px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm">
                          {spotsLeft} Spots Left
                        </Badge>
                      </div>

                      {/* Decorative Icon Background */}
                      <div className="absolute -bottom-6 -right-6 text-[6rem] opacity-20 transform -rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110">
                        {hobby?.icon}
                      </div>

                      {/* Hobby Label */}
                      <div className="absolute bottom-4 left-6 text-white flex items-center gap-3 drop-shadow-md">
                        <div className="text-3xl filter drop-shadow-lg">
                          {hobby?.icon}
                        </div>
                        <span className="font-bold text-lg tracking-tight">
                          {hobby?.name}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6 flex flex-col flex-grow">
                      {/* Title */}
                      <h3 className="font-extrabold text-xl text-gray-800 leading-snug mb-3 group-hover:text-rose-600 transition-colors line-clamp-2">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Info Pills */}
                      <div className="space-y-3 mb-6 mt-auto">
                        <div className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors bg-gray-50/80 p-2 rounded-xl">
                          <div className="p-1.5 rounded-full bg-white text-rose-500 shadow-sm">
                            <MapPinIcon className="w-4 h-4" />
                          </div>
                          <span className="font-medium truncate">
                            {location?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors bg-gray-50/80 p-2 rounded-xl">
                          <div className="p-1.5 rounded-full bg-white text-purple-500 shadow-sm">
                            <CalendarIcon className="w-4 h-4" />
                          </div>
                          <span className="font-medium">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-4 border-t border-gray-100/50 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 text-xs font-bold flex items-center justify-center shadow-sm border border-rose-100">
                            H
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                              Host
                            </span>
                            <span className="text-xs font-bold text-gray-700 truncate max-w-[90px]">
                              Event Host
                            </span>
                          </div>
                        </div>

                        <div className="flex -space-x-2.5 items-center">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-200 to-purple-200 ring-2 ring-white shadow-sm"
                            ></div>
                          ))}
                          {participantCount > 3 && (
                            <div className="w-7 h-7 rounded-full bg-gray-50 ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-gray-500 shadow-sm">
                              +{Math.max(0, participantCount - 3)}
                            </div>
                          )}
                          <span className="ml-3 text-xs font-semibold text-rose-400">
                            {participantCount} joined
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* Empty State */}
        {!loading && openEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-6 rounded-full shadow-2xl shadow-rose-100/80 mb-6">
              <HeartHandshakeIcon className="w-16 h-16 text-rose-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">
              No Vibes Found?
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
              Looks like its quiet right now. Be the spark and start your own
              meetup!
            </p>
            <Button
              onClick={() => router.push("/dashboard/create-invite")}
              className="h-14 px-10 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-lg shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transition-all hover:-translate-y-1"
            >
              Create Invite
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
