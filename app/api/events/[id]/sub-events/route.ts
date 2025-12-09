import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseId } from "@/lib/utils/id-parser";

// GET /api/events/[id]/sub-events - Get all sub-events for a parent event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseId(params.id);
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const subEvents = await prisma.event.findMany({
      where: {
        parentEventId: eventId,
        status: { not: "CANCELLED" },
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        location: true,
        hobbies: {
          include: {
            hobby: true,
          },
        },
        participants: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: subEvents,
    });
  } catch (error) {
    console.error("Error fetching sub-events:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/sub-events - Create a new sub-event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseId(params.id);
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, date, maxParticipants, hostId, image } = body;

    // Validate required fields
    if (!title || !date || !hostId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if parent event exists
    const parentEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        hobbies: {
          include: {
            hobby: true,
          },
        },
      },
    });

    if (!parentEvent) {
      return NextResponse.json(
        { success: false, error: "Parent event not found" },
        { status: 404 }
      );
    }

    // Use parent event's location if locationId is not provided
    const finalLocationId = parentEvent.locationId;

    // Create sub-event
    const subEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        duration: 60,
        locationId: finalLocationId,
        maxParticipants: maxParticipants || 10,
        hostId: parseId(hostId)!,
        parentEventId: eventId,
        status: "OPEN",
        isPrivate: parentEvent.isPrivate,
        image: image || null,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        location: true,
      },
    });

    // Copy hobbies from parent event
    if (parentEvent.hobbies && parentEvent.hobbies.length > 0) {
      await prisma.eventHobby.createMany({
        data: parentEvent.hobbies.map((eh) => ({
          eventId: subEvent.id,
          hobbyId: eh.hobbyId,
          isPrimary: eh.isPrimary,
        })),
      });
    }

    // Auto-add creator as participant
    await prisma.eventParticipant.create({
      data: {
        eventId: subEvent.id,
        userId: parseId(hostId)!,
        status: "JOINED",
      },
    });

    return NextResponse.json({
      success: true,
      data: subEvent,
    });
  } catch (error) {
    console.error("Error creating sub-event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
