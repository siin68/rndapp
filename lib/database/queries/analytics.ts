import prisma from "../../prisma";

/**
 * Analytics queries
 */
export const analyticsQueries = {
  // Get user activity stats
  async getUserStats(userId: string) {
    const [eventsHosted, eventsAttended, averageRating, totalFriends] =
      await Promise.all([
        prisma.event.count({ where: { hostId: userId } }),
        prisma.eventParticipant.count({ where: { userId } }),
        prisma.review.aggregate({
          where: { revieweeId: userId },
          _avg: { rating: true },
        }),
        prisma.friendship.count({
          where: {
            OR: [{ user1Id: userId }, { user2Id: userId }],
          },
        }),
      ]);

    return {
      eventsHosted,
      eventsAttended,
      averageRating: averageRating._avg.rating || 0,
      totalFriends,
    };
  },

  // Get popular hobbies
  async getPopularHobbies(limit: number = 10) {
    return prisma.hobby.findMany({
      include: {
        _count: {
          select: { users: true, events: true },
        },
      },
      orderBy: {
        users: {
          _count: "desc",
        },
      },
      take: limit,
    });
  },

  // Get platform statistics
  async getPlatformStats() {
    const [totalUsers, totalEvents, totalMessages, activeUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.event.count(),
        prisma.message.count(),
        prisma.user.count({
          where: {
            lastActive: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

    return {
      totalUsers,
      totalEvents,
      totalMessages,
      activeUsers,
    };
  },

  // Get event statistics by hobby
  async getEventStatsByHobby() {
    return prisma.hobby.findMany({
      include: {
        _count: {
          select: { events: true },
        },
      },
      orderBy: {
        events: {
          _count: "desc",
        },
      },
    });
  },

  // Get user activity over time
  async getUserActivity(userId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [events, messages, reviews] = await Promise.all([
      prisma.event.findMany({
        where: {
          hostId: userId,
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),
      prisma.message.findMany({
        where: {
          senderId: userId,
          timestamp: { gte: startDate },
        },
        select: { timestamp: true },
      }),
      prisma.review.findMany({
        where: {
          reviewerId: userId,
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),
    ]);

    return {
      eventsCreated: events.length,
      messagesSent: messages.length,
      reviewsGiven: reviews.length,
      dailyActivity: {
        events: events.map((e) => e.createdAt),
        messages: messages.map((m) => m.timestamp),
        reviews: reviews.map((r) => r.createdAt),
      },
    };
  },
};
