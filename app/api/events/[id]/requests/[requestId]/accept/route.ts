import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import prisma from "@/lib/prisma";
import { parseId } from "@/lib/utils/id-parser";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const eventId = parseId(params.id);
    const requestId = parseId(params.requestId);
    const userId = parseId(session?.user?.id);

    if (!session?.user?.id || !userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!eventId || !requestId) {
      return NextResponse.json(
        { success: false, error: "Invalid Event ID or Request ID" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        host: { select: { id: true, name: true } },
        _count: {
          select: { participants: true }
        }
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.hostId !== userId) {
      return NextResponse.json(
        { success: false, error: "Only the host can accept join requests" },
        { status: 403 }
      );
    }

    // Check if event is full
    if (event._count.participants >= event.maxParticipants) {
      return NextResponse.json(
        { success: false, error: "Event is full" },
        { status: 400 }
      );
    }

    // Get the join request
    const joinRequest = await prisma.eventJoinRequest.findUnique({
      where: { id: requestId },
      include: { 
        user: {
          select: { id: true, name: true, image: true, bio: true }
        } 
      },
    });

    if (!joinRequest) {
      return NextResponse.json(
        { success: false, error: "Join request not found" },
        { status: 404 }
      );
    }

    if (joinRequest.eventId !== eventId) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }

    if (joinRequest.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "This request has already been processed" },
        { status: 400 }
      );
    }

    // Get or create event chat
    let eventChat = await prisma.chat.findFirst({
      where: { eventId, type: "EVENT" },
    });

    // Accept the request in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update request status
      await tx.eventJoinRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });

      // Add user as participant
      const participant = await tx.eventParticipant.create({
        data: {
          eventId,
          userId: joinRequest.userId,
          status: "JOINED",
        },
        include: {
          user: {
            select: { id: true, name: true, image: true, bio: true }
          }
        }
      });

      // Create notification for the user
      const notification = await tx.notification.create({
        data: {
          userId: joinRequest.userId,
          type: "EVENT_ACCEPTED",
          title: "Join request accepted",
          message: `Your request to join "${event.title}" has been accepted`,
          eventId,
          data: JSON.stringify({
            eventId,
            eventTitle: event.title,
          }),
        },
      });

      // Handle chat participation
      if (!eventChat) {
        // Create new group chat for the event
        eventChat = await tx.chat.create({
          data: {
            eventId,
            type: "EVENT",
            name: event.title,
            participants: {
              create: [
                { userId: event.hostId, role: "OWNER" },
                { userId: joinRequest.userId, role: "MEMBER" },
              ],
            },
          },
        });

        // Send system message
        await tx.message.create({
          data: {
            chatId: eventChat.id,
            senderId: joinRequest.userId,
            content: `${joinRequest.user.name} joined the group`,
            type: "SYSTEM",
          },
        });
      } else {
        // Check if user is already in chat
        const existingChatParticipant = await tx.chatParticipant.findUnique({
          where: {
            chatId_userId: {
              chatId: eventChat.id,
              userId: joinRequest.userId,
            },
          },
        });

        if (!existingChatParticipant) {
          // Add user to existing chat
          await tx.chatParticipant.create({
            data: {
              chatId: eventChat.id,
              userId: joinRequest.userId,
              role: "MEMBER",
            },
          });

          // Send system message
          await tx.message.create({
            data: {
              chatId: eventChat.id,
              senderId: joinRequest.userId,
              content: `${joinRequest.user.name} joined the group`,
              type: "SYSTEM",
            },
          });
        }
      }

      // Update event status to FULL if needed
      const newParticipantCount = event._count.participants + 1;
      if (newParticipantCount >= event.maxParticipants && event.status === "OPEN") {
        await tx.event.update({
          where: { id: eventId },
          data: { status: "FULL" },
        });
      }

      return { participant, notification, newParticipantCount };
    });

    // Emit real-time notifications via Socket.IO
    try {
      const { socketEmit } = await import('@/lib/socket');
      
      await socketEmit.toUser(joinRequest.userId.toString(), 'notification', {
        id: result.notification.id,
        type: 'EVENT_ACCEPTED',
        title: result.notification.title,
        message: result.notification.message,
        data: {
          eventId,
          eventTitle: event.title,
          chatId: eventChat?.id,
        },
        createdAt: result.notification.createdAt,
      });

      // Send complete event info to user B so they can update their UI
      await socketEmit.toUser(joinRequest.userId.toString(), 'event-request-accepted', {
        eventId,
        requestId,
        eventTitle: event.title,
        chatId: eventChat?.id,
        status: 'ACCEPTED',
        participantCount: result.newParticipantCount,
        participant: result.participant,
      });

      await socketEmit.toEvent(eventId.toString(), 'event-joined', {
        eventId,
        userId: joinRequest.userId,
        userName: joinRequest.user.name,
        userImage: joinRequest.user.image,
        participantCount: result.newParticipantCount,
        chatId: eventChat?.id,
      });

      if (eventChat) {
        await socketEmit.toChat(eventChat.id.toString(), 'chat-member-joined', {
          chatId: eventChat.id,
          userId: joinRequest.userId,
          userName: joinRequest.user.name,
          userImage: joinRequest.user.image,
        });
      }
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    return NextResponse.json({
      success: true,
      message: "Join request accepted",
      data: {
        participant: result.participant,
        chatId: eventChat?.id,
      },
    });
  } catch (error) {
    console.error("Error accepting join request:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

