"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import {
  Button,
  Input,
  Textarea,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui";
import { uploadToCloudinaryClient } from "@/lib/cloudinary";

// Icons
const CameraIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);
const UserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default function ProfileStep() {
  const t = useTranslations("onboarding.profile");
  const tCommon = useTranslations("onboarding");
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male" as "male" | "female" | "other",
    bio: "",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!session?.user) {
        console.log("No session, staying on onboarding");
        setCheckingOnboarding(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/onboarding-status");
        const result = await response.json();
        console.log("result: ", result);

        if (result.success && !result.needsOnboarding) {
          console.log(
            "User has already completed onboarding, redirecting to dashboard"
          );
          router.push("/dashboard");
          return;
        } else {
          console.log("User needs onboarding, staying on page");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setCheckingOnboarding(false);
      }
    }

    checkOnboardingStatus();
  }, [session?.user, router]);

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        image: session.user.image || "",
      }));
      if (session.user.image) {
        setImagePreview(session.user.image);
      }
    }
  }, [session]);

  // Show loading while checking onboarding
  if (checkingOnboarding) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking profile status...</p>
        </div>
      </div>
    );
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary using client-side upload
      const imageUrl = await uploadToCloudinaryClient(file);
      
      // Update form data with the uploaded image URL
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      setImagePreview(imageUrl);
      
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
      
      // Reset to previous state if upload fails
      setImagePreview(formData.image);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("onboarding-profile", JSON.stringify(formData));
    router.push(`/onboarding/hobbies`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-100/50 rounded-full blur-[100px] -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px] -z-10" />

      <div className="max-w-xl mx-auto w-full relative z-10">
        {/* Progress Header */}
        <div className="mb-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-2 w-12 rounded-full bg-gradient-to-r from-rose-500 to-purple-600"></div>
            <div className="h-2 w-12 rounded-full bg-gray-200"></div>
            <div className="h-2 w-12 rounded-full bg-gray-200"></div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-500 max-w-sm mx-auto">
            Lets start with the basics. Who are you?
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-purple-50/50 p-8 md:p-10 border border-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 to-purple-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg relative z-10">
                  <AvatarImage src={imagePreview} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 text-4xl font-bold">
                    {formData.name.charAt(0) || (
                      <UserIcon className="w-10 h-10 opacity-50" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <label
                  className={`absolute bottom-1 right-1 z-20 hover:scale-110 transition-transform cursor-pointer ${
                    uploadingImage ? "pointer-events-none" : ""
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <div
                    className={`w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg border-2 border-white ${
                      uploadingImage ? "animate-pulse" : ""
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CameraIcon className="w-5 h-5" />
                    )}
                  </div>
                </label>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-400">
                {uploadingImage ? "Uploading photo..." : "Tap to upload photo"}
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                  {t("name")}
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g. Alex Doe"
                  className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all font-semibold text-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                    {t("age")}
                  </label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    required
                    min="18"
                    max="100"
                    placeholder="18+"
                    className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all font-semibold text-lg text-center"
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                    {t("gender")}
                  </label>
                  <div className="flex bg-gray-50 rounded-2xl p-1.5 h-14">
                    {(["male", "female", "other"] as const).map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender })}
                        className={`
                            flex-1 rounded-xl text-sm font-bold transition-all capitalize
                            ${
                              formData.gender === gender
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                            }
                          `}
                      >
                        {gender === "male"
                          ? "Him"
                          : gender === "female"
                          ? "Her"
                          : "Them"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                  {t("bio")}
                </label>
                <Textarea
                  placeholder={t("bioPlaceholder")}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={3}
                  required
                  className="resize-none rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all font-medium text-base p-4"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white text-lg font-bold shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
            >
              {tCommon("next")}
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
