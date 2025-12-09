"use client";

import { useParams, usePathname } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
import { MessageIcon } from "@/icons/icons";

interface Event {
  id: number;
  title: string;
  description?: string;
  image?: string;
  date: Date | string;
  hobbyId: number;
  locationId: number;
  hostId: number;
  maxParticipants: number;
  status: string;
  host?: any;
  hobby?: any;
  location?: any;
  participants?: any[];
  joinRequests?: { id: number; userId: number; status: string; createdAt: string }[];
  chats?: { id: number; type: string }[];
  _count?: { participants: number };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const locale = (pathname ? pathname.split('/')[1] : '') || 'en';
  
  // Using a fallback for translations if namespace setup varies
  const t = useTranslations("event");

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // Helper function to refresh event data
  const refreshEvent = useCallback(async () => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/events/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setEvent(data.data);
      }
    } catch (err) {
      console.error("Error refreshing event:", err);
    }
  }, [params?.id]);

  useEffect(() => {
    async function fetchEvent() {
      if (!params?.id) return;
      
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

    if (params?.id) {
      fetchEvent();
    }
  }, [params?.id]);

  useEffect(() => {
    const handleRequestAccepted = (event: CustomEvent) => {
      const data = event.detail;
      
      if (data.eventId?.toString() === params?.id?.toString()) {
        setHasPendingRequest(false);
        setActionSuccess("Your request has been accepted! Welcome to the event!");
        refreshEvent();
      }
    };

    window.addEventListener('event-request-accepted' as any, handleRequestAccepted as any);

    return () => {
      window.removeEventListener('event-request-accepted' as any, handleRequestAccepted as any);
    };
  }, [params?.id, refreshEvent]);

  useEffect(() => {
    if (event?.hostId && event.hostId.toString() === session?.user?.id?.toString()) {
      fetchJoinRequests();
    }
  }, [event?.hostId, session?.user?.id]);

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
        setActionSuccess("Join request sent! Please wait for host approval.");
        setHasPendingRequest(true);
        // Refresh event data
        await refreshEvent();
      } else {
        setActionError(data.error || "Failed to send join request");
      }
    } catch (err) {
      console.error("Error sending join request:", err);
      setActionError("Failed to send join request. Please try again.");
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
        await refreshEvent();
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

  // Handle deleting event (for host only)
  const handleDeleteEvent = async () => {
    if (!params?.id) return;
    
    setDeleting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(`/api/events/${params.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setActionSuccess("Event deleted successfully");
        // Redirect to my events page after a short delay
        setTimeout(() => {
          router.push("/dashboard/my-events");
        }, 1500);
      } else {
        setActionError(data.error || "Failed to delete event");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      setActionError("Failed to delete event. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Fetch friends for invitation
  const fetchFriends = async () => {
    if (!session?.user?.id || !params?.id) return;
    
    setLoadingFriends(true);
    try {
      // First, refresh event data to get latest participants
      const eventResponse = await fetch(`/api/events/${params.id}`);
      const eventData = await eventResponse.json();
      let currentParticipantIds: string[] = [];
      
      if (eventData.success) {
        currentParticipantIds = eventData.data.participants?.map((p: any) => p.userId || p.id) || [];
      }
      
      // Then fetch friends
      const response = await fetch(`/api/mutual-matches?userId=${session.user.id}`);
      const data = await response.json();
      
      if (data.success) {
        // Map to friend objects and filter out participants
        const availableFriends = data.data
          .map((item: any) => item.friend)
          .filter((friend: any) => !currentParticipantIds.includes(friend.id));
        setFriends(availableFriends);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Fetch join requests
  const fetchJoinRequests = async () => {
    if (!params?.id) return;
    
    setLoadingRequests(true);
    try {
      const response = await fetch(`/api/events/${params.id}/requests`);
      const data = await response.json();
      
      if (data.success) {
        setJoinRequests(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching join requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Handle invite friend
  const handleInviteFriend = async (friendId: string) => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/events/${params.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: friendId }),
      });

      const data = await response.json();

      if (data.success) {
        setActionSuccess("Invitation sent!");
        // Remove invited friend from list
        setFriends(friends.filter(f => f.id !== friendId));
        // Refresh event data to update participants count
        await refreshEvent();
      } else {
        setActionError(data.error || "Failed to send invitation");
      }
    } catch (err) {
      console.error("Error inviting friend:", err);
      setActionError("Failed to send invitation");
    }
  };

  // Handle accept join request
  const handleAcceptRequest = async (requestId: string) => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/events/${params.id}/requests/${requestId}/accept`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setActionSuccess("Request accepted!");
        // Refresh join requests and event data
        await fetchJoinRequests();
        await refreshEvent();
      } else {
        setActionError(data.error || "Failed to accept request");
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      setActionError("Failed to accept request");
    }
  };

  // Handle reject join request
  const handleRejectRequest = async (requestId: string) => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/events/${params.id}/requests/${requestId}/reject`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setActionSuccess("Request rejected");
        fetchJoinRequests();
      } else {
        setActionError(data.error || "Failed to reject request");
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
      setActionError("Failed to reject request");
    }
  };

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
  const hobby = event.hobbyId ? (getHobbyById(event.hobbyId.toString()) || event.hobby) : event.hobby;
  const location = event.locationId ? (getLocationById(event.locationId.toString()) || event.location) : event.location;
  const host = event.host;
  const participantCount = event._count?.participants || event.participants?.length || 0;
  const maxParticipants = event.maxParticipants || 10; // Fallback if 0
  const isFull = participantCount >= maxParticipants;
  const spotsLeft = maxParticipants - participantCount;
  const currentUserId = session?.user?.id?.toString();
  const isParticipant = event.participants?.some(
    (p: any) => p.userId?.toString() === currentUserId || p.id?.toString() === currentUserId
  );
  const isHost = event.hostId?.toString() === currentUserId;
  
  // Check if current user has a pending join request
  const isPendingRequest = hasPendingRequest || event.joinRequests?.some(
    (r) => r.userId?.toString() === currentUserId && r.status === "PENDING"
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
              <Image 
                src={event.image} 
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Abstract Background Patterns */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="relative z-10 p-8 md:p-12 flex flex-col h-full justify-between min-h-[360px]">
            <div className="flex justify-between items-start">
              <div className="inline-flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl shadow-lg text-gray-800">
                <span>{(hobby as any)?.icon}</span>
                <span>{(hobby as any)?.name || "Social Event"}</span>
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Event?</h3>
              <p className="text-gray-500">This action cannot be undone. All participants will be notified.</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="flex-1 rounded-full h-12 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteEvent}
                disabled={deleting}
                className="flex-1 rounded-full h-12 bg-red-500 text-white hover:bg-red-600 font-bold disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Invite Friends</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {loadingFriends ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No friends available to invite</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={friend.image} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                          {friend.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-gray-900">{friend.name}</p>
                        <p className="text-sm text-gray-500">{friend.bio || "No bio"}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleInviteFriend(friend.id)}
                      className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 text-sm font-bold"
                    >
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Join Requests Modal */}
      {showJoinRequestsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Join Requests</h3>
              <button onClick={() => setShowJoinRequestsModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {loadingRequests ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : joinRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {joinRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={request.user?.image} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                          {request.user?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{request.user?.name}</p>
                        <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {request.message && (
                      <p className="text-sm text-gray-600 mb-3 p-2 bg-white rounded-xl">{request.message}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1 rounded-full bg-green-500 text-white hover:bg-green-600 py-2 text-sm font-bold"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 py-2 text-sm font-bold"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="fixed bottom-8 inset-x-0 px-4 z-40 flex justify-center">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl shadow-black/30 flex items-center gap-2 max-w-2xl w-full border border-white/10">
          {/* Show Edit/Delete/Invite/Requests for host, Join/Leave for others */}
          {isHost ? (
            <>
              <Button
                onClick={() => {
                  setShowJoinRequestsModal(true);
                  fetchJoinRequests();
                }}
                className="relative rounded-full h-12 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 flex items-center gap-2 transition-all font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105"
              >
                {/* Badge for pending requests */}
                {joinRequests.filter(r => r.status === 'PENDING').length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {joinRequests.filter(r => r.status === 'PENDING').length > 9 ? '9+' : joinRequests.filter(r => r.status === 'PENDING').length}
                  </span>
                )}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="hidden sm:inline">Requests</span>
              </Button>
              <Button
                onClick={() => {
                  setShowInviteModal(true);
                  fetchFriends();
                }}
                className="rounded-full h-12 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 flex items-center gap-2 transition-all font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Invite</span>
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/create-invite?edit=${event.id}`)}
                className="flex-1 rounded-full h-12 text-base font-bold shadow-lg transition-all bg-white text-gray-900 hover:bg-gray-50 hover:scale-[1.02]"
              >
                Edit
              </Button>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                className="rounded-full h-12 w-12 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </>
          ) : isParticipant ? (
            <>
              <Button
                onClick={() => {
                  const eventChat = event.chats?.find((chat: any) => chat.type === 'EVENT');
                  if (eventChat) {
                    router.push(`/chat/${eventChat.id}`);
                  }
                }}
                className="rounded-full h-12 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 flex items-center gap-2 transition-all font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Chat</span>
              </Button>
              <Button
                onClick={handleLeaveEvent}
                disabled={joining}
                className="flex-1 rounded-full h-12 text-base font-bold shadow-lg transition-all bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joining ? "Leaving..." : "Leave Event"}
              </Button>
            </>
          ) : isPendingRequest ? (
            <Button
              disabled={true}
              className="flex-1 rounded-full h-12 text-base font-bold shadow-lg transition-all bg-gradient-to-r from-amber-500 to-orange-500 text-white cursor-not-allowed opacity-90"
            >
              <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Request Pending
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
                ? "Sending Request..."
                : isFull
                ? "Squad Full"
                : event.status !== "OPEN"
                ? "Event Closed"
                : "Request to Join"}
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}