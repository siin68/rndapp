"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const locale = (pathname ? pathname.split("/")[1] : "") || "en";
  const { data: session } = useSession();

  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  // Check onboarding status on component mount
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

  // Load previously selected locations from localStorage
  useEffect(() => {
    if (checkingOnboarding) return;

    const savedLocations = localStorage.getItem("onboarding-locations");
    if (savedLocations) {
      setSelectedLocations(JSON.parse(savedLocations));
    }
  }, [checkingOnboarding]);

  // Show loading while checking onboarding
  if (checkingOnboarding) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking profile status...</p>
      </div>
    );
  }

  const toggleLocation = (locationId: string) => {
    if (selectedLocations.includes(locationId)) {
      setSelectedLocations(selectedLocations.filter((id) => id !== locationId));
    } else {
      if (selectedLocations.length < 3) {
        setSelectedLocations([...selectedLocations, locationId]);
      }
    }
  };

  // Lấy vị trí hiện tại của user
  const getCurrentLocation = async () => {
    setGettingLocation(true);
    setError(null);

    try {
      const location = await getCurrentUserLocation();
      setUserLocation(location);

      // Tự động chọn location gần nhất
      const suggestions = suggestNearestLocations(
        location.latitude,
        location.longitude,
        LOCATIONS,
        100, // 100km
        1 // chỉ lấy 1 suggestion
      );

      if (
        suggestions.length > 0 &&
        !selectedLocations.includes(suggestions[0].id)
      ) {
        setSelectedLocations((prev) =>
          [suggestions[0].id, ...prev].slice(0, 3)
        );
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
    if (selectedLocations.length < 1 || !session?.user) return;

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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-sm font-medium text-primary-600">
          {tCommon("step", { current: 3, total: 3 })}
        </p>
        <h1 className="text-3xl font-extrabold mt-2 bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-gray-600 mt-2">{t("subtitle")}</p>
        <p className="text-sm font-semibold text-primary-700 mt-3">
          {t("selected", { count: selectedLocations.length })} / 1-3 locations
        </p>

        <div className="mt-4">
          <Button
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            variant="outline"
            className="flex items-center gap-2"
          >
            {gettingLocation ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
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
            {gettingLocation ? "Đang lấy vị trí..." : "📍 Lấy vị trí hiện tại"}
          </Button>
          {userLocation && (
            <p className="text-sm text-green-600 mt-2">
              ✅ Đã xác định vị trí
              {userLocation.city ? ` tại ${userLocation.city}` : ""}
            </p>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LOCATIONS.map((location) => {
              const isSelected = selectedLocations.includes(location.id);

              // Tính khoảng cách nếu có vị trí user
              let distance: number | null = null;
              if (userLocation) {
                const coords = getLocationCoordinates(location.name);
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
                  className={`p-5 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                    isSelected
                      ? "border-primary-500 bg-gradient-to-br from-primary-50 to-accent-50 shadow-md"
                      : "border-gray-200 hover:border-primary-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div
                        className={`font-bold text-lg ${
                          isSelected ? "text-primary-700" : "text-gray-800"
                        }`}
                      >
                        {location.name}
                      </div>
                      <div
                        className={`text-sm mt-1 ${
                          isSelected ? "text-primary-600" : "text-gray-500"
                        }`}
                      >
                        {location.city}
                      </div>
                    </div>
                    {distance !== null && (
                      <div className="text-xs text-gray-400 text-right">
                        <div>{formatDistance(distance)}</div>
                        {isLocationNearby(distance) && (
                          <div className="text-green-500 font-medium">
                            Gần bạn
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          ← {tCommon("back")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            selectedLocations.length < 1 ||
            selectedLocations.length > 3 ||
            isSubmitting
          }
        >
          {isSubmitting ? "Saving..." : `${tCommon("finish")} ✓`}
        </Button>
      </div>
    </div>
  );
}
