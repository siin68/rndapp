import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: eventId, requestId } = params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!eventId || !requestId) {
      return NextResponse.json(
        { success: false, error: "Event ID and Request ID are required" },
        { status: 400 }
      );
    }

    // Check if user is the host
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        hostId: true,
        title: true,
        maxParticipants: true,
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

    if (event.hostId !== (session.user as any).id) {
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
      include: { user: true },
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

    // Accept the request in a transaction
    await prisma.$transaction(async (prisma) => {
      // Update request status
      await prisma.eventJoinRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });

      // Add user as participant
      await prisma.eventParticipant.create({
        data: {
          eventId,
          userId: joinRequest.userId,
        },
      });

      // Create notification for the user
      await prisma.notification.create({
        data: {
          userId: joinRequest.userId,
          type: "EVENT_ACCEPTED",
          message: `Your request to join "${event.title}" has been accepted`,
          eventId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Join request accepted",
    });
  } catch (error) {
    console.error("Error accepting join request:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
