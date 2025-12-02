"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui";
import { LOCATIONS } from "@/constants/locations";
import {
  getCurrentUserLocation,
  calculateDistance,
  getLocationCoordinates,
  suggestNearestLocations,
  formatDistance,
  isLocationNearby,
  UserLocation,
} from "@/lib/locationUtils";

export default function LocationsStep() {
  const t = useTranslations("onboarding.locations");
  const tCommon = useTranslations("onboarding");
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const { data: session } = useSession();

  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

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
    if (checkingOnboarding) return;

    const savedLocations = localStorage.getItem("onboarding-locations");
    if (savedLocations) {
      setSelectedLocations(JSON.parse(savedLocations));
    }
  }, [checkingOnboarding]);

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-100/50 rounded-full blur-[100px] -z-10" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px] -z-10" />

        <div className="max-w-xl mx-auto w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  const toggleLocation = (locationId: string) => {
    if (selectedLocations.includes(locationId)) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations([locationId]); // Only allow 1 selection
    }
  };

  // Lấy vị trí hiện tại của user
  const getCurrentLocation = async () => {
    setGettingLocation(true);
    setError(null);

    try {
      const location = await getCurrentUserLocation();
      setUserLocation(location);

      // Tự động chọn location gần nhất (chỉ 1 location)
      // Map English city names to Vietnamese names for coordinate lookup
      const cityNameMap: { [key: string]: string } = {
        "Ho Chi Minh": "Hồ Chí Minh",
        Hanoi: "Hà Nội",
        "Da Nang": "Đà Nẵng",
        Tokyo: "Tokyo",
      };

      const locationsWithDistance = LOCATIONS.map((loc) => {
        const vietnameseCityName = cityNameMap[loc.city] || loc.city;
        const coords = getLocationCoordinates(vietnameseCityName);
        if (!coords) return null;

        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          coords.lat,
          coords.lng
        );
        return { ...loc, distance };
      })
        .filter(
          (loc): loc is typeof loc & { distance: number } =>
            loc !== null && loc.distance <= 100
        )
        .sort((a, b) => a.distance - b.distance);

      if (locationsWithDistance.length > 0) {
        setSelectedLocations([locationsWithDistance[0].id]);
      }
    } catch (error: any) {
      console.error("Error getting location:", error);
      setError(
        error.message ||
          "Không thể lấy vị trí hiện tại. Vui lòng chọn thủ công."
      );
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedLocations.length !== 1 || !session?.user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const profileData = localStorage.getItem("onboarding-profile");
      const hobbiesData = localStorage.getItem("onboarding-hobbies");

      const profile = profileData ? JSON.parse(profileData) : {};
      const hobbies = hobbiesData ? JSON.parse(hobbiesData) : [];

      const onboardingData = {
        profile: {
          name: profile.name,
          age: profile.age ? parseInt(profile.age) : null,
          gender: profile.gender?.toUpperCase(),
          bio: profile.bio,
        },
        hobbies: hobbies,
        locations: selectedLocations,
      };

      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(onboardingData),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.removeItem("onboarding-profile");
        localStorage.removeItem("onboarding-hobbies");
        localStorage.removeItem("onboarding-locations");

        router.push("/dashboard");
      } else {
        setError(result.error || "Failed to save profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Blobs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-[120px] -z-10 mix-blend-multiply animate-pulse" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse delay-700" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Progress Header */}
        <div className="mb-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-2 w-12 rounded-full bg-gradient-to-r from-rose-500 to-purple-600"></div>
            <div className="h-2 w-12 rounded-full bg-gradient-to-r from-rose-500 to-purple-600"></div>
            <div className="h-2 w-12 rounded-full bg-gradient-to-r from-rose-500 to-purple-600"></div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            Chọn 1 địa điểm để tham gia các hoạt động meetup
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/50">
            <span className="text-sm font-semibold text-primary-700">
              {selectedLocations.length > 0
                ? "✅ Đã chọn 1 vị trí"
                : "📍 Chọn 1 vị trí"}
            </span>
          </div>
        </div>

        {/* Current Location Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-purple-50/50 p-6 md:p-8 border border-white mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Vị trí hiện tại</h3>
                <p className="text-sm text-gray-500">
                  Tự động chọn địa điểm gần bạn nhất
                </p>
              </div>
            </div>

            <Button
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              variant="outline"
              className="flex items-center gap-2 bg-white/50 hover:bg-white/80 border-emerald-200 hover:border-emerald-300"
            >
              {gettingLocation ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="3,11 22,2 13,21 11,13 3,11"></polygon>
                </svg>
              )}
              {gettingLocation ? "Đang định vị..." : "📍 Lấy vị trí"}
            </Button>
          </div>

          {userLocation && (
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-emerald-700 font-medium">
                ✅ Đã xác định vị trí
                {userLocation.city ? ` tại ${userLocation.city}` : ""}
              </p>
            </div>
          )}
        </div>

        {/* Locations Grid */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-purple-50/50 p-6 md:p-8 border border-white mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LOCATIONS.map((location) => {
              const isSelected = selectedLocations.includes(location.id);

              let distance: number | null = null;
              if (userLocation) {
                // Map English city names to Vietnamese names for coordinate lookup
                const cityNameMap: { [key: string]: string } = {
                  "Ho Chi Minh": "Hồ Chí Minh",
                  Hanoi: "Hà Nội",
                  "Da Nang": "Đà Nẵng",
                  Tokyo: "Tokyo", // Keep as is for international cities
                };
                const vietnameseCityName =
                  cityNameMap[location.city] || location.city;
                const coords = getLocationCoordinates(vietnameseCityName);
                if (coords) {
                  distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    coords.lat,
                    coords.lng
                  );
                }
              }

              return (
                <button
                  key={location.id}
                  onClick={() => toggleLocation(location.id)}
                  className={`group p-5 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-105 hover:shadow-xl ${
                    isSelected
                      ? "border-rose-400 bg-gradient-to-br from-rose-50 to-purple-50 shadow-lg scale-105"
                      : "border-gray-200 hover:border-purple-300 bg-white/70 hover:bg-white/90"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`font-bold text-lg transition-colors ${
                            isSelected
                              ? "text-purple-700"
                              : "text-gray-800 group-hover:text-purple-600"
                          }`}
                        >
                          {location.name}
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-sm transition-colors ${
                          isSelected
                            ? "text-purple-600"
                            : "text-gray-500 group-hover:text-purple-500"
                        }`}
                      >
                        {location.city}
                      </div>

                      {distance !== null && (
                        <div className="mt-2 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span
                            className={`text-xs font-medium ${
                              isLocationNearby(distance)
                                ? "text-emerald-600"
                                : "text-gray-400"
                            }`}
                          >
                            {formatDistance(distance)}
                            {isLocationNearby(distance) && " • Gần bạn"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl">
            <div className="flex items-center gap-2">
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
                className="text-red-500"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-white/50 hover:bg-white/80 border-gray-200 hover:border-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            {tCommon("back")}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={selectedLocations.length !== 1 || isSubmitting}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                {tCommon("finish")}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
