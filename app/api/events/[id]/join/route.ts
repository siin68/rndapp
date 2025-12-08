import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth.config';
import prisma from "@/lib/prisma";
import { EventService } from "@/lib/database/services";
import { parseId } from "@/lib/utils/id-parser";

/**
 * POST /api/events/[id]/join
 * Request to join an event (creates a pending join request)
 */
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

    const eventId = parseId(params.id);
    const userId = parseId(session.user.id);

    if (!eventId || !userId) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    // Parse optional message from request body
    let message = "";
    try {
      const body = await request.json();
      message = body.message || "";
    } catch {
      // No body or invalid JSON, continue without message
    }

    // Fetch event with all necessary relations
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        host: { select: { id: true, name: true, image: true, bio: true } },
        participants: {
          where: { status: "JOINED" },
          include: {
            user: { select: { id: true, name: true, image: true, bio: true } },
          },
        },
        joinRequests: {
          where: { userId },
        },
        _count: { 
          select: { 
            participants: {
              where: { status: "JOINED" }
            } 
          } 
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if user is already a participant
    const isAlreadyParticipant = event.participants.some(p => p.userId === userId);
    if (isAlreadyParticipant) {
      return NextResponse.json(
        { success: false, error: "You have already joined this event" },
        { status: 400 }
      );
    }

    // Check if user already has a pending request
    const existingRequest = event.joinRequests.find(r => r.status === "PENDING");
    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: "You already have a pending join request for this event" },
        { status: 400 }
      );
    }

    // Check if user's previous request was rejected
    const rejectedRequest = event.joinRequests.find(r => r.status === "REJECTED");
    if (rejectedRequest) {
      return NextResponse.json(
        { success: false, error: "Your previous join request was rejected" },
        { status: 400 }
      );
    }

    // Check if user has old ACCEPTED request but left the event
    // Delete old request to allow rejoin
    const acceptedRequest = event.joinRequests.find(r => r.status === "ACCEPTED");
    if (acceptedRequest && !isAlreadyParticipant) {
      await prisma.eventJoinRequest.delete({
        where: { id: acceptedRequest.id }
      });
    }

    // Fetch user data for validation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hobbies: { include: { hobby: true } },
        locations: { include: { location: { include: { city: true } } } },
        receivedReviews: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user can join the event
    const validationResult = EventService.canUserJoinEvent(event as any, user as any);

    if (!validationResult.canJoin) {
      return NextResponse.json(
        { success: false, error: validationResult.reason },
        { status: 400 }
      );
    }

    // Create join request with PENDING status
    const joinRequest = await prisma.eventJoinRequest.create({
      data: {
        eventId,
        userId,
        status: "PENDING",
        message: message || null,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, bio: true },
        },
      },
    });

    // Create notification for event host about new join request
    const notification = await prisma.notification.create({
      data: {
        userId: event.host.id,
        type: "EVENT_JOIN_REQUEST",
        title: "New join request",
        message: `${user.name} wants to join your event "${event.title}"`,
        eventId,
        data: JSON.stringify({
          eventId,
          requestId: joinRequest.id,
          userId: userId,
          userName: user.name,
          userImage: user.image,
          userBio: user.bio,
          message: message || null,
        }),
      },
    });

    // Emit real-time notification via Socket.IO to host
    try {
      const { socketEmit } = await import('@/lib/socket');
      const hostUserId = event.host.id.toString();
      console.log('[DEBUG] Sending join request notification to host:', hostUserId);
      
      await socketEmit.toUser(hostUserId, 'notification', {
        id: notification.id,
        type: 'EVENT_JOIN_REQUEST',
        title: notification.title,
        message: notification.message,
        data: {
          eventId,
          requestId: joinRequest.id,
          userId: userId,
          userName: user.name,
          userImage: user.image,
          userBio: user.bio,
          message: message || null,
        },
        createdAt: notification.createdAt,
      });

      // Also emit event-specific event for join request
      await socketEmit.toUser(hostUserId, 'event-join-request', {
        eventId,
        requestId: joinRequest.id,
        user: {
          id: userId,
          name: user.name,
          image: user.image,
          bio: user.bio,
        },
        message: message || null,
        createdAt: joinRequest.createdAt,
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    return NextResponse.json({
      success: true,
      message: "Join request sent successfully. Please wait for the host to approve.",
      data: {
        requestId: joinRequest.id,
        status: "PENDING",
      },
    });
  } catch (error: any) {
    console.error("Error creating join request:", error);

    // Handle unique constraint violation (already has request)
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "You already have a join request for this event" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]/join
 * Leave an event
 */
export async function DELETE(
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

    const eventId = parseId(params.id);
    const userId = parseId(session.user.id);

    if (!eventId || !userId) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const participation = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { success: false, error: "You are not a participant of this event" },
        { status: 400 }
      );
    }

    if (participation.status !== "JOINED") {
      return NextResponse.json(
        { success: false, error: "You have already left this event" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        title: true, 
        date: true, 
        status: true,
        hostId: true,
        maxParticipants: true,
        _count: { 
          select: { 
            participants: {
              where: { status: "JOINED" }
            }
          } 
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    if (event.date < now) {
      return NextResponse.json(
        { success: false, error: "Cannot leave an event that has already started" },
        { status: 400 }
      );
    }

    await prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    await prisma.eventJoinRequest.deleteMany({
      where: {
        eventId,
        userId,
      },
    });

    // Update event status back to OPEN if it was FULL
    const newParticipantCount = event._count.participants - 1;
    if (event.status === "FULL" && newParticipantCount < event.maxParticipants) {
      await prisma.event.update({
        where: { id: eventId },
        data: { status: "OPEN" },
      });
    }

    // Get user info for notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true },
    });

    // Remove user from event group chat
    const eventChat = await prisma.chat.findFirst({
      where: { eventId, type: "EVENT" },
    });

    if (eventChat && user) {
      // Update chat participant (mark as left instead of deleting)
      await prisma.chatParticipant.updateMany({
        where: {
          chatId: eventChat.id,
          userId,
        },
        data: {
          leftAt: new Date(),
        },
      });

      // Send system message
      await prisma.message.create({
        data: {
          chatId: eventChat.id,
          senderId: userId,
          content: `${user.name} left the group`,
          type: "SYSTEM",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully left the event",
      data: {
        participantCount: newParticipantCount,
      },
    });
  } catch (error) {
    console.error("Error leaving event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
