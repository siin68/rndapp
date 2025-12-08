"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { getHobbyById, getLocationById, fetchEvents } from "@/lib/data";
import { useSession } from "next-auth/react";
import { MapPinIcon, CalendarIcon, HeartIcon, SparklesIcon, HeartHandshakeIcon, SearchIcon, FilterIcon, XIcon } from "@/icons/icons";
import { HOBBIES } from "@/constants/hobbies";

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
  host?: {
    id: string;
    name: string;
    image?: string;
  };
  location?: {
    id: string;
    name: string;
    city?: {
      id: string;
      name: string;
    };
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchOpenEvents() {
      if (!session?.user?.id) return;

      try {
        const events = await fetchEvents({
          limit: 20,
          userId: session.user.id.toString(), // Pass userId to exclude user's own events
        });
        const processedEvents = events.map((e: any) => {
          // Extract hobby IDs from hobbies array structure
          // API returns: hobbies: [{ hobby: { id: 1, name: "...", icon: "..." }, isPrimary: true }]
          let hobbyIds: string[] = [];

          if (e.hobbies && Array.isArray(e.hobbies)) {
            // Extract from hobbies array and convert to strings
            hobbyIds = e.hobbies.map((h: any) => String(h.hobby.id));
          } else if (e.hobbyId) {
            // Fallback to single hobbyId
            hobbyIds = [String(e.hobbyId)];
          } else if (e.hobbyIds) {
            // Already have hobbyIds array
            hobbyIds = e.hobbyIds.map((id: any) => String(id));
          }

          return {
            ...e,
            hobbyIds,
          };
        });
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

  // Filter events based on search term and selected hobbies
  const filteredEvents = openEvents.filter((event) => {
    // Search filter
    const matchesSearch = searchTerm === "" ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Hobby filter
    const matchesHobby = selectedHobbies.length === 0 ||
      event.hobbyIds.some(hobbyId => selectedHobbies.includes(hobbyId));

    // Debug logging
    if (selectedHobbies.length > 0 && event.hobbyIds.length > 0) {
      console.log('Event:', event.title, 'Event hobbyIds:', event.hobbyIds, 'Selected:', selectedHobbies, 'Match:', matchesHobby);
    }

    return matchesSearch && matchesHobby;
  });

  // Toggle hobby selection
  const toggleHobby = (hobbyId: string) => {
    setSelectedHobbies(prev =>
      prev.includes(hobbyId)
        ? prev.filter(id => id !== hobbyId)
        : [...prev, hobbyId]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedHobbies([]);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] py-10 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="fixed top-0 inset-x-0 h-96 bg-gradient-to-b from-rose-50/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto space-y-12">
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

        {/* Search and Filter Section */}
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Search Input */}
          <div className="relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
            <input
              type="text"
              placeholder="Search events by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300 outline-none shadow-sm hover:shadow-md"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <XIcon className="w-3.5 h-3.5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md ${selectedHobbies.length > 0
                ? 'bg-gradient-to-r from-rose-50 to-purple-50 border-rose-300 text-rose-700'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center gap-3">
                <FilterIcon className={`w-5 h-5 ${selectedHobbies.length > 0 ? 'text-rose-500' : 'text-gray-400'}`} />
                <span className="font-semibold">
                  {selectedHobbies.length > 0
                    ? `${selectedHobbies.length} ${selectedHobbies.length === 1 ? 'hobby' : 'hobbies'} selected`
                    : 'Filter by hobbies'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedHobbies.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                    className="px-3 py-1 text-xs font-bold text-rose-600 bg-white rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <div className={`transform transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Filter Dropdown */}
            <div
              className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden transition-all duration-300 z-10 ${isFilterOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
            >
              <div className="p-4 bg-gradient-to-r from-rose-50 to-purple-50 border-b border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Select Hobbies</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 max-h-80 overflow-y-auto">
                {HOBBIES.map((hobby) => {
                  const isSelected = selectedHobbies.includes(hobby.id);
                  return (
                    <button
                      key={hobby.id}
                      onClick={() => toggleHobby(hobby.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isSelected
                        ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-md scale-[1.02]'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-[1.02]'
                        }`}
                    >
                      <span className="text-xl">{hobby.icon}</span>
                      <span className="truncate">{hobby.name}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedHobbies.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 px-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold">
                  <SearchIcon className="w-3 h-3" />
                  &ldquo;{searchTerm}&rdquo;
                  <button onClick={() => setSearchTerm("")} className="hover:text-rose-900">
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedHobbies.map(hobbyId => {
                const hobby = HOBBIES.find(h => h.id === hobbyId);
                if (!hobby) return null;
                return (
                  <span
                    key={hobbyId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold"
                  >
                    <span>{hobby.icon}</span>
                    {hobby.name}
                    <button onClick={() => toggleHobby(hobbyId)} className="hover:text-purple-900">
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={clearFilters}
                className="ml-auto text-xs font-bold text-gray-500 hover:text-rose-600 transition-colors underline"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

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
            : filteredEvents.map((event) => {
                const location = event.location || getLocationById(event.locationId);
                const cityName = (location?.city as any)?.name || location?.city || '';
                const locationName = location?.name || '';
                const participantCount =
                  event._count?.participants || event.participants?.length || 0;
                const spotsLeft = event.maxParticipants - participantCount;

                // Use hobbies from event if available, otherwise use hobbyIds
                const eventHobbies = event.hobbies?.map(h => h.hobby) || [];
                const hobbyIds = eventHobbies.length > 0 
                  ? eventHobbies.map(h => h.id)
                  : event.hobbyIds;
                const totalHobbies = hobbyIds.length;
                const showMax = 3;
                // If we have > 3, we show 2 items + 1 counter badge = 3 elements total.
                // If we have <= 3, we show all items.
                const shouldTruncate = totalHobbies > showMax;
                const displayCount = shouldTruncate
                  ? showMax - 1
                  : totalHobbies;
                const displayHobbies = hobbyIds.slice(0, displayCount);
                const remaining = totalHobbies - displayCount;

                // Helper to get hobby info
                const getHobbyInfo = (hid: string) => {
                  const fromEvent = eventHobbies.find(h => h.id === hid);
                  if (fromEvent) return { name: fromEvent.name, emoji: fromEvent.icon };
                  return getHobby(hid);
                };

                return (
                  <Card
                    key={event.id}
                    onClick={() => router.push(`/event/${event.id}`)}
                    className="group relative border-0 bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-rose-100 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full hover:-translate-y-1"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                      WebkitTransform: 'translateZ(0)'
                    }}
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                      {event.image ? (
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-rose-100 to-indigo-100 flex items-center justify-center">
                          <HeartHandshakeIcon className="w-16 h-16 text-rose-300" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[90%]">
                        {displayHobbies.map((hid) => {
                          const h = getHobbyInfo(hid);
                          return (
                            <span
                              key={hid}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-gray-800 text-[10px] font-bold shadow-sm"
                            >
                              <span>{(h as any)?.emoji}</span>
                              <span className="truncate max-w-[80px]">
                                {(h as any)?.name}
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

                    <CardContent className="p-5 flex flex-col gap-3 relative">
                      <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-rose-600 transition-colors">
                        {event.title}
                      </h3>

                      {/* Host Info */}
                      {event.host && (
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                          <Image 
                            src={event.host.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.host.id}`}
                            alt={event.host.name}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-200"
                          />
                          <span className="text-xs text-gray-600 font-medium truncate">
                            by {event.host.name}
                          </span>
                        </div>
                      )}

                      {/* Hobbies Preview */}
                      <div className="flex flex-wrap gap-1.5 pb-2">
                        {displayHobbies.slice(0, 2).map((hid) => {
                          const h = getHobbyInfo(hid);
                          return (
                            <span
                              key={hid}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-bold"
                            >
                              <span>{(h as any)?.emoji}</span>
                              <span className="truncate max-w-[60px]">{(h as any)?.name}</span>
                            </span>
                          );
                        })}
                        {totalHobbies > 2 && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold">
                            +{totalHobbies - 2}
                          </span>
                        )}
                      </div>

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
                            {cityName || locationName || "Online"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {!loading && filteredEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <HeartHandshakeIcon className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {searchTerm || selectedHobbies.length > 0
                ? "No events found matching your filters."
                : "No active invites found."}
            </p>
            {searchTerm || selectedHobbies.length > 0 ? (
              <Button
                variant="link"
                onClick={clearFilters}
                className="text-rose-600 font-bold"
              >
                Clear filters
              </Button>
            ) : (
                <Button
                  variant="link"
                  onClick={() => router.push("/dashboard/create-invite")}
                  className="text-rose-600 font-bold"
                >
                  Create one?
                </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
