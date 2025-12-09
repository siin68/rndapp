'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Button, Input, Textarea } from '@/components/ui';
import { uploadToCloudinaryClient } from '@/lib/cloudinary';
import { toast } from 'react-toastify';

const CameraIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
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
  const hasLoadedRef = useRef(false);

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      if (hasLoadedRef.current || !session?.user?.email) {
        if (session?.user?.email) setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/profile/update');
        
        if (!response.ok) throw new Error('Failed to load profile');
        
        const result = await response.json();
        
        if (result.success && result.data) {
          const userData = {
            name: result.data.name || '',
            age: result.data.age?.toString() || '',
            gender: result.data.gender || 'male',
            bio: result.data.bio || '',
            image: result.data.image || '',
          };
          
          setInitialData(userData);
          setFormData(userData);
          setImagePreview(userData.image);
          hasLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('❌ Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  useEffect(() => {
    if (!initialData) return;
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    setIsDirty(isChanged);
  }, [formData, initialData]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('❌ Image must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('❌ Please upload an image file');
      return;
    }

    try {
      setIsUploading(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      const cloudinaryUrl = await uploadToCloudinaryClient(file);
      
      setFormData({ ...formData, image: cloudinaryUrl });
      
      
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('❌ Failed to upload image');
      setImagePreview(initialData?.image || '');
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('❌ Name is required');
      return false;
    }
    if (formData.name.trim().length < 2) {
      toast.error('❌ Name must be at least 2 characters');
      return false;
    }
    if (formData.name.trim().length > 50) {
      toast.error('❌ Name must be less than 50 characters');
      return false;
    }

    if (!formData.age) {
      toast.error('❌ Age is required');
      return false;
    }
    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 18) {
      toast.error('❌ You must be at least 18 years old');
      return false;
    }
    if (ageNum > 100) {
      toast.error('❌ Please enter a valid age');
      return false;
    }

    if (formData.bio.length > 500) {
      toast.error('❌ Bio must be less than 500 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          age: parseInt(formData.age),
          gender: formData.gender,
          bio: formData.bio.trim(),
          image: formData.image,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const result = await response.json();
      
      setInitialData(formData);
      setIsDirty(false);
      
      toast.success('✅ Profile updated!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`❌ ${error instanceof Error ? error.message : 'Update failed'}`);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setImagePreview(initialData.image);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-rose-500"></div>
        </div>
      </div>
    );
  }

  if (!initialData) return null;

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
                 
                 <div className="w-32 h-32 border-[4px] border-white shadow-xl relative z-10 rounded-full overflow-hidden bg-gray-100">
                  {imagePreview && (
                    <Image 
                      key={imagePreview} 
                      src={imagePreview} 
                      alt="Profile" 
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                
                <label className="absolute bottom-0 right-0 z-20 hover:scale-105 transition-transform cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-gray-700 flex items-center justify-center shadow-lg border border-white hover:text-rose-500 transition-colors">
                    {isUploading ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <CameraIcon className="w-5 h-5" />
                    )}
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
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name *</label>
                 <div className="relative group">
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="h-14 px-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all font-semibold text-gray-800 text-lg placeholder:text-gray-300"
                      minLength={2}
                      maxLength={50}
                      required
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-rose-300 opacity-0 group-focus-within:opacity-100 transition-opacity">
                      <SparklesIcon className="w-5 h-5" />
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Age *</label>
                     <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        min={18}
                        max={100}
                        className="h-14 rounded-2xl bg-white border border-gray-100 shadow-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all font-semibold text-center text-lg text-gray-800"
                        required
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
                    maxLength={500}
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
                 type="button"
                 className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
               >
                 Reset
               </button>
               <Button 
                 onClick={handleSubmit}
                 type="button"
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