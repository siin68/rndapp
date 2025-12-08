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
      select: { hostId: true, title: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.hostId !== userId) {
      return NextResponse.json(
        { success: false, error: "Only the host can reject join requests" },
        { status: 403 }
      );
    }

    // Get the join request
    const joinRequest = await prisma.eventJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: { id: true, name: true }
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

    // Reject the request in a transaction
    const notification = await prisma.$transaction(async (tx) => {
      // Update request status
      await tx.eventJoinRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      // Create notification for the user
      const notif = await tx.notification.create({
        data: {
          userId: joinRequest.userId,
          type: "EVENT_REJECTED",
          title: "Join request rejected",
          message: `Your request to join "${event.title}" has been declined`,
          eventId,
          data: JSON.stringify({
            eventId,
            eventTitle: event.title,
          }),
        },
      });

      return notif;
    });

    // Emit real-time notification via Socket.IO
    try {
      const { socketEmit } = await import('@/lib/socket');
      
      await socketEmit.toUser(joinRequest.userId.toString(), 'notification', {
        id: notification.id,
        type: 'EVENT_REJECTED',
        title: notification.title,
        message: notification.message,
        data: {
          eventId,
          eventTitle: event.title,
        },
        createdAt: notification.createdAt,
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    return NextResponse.json({
      success: true,
      message: "Join request rejected",
    });
  } catch (error) {
    console.error("Error rejecting join request:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

