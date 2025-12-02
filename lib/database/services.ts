import {
  UserMatch,
  EventRecommendation,
  UserWithRelations,
  EventWithRelations,
} from "./types";

export class MatchingService {
  static calculateCompatibilityScore(
    user1: UserWithRelations,
    user2: UserWithRelations
  ): number {
    let score = 0;
    let factors = 0;

    const hobby1Ids = user1.hobbies.map((h) => h.hobby.id);
    const hobby2Ids = user2.hobbies.map((h) => h.hobby.id);
    const sharedHobbies = hobby1Ids.filter((id) => hobby2Ids.includes(id));
    const hobbyScore =
      (sharedHobbies.length / Math.max(hobby1Ids.length, hobby2Ids.length)) *
      40;
    score += hobbyScore;
    factors += 40;

    const location1Ids = user1.locations.map((l) => l.location.id);
    const location2Ids = user2.locations.map((l) => l.location.id);
    const sharedLocations = location1Ids.filter((id) =>
      location2Ids.includes(id)
    );
    const locationScore =
      (sharedLocations.length /
        Math.max(location1Ids.length, location2Ids.length)) *
      30;
    score += locationScore;
    factors += 30;

    if (user1.age && user2.age) {
      const ageDiff = Math.abs(user1.age - user2.age);
      const ageScore = Math.max(0, (10 - ageDiff) / 10) * 20;
      score += ageScore;
      factors += 20;
    }

    if (user2.receivedReviews && user2.receivedReviews.length > 0) {
      const avgRating =
        user2.receivedReviews.reduce((sum, r) => sum + r.rating, 0) /
        user2.receivedReviews.length;
      const ratingScore = (avgRating / 5) * 10;
      score += ratingScore;
      factors += 10;
    }

    return Math.min(100, (score / factors) * 100);
  }

  static async findMatches(
    targetUser: UserWithRelations,
    candidates: UserWithRelations[],
    limit: number = 10
  ): Promise<UserMatch[]> {
    const matches: UserMatch[] = [];

    for (const candidate of candidates) {
      const compatibilityScore = this.calculateCompatibilityScore(
        targetUser,
        candidate
      );

      if (compatibilityScore > 20) {
        const targetHobbyIds = targetUser.hobbies.map((h) => h.hobby.id);
        const candidateHobbyIds = candidate.hobbies.map((h) => h.hobby.id);
        const sharedHobbyIds = targetHobbyIds.filter((id) =>
          candidateHobbyIds.includes(id)
        );
        const sharedHobbies = candidate.hobbies
          .filter((h) => sharedHobbyIds.includes(h.hobby.id))
          .map((h) => ({
            id: h.hobby.id,
            name: h.hobby.name,
            category: h.hobby.category,
          }));

        const targetLocationIds = targetUser.locations.map(
          (l) => l.location.id
        );
        const candidateLocationIds = candidate.locations.map(
          (l) => l.location.id
        );
        const sharedLocationIds = targetLocationIds.filter((id) =>
          candidateLocationIds.includes(id)
        );
        const sharedLocations = candidate.locations
          .filter((l) => sharedLocationIds.includes(l.location.id))
          .map((l) => ({
            id: l.location.id,
            name: l.location.name,
            city: l.location.city.name,
          }));

        matches.push({
          user: candidate,
          compatibilityScore,
          sharedHobbies,
          sharedLocations,
        });
      }
    }

    return matches
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);
  }

  static calculateEventRelevance(
    user: UserWithRelations,
    event: EventWithRelations
  ): { score: number; reasons: EventRecommendation["reasons"] } {
    let score = 0;
    const reasons: EventRecommendation["reasons"] = [];

    const userHobbyIds = user.hobbies.map((h) => h.hobby.id);
    if (userHobbyIds.includes(event.hobby.id)) {
      score += 50;
      reasons.push("hobby_match");
    }

    const userLocationIds = user.locations.map((l) => l.location.id);
    if (userLocationIds.includes(event.location.id)) {
      score += 30;
      reasons.push("location_match");
    }

    if (!reasons.includes("location_match")) {
      const userCityIds = user.locations.map((l) => l.location.city.id);
      if (userCityIds.includes(event.location.city.id)) {
        score += 20;
        reasons.push("location_match");
      }
    }

    if (event.host && event._count.reviews && event._count.reviews > 0) {
      score += 10;
      reasons.push("similar_events");
    }

    const daysUntilEvent = Math.ceil(
      (event.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilEvent <= 7) {
      score += 5;
    }

    return { score: Math.min(100, score), reasons };
  }

  static async recommendEvents(
    user: UserWithRelations,
    events: EventWithRelations[],
    limit: number = 20
  ): Promise<EventRecommendation[]> {
    const recommendations: EventRecommendation[] = [];

    for (const event of events) {
      const { score, reasons } = this.calculateEventRelevance(user, event);

      if (score > 20) {
        recommendations.push({
          event,
          relevanceScore: score,
          reasons,
        });
      }
    }

    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }
}

export class NotificationService {
  static createNotificationData(
    type: string,
    data: Record<string, any>
  ): string {
    return JSON.stringify({ type, ...data });
  }

  static generateMessage(
    type: string,
    data: Record<string, any>,
    locale: string = "en"
  ): { title: string; message: string } {
    const messages = {
      en: {
        FRIEND_REQUEST: {
          title: "New Friend Request",
          message: `${data.senderName} sent you a friend request`,
        },
        EVENT_INVITATION: {
          title: "Event Invitation",
          message: `${data.senderName} invited you to "${data.eventTitle}"`,
        },
        EVENT_REMINDER: {
          title: "Event Reminder",
          message: `"${data.eventTitle}" starts in ${data.timeUntil}`,
        },
        NEW_MESSAGE: {
          title: "New Message",
          message: `${data.senderName}: ${data.messagePreview}`,
        },
        EVENT_UPDATE: {
          title: "Event Update",
          message: `"${data.eventTitle}" has been updated`,
        },
      },
      vi: {
        FRIEND_REQUEST: {
          title: "Lời mời kết bạn mới",
          message: `${data.senderName} đã gửi lời mời kết bạn`,
        },
        EVENT_INVITATION: {
          title: "Lời mời tham gia sự kiện",
          message: `${data.senderName} mời bạn tham gia "${data.eventTitle}"`,
        },
        EVENT_REMINDER: {
          title: "Nhắc nhở sự kiện",
          message: `"${data.eventTitle}" sẽ bắt đầu trong ${data.timeUntil}`,
        },
        NEW_MESSAGE: {
          title: "Tin nhắn mới",
          message: `${data.senderName}: ${data.messagePreview}`,
        },
        EVENT_UPDATE: {
          title: "Cập nhật sự kiện",
          message: `"${data.eventTitle}" đã được cập nhật`,
        },
      },
    };

    const localeMessages =
      messages[locale as keyof typeof messages] || messages.en;
    return (
      localeMessages[type as keyof typeof localeMessages] || {
        title: "Notification",
        message: "You have a new notification",
      }
    );
  }
}

/**
 * Event service for business logic
 */
export class EventService {
  static canUserJoinEvent(
    event: EventWithRelations,
    user: UserWithRelations
  ): { canJoin: boolean; reason?: string } {
    // Check if event is full
    if (event._count.participants >= event.maxParticipants) {
      return { canJoin: false, reason: "Event is full" };
    }

    // Check if event is in the past
    if (event.date < new Date()) {
      return { canJoin: false, reason: "Event has already passed" };
    }

    // Check if user is already participating
    const isParticipating = event.participants.some(
      (p) => p.user.id === user.id
    );
    if (isParticipating) {
      return { canJoin: false, reason: "Already participating" };
    }

    // Check if user is the host
    if (event.host.id === user.id) {
      return { canJoin: false, reason: "Cannot join your own event" };
    }

    // Check age restrictions
    if (
      event?.ageRestrictionMin &&
      user.age &&
      user.age < event.ageRestrictionMin
    ) {
      return { canJoin: false, reason: "Below minimum age requirement" };
    }
    if (
      event?.ageRestrictionMax &&
      user.age &&
      user.age > event.ageRestrictionMax
    ) {
      return { canJoin: false, reason: "Above maximum age requirement" };
    }

    // Check gender restrictions
    if (event?.genderRestriction && user.gender !== event.genderRestriction) {
      return { canJoin: false, reason: "Gender restriction applies" };
    }

    return { canJoin: true };
  }

  /**
   * Calculate event completion percentage for stats
   */
  static calculateEventStats(event: EventWithRelations) {
    const fillPercentage =
      (event._count.participants / event.maxParticipants) * 100;
    const isPastEvent = event.date < new Date();
    const isUpcoming = event.date > new Date();
    const daysUntilEvent = Math.ceil(
      (event.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      fillPercentage,
      isPastEvent,
      isUpcoming,
      daysUntilEvent,
      hasMinimumParticipants:
        event._count.participants >= event.minParticipants,
    };
  }
}
