import prisma from "../../prisma";

export const chatQueries = {
  async getUserChats(userId: string | number) {
    const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
    return prisma.chatParticipant.findMany({
      where: { userId: numericUserId },
      include: {
        chat: {
          include: {
            event: {
              select: { title: true, date: true },
            },
            participants: {
              where: { userId: { not: numericUserId } },
              include: {
                user: { select: { name: true, image: true } },
              },
            },
            messages: {
              orderBy: { timestamp: "desc" },
              take: 1,
              include: {
                sender: { select: { name: true, image: true } },
              },
            },
          },
        },
      },
      orderBy: {
        chat: {
          updatedAt: "desc",
        },
      },
    });
  },

  // Get chat messages
  //   async getChatMessages(chatId: string, userId: string, limit: number = 50) {
  //     const participant = await prisma.chatParticipant.findUnique({
  //       where: {
  //         chatId_userId: { chatId, userId: senderId },
  //       },
  //     });

  //     if (!participant) return null;

  //     return prisma.message.findMany({
  //       where: { chatId },
  //       include: {
  //         sender: { select: { id: true, name: true, image: true } },
  //         replyTo: {
  //           include: {
  //             sender: { select: { name: true } },
  //           },
  //         },
  //       },
  //       orderBy: { timestamp: "desc" },
  //       take: limit,
  //     });
  //   },

  // Create new chat
  async createChat(
    participants: (string | number)[],
    eventId?: number,
    type: string = "GROUP"
  ) {
    const chat = await prisma.chat.create({
      data: {
        eventId,
        type,
        participants: {
          create: participants.map((userId, index) => ({
            userId: typeof userId === 'string' ? parseInt(userId) : userId,
            role: index === 0 ? "OWNER" : "MEMBER",
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
      },
    });

    return chat;
  },

  //   async sendMessage(
  //     chatId: string,
  //     senderId: string,
  //     content: string,
  //     replyToId?: string
  //   ) {
  //     const participant = await prisma.chatParticipant.findUnique({
  //       where: {
  //         chatId_userId: { chatId, senderId },
  //       },
  //     });

  //     if (!participant) throw new Error("User is not a participant in this chat");

  //     const message = await prisma.message.create({
  //       data: {
  //         chatId,
  //         senderId,
  //         content,
  //         replyToId,
  //       },
  //       include: {
  //         sender: { select: { id: true, name: true, image: true } },
  //         replyTo: {
  //           include: {
  //             sender: { select: { name: true } },
  //           },
  //         },
  //       },
  //     });

  //     // Update chat's updatedAt
  //     await prisma.chat.update({
  //       where: { id: chatId },
  //       data: { updatedAt: new Date() },
  //     });

  //     return message;
  //   },

  // Mark messages as read
  async markAsRead(chatId: number, userId: string | number) {
    const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
    return prisma.chatParticipant.update({
      where: {
        chatId_userId: { chatId, userId: numericUserId },
      },
      data: {
        lastReadAt: new Date(),
      },
    });
  },
};
