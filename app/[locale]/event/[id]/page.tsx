"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
} from "@/components/ui";
import { getHobbyById, getLocationById } from "@/lib/data";
import { useSession } from "next-auth/react";

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
  host?: any;
  hobby?: any;
  location?: any;
  participants?: any[];
  _count?: { participants: number };
}

import { ArrowLeftIcon, CalendarIcon, MapPinIcon, MessageCircleIcon } from "@/icons/icons";

const MessageIcon = MessageCircleIcon;

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const t = useTranslations("event");
  const { data: session } = useSession();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      if (!params?.id) return;
      
      try {
        const response = await fetch(`/api/events/${params.id}`);
        console.log("response: ", response);
        const data = await response.json();

        if (data.success) {
          setEvent(data.data);
        } else {
          setError(data.error || "Event not found");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    }

    if (params?.id) {
      fetchEvent();
    }
  }, [params?.id]);

  // Handle joining event
  const handleJoinEvent = async () => {
    if (!params?.id) return;
    
    if (!session?.user?.id) {
      router.push(`/${locale}/login`);
      return;
    }

    setJoining(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(`/api/events/${params.id}/join`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setActionSuccess("Successfully joined the event!");
        // Refresh event data
        const eventResponse = await fetch(`/api/events/${params.id}`);
        const eventData = await eventResponse.json();
        if (eventData.success) {
          setEvent(eventData.data);
        }
      } else {
        setActionError(data.error || "Failed to join event");
      }
    } catch (err) {
      console.error("Error joining event:", err);
      setActionError("Failed to join event. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  // Handle leaving event
  const handleLeaveEvent = async () => {
    if (!params?.id) return;
    
    if (!session?.user?.id) {
      return;
    }

    if (!confirm("Are you sure you want to leave this event?")) {
      return;
    }

    setJoining(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(`/api/events/${params.id}/join`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setActionSuccess("Successfully left the event");
        // Refresh event data
        const eventResponse = await fetch(`/api/events/${params.id}`);
        const eventData = await eventResponse.json();
        if (eventData.success) {
          setEvent(eventData.data);
        }
      } else {
        setActionError(data.error || "Failed to leave event");
      }
    } catch (err) {
      console.error("Error leaving event:", err);
      setActionError("Failed to leave event. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500">{error || "Event not found"}</p>
          <Button onClick={() => router.push(`/dashboard`)} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const hobby = getHobbyById(event.hobbyId) || event.hobby;
  const location = getLocationById(event.locationId) || event.location;
  const host = event.host;
  const participantCount =
    event._count?.participants || event.participants?.length || 0;
  const isFull = participantCount >= event.maxParticipants;
  const spotsLeft = event.maxParticipants - participantCount;
  const isParticipant = event.participants?.some(
    (p: any) => p.userId === session?.user?.id
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Back
        </Button>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-extrabold text-gray-800">
                {event.title}
              </h1>
              <Badge
                variant={event.status === "OPEN" ? "default" : "secondary"}
              >
                {event.status === "OPEN" ? "Open" : event.status}
              </Badge>
            </div>
            <p className="text-gray-600 mb-6">{event.description}</p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {t("host")}
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={host?.image || ""}
                      alt={host?.name || ""}
                    />
                    <AvatarFallback>
                      {host?.name?.charAt(0) || "H"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {host?.name || "Event Host"}
                    </div>
                    {host?.id && (
                      <button
                        onClick={() =>
                          router.push(`/${locale}/profile/${host.id}`)
                        }
                        className="text-sm text-primary-600 hover:underline"
                      >
                        View profile
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {t("hobby")}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{hobby?.icon}</span>
                  <span className="font-semibold text-gray-800">
                    {hobby?.name}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {t("location")}
                </h3>
                <div className="font-semibold text-gray-800">
                  {location?.name}
                </div>
                <div className="text-sm text-gray-600">
                  {location?.city?.name || location?.city}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {t("when")}
                </h3>
                <div className="font-semibold text-gray-800">
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(event.date).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-purple-100/50 group transform transition-all hover:scale-[1.01]">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 opacity-90 transition-opacity group-hover:opacity-100" />
           <div className="absolute -bottom-10 -right-10 text-[12rem] opacity-20 rotate-12">{hobby?.icon}</div>
           
           <div className="relative p-8 md:p-10 text-white space-y-6">
              <div className="flex justify-between items-start">
                 <Badge className="bg-white/20 backdrop-blur-md border-0 text-white font-bold px-3 py-1">
                    {hobby?.name}
                 </Badge>
                 <Badge className={`${event.status === 'OPEN' ? 'bg-green-400' : 'bg-gray-400'} text-white border-0 font-bold px-3 py-1 uppercase tracking-wider shadow-sm`}>
                    {event.status === 'OPEN' ? 'Open for Joining' : 'Full / Closed'}
                 </Badge>
              </div>
              
              <div className="space-y-2">
                 <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-sm">
                   {event.title}
                 </h1>
                 <div className="flex flex-wrap gap-4 text-purple-100 font-medium pt-2">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                       <CalendarIcon className="w-4 h-4" />
                       {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                       <MapPinIcon className="w-4 h-4" />
                       {location?.name}, {location?.city?.name || location?.city}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
           
           <div className="md:col-span-2 space-y-6">
              
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-sm flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="relative">
                       <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                          <AvatarImage src={host?.image} />
                          <AvatarFallback className="bg-gradient-to-br from-rose-100 to-purple-100 text-purple-600 font-bold">{host?.name?.charAt(0)}</AvatarFallback>
                       </Avatar>
                       <div className="absolute -bottom-1 -right-1 bg-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white border border-white shadow-sm tracking-wide">
                          HOST
                       </div>
                    </div>
                    <div>
                       <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Organized by</div>
                       <div className="text-lg font-bold text-gray-900">{host?.name}</div>
                    </div>
                 </div>
                 <Button variant="ghost" size="sm" onClick={() => router.push(`/profile/${host?.id}`)} className="text-purple-600 font-bold hover:bg-purple-50 rounded-xl">
                    Profile
                 </Button>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-sm space-y-4">
                 <h3 className="font-bold text-gray-900 text-lg">About this Event</h3>
                 <p className="text-gray-600 leading-relaxed text-base">
                    {event.description}
                 </p>
                 <div className="pt-4 flex flex-wrap gap-2">
                    {['Friendly', 'Casual', 'Beginners Welcome', 'English'].map(tag => (
                       <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-500 border border-gray-200">
                          #{tag}
                       </span>
                    ))}
                 </div>
              </div>

           </div>

           <div className="md:col-span-1">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-sm h-full">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900">The Squad</h3>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                       {participantCount}/{event.maxParticipants}
                    </span>
                 </div>
                 
                 <div className="space-y-3">
                    {event.participants?.map((participant: any) => {
                       const participantUser = participant.user || participant;
                       return (
                          <div key={participant.id || participant.userId} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-colors cursor-pointer group" onClick={() => router.push(`/profile/${participantUser.id || participant.userId}`)}>
                             <Avatar className="w-10 h-10 border border-white shadow-sm group-hover:scale-105 transition-transform">
                                <AvatarImage src={participantUser?.image} />
                                <AvatarFallback className="text-xs font-bold text-gray-500">{participantUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                             </Avatar>
                             <div className="truncate">
                                <div className="text-sm font-bold text-gray-800 truncate">{participantUser?.name || 'Unknown'}</div>
                                <div className="text-[10px] text-gray-400 font-medium">Ready to go</div>
                             </div>
                          </div>
                       )
                    }) || []}
                    {spotsLeft > 0 && Array.from({length: Math.min(3, spotsLeft)}).map((_, i) => (
                       <div key={i} className="flex items-center gap-3 p-2 opacity-50">
                          <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs font-bold">
                             ?
                          </div>
                          <div className="text-sm font-medium text-gray-400">Open Spot</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* Success/Error Toast */}
      {(actionSuccess || actionError) && (
        <div className="fixed top-8 inset-x-0 px-4 z-50 flex justify-center">
          <div
            className={`${
              actionSuccess
                ? "bg-green-500"
                : "bg-red-500"
            } text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-down`}
          >
            <span className="text-xl">
              {actionSuccess ? "✓" : "✗"}
            </span>
            <span className="font-semibold">
              {actionSuccess || actionError}
            </span>
            <button
              onClick={() => {
                setActionSuccess(null);
                setActionError(null);
              }}
              className="ml-2 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="fixed bottom-8 inset-x-0 px-4 z-40 flex justify-center">
        <div className="bg-gray-900/95 backdrop-blur-xl p-2 pl-3 rounded-[2rem] shadow-2xl shadow-purple-500/20 flex items-center gap-3 max-w-md w-full border border-white/10 ring-1 ring-black/5">
          <Button
            onClick={() => router.push(`/dashboard/chat/${event.id}`)}
            className="rounded-full w-12 h-12 bg-white/10 hover:bg-white/20 text-white border-0 flex items-center justify-center shrink-0 transition-colors"
          >
            <MessageIcon className="w-5 h-5" />
          </Button>

          {/* Show different button based on participation status */}
          {isParticipant ? (
            <Button
              onClick={handleLeaveEvent}
              disabled={joining}
              className="flex-1 rounded-full h-12 text-base font-bold shadow-lg transition-all bg-red-500 text-white hover:bg-red-600 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? "Leaving..." : "Leave Event"}
            </Button>
          ) : (
            <Button
              onClick={handleJoinEvent}
              disabled={isFull || event.status !== "OPEN" || joining}
              className={`
                flex-1 rounded-full h-12 text-base font-bold shadow-lg transition-all
                ${
                  isFull || event.status !== "OPEN"
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-900 hover:bg-gray-50 hover:scale-[1.02]"
                }
                ${joining ? "opacity-50 cursor-wait" : ""}
              `}
            >
              {joining
                ? "Joining..."
                : isFull
                ? "Squad Full"
                : event.status !== "OPEN"
                ? "Event Closed"
                : "Join Event"}
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
