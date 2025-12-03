'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Button, Avatar, AvatarImage, AvatarFallback, Badge } from '@/components/ui';
import { getUserById, getHobbyById, getLocationById, getEventsByUserId } from '@/lib/data';
import { ArrowLeftIcon, MapPinIcon, SparklesIcon, CalendarIcon, MessageCircleIcon } from '@/icons/icons';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('profile');
  
  const user = getUserById(params.id as string);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce grayscale opacity-50">👤</div>
          <h2 className="text-xl font-bold text-gray-800">User not found</h2>
          <Button onClick={() => router.push(`/dashboard`)} variant="outline" className="rounded-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const userEvents = getEventsByUserId(user.id);

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative pb-20">
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-rose-100/40 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="sticky top-0 z-30 px-4 py-4">
         <div className="max-w-xl mx-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()} 
              className="rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-white text-gray-700"
            >
               <ArrowLeftIcon className="w-5 h-5" />
            </Button>
         </div>
      </div>

      <div className="max-w-xl mx-auto px-4 space-y-8">
        
        <div className="relative pt-12">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 pt-24 border border-white shadow-xl shadow-purple-100/50 text-center relative overflow-visible">
               
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 to-purple-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <Avatar className="w-32 h-32 border-[6px] border-[#FAFAFA] shadow-lg bg-white">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 text-4xl font-bold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-sm" title="Online"></div>
                  </div>
               </div>

               <div className="space-y-4 relative z-0">
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">{user.name}</h1>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500">
                      <span>{user.age} years old</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="capitalize">{user.gender}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed font-medium max-w-sm mx-auto">
                    {user.bio}
                  </p>

                  <div className="pt-2">
                    <Button 
                      onClick={() => alert('Message functionality will be implemented')}
                      className="rounded-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold px-8 shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all gap-2"
                    >
                      <MessageCircleIcon className="w-4 h-4" />
                      {t('sendMessage')}
                    </Button>
                  </div>
               </div>
            </div>
        </div>

        <div className="grid gap-6">
           
           <div className="space-y-6">
              <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 border border-white shadow-sm">
                 <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <SparklesIcon className="w-4 h-4 text-purple-400" />
                   Interests
                 </h2>
                 <div className="flex flex-wrap gap-2">
                   {user.hobbies.map((hobbyId) => {
                     const hobby = getHobbyById(hobbyId);
                     return (
                       <span key={hobbyId} className="px-4 py-2 rounded-xl text-sm font-bold bg-purple-50 text-purple-700 border border-purple-100">
                         {hobby?.icon} {hobby?.name}
                       </span>
                     );
                   })}
                 </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 border border-white shadow-sm">
                 <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <MapPinIcon className="w-4 h-4 text-rose-400" />
                   Locations
                 </h2>
                 <div className="flex flex-wrap gap-2">
                   {user.preferredLocations.map((locationId) => {
                     const location = getLocationById(locationId);
                     return (
                       <span key={locationId} className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-50 text-rose-700 border border-rose-100">
                         {location?.name}
                       </span>
                     );
                   })}
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <h2 className="text-lg font-black text-gray-900 px-2">Past Events</h2>
              {userEvents.length > 0 ? (
                <div className="space-y-3">
                  {userEvents.map((event) => {
                    const hobby = getHobbyById(event.hobbyId);
                    const location = getLocationById(event.locationId);
                    return (
                      <div
                        key={event.id}
                        onClick={() => router.push(`/event/${event.id}`)}
                        className="group flex items-center gap-4 bg-white rounded-2xl p-3 pr-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                          {hobby?.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                           <h3 className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                             {event.title}
                           </h3>
                           <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-0.5">
                             <CalendarIcon className="w-3 h-3" />
                             <span>{event.date}</span>
                             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                             <span>{location?.name}</span>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-white/40 rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">No public events yet</p>
                </div>
              )}
           </div>

        </div>

      </div>
    </div>
  );
}