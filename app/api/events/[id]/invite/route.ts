import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { userId: userIdStr } = body;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const eventId = parseInt(params.id, 10);
    const userId = parseInt(userIdStr, 10);

    if (isNaN(eventId) || isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Event ID or User ID" },
        { status: 400 }
      );
    }

    // Check if event exists and user is the host
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

    if (event.hostId !== (session.user as any).id) {
      return NextResponse.json(
        { success: false, error: "Only the host can invite participants" },
        { status: 403 }
      );
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingParticipant) {
      return NextResponse.json(
        { success: false, error: "User is already a participant" },
        { status: 400 }
      );
    }

    // Create notification for the invited user
    await prisma.notification.create({
      data: {
        userId,
        type: "EVENT_INVITE",
        message: `You've been invited to join "${event.title}"`,
        eventId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
