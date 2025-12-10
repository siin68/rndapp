"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CameraIcon, UserIcon, ArrowRightIcon } from "@/icons/icons";
import { uploadToCloudinaryClient } from "@/lib/cloudinary";
// import { uploadToCloudinaryClient } from "@/lib/cloudinary";

export default function OnboardingProfilePage() {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!session?.user) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/onboarding-status");
        const result = await response.json();

        if (result.success && !result.needsOnboarding) {
          router.push("/dashboard");
          return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    try {
      setUploadingImage(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const imageUrl = await uploadToCloudinaryClient(file);

      setFormData((prev) => ({ ...prev, image: imageUrl }));
      setImagePreview(imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);

      setImagePreview(formData.image);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      console.error('No user session');
      return;
    }

    setIsSubmitting(true);
    try {
      localStorage.setItem("onboarding-profile", JSON.stringify(formData));
      
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          name: formData.name,
          age: parseInt(formData.age) || null,
          gender: formData.gender.toUpperCase(),
          bio: formData.bio,
          image: formData.image,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      router.push(`/onboarding/hobbies`);
    } catch (error) {
      console.error('Error updating profile:', error);
      router.push(`/onboarding/hobbies`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-100/50 rounded-full blur-[100px] -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px] -z-10" />

      <div className="max-w-xl mx-auto w-full relative z-10">
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
              disabled={isSubmitting || uploadingImage}
              className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white text-lg font-bold shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  {tCommon("next")}
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
