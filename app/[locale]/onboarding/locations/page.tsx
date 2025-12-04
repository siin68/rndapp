"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button, Input } from "@/components/ui";
import {
  getCurrentUserLocation,
  calculateDistance,
  getLocationCoordinates,
  suggestNearestLocations,
  formatDistance,
  isLocationNearby,
  UserLocation,
} from "@/lib/locationUtils";

interface Location {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  city: {
    id: string;
    name: string;
  };
}

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [addingLocation, setAddingLocation] = useState(false);

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

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch("/api/locations");
        const data = await response.json();

        if (data.success) {
          setLocations(data.data || []);
        } else {
          console.error("Failed to fetch locations:", data.error);
          setLocations([]);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    }

    fetchLocations();
  }, []);

  if (checkingOnboarding || loadingLocations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-100/50 rounded-full blur-[100px] -z-10" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px] -z-10" />

        <div className="max-w-xl mx-auto w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {checkingOnboarding
              ? "Checking profile status..."
              : "Loading locations..."}
          </p>
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
    setSuccessMessage(null);

    try {
      const location = await getCurrentUserLocation();
      setUserLocation(location);
      setShowNearbyOnly(true); // Tự động chuyển sang chế độ hiển thị gần đây

      // Tính toán khoảng cách cho tất cả locations và tự động chọn gần nhất
      const locationsWithDistance = locations
        .map((loc) => {
          // Use coordinates from API or fallback to city coordinates
          const lat =
            loc.latitude || getLocationCoordinates(loc.city.name)?.lat;
          const lng =
            loc.longitude || getLocationCoordinates(loc.city.name)?.lng;

          if (!lat || !lng) return null;

          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            lat,
            lng
          );
          return { ...loc, distance };
        })
        .filter(
          (loc): loc is typeof loc & { distance: number } =>
            loc !== null && loc.distance <= 50 // Giảm từ 100km xuống 50km cho gần hơn
        )
        .sort((a, b) => a.distance - b.distance);

      // Tự động chọn location gần nhất nếu có
      if (locationsWithDistance.length > 0) {
        setSelectedLocations([locationsWithDistance[0].id]);
      } else {
        // Nếu không có location nào gần đó, tự động tạo location mới từ địa chỉ GPS
        await createLocationFromGPS(location);
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

  const createLocationFromGPS = async (userLoc: UserLocation) => {
    try {
      let locationName = "";
      let cityName = "";

      if ((userLoc as any)?.address) {
        const addressParts = (userLoc as any)?.address
          .split(",")
          .map((part: any) => part.trim());

        if (addressParts.length >= 2) {
          locationName = `${addressParts[0]}, ${addressParts[1]}`;
          cityName =
            addressParts[addressParts.length - 1] ||
            addressParts[addressParts.length - 2];
        } else {
          locationName = addressParts[0] || `Vị trí GPS`;
          cityName = userLoc.city || "Unknown";
        }
      } else {
        locationName = `Vị trí tại ${userLoc.city || "Unknown"}`;
        cityName = userLoc.city || "Unknown";
      }

      if (locationName.length > 100) {
        locationName = locationName.substring(0, 100) + "...";
      }

      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: locationName,
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
          cityName: cityName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLocations((prev) => [...prev, result.data]);
        setSelectedLocations([result.data.id]);
        setError(null);

        setSuccessMessage(
          `Đã tạo địa điểm mới: "${result.data.name}" tại vị trí hiện tại của bạn.`
        );
        setTimeout(() => setSuccessMessage(null), 5000); // Clear success message after 5s
      } else {
        setError(
          `Không thể tự động tạo địa điểm từ vị trí hiện tại. ${
            result.error || ""
          }`
        );
      }
    } catch (error) {
      console.error("Error creating location from GPS:", error);
      setError("Có lỗi xảy ra khi tự động tạo địa điểm từ vị trí hiện tại.");
    }
  };

  // Thêm location mới gần vị trí hiện tại
  const addNewLocation = async () => {
    if (!newLocationName.trim() || !userLocation) return;

    setAddingLocation(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newLocationName.trim(),
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          cityName: userLocation.city || "Unknown",
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Thêm location mới vào danh sách
        setLocations((prev) => [...prev, result.data]);
        setSelectedLocations([result.data.id]);
        setNewLocationName("");
        setSuccessMessage(`Đã thêm địa điểm: "${result.data.name}"`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || "Không thể thêm location mới");
      }
    } catch (error) {
      console.error("Error adding location:", error);
      setError("Có lỗi xảy ra khi thêm location");
    } finally {
      setAddingLocation(false);
    }
  };

  const filteredLocations =
    showNearbyOnly && userLocation
      ? locations
          .filter((loc) => {
            const lat =
              loc.latitude || getLocationCoordinates(loc.city.name)?.lat;
            const lng =
              loc.longitude || getLocationCoordinates(loc.city.name)?.lng;

            if (!lat || !lng) return false;

            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              lat,
              lng
            );
            return distance <= 50;
          })
          .sort((a, b) => {
            const aLat = a.latitude || getLocationCoordinates(a.city.name)?.lat;
            const aLng =
              a.longitude || getLocationCoordinates(a.city.name)?.lng;
            const bLat = b.latitude || getLocationCoordinates(b.city.name)?.lat;
            const bLng =
              b.longitude || getLocationCoordinates(b.city.name)?.lng;

            if (!aLat || !aLng || !bLat || !bLng) return 0;

            const aDist = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              aLat,
              aLng
            );
            const bDist = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              bLat,
              bLng
            );
            return aDist - bDist;
          })
      : locations;

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
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-[120px] -z-10 mix-blend-multiply animate-pulse" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse delay-700" />

      <div className="max-w-4xl mx-auto relative z-10">
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
            <>
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-emerald-700 font-medium">
                  ✅ Đã xác định vị trí
                  {userLocation.city ? ` tại ${userLocation.city}` : ""}
                  {showNearbyOnly && ` • Hiển thị trong bán kính 50km`}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  onClick={() => setShowNearbyOnly(!showNearbyOnly)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {showNearbyOnly ? "📍 Gần đây" : "🌍 Tất cả"}
                  <span className="text-xs">
                    (
                    {showNearbyOnly
                      ? filteredLocations.length
                      : locations.length}
                    )
                  </span>
                </Button>

                {showNearbyOnly && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
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
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="12 6v6l4 2" />
                    </svg>
                    {filteredLocations.length === 0
                      ? "Không có địa điểm nào gần bạn"
                      : `${filteredLocations.length} địa điểm được sắp xếp theo khoảng cách`}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {userLocation && filteredLocations.length < 5 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-purple-50/50 p-6 md:p-8 border border-white mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" x2="12" y1="5" y2="19" />
                  <line x1="5" x2="19" y1="12" y2="12" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Thêm vị trí mới</h3>
                <p className="text-sm text-gray-500">
                  Tạo địa điểm gần vị trí hiện tại của bạn
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="Nhập tên địa điểm (VD: Quận 1, Trung tâm thành phố...)"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                className="flex-1"
                disabled={addingLocation}
              />
              <Button
                onClick={addNewLocation}
                disabled={!newLocationName.trim() || addingLocation}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {addingLocation ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Thêm"
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-purple-50/50 p-6 md:p-8 border border-white mb-8">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {showNearbyOnly ? "📍" : "🗺️"}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {showNearbyOnly
                  ? "Không có địa điểm nào trong bán kính 50km"
                  : "Chưa có địa điểm nào có sẵn"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {showNearbyOnly
                  ? "Hãy thêm địa điểm mới ở vị trí hiện tại của bạn hoặc xem tất cả địa điểm có sẵn."
                  : "Hiện tại chưa có địa điểm nào trong hệ thống. Bạn có thể thêm địa điểm mới."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {showNearbyOnly && (
                  <Button
                    onClick={() => setShowNearbyOnly(false)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    🌍 Xem tất cả địa điểm
                  </Button>
                )}
                {userLocation && (
                  <Button
                    onClick={() => setNewLocationName("")}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    ➕ Thêm địa điểm mới
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLocations.map((location) => {
                const isSelected = selectedLocations.includes(location.id);

                let distance: number | null = null;
                if (userLocation) {
                  const lat =
                    location.latitude ||
                    getLocationCoordinates(location.city.name)?.lat;
                  const lng =
                    location.longitude ||
                    getLocationCoordinates(location.city.name)?.lng;

                  if (lat && lng) {
                    distance = calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      lat,
                      lng
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
                          {location.city.name}
                        </div>

                        {distance !== null && (
                          <div className="mt-3 flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`${
                                distance <= 5
                                  ? "text-emerald-500"
                                  : distance <= 20
                                  ? "text-amber-500"
                                  : "text-gray-400"
                              }`}
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span
                              className={`text-xs font-medium ${
                                distance <= 5
                                  ? "text-emerald-600"
                                  : distance <= 20
                                  ? "text-amber-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatDistance(distance)}
                              {distance <= 5 && " • Rất gần"}
                              {distance > 5 && distance <= 20 && " • Gần"}
                              {distance > 20 && " • Xa"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-2xl">
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
                className="text-emerald-600"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
              <span className="text-emerald-700 font-medium">
                ✅ {successMessage}
              </span>
            </div>
          </div>
        )}

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
