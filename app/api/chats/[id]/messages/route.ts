import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { socketEmit } from "@/lib/socket";

export async function POST(
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

    // Validate chatId is a valid number
    if (isNaN(chatId)) {
      return NextResponse.json(
        { success: false, error: "Invalid chat ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content, type = "TEXT" } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required" },
        { status: 400 }
      );
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          where: {
            userId: session.user.id,
            leftAt: null,
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

    if (chat.participants.length === 0) {
      return NextResponse.json(
        { success: false, error: "You are not a participant in this chat" },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: session.user.id,
        content: content.trim(),
        type,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    socketEmit.toChat(chatId.toString(), "new-message", {
      chatId: chatId.toString(),
      message: {
        id: message.id,
        content: message.content,
        type: message.type,
        timestamp: message.timestamp,
        sender: message.sender,
      },
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
