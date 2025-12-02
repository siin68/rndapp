'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, Input, Textarea, Button } from '@/components/ui';
import { HOBBIES } from '@/constants/hobbies';
import { LOCATIONS } from '@/constants/locations';

export default function CreateInvitePage() {
  const t = useTranslations('dashboard.createInvite');
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hobbyId: '',
    locationId: '',
    date: '',
    time: '',
    maxParticipants: '5',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create event logic here
    console.log('Creating event:', formData);
    router.push('/dashboard/my-events');
  };

  // Decorative icon for the select arrow
  const ChevronDownIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="text-rose-400"
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Decorative background blobs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl -z-10 mix-blend-multiply animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10 mix-blend-multiply animate-pulse delay-700" />

      <div className="w-full max-w-2xl">
        <div className="text-center mb-10 space-y-2">
          <span className="inline-block py-1 px-3 rounded-full bg-rose-100 text-rose-600 text-xs font-bold tracking-widest uppercase mb-2">
            Make a Connection
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 drop-shadow-sm">
            {t('title')}
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Create a moment worth sharing
          </p>
        </div>

        <Card className="border-0 shadow-2xl shadow-rose-100/50 bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500" />
          
          <CardContent className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Title Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {t('eventTitle')}
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Sunday Brunch & Art 🎨"
                    required
                    className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 px-5 text-lg font-medium text-gray-800 placeholder:text-gray-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {t('description')}
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Tell them what makes this meetup special..."
                    rows={4}
                    required
                    className="min-h-[120px] rounded-2xl border-gray-200 bg-gray-50/50 p-5 text-base text-gray-800 placeholder:text-gray-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300 resize-none"
                  />
                </div>
              </div>

              {/* Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {t('hobby')}
                  </label>
                  <div className="relative group">
                    <select
                      value={formData.hobbyId}
                      onChange={(e) => setFormData({ ...formData, hobbyId: e.target.value })}
                      className="w-full h-14 appearance-none rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-base font-medium text-gray-800 focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all duration-300 cursor-pointer hover:bg-white"
                      required
                    >
                      <option value="">Select a vibe...</option>
                      {HOBBIES.map((hobby) => (
                        <option key={hobby.id} value={hobby.id}>
                           {hobby.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 group-hover:translate-y-0.5 transition-transform">
                      <ChevronDownIcon />
                    </div>
                    {/* Floating icon if hobby selected - strictly cosmetic logic based on mapping would go here, simplified for now */}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {t('location')}
                  </label>
                  <div className="relative group">
                    <select
                      value={formData.locationId}
                      onChange={(e) =>
                        setFormData({ ...formData, locationId: e.target.value })
                      }
                      className="w-full h-14 appearance-none rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-base font-medium text-gray-800 focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all duration-300 cursor-pointer hover:bg-white"
                      required
                    >
                      <option value="">Where are we going?</option>
                      {LOCATIONS.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name} • {location.city}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 group-hover:translate-y-0.5 transition-transform">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time Pill Container */}
              <div className="bg-rose-50/50 p-6 rounded-3xl space-y-4 border border-rose-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest ml-1">
                      {t('date')}
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="h-12 rounded-xl border-rose-200 bg-white text-gray-700 focus:border-rose-400 focus:ring-rose-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest ml-1">
                      {t('time')}
                    </label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                      className="h-12 rounded-xl border-rose-200 bg-white text-gray-700 focus:border-rose-400 focus:ring-rose-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                     <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest">
                      {t('maxParticipants')}
                    </label>
                    <span className="text-xs font-medium text-rose-400 bg-rose-100 px-2 py-0.5 rounded-full">
                      {formData.maxParticipants} People
                    </span>
                  </div>
                  
                  <Input
                    type="range"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      setFormData({ ...formData, maxParticipants: e.target.value })
                    }
                    min="2"
                    max="20"
                    required
                    className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-[10px] text-rose-300 font-medium px-1">
                    <span>Intimate (2)</span>
                    <span>Party (20)</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="flex-1 h-14 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-semibold transition-colors"
                >
                  {t('cancel')}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-[2] h-14 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-lg shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transform transition-all hover:-translate-y-0.5 active:scale-95"
                >
                   {t('publish')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}