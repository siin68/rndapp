import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth.config';
import prisma from "@/lib/prisma";
import { EventService } from "@/lib/database/services";

/**
 * POST /api/events/[id]/join
 * Join an event
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

    const eventId = params.id;
    const userId = session.user.id;

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

    // Create participation record
    const participant = await prisma.eventParticipant.create({
      data: {
        eventId,
        userId,
        status: "JOINED",
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, bio: true },
        },
      },
    });

    // Update event status to FULL if needed
    const newParticipantCount = event._count.participants + 1;
    if (newParticipantCount >= event.maxParticipants && event.status === "OPEN") {
      await prisma.event.update({
        where: { id: eventId },
        data: { status: "FULL" },
      });
    }

    // Create notification for event host
    const notification = await prisma.notification.create({
      data: {
        userId: event.hostId,
        type: "EVENT_JOIN",
        title: "New participant joined",
        message: `${user.name} has joined your event "${event.title}"`,
        data: JSON.stringify({
          eventId,
          participantId: userId,
          participantName: user.name,
          participantImage: user.image,
        }),
      },
    });

    // Emit real-time notification via Socket.IO
    try {
      const { socketEmit } = await import('@/lib/socket');
      
      // Send notification to host
      socketEmit.toUser(event.hostId, 'notification', {
        id: notification.id,
        type: 'EVENT_JOIN',
        title: notification.title,
        message: notification.message,
        data: {
          eventId,
          participantId: userId,
          participantName: user.name,
          participantImage: user.image,
        },
        createdAt: notification.createdAt,
      });

      // Broadcast to all event participants
      socketEmit.toEvent(eventId, 'event-joined', {
        eventId,
        userId,
        userName: user.name,
        userImage: user.image,
        participantCount: newParticipantCount,
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined the event",
      data: {
        participant,
        participantCount: newParticipantCount,
      },
    });
  } catch (error: any) {
    console.error("Error joining event:", error);

    // Handle unique constraint violation (already joined)
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "You have already joined this event" },
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

    const eventId = params.id;
    const userId = session.user.id;

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

    // Delete the participation record so user can rejoin later
    await prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
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

    // Create notification for event host
    if (user) {
      await prisma.notification.create({
        data: {
          userId: event.hostId,
          type: "EVENT_LEAVE",
          title: "Participant left event",
          message: `${user.name} has left your event "${event.title}"`,
          data: JSON.stringify({
            eventId,
            participantId: userId,
            participantName: user.name,
            participantImage: user.image,
          }),
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
