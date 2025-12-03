'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, Button, Input, Textarea, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';

// Icons
const CameraIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Initial state tracking
  const [initialData, setInitialData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    bio: '',
    image: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Load initial data
  useEffect(() => {
    if (session && !initialData) {
      const data = {
        name: session.user?.name || '',
        age: '25', // Mock existing data
        gender: 'male',
        bio: 'Hello! I love meeting new people and sharing hobbies.',
        image: session.user?.image || '',
      };
      // @ts-ignore
      setInitialData(data);
      // @ts-ignore
      setFormData(data);
      setImagePreview(data.image);
    }
  }, [session, initialData]);

  // Check for changes
  useEffect(() => {
    if (!initialData) return;
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    setIsDirty(isChanged);
  }, [formData, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving profile:', formData);
    // Simulate save
    setTimeout(() => {
      setInitialData(formData);
      setIsDirty(false);
      // Optional: Show success toast
    }, 500);
  };

  const handleReset = () => {
    setFormData(initialData);
    setImagePreview(initialData.image);
  };

  if (!initialData) return null; // Or a loading spinner

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-rose-100/40 to-transparent rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-purple-100/40 to-transparent rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-xl mx-auto space-y-8 relative z-10 pb-24">
        
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Edit Profile</h1>
          <div className="w-10" /> 
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="flex flex-col items-center justify-center gap-4">
               <div className="relative group cursor-pointer">
                 <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                 
                 <Avatar className="w-32 h-32 border-[4px] border-white shadow-xl relative z-10">
                  <AvatarImage src={imagePreview} alt="Profile" className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-rose-50 to-purple-50 text-rose-400 text-4xl font-black">
                    {formData.name.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <label className="absolute bottom-0 right-0 z-20 hover:scale-105 transition-transform cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-gray-700 flex items-center justify-center shadow-lg border border-white hover:text-rose-500 transition-colors">
                    <CameraIcon className="w-5 h-5" />
                  </div>
                </label>
               </div>
               
               <div className="text-center">
                 <h2 className="text-2xl font-black text-gray-800 tracking-tight">{formData.name || 'Your Name'}</h2>
                 <p className="text-sm text-gray-500 font-medium">@{session?.user?.email?.split('@')[0]}</p>
               </div>
          </div>

          <div className="space-y-6">
             <div className="space-y-4">
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                 <div className="relative group">
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="h-14 px-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all font-semibold text-gray-800 text-lg placeholder:text-gray-300"
                      required
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-rose-300 opacity-0 group-focus-within:opacity-100 transition-opacity">
                      <SparklesIcon className="w-5 h-5" />
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Age</label>
                     <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="h-14 rounded-2xl bg-white border border-gray-100 shadow-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all font-semibold text-center text-lg text-gray-800"
                      />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Gender</label>
                     <div className="relative h-14">
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                          className="w-full h-full rounded-2xl bg-white border border-gray-100 shadow-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-none transition-all font-semibold text-gray-800 px-4 appearance-none"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-1.5">
                 <div className="flex justify-between items-center ml-1">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bio</label>
                   <span className={`text-[10px] font-bold ${formData.bio.length > 450 ? 'text-red-500' : 'text-gray-300'}`}>
                     {formData.bio.length}/500
                   </span>
                 </div>
                 <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us what makes you tick..."
                    rows={6}
                    className="resize-none rounded-2xl bg-white border border-gray-100 shadow-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all font-medium text-gray-700 p-4 text-base leading-relaxed"
                  />
               </div>
             </div>
          </div>
        </form>
      </div>

      <div 
        className={`
          fixed bottom-28 left-0 right-0 z-50 flex justify-center px-4
          transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275)
          ${isDirty ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'}
        `}
      >
         <div className="bg-gray-900/90 backdrop-blur-xl text-white pl-6 pr-2 py-2 rounded-full shadow-2xl shadow-gray-400/50 flex items-center gap-6 border border-white/10 max-w-sm w-full">
            <span className="text-sm font-medium text-gray-300 flex-1 truncate">
              Unsaved changes
            </span>
            <div className="flex items-center gap-2 shrink-0">
               <button 
                 onClick={handleReset}
                 className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
               >
                 Reset
               </button>
               <Button 
                 onClick={handleSubmit}
                 className="rounded-full bg-white text-gray-900 hover:bg-gray-200 font-bold px-6 py-2 shadow-lg transition-transform active:scale-95"
               >
                 Save
               </Button>
            </div>
         </div>
      </div>

    </div>
  );
}