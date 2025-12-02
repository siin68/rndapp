import prisma from "../../prisma";

/**
 * Social features queries
 */
export const socialQueries = {
  // Get friend suggestions
  async getFriendSuggestions(userId: string, limit: number = 10) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hobbies: true, locations: true },
    });

    if (!user) return [];

    const userHobbyIds = user.hobbies.map((h) => h.hobbyId);

    return prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { isActive: true },
          {
            hobbies: {
              some: { hobbyId: { in: userHobbyIds } },
            },
          },
          {
            NOT: {
              OR: [
                { friendships1: { some: { user2Id: userId } } },
                { friendships2: { some: { user1Id: userId } } },
                { sentFriendRequests: { some: { receiverId: userId } } },
                { receivedFriendRequests: { some: { senderId: userId } } },
              ],
            },
          },
        ],
      },
      include: {
        hobbies: { include: { hobby: true } },
        receivedReviews: {
          select: { rating: true },
        },
      },
      take: limit,
    });
  },

  // Get user's friends
  async getUserFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            lastActive: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            lastActive: true,
          },
        },
      },
    });

    return friendships.map((friendship) =>
      friendship.user1Id === userId ? friendship.user2 : friendship.user1
    );
  },

  // Send friend request
  async sendFriendRequest(
    senderId: string,
    receiverId: string,
    message?: string
  ) {
    // Check if already friends or request exists
    const existingRelation = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existingRelation) {
      throw new Error(
        "Friend request already exists or users are already friends"
      );
    }

    return prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        message,
      },
      include: {
        sender: { select: { name: true, image: true } },
        receiver: { select: { name: true, image: true } },
      },
    });
  },

  // Accept friend request
  async acceptFriendRequest(requestId: string) {
    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== "PENDING") {
      throw new Error("Invalid friend request");
    }

    // Create friendship
    await prisma.friendship.create({
      data: {
        user1Id: request.senderId,
        user2Id: request.receiverId,
      },
    });

    // Update request status
    return prisma.friendRequest.update({
      where: { id: requestId },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
      },
    });
  },

  // Get pending friend requests
  async getPendingFriendRequests(userId: string) {
    return prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        sender: { select: { id: true, name: true, image: true, bio: true } },
      },
      orderBy: { sentAt: "desc" },
    });
  },
};
