"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent, Input, Textarea, Button } from "@/components/ui";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();

  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    hobbyId: "",
    locationId: "",
    date: "",
    time: "",
    duration: "120",
    maxParticipants: "8",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Fetch hobbies and locations
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
          setHobbies(hobbiesData.data);
        }

        if (locationsData.success) {
          setLocations(locationsData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle image file selection and upload to Cloudinary
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setUploading(true);

      // Create preview URL for immediate display
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          // Update form data with Cloudinary URL
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
    }
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, image: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      alert("You must be logged in to create an event");
      return;
    }

    setSubmitting(true);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        image: formData.image || undefined,
        hostId: session.user.id,
        hobbyId: formData.hobbyId,
        locationId: formData.locationId,
        date: `${formData.date}T${formData.time}:00.000Z`,
        duration: parseInt(formData.duration),
        maxParticipants: parseInt(formData.maxParticipants),
        minParticipants: 2,
        price: 0,
        isPrivate: false,
        requiresApproval: false,
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/dashboard/my-events");
      } else {
        alert(result.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event");
    } finally {
      setSubmitting(false);
    }
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
      <path d="m6 9 6 6 6-6" />
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
            {t("title")}
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
                    Event Title
                  </label>
                  <Input
                    placeholder="What's the vibe?"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 px-5 text-base font-medium text-gray-800 placeholder:text-gray-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Event Cover Image (Optional)
                  </label>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Event preview"
                        className="w-full h-48 object-cover rounded-2xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* File Input */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex items-center justify-center h-14 rounded-2xl border-2 border-dashed transition-colors group ${
                        uploading
                          ? "border-blue-300 bg-blue-50/50 cursor-wait"
                          : "border-gray-300 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer"
                      }`}
                    >
                      <div className="text-center">
                        {uploading ? (
                          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        ) : (
                          <svg
                            className="mx-auto h-6 w-6 text-gray-400 group-hover:text-gray-500"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        <p
                          className={`text-sm font-medium ${
                            uploading ? "text-blue-600" : "text-gray-500"
                          }`}
                        >
                          {uploading
                            ? "Uploading..."
                            : imagePreview
                            ? "Change image"
                            : "Upload cover image"}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Description
                  </label>
                  <Textarea
                    placeholder="Tell people what to expect..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
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
                    {t("hobby")}
                  </label>
                  <div className="relative group">
                    <select
                      value={formData.hobbyId}
                      onChange={(e) =>
                        setFormData({ ...formData, hobbyId: e.target.value })
                      }
                      className="w-full h-14 appearance-none rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-base font-medium text-gray-800 focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all duration-300 cursor-pointer hover:bg-white"
                      required
                      disabled={loading}
                    >
                      <option value="">
                        {loading ? "Loading hobbies..." : "Select a vibe..."}
                      </option>
                      {hobbies.map((hobby) => (
                        <option key={hobby.id} value={hobby.id}>
                          {hobby.emoji} {hobby.name}
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
                    {t("location")}
                  </label>
                  <div className="relative group">
                    <select
                      value={formData.locationId}
                      onChange={(e) =>
                        setFormData({ ...formData, locationId: e.target.value })
                      }
                      className="w-full h-14 appearance-none rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-base font-medium text-gray-800 focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all duration-300 cursor-pointer hover:bg-white"
                      required
                      disabled={loading}
                    >
                      <option value="">
                        {loading
                          ? "Loading locations..."
                          : "Where are we going?"}
                      </option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name} • {location.city.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 group-hover:translate-y-0.5 transition-transform">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50/50 p-6 rounded-3xl space-y-4 border border-rose-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest ml-1">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                      className="h-12 rounded-xl border-rose-200 bg-white text-gray-700 focus:border-rose-400 focus:ring-rose-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest ml-1">
                      Time
                    </label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      required
                      className="h-12 rounded-xl border-rose-200 bg-white text-gray-700 focus:border-rose-400 focus:ring-rose-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest ml-1">
                      Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      min="30"
                      max="480"
                      step="30"
                      required
                      className="h-12 rounded-xl border-rose-200 bg-white text-gray-700 focus:border-rose-400 focus:ring-rose-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest ml-1">
                      Max Participants
                    </label>
                    <Input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxParticipants: e.target.value,
                        })
                      }
                      min="2"
                      max="50"
                      required
                      className="h-12 rounded-xl border-rose-200 bg-white text-gray-700 focus:border-rose-400 focus:ring-rose-200"
                    />
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
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] h-14 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-lg shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transform transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  {t("publish")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
