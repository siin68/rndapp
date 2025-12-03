import prisma from "../../prisma";

/**
 * Event-related queries
 */
export const eventQueries = {
  // Find events by user interests
  async findRecommendedEvents(userId: string, limit: number = 10) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hobbies: true, locations: true },
    });

    if (!user) return [];

    const userHobbyIds = user.hobbies.map((h) => h.hobbyId);
    const userLocationIds = user.locations.map((l) => l.locationId);

    return prisma.event.findMany({
      where: {
        AND: [
          { status: "OPEN" },
          { date: { gte: new Date() } },
          { hostId: { not: userId } },
          {
            OR: [
              { hobbies: { some: { hobbyId: { in: userHobbyIds } } } },
              { locationId: { in: userLocationIds } },
            ],
          },
          {
            NOT: {
              participants: {
                some: { userId },
              },
            },
          },
        ],
      },
      include: {
        host: { select: { id: true, name: true, image: true, bio: true } },
        hobbies: {
          include: { hobby: true },
          orderBy: { isPrimary: "desc" },
        },
        location: { include: { city: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, image: true, bio: true } },
          },
        },
        _count: { select: { participants: true } },
      },
      orderBy: [{ date: "asc" }, { createdAt: "desc" }],
      take: limit,
    });
  },

  async getEventDetails(eventId: string, viewerId?: string) {
    return prisma.event.findUnique({
      where: { id: eventId },
      include: {
        host: {
          select: { id: true, name: true, image: true, bio: true },
        },
        hobbies: {
          include: { hobby: true },
          orderBy: { isPrimary: "desc" },
        },
        location: { include: { city: true } },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, image: true, bio: true },
            },
          },
        },
        chats: {
          where: viewerId
            ? {
                participants: {
                  some: { userId: viewerId },
                },
              }
            : {},
          include: {
            messages: {
              orderBy: { timestamp: "desc" },
              take: 1,
            },
          },
        },
        reviews: {
          include: {
            reviewer: { select: { name: true, image: true } },
          },
        },
        _count: {
          select: { participants: true, reviews: true },
        },
      },
    });
  },

  async getUserHostedEvents(userId: string) {
    return prisma.event.findMany({
      where: { hostId: userId },
      include: {
        hobbies: {
          include: { hobby: true },
          orderBy: { isPrimary: "desc" },
        },
        location: { include: { city: true } },
        participants: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        _count: { select: { participants: true } },
      },
      orderBy: { date: "desc" },
    });
  },

  async getUserParticipatingEvents(userId: string) {
    return prisma.event.findMany({
      where: {
        participants: {
          some: {
            userId,
            status: "JOINED",
          },
        },
      },
      include: {
        host: { select: { id: true, name: true, image: true, bio: true } },
        hobbies: {
          include: { hobby: true },
          orderBy: { isPrimary: "desc" },
        },
        location: { include: { city: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, image: true, bio: true } },
          },
        },
        _count: { select: { participants: true } },
      },
      orderBy: { date: "asc" },
    });
  },

  async searchEvents(
    query: string,
    filters?: {
      hobbyIds?: string[];
      locationIds?: string[];
      dateFrom?: Date;
      dateTo?: Date;
      excludeHostId?: string; // Add option to exclude events by host
    },
    limit: number = 20
  ) {
    return prisma.event.findMany({
      where: {
        AND: [
          { status: "OPEN" },
          { date: { gte: new Date() } },
          {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          ...(filters?.hobbyIds
            ? [{ hobbies: { some: { hobbyId: { in: filters.hobbyIds } } } }]
            : []),
          ...(filters?.locationIds
            ? [{ locationId: { in: filters.locationIds } }]
            : []),
          ...(filters?.dateFrom ? [{ date: { gte: filters.dateFrom } }] : []),
          ...(filters?.dateTo ? [{ date: { lte: filters.dateTo } }] : []),
          ...(filters?.excludeHostId
            ? [{ hostId: { not: filters.excludeHostId } }]
            : []),
        ],
      },
      include: {
        host: { select: { id: true, name: true, image: true, bio: true } },
        hobbies: {
          include: { hobby: true },
          orderBy: { isPrimary: "desc" },
        },
        location: { include: { city: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, image: true, bio: true } },
          },
        },
        _count: { select: { participants: true } },
      },
      orderBy: { date: "asc" },
      take: limit,
    });
  },
};
