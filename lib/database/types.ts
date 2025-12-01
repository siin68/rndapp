// Extended types for API responses with Prisma relations

export interface UserWithRelations {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  age?: number | null;
  gender?: string | null; // MALE, FEMALE, OTHER
  isActive: boolean;
  isVerified: boolean;
  lastActive: Date;
  createdAt: Date;
  hobbies: Array<{
    hobby: {
      id: string;
      name: string;
      nameVi: string;
      category: string;
      icon: string;
    };
    skillLevel: string; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    isPrimary: boolean;
  }>;
  locations: Array<{
    location: {
      id: string;
      name: string;
      nameVi: string;
      city: {
        id: string;
        name: string;
        nameVi: string;
      };
    };
    isPrimary: boolean;
  }>;
  receivedReviews?: Array<{
    rating: number;
    comment?: string | null;
    reviewer: {
      name: string;
      image?: string | null;
    };
  }>;
  _count?: {
    hostedEvents: number;
    eventParticipants: number;
    receivedReviews: number;
  };
}

export interface EventWithRelations {
  id: string;
  title: string;
  description?: string | null;
  date: Date;
  duration?: number | null;
  maxParticipants: number;
  minParticipants: number;
  price?: number | null;
  currency: string;
  status: string; // DRAFT, OPEN, FULL, ONGOING, COMPLETED, CANCELLED
  isPrivate: boolean;
  requiresApproval: boolean;
  ageRestrictionMin?: number | null;
  ageRestrictionMax?: number | null;
  genderRestriction?: string | null; // MALE, FEMALE, OTHER
  tags?: string | null; // JSON array of tags
  createdAt: Date;
  updatedAt: Date;
  host: {
    id: string;
    name: string;
    image?: string | null;
    bio?: string | null;
  };
  hobby: {
    id: string;
    name: string;
    nameVi: string;
    category: string;
    icon: string;
  };
  location: {
    id: string;
    name: string;
    nameVi: string;
    address?: string | null;
    city: {
      id: string;
      name: string;
      nameVi: string;
    };
  };
  participants: Array<{
    user: {
      id: string;
      name: string;
      image?: string | null;
      bio?: string | null;
    };
    status: string; // JOINED, LEFT, KICKED, BANNED
    joinedAt: Date;
  }>;
  _count: {
    participants: number;
    reviews?: number;
  };
}

export interface ChatWithRelations {
  id: string;
  type: string; // DIRECT, GROUP, EVENT
  name?: string | null;
  event?: {
    title: string;
    date: Date;
  } | null;
  participants: Array<{
    user: {
      id: string;
      name: string;
      image?: string | null;
    };
    role: string; // OWNER, ADMIN, MEMBER
    lastReadAt: Date;
  }>;
  messages: Array<{
    id: string;
    content: string;
    type: string; // TEXT, IMAGE, FILE, SYSTEM
    timestamp: Date;
    sender: {
      id: string;
      name: string;
      image?: string | null;
    };
    replyTo?: {
      content: string;
      sender: {
        name: string;
      };
    } | null;
  }>;
}

export interface NotificationWithData {
  id: string;
  type: string; // FRIEND_REQUEST, EVENT_INVITATION, EVENT_REMINDER, NEW_MESSAGE, EVENT_UPDATE, SYSTEM
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export interface FriendshipWithUser {
  id: string;
  name: string;
  image?: string | null;
  bio?: string | null;
  lastActive: Date;
}

export interface UserStats {
  eventsHosted: number;
  eventsAttended: number;
  averageRating: number;
  totalFriends: number;
}

export interface HobbyStats {
  id: string;
  name: string;
  nameVi: string;
  category: string;
  icon: string;
  _count: {
    users: number;
    events: number;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search and filter types
export interface EventFilters {
  hobbyIds?: string[];
  locationIds?: string[];
  cityIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  status?: string[]; // EventStatus values
  isPrivate?: boolean;
  hasSpace?: boolean; // events that aren't full
}

export interface UserSearchFilters {
  hobbyIds?: string[];
  locationIds?: string[];
  ageMin?: number;
  ageMax?: number;
  gender?: string; // Gender values
  isVerified?: boolean;
  hasImage?: boolean;
}

// Matching algorithm types
export interface UserMatch {
  user: UserWithRelations;
  compatibilityScore: number;
  sharedHobbies: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  sharedLocations: Array<{
    id: string;
    name: string;
    city: string;
  }>;
  distance?: number; // in km if location data available
}

export interface EventRecommendation {
  event: EventWithRelations;
  relevanceScore: number;
  reasons: Array<
    "hobby_match" | "location_match" | "friend_attending" | "similar_events"
  >;
}

// Enum string constants for type safety
export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export const ProfileVisibility = {
  PUBLIC: "PUBLIC",
  FRIENDS_ONLY: "FRIENDS_ONLY",
  PRIVATE: "PRIVATE",
} as const;

export const SkillLevel = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
} as const;

export const EventStatus = {
  DRAFT: "DRAFT",
  OPEN: "OPEN",
  FULL: "FULL",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const ParticipationStatus = {
  JOINED: "JOINED",
  LEFT: "LEFT",
  KICKED: "KICKED",
  BANNED: "BANNED",
} as const;

export const InvitationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  CANCELLED: "CANCELLED",
} as const;

export const ChatType = {
  DIRECT: "DIRECT",
  GROUP: "GROUP",
  EVENT: "EVENT",
} as const;

export const ChatRole = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export const MessageType = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  FILE: "FILE",
  SYSTEM: "SYSTEM",
} as const;

export const FriendRequestStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  CANCELLED: "CANCELLED",
} as const;

export const NotificationType = {
  FRIEND_REQUEST: "FRIEND_REQUEST",
  EVENT_INVITATION: "EVENT_INVITATION",
  EVENT_REMINDER: "EVENT_REMINDER",
  NEW_MESSAGE: "NEW_MESSAGE",
  EVENT_UPDATE: "EVENT_UPDATE",
  SYSTEM: "SYSTEM",
} as const;

export const ReportType = {
  SPAM: "SPAM",
  HARASSMENT: "HARASSMENT",
  INAPPROPRIATE_CONTENT: "INAPPROPRIATE_CONTENT",
  FAKE_PROFILE: "FAKE_PROFILE",
  OTHER: "OTHER",
} as const;

export const ReportStatus = {
  PENDING: "PENDING",
  REVIEWING: "REVIEWING",
  RESOLVED: "RESOLVED",
  DISMISSED: "DISMISSED",
} as const;

// Type definitions
export type Gender = (typeof Gender)[keyof typeof Gender];
export type ProfileVisibility =
  (typeof ProfileVisibility)[keyof typeof ProfileVisibility];
export type SkillLevel = (typeof SkillLevel)[keyof typeof SkillLevel];
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];
export type ParticipationStatus =
  (typeof ParticipationStatus)[keyof typeof ParticipationStatus];
export type InvitationStatus =
  (typeof InvitationStatus)[keyof typeof InvitationStatus];
export type ChatType = (typeof ChatType)[keyof typeof ChatType];
export type ChatRole = (typeof ChatRole)[keyof typeof ChatRole];
export type MessageType = (typeof MessageType)[keyof typeof MessageType];
export type FriendRequestStatus =
  (typeof FriendRequestStatus)[keyof typeof FriendRequestStatus];
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
export type ReportType = (typeof ReportType)[keyof typeof ReportType];
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];
