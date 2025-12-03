'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Avatar, AvatarImage, AvatarFallback, Badge } from '@/components/ui';
import { getHobbyById, getLocationById } from '@/lib/data';
import { ArrowLeftIcon, MapPinIcon, SparklesIcon, CalendarIcon, MessageCircleIcon } from '@/icons/icons';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('profile');
  
  const [user, setUser] = useState<any>(null);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch(`/api/users/profile/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setUser(data.data);
          // Set events from API response
          if (data.data.events) {
            setUserEvents(data.data.events);
          }
        } else {
          setError(data.error || "User not found");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchUserProfile();
    }
  }, [params.id]);

  // Helper to format date for the event card
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      full: date.toLocaleDateString()
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
            </div>
          </div>
          <p className="text-gray-400 font-medium text-sm animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-3xl grayscale opacity-50">
            👤
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Unavailable</h2>
            <p className="text-gray-500 text-sm">{error || "We couldn't find the user you're looking for."}</p>
          </div>
          <Button 
            onClick={() => router.push(`/dashboard`)} 
            className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] relative overflow-hidden pb-20 selection:bg-purple-100 selection:text-purple-900">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 inset-x-0 h-[400px] bg-gradient-to-b from-purple-50/50 via-white/50 to-transparent pointer-events-none -z-10" />
      <div className="fixed -top-[20%] -left-[10%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply" />
      <div className="fixed top-[10%] -right-[10%] w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-multiply" />

      {/* Navigation */}
      <div className="sticky top-0 z-40 px-4 py-4 backdrop-blur-[2px]">
         <div className="max-w-2xl mx-auto flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()} 
              className="rounded-full bg-white/70 backdrop-blur-md shadow-sm border border-white/50 hover:bg-white text-gray-700 hover:scale-105 transition-all duration-300"
            >
               <ArrowLeftIcon className="w-5 h-5" />
            </Button>
         </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 space-y-8">
        
        {/* Profile Hero Card */}
        <div className="relative pt-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 pt-0 border border-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.05)] text-center relative overflow-visible mt-12">
               
               {/* Avatar Container */}
               <div className="relative -mt-16 mb-6 inline-block">
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 to-purple-600 rounded-full blur-2xl opacity-20 scale-110"></div>
                  <Avatar className="w-36 h-36 border-[8px] border-white shadow-xl relative z-10">
                    <AvatarImage src={user.image} alt={user.name} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 text-5xl font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status Indicator */}
                  <div className="absolute bottom-4 right-2 z-20">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full border-[4px] border-white shadow-sm flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-100 rounded-full opacity-50 animate-pulse"></div>
                    </div>
                  </div>
               </div>

               {/* User Info */}
               <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{user.name}</h1>
                    <div className="flex items-center justify-center gap-3">
                      <Badge variant="secondary" className="bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 px-3 py-1 rounded-full border border-gray-200/50 backdrop-blur-sm">
                        {user.age} years old
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 px-3 py-1 rounded-full border border-gray-200/50 backdrop-blur-sm capitalize">
                        {user.gender}
                      </Badge>
                    </div>
                  </div>

                  {user.bio && (
                    <p className="text-gray-600 leading-relaxed font-medium max-w-md mx-auto text-[15px]">
                      {user.bio}
                    </p>
                  )}

                  <div className="pt-2 pb-2">
                    <Button 
                      onClick={() => alert('Sending greeting will cost 1 credit')}
                      className="w-full max-w-xs rounded-2xl bg-gray-900 hover:bg-black text-white font-bold h-12 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-300/50 hover:-translate-y-0.5 transition-all duration-300 gap-2.5 text-sm"
                    >
                      <MessageCircleIcon className="w-4 h-4" />
                      Send Hello <span className="ml-1 text-amber-400">• 1 Credit</span>
                    </Button>
                  </div>
               </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-backwards">
           
           {/* Info Sections */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interests */}
              <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
                 <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                   <SparklesIcon className="w-3.5 h-3.5 text-purple-500" />
                   Interests
                 </h2>
                 <div className="flex flex-wrap gap-2 content-start">
                   {user.hobbies && user.hobbies.length > 0 ? (
                     user.hobbies.map((hobby: any) => (
                       <span key={hobby.id} className="inline-flex items-center px-3.5 py-2 rounded-2xl text-xs font-bold bg-[#FAF5FF] text-purple-700 border border-purple-100/50 transition-colors hover:bg-purple-50">
                         <span className="mr-1.5 opacity-80">{hobby.emoji}</span>
                         {hobby.name}
                       </span>
                     ))
                   ) : (
                     <p className="text-gray-400 text-sm italic pl-1">No interests added</p>
                   )}
                 </div>
              </div>

              {/* Locations */}
              <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
                 <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                   <MapPinIcon className="w-3.5 h-3.5 text-rose-500" />
                   Locations
                 </h2>
                 <div className="flex flex-wrap gap-2 content-start">
                   {user.preferredLocations && user.preferredLocations.length > 0 ? (
                     user.preferredLocations.map((location: any) => (
                       <span key={location.id} className="inline-flex items-center px-3.5 py-2 rounded-2xl text-xs font-bold bg-[#FFF1F2] text-rose-700 border border-rose-100/50 transition-colors hover:bg-rose-50">
                         {location.city.name}
                       </span>
                     ))
                   ) : (
                     <p className="text-gray-400 text-sm italic pl-1">No locations added</p>
                   )}
                 </div>
              </div>
           </div>

           {/* Events Section */}
           <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-black text-gray-900">Recent Events</h2>
                <Badge variant="outline" className="rounded-full px-2.5 bg-white font-normal text-gray-500">
                  {userEvents.length} Total
                </Badge>
              </div>
              
              {userEvents && userEvents.length > 0 ? (
                <div className="grid gap-3">
                  {userEvents.map((event: any) => {
                    const dateInfo = formatDate(event.date);
                    return (
                      <div
                        key={event.id}
                        onClick={() => router.push(`/event/${event.id}`)}
                        className="group relative bg-white rounded-3xl p-3 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-purple-100/50 transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        <div className="flex items-center gap-4">
                          {/* Date Box */}
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-50 group-hover:bg-purple-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100 group-hover:border-purple-100 transition-colors">
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-purple-400 uppercase tracking-wider">{dateInfo.month}</span>
                            <span className="text-xl font-black text-gray-900 group-hover:text-purple-600">{dateInfo.day}</span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 py-1">
                             <h3 className="font-bold text-gray-900 truncate text-[15px] group-hover:text-purple-700 transition-colors">
                               {event.title}
                             </h3>
                             <div className="flex items-center gap-3 mt-1.5">
                               <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                 <Badge 
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border-0 ${
                                      event.status === 'OPEN' 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {event.status}
                                  </Badge>
                               </div>
                             </div>
                          </div>

                          {/* Image or Icon */}
                          <div className="flex-shrink-0 mr-1">
                            {event.image ? (
                              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white shadow-sm">
                                <img 
                                  src={event.image} 
                                  alt={event.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                                🎈
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-medium text-sm">No public events shared yet</p>
                </div>
              )}
           </div>

        </div>

      </div>
    </div>
  );
}