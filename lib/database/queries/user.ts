import prisma from "../../prisma";

/**
 * User-related queries
 */
export const userQueries = {
  // Find users by hobbies and location with distance
  async findCompatibleUsers(userId: string, distanceKm: number = 10) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hobbies: true, locations: true },
    });

    if (!user) return [];

    const userHobbyIds = user.hobbies.map((h) => h.hobbyId);
    const userLocationIds = user.locations.map((l) => l.locationId);

    return prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { isActive: true },
          {
            OR: [
              { hobbies: { some: { hobbyId: { in: userHobbyIds } } } },
              { locations: { some: { locationId: { in: userLocationIds } } } },
            ],
          },
        ],
      },
      include: {
        hobbies: { include: { hobby: true } },
        locations: { include: { location: { include: { city: true } } } },
        receivedReviews: {
          select: { rating: true },
        },
      },
      take: 50,
    });
  },

  // Get user profile with stats
  async getUserProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        hobbies: { include: { hobby: true } },
        locations: { include: { location: { include: { city: true } } } },
        hostedEvents: { where: { status: { not: "CANCELLED" } } },
        eventParticipants: { include: { event: true } },
        receivedReviews: {
          select: {
            rating: true,
            comment: true,
            reviewer: { select: { name: true, image: true } },
          },
        },
        _count: {
          select: {
            hostedEvents: true,
            eventParticipants: true,
            receivedReviews: true,
          },
        },
      },
    });
  },

  // Get user by email
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        hobbies: { include: { hobby: true } },
        locations: { include: { location: { include: { city: true } } } },
      },
    });
  },

  // Update user last active
  async updateLastActive(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date() },
    });
  },

  // Search users
  async searchUsers(query: string, limit: number = 20) {
    return prisma.user.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [{ name: { contains: query } }, { bio: { contains: query } }],
          },
        ],
      },
      include: {
        hobbies: { include: { hobby: true } },
        locations: { include: { location: { include: { city: true } } } },
      },
      take: limit,
    });
  },
};
