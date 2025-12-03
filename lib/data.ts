import { LOCATIONS } from "@/constants/locations";

// Cache for hobbies to avoid repeated API calls
let hobbiesCache: any[] | null = null;

export async function getHobbyById(id: string) {
  if (!hobbiesCache) {
    try {
      const response = await fetch("/api/hobbies");
      const data = await response.json();
      if (data.success) {
        hobbiesCache = data.data;
      } else {
        hobbiesCache = [];
      }
    } catch (error) {
      console.error("Error fetching hobbies:", error);
      hobbiesCache = [];
    }
  }
  return hobbiesCache?.find((hobby) => hobby.id === id);
}

export function getLocationById(id: string) {
  return LOCATIONS.find((location) => location.id === id);
}

// Legacy function for compatibility
export function getUserById(id: string) {
  // This would typically fetch from database in real implementation
  // For now, return a placeholder since we're transitioning away from mock data
  return null;
}

export function getEventById(id: string) {
  // This would typically fetch from database in real implementation
  // For now, return a placeholder since we're transitioning away from mock data
  return null;
}

// API helper functions
export async function fetchEvents(options?: {
  type?: "hosted" | "participating" | "recommended";
  userId?: string;
  limit?: number;
  status?: string;
}) {
  const params = new URLSearchParams();

  if (options?.type) params.append("type", options.type);
  if (options?.userId) params.append("userId", options.userId);
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.status) params.append("status", options.status);

  const response = await fetch(`/api/events?${params.toString()}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch events");
  }

  return data.data;
}

export async function fetchEventStats(userId?: string) {
  const params = new URLSearchParams();
  if (userId) params.append("userId", userId);

  const response = await fetch(`/api/events/stats?${params.toString()}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch event stats");
  }

  return data.data;
}
