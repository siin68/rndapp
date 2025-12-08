import prisma from "../../prisma";
import { parseId, parseIds } from "../../utils/id-parser";

/**
 * Event-related queries
 */
export const eventQueries = {
  // Find events by user interests
  async findRecommendedEvents(userId: string | number, limit: number = 10) {
    const parsedUserId = parseId(userId);
    if (!parsedUserId) return [];

    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
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
          { hostId: { not: parsedUserId } },
          {
            OR: [
              { hobbies: { some: { hobbyId: { in: userHobbyIds } } } },
              { locationId: { in: userLocationIds } },
            ],
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

  async getEventDetails(eventId: string | number, viewerId?: string | number) {
    const parsedEventId = parseId(eventId);
    const parsedViewerId = parseId(viewerId);

    if (!parsedEventId) return null;

    return prisma.event.findUnique({
      where: { id: parsedEventId },
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
          where: { status: "JOINED" },
          include: {
            user: {
              select: { id: true, name: true, image: true, bio: true },
            },
          },
        },
        // Include join requests for the viewer to see their pending status
        joinRequests: parsedViewerId
          ? {
              where: { userId: parsedViewerId },
              select: {
                id: true,
                userId: true,
                status: true,
                createdAt: true,
              },
            }
          : false,
        chats: {
          where: parsedViewerId
            ? {
                participants: {
                  some: { userId: parsedViewerId },
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

  async getUserHostedEvents(userId: string | number) {
    const parsedUserId = parseId(userId);
    if (!parsedUserId) return [];

    return prisma.event.findMany({
      where: { hostId: parsedUserId },
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

  async getUserParticipatingEvents(userId: string | number) {
    const parsedUserId = parseId(userId);
    if (!parsedUserId) return [];

    return prisma.event.findMany({
      where: {
        participants: {
          some: {
            userId: parsedUserId,
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
      hobbyIds?: (string | number)[];
      locationIds?: (string | number)[];
      dateFrom?: Date;
      dateTo?: Date;
      excludeHostId?: string | number;
      excludeParticipantId?: string | number; // Exclude events user is already participating in
    },
    limit: number = 20
  ) {
    // Parse array IDs
    const parsedHobbyIds = filters?.hobbyIds?.map(id => parseId(id)).filter((id): id is number => id !== undefined);
    const parsedLocationIds = filters?.locationIds?.map(id => parseId(id)).filter((id): id is number => id !== undefined);
    const parsedExcludeHostId = parseId(filters?.excludeHostId);
    const parsedExcludeParticipantId = parseId(filters?.excludeParticipantId);

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
          ...(parsedHobbyIds && parsedHobbyIds.length > 0
            ? [{ hobbies: { some: { hobbyId: { in: parsedHobbyIds } } } }]
            : []),
          ...(parsedLocationIds && parsedLocationIds.length > 0
            ? [{ locationId: { in: parsedLocationIds } }]
            : []),
          ...(filters?.dateFrom ? [{ date: { gte: filters.dateFrom } }] : []),
          ...(filters?.dateTo ? [{ date: { lte: filters.dateTo } }] : []),
          ...(parsedExcludeHostId
            ? [{ hostId: { not: parsedExcludeHostId } }]
            : []),
          ...(parsedExcludeParticipantId
            ? [{
                participants: {
                  none: {
                    userId: parsedExcludeParticipantId,
                    status: "JOINED"
                  }
                }
              }]
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
