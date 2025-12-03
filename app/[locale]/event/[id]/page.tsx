"use client";

import { useParams, usePathname } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
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
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  MessageCircle, 
  Clock, 
  Users, 
  CheckCircle2, 
  Share2,
  Navigation
} from "lucide-react";

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

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Using a fallback for translations if namespace setup varies
  const t = useTranslations("event");

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`);
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

  // Loading State - Modern Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="w-full max-w-4xl h-80 bg-gray-200 rounded-3xl"></div>
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 rounded-3xl md:col-span-2"></div>
          <div className="h-64 bg-gray-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <MapPin className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
        <p className="text-gray-500 mb-8">{error || "We couldn't find the event you're looking for."}</p>
        <Button onClick={() => router.push(`/dashboard`)} size="lg" className="rounded-full">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Derived Data
  const hobby = getHobbyById(event.hobbyId) || event.hobby;
  const location = getLocationById(event.locationId) || event.location;
  const host = event.host;
  const participantCount = event._count?.participants || event.participants?.length || 0;
  const maxParticipants = event.maxParticipants || 10; // Fallback if 0
  const isFull = participantCount >= maxParticipants;
  const spotsLeft = maxParticipants - participantCount;
  const isParticipant = event.participants?.some(
    (p: any) => p.userId === (session?.user as any)?.id || p.id === (session?.user as any)?.id
  );
  
  const eventDate = new Date(event.date);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-32">
      {/* Navbar / Top Controls */}
      <div className=" z-40 p-2 pointer-events-none">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-gray-200 hover:bg-white pointer-events-auto h-10 w-10 transition-transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-6">
        
        {/* HERO SECTION */}
        <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-2xl shadow-indigo-200">
          
          {/* Event Image Background */}
          {event.image && (
            <div className="absolute inset-0 z-0">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Abstract Background Patterns */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="relative z-10 p-8 md:p-12 flex flex-col h-full justify-between min-h-[360px]">
            <div className="flex justify-between items-start">
              <div className="inline-flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl shadow-lg text-gray-800">
                <span>{hobby?.icon}</span>
                <span>{hobby?.name || "Social Event"}</span>
              </div>
              <Badge 
                className={`${event.status === 'OPEN' ? 'bg-green-400/90 text-green-950' : 'bg-gray-400/90 text-gray-100'} backdrop-blur-md border-0 px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-lg`}
              >
                {event.status === 'OPEN' ? 'Open' : event.status}
              </Badge>
            </div>

            <div className="space-y-4 mt-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-white font-medium text-sm md:text-base">
                 <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl shadow-lg text-gray-800">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    {eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                 </div>
                 <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl shadow-lg text-gray-800">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    {eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                 </div>
                 <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl shadow-lg text-gray-800">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    {location?.city?.name || location?.city || "Unknown City"}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN (Details) - Spans 8 cols */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Description Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
               <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                 About this Event
               </h3>
               <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
                 {event.description ? event.description : "No description provided."}
               </div>
               
               {/* Location Detail */}
               <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-indigo-600">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">Location</h4>
                    <p className="font-semibold text-gray-800 text-lg">{location?.name}</p>
                    <p className="text-gray-500 text-sm">{location?.address || location?.city?.name || location?.city}</p>
                  </div>
               </div>
            </div>

            {/* Host Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-indigo-100 transition-all" onClick={() => router.push(`/profile/${host?.id}`)}>
               <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-lg group-hover:scale-105 transition-transform">
                      <AvatarImage src={host?.image || ""} alt={host?.name || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 font-bold text-xl">
                        {host?.name?.charAt(0) || "H"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                      HOST
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Organized by</div>
                    <div className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{host?.name || "Unknown Host"}</div>
                    <div className="text-sm text-gray-500 font-medium">View Profile</div>
                  </div>
               </div>
               <div className="hidden sm:block">
                  <Button variant="ghost" className="text-gray-400 hover:text-indigo-600">
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </Button>
               </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Participants & Status) - Spans 4 cols */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Participants Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  Participants
                </h3>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {participantCount} / {maxParticipants}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`}
                  style={{ width: `${Math.min((participantCount / maxParticipants) * 100, 100)}%` }}
                ></div>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                 {/* Current Participants */}
                 {event.participants?.map((participant: any) => {
                    const pUser = participant.user || participant;
                    return (
                      <div 
                        key={pUser.id || Math.random()} 
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/profile/${pUser.id}`)}
                      >
                        <Avatar className="w-10 h-10 border border-gray-200">
                          <AvatarImage src={pUser.image} />
                          <AvatarFallback className="text-xs bg-gray-100 font-bold text-gray-500">
                            {pUser.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{pUser.name}</p>
                          <p className="text-xs text-gray-400 font-medium">Joined</p>
                        </div>
                      </div>
                    );
                 })}

                 {/* Empty Slots */}
                 {spotsLeft > 0 && Array.from({ length: Math.min(3, spotsLeft) }).map((_, i) => (
                   <div key={`empty-${i}`} className="flex items-center gap-3 p-2 opacity-40">
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      </div>
                      <div className="text-sm font-medium text-gray-500">Open Spot</div>
                   </div>
                 ))}
                 
                 {spotsLeft > 3 && (
                   <div className="text-center text-xs text-gray-400 font-medium py-2">
                     + {spotsLeft - 3} more spots available
                   </div>
                 )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR (Glassmorphism) */}
      <div className="fixed bottom-0 inset-x-0 p-6 z-50 flex justify-center pointer-events-none">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 pl-3 shadow-2xl shadow-indigo-500/20 w-full max-w-md flex items-center gap-3 pointer-events-auto transform transition-all hover:scale-[1.02]">
           
           {/* Message Button */}
           <Button 
             variant="ghost"
             size="icon"
             onClick={() => router.push(`/dashboard/chat/${event.id}`)}
             className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/5"
             title="Event Chat"
           >
             <MessageCircle className="w-6 h-6" />
           </Button>

           {/* Main CTA */}
           {isParticipant ? (
             <Button 
                className="flex-1 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-base shadow-lg shadow-green-500/20"
                onClick={() => {}} 
                disabled
             >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                You're Going
             </Button>
           ) : (
             <Button 
                className={`flex-1 h-12 rounded-full font-bold text-base shadow-lg transition-all
                  ${isFull || event.status !== 'OPEN'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-900 hover:bg-indigo-50'
                  }
                `}
                onClick={() => alert("Join logic here")}
                disabled={isFull || event.status !== 'OPEN'}
             >
                {isFull 
                  ? 'Squad Full' 
                  : event.status !== 'OPEN' 
                    ? 'Event Closed' 
                    : `Join Event`
                }
             </Button>
           )}
        </div>
      </div>

    </div>
  );
}