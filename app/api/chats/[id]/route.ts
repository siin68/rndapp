import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const chatId = parseInt(params.id, 10);

    if (isNaN(chatId)) {
      return NextResponse.json(
        { success: false, error: "Invalid chat ID" },
        { status: 400 }
      );
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            image: true,
            date: true,
            status: true,
            hostId: true,
          },
        },
        participants: {
          where: {
            leftAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            timestamp: "asc",
          },
          take: 100,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    const sessionUserId = typeof session.user.id === 'string' 
      ? parseInt(session.user.id, 10) 
      : session.user.id;

    let isParticipant = chat.participants.some(
      (p) => p.userId === sessionUserId
    );

    if (!isParticipant && chat.type === "EVENT" && chat.eventId) {
      const eventParticipant = await prisma.eventParticipant.findFirst({
        where: {
          eventId: chat.eventId,
          userId: sessionUserId,
          status: "JOINED",
        },
      });

      if (eventParticipant) {
        const chatParticipant = await prisma.chatParticipant.findFirst({
          where: {
            chatId: chat.id,
            userId: sessionUserId,
          },
        });

        if (chatParticipant && chatParticipant.leftAt !== null) {
          await prisma.chatParticipant.update({
            where: { id: chatParticipant.id },
            data: { leftAt: null },
          });
          isParticipant = true;
        } else if (!chatParticipant) {
          await prisma.chatParticipant.create({
            data: {
              chatId: chat.id,
              userId: sessionUserId,
              role: "MEMBER",
            },
          });
          isParticipant = true;
        }
      }
    }

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: "You are not a participant in this chat" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: chat.id,
        type: chat.type,
        name: chat.name || chat.event?.title,
        event: chat.event,
        participants: chat.participants.map((p) => p.user),
        messages: chat.messages,
      },
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
