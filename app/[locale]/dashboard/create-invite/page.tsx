"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, Input, Textarea, Button } from "@/components/ui";
import { useSession } from "next-auth/react";

// --- Icons ---
const CameraIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// --- Data will be fetched from API ---



interface Hobby {
  id: string;
  name: string;
  emoji: string;
  isActive: boolean;
}

interface Location {
  id: string;
  name: string;
  nameVi: string;
  city: {
    id: string;
    name: string;
    nameVi: string;
  };
  isActive: boolean;
}

export default function CreateInvitePage() {
  const t = useTranslations("dashboard.createInvite");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const editEventId = searchParams.get("edit"); // Get event ID from query param
  const isEditMode = !!editEventId;

  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    hobbyIds: [] as string[], // Back to array for multiple selection
    locationId: "",
    date: "",
    time: "",
    maxParticipants: "8",
  });

  // UI State
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch Data
  useEffect(() => {
    async function fetchData() {
      try {
        const [hobbiesRes, locationsRes] = await Promise.all([
          fetch("/api/hobbies"),
          fetch("/api/locations"),
        ]);

        const hobbiesData = await hobbiesRes.json();
        const locationsData = await locationsRes.json();

        if (hobbiesData.success) {
          setHobbies(hobbiesData.data || []);
        }

        if (locationsData.success) {
          setLocations(locationsData.data || []);
        }

        // If edit mode, fetch existing event data
        if (isEditMode && editEventId) {
          const eventRes = await fetch(`/api/events/${editEventId}`);
          const eventData = await eventRes.json();
          
          if (eventData.success && eventData.data) {
            const event = eventData.data;
            
            // Parse date and time
            const eventDate = new Date(event.date);
            const dateStr = eventDate.toISOString().split('T')[0];
            const timeStr = eventDate.toTimeString().slice(0, 5);
            
            // Extract hobby IDs from event hobbies
            const hobbyIds = event.hobbies?.map((h: any) => h.hobby?.id || h.hobbyId) || [];
            
            setFormData({
              title: event.title || "",
              description: event.description || "",
              image: event.image || "",
              hobbyIds: hobbyIds,
              locationId: event.locationId || "",
              date: dateStr,
              time: timeStr,
              maxParticipants: String(event.maxParticipants || 8),
            });
            
            if (event.image) {
              setImagePreview(event.image);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setHobbies([]);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isEditMode, editEventId]);

  // --- Image Handling ---
  const handleFileSelect = async (file: File) => {
    setUploading(true);
    
    // Preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const result = await response.json();

      if (result.success) {
        setFormData((prev) => ({ ...prev, image: result.data.url }));
      } else {
        alert("Failed to upload image");
        removeImage();
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
      removeImage();
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  // --- Logic ---
  const toggleHobby = (id: string) => {
    setFormData((prev) => {
      const exists = prev.hobbyIds.includes(id);
      return {
        ...prev,
        hobbyIds: exists 
          ? prev.hobbyIds.filter(hId => hId !== id) 
          : [...prev.hobbyIds, id]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = session?.user as any;
    if (!user?.id) {
      alert("You must be logged in to create an event");
      return;
    }

    if (!formData.hobbyIds || formData.hobbyIds.length === 0) {
      alert("Please select at least one vibe/hobby!");
      return;
    }

    setSubmitting(true);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        image: formData.image || undefined,
        hostId: user.id,
        hobbyIds: formData.hobbyIds, // Send array to API
        locationId: formData.locationId,
        date: `${formData.date}T${formData.time}:00.000Z`,
        maxParticipants: parseInt(formData.maxParticipants),
        minParticipants: 2,
        isPrivate: false,
        requiresApproval: false,
      };

      // Use PUT for edit mode, POST for create mode
      const url = isEditMode ? `/api/events/${editEventId}` : "/api/events";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/dashboard/my-events");
      } else {
        alert(result.error || `Failed to ${isEditMode ? 'update' : 'create'} event`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} event`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full px-4 sm:px-6 lg:px-8 pb-6 md:pb-28 flex justify-center overflow-y-auto">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
         <div className="absolute top-[5%] right-[10%] w-64 h-64 bg-rose-200/30 rounded-full blur-[80px] mix-blend-multiply animate-pulse" />
         <div className="absolute bottom-[5%] left-[10%] w-80 h-80 bg-purple-200/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-4xl">
        <div className="mb-6 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/60 backdrop-blur-sm border border-rose-100 text-rose-500 text-[10px] font-bold tracking-widest uppercase mb-2 shadow-sm">
            {isEditMode ? "✏️ Edit Your Event" : "✨ Design Your Date"}
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 drop-shadow-sm mb-2">
            {isEditMode ? "Edit Event" : (t("title") || "Create Invite")}
          </h1>
          <p className="text-sm text-gray-500 font-medium max-w-xl mx-auto">
            {isEditMode ? "Update your event details and settings." : "Find someone who loves what you love. Start by setting the scene."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            <div className="lg:col-span-7 space-y-4">
              <div 
                className={`
                  relative group aspect-[16/9] rounded-3xl overflow-hidden transition-all duration-300 border-2
                  ${isDragging ? 'border-rose-400 scale-[1.02] shadow-xl shadow-rose-200/50' : 'border-transparent shadow-lg shadow-rose-100/50'}
                  bg-white
                `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <label htmlFor="image-upload" className="cursor-pointer opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/20 backdrop-blur-md border border-white/40 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/30">
                        <CameraIcon className="w-4 h-4" /> Change Photo
                      </label>
                    </div>
                    <button type="button" onClick={removeImage} className="absolute top-3 right-3 p-1.5 bg-white/90 text-gray-800 rounded-full shadow-lg hover:bg-rose-50 hover:text-rose-500 transition-colors">
                      <XIcon className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-center p-4">
                    <div className={`w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-3 transition-transform duration-300 ${isDragging ? 'scale-110 text-rose-500' : 'text-gray-400'}`}>
                      <CameraIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">Add Cover Photo</h3>
                    <p className="text-gray-400 text-xs mb-4 max-w-xs">Drag and drop or browse to upload.</p>
                    <label 
                      htmlFor="image-upload" 
                      className="cursor-pointer bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 hover:shadow-lg transition-all active:scale-95"
                    >
                      {uploading ? "Uploading..." : "Browse Files"}
                    </label>
                  </div>
                )}
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                  disabled={uploading} 
                />
              </div>

              <Card className="border-0 shadow-lg shadow-rose-100/50 bg-white/80 backdrop-blur-xl rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <HeartIcon className="w-4 h-4 text-rose-500" />
                      What&apos;s the vibe?
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-50 px-2 py-0.5 rounded-full">
                      Multi-select
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {hobbies.map((hobby) => {
                      const isSelected = formData.hobbyIds?.includes(hobby.id);
                      return (
                        <button
                          key={hobby.id}
                          type="button"
                          onClick={() => toggleHobby(hobby.id)}
                          className={`
                            group relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300
                            ${isSelected 
                              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 scale-105" 
                              : "bg-gray-50 text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900"
                            }
                          `}
                        >
                          <span className="text-sm">{hobby.emoji}</span>
                          {hobby.name}
                          {isSelected && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {(!formData.hobbyIds || formData.hobbyIds.length === 0) && (
                    <p className="mt-3 text-xs text-gray-400 italic">Select at least one interest to help find your match.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <Card className="border-0 shadow-lg shadow-indigo-100/50 bg-white rounded-2xl overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-rose-400 via-purple-500 to-indigo-500" />
                <CardContent className="p-5 space-y-5">
                  
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Title</label>
                      <Input
                        placeholder="e.g. Sunday Brunch & Books"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50 px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                      <Textarea
                        placeholder="Tell people what to expect..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={3}
                        className="rounded-xl border-gray-100 bg-gray-50/50 p-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                      <CalendarIcon className="w-3.5 h-3.5" /> The Plan
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider ml-1">Date</label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                          className="h-9 rounded-lg border-transparent bg-white shadow-sm font-medium text-xs focus:border-rose-400 focus:ring-rose-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider ml-1">Time</label>
                        <Input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          required
                          className="h-9 rounded-lg border-transparent bg-white shadow-sm font-medium text-xs focus:border-rose-400 focus:ring-rose-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider ml-1">Location</label>
                      <div className="relative">
                        <select
                          value={formData.locationId}
                          onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                          className="w-full h-9 appearance-none rounded-lg border-transparent bg-white shadow-sm px-3 text-xs font-medium text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                          required
                        >
                          <option value="">Select a spot...</option>
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.name} • {loc.city.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-rose-400">
                          <MapPinIcon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider ml-1">Max People</label>
                        <span className="text-sm font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-lg">{formData.maxParticipants}</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="100"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-600 transition-all [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:bg-rose-600 [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-all"
                      />
                      <div className="flex justify-between text-[8px] text-gray-400 font-medium px-1">
                        <button type="button" onClick={() => setFormData({ ...formData, maxParticipants: "2" })} className="hover:text-rose-500 hover:font-bold transition-all cursor-pointer">2</button>
                        <button type="button" onClick={() => setFormData({ ...formData, maxParticipants: "25" })} className="hover:text-rose-500 hover:font-bold transition-all cursor-pointer">25</button>
                        <button type="button" onClick={() => setFormData({ ...formData, maxParticipants: "50" })} className="hover:text-rose-500 hover:font-bold transition-all cursor-pointer">50</button>
                        <button type="button" onClick={() => setFormData({ ...formData, maxParticipants: "75" })} className="hover:text-rose-500 hover:font-bold transition-all cursor-pointer">75</button>
                        <button type="button" onClick={() => setFormData({ ...formData, maxParticipants: "100" })} className="hover:text-rose-500 hover:font-bold transition-all cursor-pointer">100</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.back()}
                      className="flex-1 h-10 rounded-xl text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] h-10 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transform transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70"
                    >
                      {submitting 
                        ? (isEditMode ? "Updating..." : "Publishing...") 
                        : (isEditMode ? "Update Event" : "Publish Invite")
                      }
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
