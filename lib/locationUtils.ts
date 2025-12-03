// Utility functions for location handling

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
}

// Tọa độ các thành phố Việt Nam
export const VIETNAM_CITY_COORDINATES: { [key: string]: LocationCoordinates } =
  {
    "Hồ Chí Minh": { lat: 10.8231, lng: 106.6297 },
    "Hà Nội": { lat: 21.0285, lng: 105.8542 },
    "Đà Nẵng": { lat: 16.0544, lng: 108.2022 },
    "Cần Thơ": { lat: 10.0452, lng: 105.7469 },
    "Hải Phòng": { lat: 20.8449, lng: 106.6881 },
    "Nha Trang": { lat: 12.2388, lng: 109.1967 },
    Huế: { lat: 16.4637, lng: 107.5909 },
    "Vũng Tàu": { lat: 10.4113, lng: 107.1365 },
    "Quy Nhon": { lat: 13.7563, lng: 109.2297 },
    "Đà Lạt": { lat: 11.9404, lng: 108.4583 },
    "Phan Thiết": { lat: 10.9289, lng: 108.1022 },
    "Long Xuyên": { lat: 10.3861, lng: 105.4348 },
    "Rạch Giá": { lat: 10.012, lng: 105.08 },
    "Cà Mau": { lat: 9.1768, lng: 105.1524 },
    "Buôn Ma Thuột": { lat: 12.6675, lng: 108.0378 },
    Pleiku: { lat: 13.9833, lng: 108.0 },
    Kontum: { lat: 14.3497, lng: 107.965 },
    "Tuy Hòa": { lat: 13.0955, lng: 109.2957 },
    "Phan Rang": { lat: 11.5804, lng: 108.9846 },
    "Cam Ranh": { lat: 11.9214, lng: 109.1591 },
  };

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getLocationCoordinates = (
  locationName: string
): LocationCoordinates | null => {
  return VIETNAM_CITY_COORDINATES[locationName] || null;
};

export const getCurrentUserLocation = async (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Trình duyệt không hỗ trợ định vị địa lý"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const city = await getCityNameFromCoordinates(latitude, longitude);
          resolve({ latitude, longitude, city });
        } catch (geocodeError) {
          resolve({ latitude, longitude });
        }
      },
      (error) => {
        let errorMessage = "Không thể lấy vị trí hiện tại";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật định vị và thử lại.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Không thể xác định vị trí. Vui lòng kiểm tra kết nối mạng.";
            break;
          case error.TIMEOUT:
            errorMessage = "Hết thời gian chờ khi lấy vị trí.";
            break;
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
};

export const getCityNameFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string | undefined> => {
  const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;

  if (!apiKey) {
    console.warn(
      "OpenCage API key not found. City name will not be available."
    );
    return undefined;
  }

  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&language=vi&pretty=1&no_annotations=1&limit=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.components;

      return (
        components.city ||
        components.town ||
        components.village ||
        components.state ||
        components.province ||
        "Unknown"
      );
    }

    return undefined;
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return undefined;
  }
};

export const suggestNearestLocations = (
  userLat: number,
  userLon: number,
  availableLocations: Array<{ id: string; name: string }>,
  maxDistance: number = 100,
  maxSuggestions: number = 3
): Array<{ id: string; name: string; distance: number }> => {
  const locationsWithDistance = availableLocations
    .map((location) => {
      const coords = getLocationCoordinates(location.name);
      if (!coords) return null;

      const distance = calculateDistance(
        userLat,
        userLon,
        coords.lat,
        coords.lng
      );
      return { ...location, distance };
    })
    .filter(
      (location): location is { id: string; name: string; distance: number } =>
        location !== null && location.distance <= maxDistance
    )
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxSuggestions);

  return locationsWithDistance;
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};

export const isLocationNearby = (
  distance: number,
  threshold: number = 50
): boolean => {
  return distance <= threshold;
};
