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

// Icons
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
const MessageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
);

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

  useEffect(() => {
    async function fetchEvent() {
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

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

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
        
        {/* Hero Card */}
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
                       {location?.name}, {location?.city}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
           
           {/* Left: Details */}
           <div className="md:col-span-2 space-y-6">
              
              {/* Host Card */}
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

              {/* Description */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-sm space-y-4">
                 <h3 className="font-bold text-gray-900 text-lg">About this Event</h3>
                 <p className="text-gray-600 leading-relaxed text-base">
                    {event.description}
                 </p>
                 <div className="pt-4 flex flex-wrap gap-2">
                    {/* Mock Tags for vibe */}
                    {['Friendly', 'Casual', 'Beginners Welcome', 'English'].map(tag => (
                       <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-500 border border-gray-200">
                          #{tag}
                       </span>
                    ))}
                 </div>
              </div>

           </div>

           {/* Right: Squad */}
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

      {/* Floating Action Dock (Sticky Bottom) */}
      <div className="fixed bottom-8 inset-x-0 px-4 z-40 flex justify-center">
         <div className="bg-gray-900/95 backdrop-blur-xl p-2 pl-3 rounded-[2rem] shadow-2xl shadow-purple-500/20 flex items-center gap-3 max-w-md w-full border border-white/10 ring-1 ring-black/5">
            <Button 
               onClick={() => router.push(`/dashboard/chat/${event.id}`)}
               className="rounded-full w-12 h-12 bg-white/10 hover:bg-white/20 text-white border-0 flex items-center justify-center shrink-0 transition-colors"
            >
               <MessageIcon className="w-5 h-5" />
            </Button>
            <Button 
               disabled={isFull || event.status !== 'OPEN'}
               className={`
                  flex-1 rounded-full h-12 text-base font-bold shadow-lg transition-all
                  ${isFull 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-900 hover:bg-gray-50 hover:scale-[1.02]'}
               `}
               onClick={() => alert('Join functionality will be implemented')}
            >
               {isFull ? 'Squad Full' : 'Join Event'}
            </Button>
         </div>
      </div>

    </div>
  );
}
