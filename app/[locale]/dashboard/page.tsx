"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
} from "@/components/ui";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getHobbyById, getLocationById } from "@/lib/data";

// Icons
const SparklesIcon = ({ className }: { className?: string }) => (
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
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);
const SearchIcon = ({ className }: { className?: string }) => (
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
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const HeartIcon = ({ className }: { className?: string }) => (
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
const PlusIcon = ({ className }: { className?: string }) => (
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
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);
const ArrowRightIcon = ({ className }: { className?: string }) => (
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
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
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

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  hobbyId: string;
  locationId: string;
  status: string;
  hostId: string;
  maxParticipants: number;
  stats?: any;
}

interface EventStats {
  openEvents: number;
  user: {
    hosted: number;
    participating: number;
    matches: number;
  };
}

export default function DashboardHome() {
  const t = useTranslations("dashboard.home");
  const tNav = useTranslations("dashboard.nav");
  const router = useRouter();
  const { data: session } = useSession();

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats>({
    openEvents: 0,
    user: { hosted: 0, participating: 0, matches: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;

      try {
        const eventsRes = await fetch(
          `/api/events?type=recommended&userId=${session.user.id}&limit=3`
        );
        const eventsData = await eventsRes.json();

        const statsRes = await fetch(
          `/api/events/stats?userId=${session.user.id}`
        );
        const statsData = await statsRes.json();

        if (eventsData.success) {
          setUpcomingEvents(eventsData.data || []);
        }

        if (statsData.success) {
          setStats(statsData.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session?.user?.id]);

  const openCount = stats.openEvents;
  const matchCount = stats.user.matches;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Blobs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-[120px] -z-10 mix-blend-multiply animate-pulse" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse delay-700" />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 shadow-2xl shadow-rose-200 p-8 md:p-12 text-white">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none mix-blend-overlay"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-900/20 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none mix-blend-overlay"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 w-full">
              <Avatar className="w-24 h-24 border-4 border-white/30 shadow-xl ring-4 ring-white/10">
                <AvatarImage
                  src={session?.user?.image || ""}
                  alt={session?.user?.name || ""}
                />
                <AvatarFallback className="bg-white/20 backdrop-blur-md text-white text-3xl font-bold">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">
                  Hello, {session?.user?.name?.split(" ")[0] || "Friend"}
                </h1>
                <p className="text-pink-100 text-lg font-medium max-w-lg leading-relaxed">
                  Ready to find your next adventure? There are{" "}
                  <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
                    {openCount}
                  </span>{" "}
                  live invites waiting for you.
                </p>
              </div>
            </div>

            {/* Stats/Action */}
            <div className="hidden lg:flex gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[100px]">
                <div className="text-3xl font-bold">
                  {loading ? "..." : openCount}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-pink-100">
                  Active
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[100px]">
                <div className="text-3xl font-bold">
                  {loading ? "..." : matchCount}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-pink-100">
                  Matches
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl hover:bg-white shadow-lg shadow-rose-100/50 hover:shadow-xl hover:shadow-rose-200/50 rounded-[2rem] transition-all duration-300 cursor-pointer hover:-translate-y-1"
            onClick={() => router.push("/dashboard/open-invites")}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <SearchIcon className="w-24 h-24 text-rose-500 transform rotate-12" />
            </div>
            <CardContent className="p-8 flex flex-col items-center text-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <SearchIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {tNav("openInvites")}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  Browse public meetups
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl hover:bg-white shadow-lg shadow-purple-100/50 hover:shadow-xl hover:shadow-purple-200/50 rounded-[2rem] transition-all duration-300 cursor-pointer hover:-translate-y-1"
            onClick={() => router.push("/dashboard/hobby-match")}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <HeartIcon className="w-24 h-24 text-purple-500 transform rotate-12" />
            </div>
            <CardContent className="p-8 flex flex-col items-center text-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <HeartIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {tNav("hobbyMatch")}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  Find interest twins
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="group relative overflow-hidden border-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-400/50 hover:shadow-xl hover:shadow-gray-500/50 rounded-[2rem] transition-all duration-300 cursor-pointer hover:-translate-y-1"
            onClick={() => router.push("/dashboard/create-invite")}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <SparklesIcon className="w-24 h-24 text-white transform rotate-12" />
            </div>
            <CardContent className="p-8 flex flex-col items-center text-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <PlusIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {tNav("createInvite")}
                </h3>
                <p className="text-sm text-gray-300 font-medium">
                  Host your own vibe
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
              <span className="text-2xl">🔥</span> Trending Nearby
            </h2>
            <Button
              variant="ghost"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold rounded-full group"
              onClick={() => router.push("/dashboard/open-invites")}
            >
              See All{" "}
              <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? // Loading skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <Card
                    key={i}
                    className="border-0 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-lg shadow-indigo-50/50 overflow-hidden flex flex-col h-full animate-pulse"
                  >
                    <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    <CardContent className="p-6 space-y-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))
              : upcomingEvents.map((event) => {
                  const hobby = getHobbyById(event.hobbyId);
                  const location = getLocationById(event.locationId);

                  return (
                    <Card
                      key={event.id}
                      className="group relative border-0 bg-white/80 backdrop-blur-xl hover:bg-white rounded-[2rem] shadow-lg shadow-indigo-50/50 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full hover:-translate-y-1"
                      onClick={() =>
                        router.push(`/dashboard/event/${event.id}`)
                      }
                    >
                      <div className="h-40 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                        <div className="absolute bottom-4 left-4 text-white flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-sm border border-white/20">
                            {hobby?.icon}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">
                              {hobby?.name}
                            </p>
                            <h3 className="font-bold text-lg leading-tight text-white drop-shadow-sm">
                              {event.title}
                            </h3>
                          </div>
                        </div>
                        <Badge className="absolute top-4 right-4 bg-white/90 text-indigo-600 font-bold shadow-sm backdrop-blur-sm">
                          {event.status === "open" ? "Open" : "Full"}
                        </Badge>
                      </div>

                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-gray-600 bg-gray-50 rounded-xl p-3">
                            <CalendarIcon className="w-5 h-5 text-purple-500" />
                            <div className="text-sm">
                              <span className="block font-bold text-gray-800">
                                {event.date}
                              </span>
                              <span className="text-gray-500">
                                {event.time}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-gray-600 bg-gray-50 rounded-xl p-3">
                            <MapPinIcon className="w-5 h-5 text-rose-500" />
                            <span className="text-sm font-medium truncate">
                              {location?.name}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
          </div>

          {!loading && upcomingEvents.length === 0 && (
            <div className="rounded-[2rem] border-2 border-dashed border-gray-200 bg-white/50 p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6 text-4xl">
                😴
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                It quiet... too quiet.
              </h3>
              <p className="text-gray-500 mb-6">
                No public events right now. Be the trailblazer!
              </p>
              <Button
                onClick={() => router.push("/dashboard/create-invite")}
                className="rounded-full bg-gray-900 text-white px-8"
              >
                Create First Event
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
