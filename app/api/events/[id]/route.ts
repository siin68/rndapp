import { NextRequest, NextResponse } from "next/server";
import { eventQueries } from "@/lib/database/queries";
import { EventService } from "@/lib/database/services";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const { searchParams } = new URL(request.url);
    const viewerId = searchParams.get("userId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const event = await eventQueries.getEventDetails(
      eventId,
      viewerId || undefined
    );

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Calculate event stats
    const stats = EventService.calculateEventStats(event as any);

    const eventWithStats = {
      ...event,
      stats,
    };

    return NextResponse.json({
      success: true,
      data: eventWithStats,
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json();
    const {
      title,
      description,
      image,
      hobbyIds,
      locationId,
      date,
      maxParticipants,
      minParticipants,
      isPrivate,
      requiresApproval,
    } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if event exists and get current host
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { hostId: true },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Validate hobbies if provided
    if (hobbyIds && Array.isArray(hobbyIds) && hobbyIds.length > 0) {
      const hobbiesExist = await prisma.hobby.findMany({
        where: { id: { in: hobbyIds } },
      });

      if (hobbiesExist.length !== hobbyIds.length) {
        return NextResponse.json(
          { success: false, error: "Some hobbies not found" },
          { status: 400 }
        );
      }
    }

    // Validate location if provided
    if (locationId) {
      const locationExists = await prisma.location.findUnique({
        where: { id: locationId },
      });

      if (!locationExists) {
        return NextResponse.json(
          { success: false, error: "Location not found" },
          { status: 400 }
        );
      }
    }

    // Parse date if provided
    let eventDate: Date | undefined;
    if (date) {
      try {
        eventDate = new Date(date);
        if (isNaN(eventDate.getTime())) {
          throw new Error("Invalid date");
        }
      } catch (dateError) {
        return NextResponse.json(
          { success: false, error: "Invalid date format" },
          { status: 400 }
        );
      }
    }

    // Update event with transaction
    const updatedEvent = await prisma.$transaction(async (prisma) => {
      // Update the event
      const event = await prisma.event.update({
        where: { id: eventId },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(image !== undefined && { image }),
          ...(locationId && { locationId }),
          ...(eventDate && { date: eventDate }),
          ...(maxParticipants && {
            maxParticipants: parseInt(maxParticipants.toString()),
          }),
          ...(minParticipants && {
            minParticipants: parseInt(minParticipants.toString()),
          }),
          ...(isPrivate !== undefined && { isPrivate }),
          ...(requiresApproval !== undefined && { requiresApproval }),
        },
        include: {
          host: {
            select: { id: true, name: true, image: true },
          },
          location: {
            include: { city: true },
          },
        },
      });

      // Update hobbies if provided
      if (hobbyIds && Array.isArray(hobbyIds)) {
        // Delete existing hobby associations
        await prisma.eventHobby.deleteMany({
          where: { eventId },
        });

        // Create new hobby associations
        await prisma.eventHobby.createMany({
          data: hobbyIds.map((hobbyId: string, index: number) => ({
            eventId,
            hobbyId,
            isPrimary: index === 0, // First hobby is primary
          })),
        });
      }

      // Fetch complete event with hobbies
      return await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          host: {
            select: { id: true, name: true, image: true },
          },
          location: {
            include: { city: true },
          },
          hobbies: {
            include: {
              hobby: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if event exists and user is the host
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { hostId: true, title: true },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (existingEvent.hostId !== (session.user as any).id) {
      return NextResponse.json(
        { success: false, error: "Only the host can delete this event" },
        { status: 403 }
      );
    }

    // Delete event with transaction (cascade delete will handle related records)
    await prisma.$transaction(async (prisma) => {
      // Delete event hobbies
      await prisma.eventHobby.deleteMany({
        where: { eventId },
      });

      // Delete event participants
      await prisma.eventParticipant.deleteMany({
        where: { eventId },
      });

      // Delete the event
      await prisma.event.delete({
        where: { id: eventId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
