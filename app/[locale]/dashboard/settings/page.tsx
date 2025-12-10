
"use client";

import { useTranslations } from 'next-intl';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';

// --- Icons ---
const UserIcon = ({className}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const HeartIcon = ({className}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const MapPinIcon = ({className}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const GlobeIcon = ({className}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/></svg>;
const BellIcon = ({className}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const LockIcon = ({className}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ShieldIcon = ({className}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const LogOutIcon = ({className}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const TrashIcon = ({className}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const ChevronRightIcon = ({className}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>;

interface UserProfile {
  profile: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
    age: number | null;
    gender: string | null;
    isActive: boolean;
    isVerified: boolean;
    lastActive: Date | null;
    createdAt: Date;
  };
  hobbies: Array<{
    id: string;
    name: string;
    nameVi: string | null;
    category: string;
    icon: string;
    skillLevel: string;
    isPrimary: boolean;
  }>;
  locations: Array<{
    id: string;
    name: string;
    nameVi: string | null;
    city: any;
    isPrimary: boolean;
  }>;
  stats: {
    eventsHosted: number;
    eventsAttended: number;
    totalReviews: number;
    averageRating: number;
  };
}

// --- Components ---
const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`relative w-12 h-7 rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-200 ${
      active 
        ? 'bg-gradient-to-r from-rose-500 to-purple-600 shadow-inner' 
        : 'bg-gray-200'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${
        active ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const SettingRow = ({ icon: Icon, title, subtitle, action }: { icon: any, title: string, subtitle?: string, action: React.ReactNode }) => (
  <div className="flex items-center justify-between py-4 group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
    <div>{action}</div>
  </div>
);

export default function SettingsPage() {
  const t = useTranslations('dashboard.settings');
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (pathname ? pathname.split('/')[1] : '') || 'en';

  // State for user profile from API
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showLocation, setShowLocation] = useState(true);

  // Fetch user profile from API
  useEffect(() => {
    async function fetchUserProfile() {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/users/profile?userId=${session.user.id}`);
        const data = await response.json();

        if (data.success) {
          setUserProfile(data.data);
        } else {
          setError(data.error || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [session?.user?.id]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = `/login`;
  };

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'vi' : 'en';
    if (!pathname) return;
    const newPath = pathname.replace(`/${locale}/`, `/${newLocale}/`);
    router.push(newPath);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-8 px-4 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !userProfile) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-8 px-4 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Profile not found'}</p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8 flex justify-center pb-24">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse delay-700" />

      <div className="w-full max-w-3xl space-y-8">
        
        <div className="relative">
          <Card className="border-0 shadow-2xl shadow-rose-100/50 bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500 relative">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>
            
            <CardContent className="px-8 pb-8 pt-0 relative">
               <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-12">
                 <div className="relative group">
                   <div className="absolute -inset-1 bg-gradient-to-br from-rose-500 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity"></div>
                   <Avatar className="w-32 h-32 sm:w-36 sm:h-36 border-[6px] border-white shadow-xl relative">
                     <AvatarImage src={userProfile.profile.image || ''} alt={userProfile.profile.name} className="object-cover" />
                     <AvatarFallback className="text-4xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-black">
                       {userProfile.profile.name?.charAt(0) || '?'}
                     </AvatarFallback>
                   </Avatar>
                 </div>

                 <div className="flex-1 text-center sm:text-left mb-2">
                   <h1 className="text-3xl font-black text-gray-900 tracking-tight">{userProfile.profile.name}</h1>
                   <p className="text-rose-500 font-medium">{userProfile.profile.email}</p>
                 </div>
                 
                 <Button 
                   onClick={() => router.push('/dashboard/settings/profile')}
                   className="rounded-full bg-gray-900 hover:bg-gray-800 text-white font-bold shadow-lg shadow-gray-200 hover:shadow-xl transition-all hover:-translate-y-0.5 px-6 mb-2"
                 >
                   Edit Profile
                 </Button>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
             { title: "Hobbies", icon: HeartIcon, color: "text-rose-500", bg: "bg-rose-50", link: "/onboarding/hobbies" },
             { title: "Locations", icon: MapPinIcon, color: "text-indigo-500", bg: "bg-indigo-50", link: "/onboarding/locations" },
             { title: "Language", icon: GlobeIcon, color: "text-amber-500", bg: "bg-amber-50", action: toggleLanguage },
             { title: "Privacy", icon: ShieldIcon, color: "text-emerald-500", bg: "bg-emerald-50", link: "#privacy" }
          ].map((item, i) => (
            <button 
              key={i}
              onClick={() => item.link ? router.push(item.link) : item.action?.()}
              className="group flex flex-col items-center justify-center p-4 bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300"
            >
               <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                 <item.icon className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold text-gray-700">{item.title}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          
          <section className="space-y-3">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-4">Notifications</h3>
             <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-lg shadow-indigo-50/50 rounded-[2rem] overflow-hidden">
                <CardContent className="p-6 divide-y divide-gray-100">
                   <SettingRow 
                     icon={BellIcon} 
                     title="Pause Notifications" 
                     subtitle="Temporarily mute all alerts"
                     action={<Toggle active={!notificationsEnabled} onClick={() => setNotificationsEnabled(!notificationsEnabled)} />} 
                   />
                   <SettingRow 
                     icon={GlobeIcon} 
                     title="Email Digests" 
                     subtitle="Weekly summary of your matches"
                     action={<Toggle active={emailNotifications} onClick={() => setEmailNotifications(!emailNotifications)} />} 
                   />
                   <SettingRow 
                     icon={MapPinIcon} 
                     title="Push Notifications" 
                     subtitle="Real-time alerts on your device"
                     action={<Toggle active={pushNotifications} onClick={() => setPushNotifications(!pushNotifications)} />} 
                   />
                </CardContent>
             </Card>
          </section>

           <section className="space-y-3">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-4">Privacy</h3>
             <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-lg shadow-indigo-50/50 rounded-[2rem] overflow-hidden">
                <CardContent className="p-6 divide-y divide-gray-100">
                   <SettingRow 
                     icon={LockIcon} 
                     title="Private Profile" 
                     subtitle="Hide details from non-matches"
                     action={<Toggle active={privateProfile} onClick={() => setPrivateProfile(!privateProfile)} />} 
                   />
                   <SettingRow 
                     icon={MapPinIcon} 
                     title="Show Distance" 
                     subtitle="Visible to people nearby"
                     action={<Toggle active={showLocation} onClick={() => setShowLocation(!showLocation)} />} 
                   />
                </CardContent>
             </Card>
          </section>

          <section className="space-y-3 pt-4">
             <Button 
               variant="outline" 
               onClick={handleLogout}
               className="w-full h-14 rounded-2xl border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-bold text-lg flex items-center justify-center gap-2"
             >
               <LogOutIcon className="w-5 h-5" /> Log Out
             </Button>
             
             <Button 
               variant="ghost" 
               className="w-full h-12 rounded-2xl text-red-400 hover:text-red-600 hover:bg-red-50 font-semibold text-sm flex items-center justify-center gap-2"
               onClick={() => alert("Delete account flow")}
             >
               <TrashIcon className="w-4 h-4" /> Delete Account
             </Button>
          </section>

        </div>
      </div>
    </div>
  );
}
