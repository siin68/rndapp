import prisma from "../../prisma";

/**
 * Social features queries
 */
export const socialQueries = {
  // Get friend suggestions
  async getFriendSuggestions(userId: string | number, limit: number = 10) {
    const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
    const user = await prisma.user.findUnique({
      where: { id: numericUserId },
      include: { hobbies: true, locations: true },
    });

    if (!user) return [];

    const userHobbyIds = user.hobbies.map((h) => h.hobbyId);

    return prisma.user.findMany({
      where: {
        AND: [
          { id: { not: numericUserId } },
          { isActive: true },
          {
            hobbies: {
              some: { hobbyId: { in: userHobbyIds } },
            },
          },
          {
            NOT: {
              OR: [
                { friendships1: { some: { user2Id: numericUserId } } },
                { friendships2: { some: { user1Id: numericUserId } } },
                { sentFriendRequests: { some: { receiverId: numericUserId } } },
                { receivedFriendRequests: { some: { senderId: numericUserId } } },
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
  async getUserFriends(userId: string | number) {
    const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: numericUserId }, { user2Id: numericUserId }],
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
      friendship.user1Id === numericUserId ? friendship.user2 : friendship.user1
    );
  },

  // Send friend request
  async sendFriendRequest(
    senderId: string | number,
    receiverId: string | number,
    message?: string
  ) {
    const numericSenderId = typeof senderId === 'string' ? parseInt(senderId) : senderId;
    const numericReceiverId = typeof receiverId === 'string' ? parseInt(receiverId) : receiverId;
    // Check if already friends or request exists
    const existingRelation = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: numericSenderId, receiverId: numericReceiverId },
          { senderId: numericReceiverId, receiverId: numericSenderId },
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
        senderId: numericSenderId,
        receiverId: numericReceiverId,
        message,
      },
      include: {
        sender: { select: { name: true, image: true } },
        receiver: { select: { name: true, image: true } },
      },
    });
  },

  // Accept friend request
  async acceptFriendRequest(requestId: string | number) {
    const numericRequestId = typeof requestId === 'string' ? parseInt(requestId) : requestId;
    const request = await prisma.friendRequest.findUnique({
      where: { id: numericRequestId },
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
      where: { id: numericRequestId },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
      },
    });
  },

  // Get pending friend requests
  async getPendingFriendRequests(userId: string | number) {
    const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
    return prisma.friendRequest.findMany({
      where: {
        receiverId: numericUserId,
        status: "PENDING",
      },
      include: {
        sender: { select: { id: true, name: true, image: true, bio: true } },
      },
      orderBy: { sentAt: "desc" },
    });
  },
};
