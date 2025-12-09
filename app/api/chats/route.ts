import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, friendId } = body;

    if (!userId || !friendId) {
      return NextResponse.json(
        { success: false, error: "userId and friendId are required" },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId, 10);
    const friendIdNum = parseInt(friendId, 10);

    if (isNaN(userIdNum) || isNaN(friendIdNum)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId or friendId" },
        { status: 400 }
      );
    }

    const existingChat = await prisma.chat.findFirst({
      where: {
        type: "DIRECT",
        AND: [
          {
            participants: {
              some: {
                userId: userIdNum,
              },
            },
          },
          {
            participants: {
              some: {
                userId: friendIdNum,
              },
            },
          },
        ],
      },
      include: {
        participants: {
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
            timestamp: "desc",
          },
          take: 1,
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

    if (existingChat) {
      const formattedChat = {
        id: existingChat.id,
        type: existingChat.type,
        participants: existingChat.participants.map((p) => p.user),
        lastMessage: existingChat.messages[0] || null,
        updatedAt: existingChat.updatedAt,
      };

      return NextResponse.json({
        success: true,
        data: formattedChat,
        isNew: false,
      });
    }

    const newChat = await prisma.chat.create({
      data: {
        type: "DIRECT",
        participants: {
          create: [
            { userId: userIdNum },
            { userId: friendIdNum },
          ],
        },
      },
      include: {
        participants: {
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
      },
    });

    const formattedChat = {
      id: newChat.id,
      type: newChat.type,
      participants: newChat.participants.map((p) => p.user),
      lastMessage: null,
      updatedAt: newChat.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: formattedChat,
      isNew: true,
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
        { status: 400 }
      );
    }

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: userIdNum,
            leftAt: null, 
          },
        },
      },
      include: {
        participants: {
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
            timestamp: "desc",
          },
          take: 1,
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
        event: {
          select: {
            id: true,
            title: true,
            image: true,
            status: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Format the response
    const formattedChats = chats.map((chat) => ({
      id: chat.id,
      type: chat.type,
      event: chat.event,
      participants: chat.participants.map((p) => p.user),
      lastMessage: chat.messages[0] || null,
      updatedAt: chat.updatedAt,
      unreadCount: 0,
    }));

    return NextResponse.json({
      success: true,
      data: formattedChats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
