"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { getHobbyById, getLocationById, fetchEvents } from "@/lib/data";
import { useSession } from "next-auth/react";

// --- Icons ---
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

// --- Types ---
interface Event {
  id: string;
  title: string;
  description?: string;
  image?: string;
  date: Date | string;
  hobbyIds: string[];
  locationId: string;
  hostId: string;
  maxParticipants: number;
  status: string;
  participants?: any[];
  _count?: { participants: number };
}

// Fallback helper
const SAMPLE_HOBBIES: Record<string, { name: string; emoji: string }> = {
  h1: { name: "Coffee", emoji: "☕" },
  h2: { name: "Movies", emoji: "🎬" },
  h3: { name: "Hiking", emoji: "🥾" },
  h4: { name: "Foodie", emoji: "🍜" },
  h5: { name: "Art", emoji: "🎨" },
  h6: { name: "Music", emoji: "🎵" },
};

export default function OpenInvitesPage() {
  const t = useTranslations("dashboard.openInvites");
  const router = useRouter();
  const { data: session } = useSession();

  const [openEvents, setOpenEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpenEvents() {
      if (!session?.user?.id) return;

      try {
        const events = await fetchEvents({
          limit: 20,
          userId: session.user.id, // Pass userId to exclude user's own events
        });
        const processedEvents = events.map((e: any) => ({
          ...e,
          hobbyIds: e.hobbyIds || (e.hobbyId ? [e.hobbyId] : []),
        }));
        setOpenEvents(processedEvents || []);
      } catch (error) {
        console.error("Error fetching open events:", error);
        setOpenEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOpenEvents();
  }, [session?.user?.id]);

  const getHobby = (id: string) => {
    try {
      const h = getHobbyById(id);
      if (h) return h;
    } catch (e) {
      /* ignore */
    }
    return SAMPLE_HOBBIES[id] || { name: "Social", emoji: "✨" };
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] py-10 px-4 sm:px-6 lg:px-8 pb-24">
      {/* Subtle Top Gradient */}
      <div className="fixed top-0 inset-x-0 h-96 bg-gradient-to-b from-rose-50/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-[11px] font-bold uppercase tracking-widest">
            <SparklesIcon className="w-3 h-3" /> Discover
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900">
            Find Your Crowd
          </h1>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Join open invitations and meet people who love what you love.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="border-0 bg-white rounded-3xl overflow-hidden h-[400px] animate-pulse shadow-sm"
                >
                  <div className="h-2/3 bg-gray-200" />
                  <CardContent className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))
            : openEvents.map((event) => {
                const location = getLocationById(event.locationId);
                const participantCount =
                  event._count?.participants || event.participants?.length || 0;
                const spotsLeft = event.maxParticipants - participantCount;

                // Logic to limit hobbies to max 3 visual elements
                const totalHobbies = event.hobbyIds.length;
                const showMax = 3;
                // If we have > 3, we show 2 items + 1 counter badge = 3 elements total.
                // If we have <= 3, we show all items.
                const shouldTruncate = totalHobbies > showMax;
                const displayCount = shouldTruncate
                  ? showMax - 1
                  : totalHobbies;
                const displayHobbies = event.hobbyIds.slice(0, displayCount);
                const remaining = totalHobbies - displayCount;

                return (
                  <Card
                    key={event.id}
                    onClick={() => router.push(`/event/${event.id}`)}
                    className="group relative border-0 bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-rose-100 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full hover:-translate-y-1"
                  >
                    {/* Image Container - Taller Aspect Ratio */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-rose-100 to-indigo-100 flex items-center justify-center">
                          <HeartHandshakeIcon className="w-16 h-16 text-rose-300" />
                        </div>
                      )}

                      {/* Gradient Overlay for Text Visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                      {/* Hobbies - Floating Top Left */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[90%]">
                        {displayHobbies.map((hid) => {
                          const h = getHobby(hid);
                          return (
                            <span
                              key={hid}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-gray-800 text-[10px] font-bold shadow-sm"
                            >
                              <span>{h?.emoji}</span>
                              <span className="truncate max-w-[80px]">
                                {h?.name}
                              </span>
                            </span>
                          );
                        })}
                        {remaining > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-white/95 backdrop-blur-sm text-gray-600 text-[10px] font-bold shadow-sm">
                            +{remaining}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-5 flex flex-col gap-3 relative">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-rose-600 transition-colors">
                        {event.title}
                      </h3>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 font-medium mt-auto">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-rose-400" />
                          <span>
                            {new Date(event.date).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-gray-700 font-bold">
                            {spotsLeft} spots left
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <MapPinIcon className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="truncate">
                            {location?.name || "Online"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {!loading && openEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <HeartHandshakeIcon className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              No active invites found.
            </p>
            <Button
              variant="link"
              onClick={() => router.push("/dashboard/create-invite")}
              className="text-rose-600 font-bold"
            >
              Create one?
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
