import { NextRequest, NextResponse } from "next/server";
import { eventQueries } from "@/lib/database/queries";
import { EventService } from "@/lib/database/services";
import prisma from "@/lib/prisma";
import { parseId, parseIds } from "@/lib/utils/id-parser";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") || "open";
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type"); // "hosted", "participating", "recommended"

    let events;

    if (type === "hosted" && userId) {
      events = await eventQueries.getUserHostedEvents(userId);
    } else if (type === "participating" && userId) {
      events = await eventQueries.getUserParticipatingEvents(userId);
    } else if (type === "recommended" && userId) {
      events = await eventQueries.findRecommendedEvents(userId, limit);
    } else {
      // For general search, exclude user's own events and events they've already joined
      const filters = userId 
        ? { 
            excludeHostId: userId,
            excludeParticipantId: userId  // Exclude events already joined
          } 
        : {};
      events = await eventQueries.searchEvents("", filters, limit);
    }

    const eventsWithStats = events.map((event) => {
      const stats = EventService.calculateEventStats(event as any);
      return {
        ...event,
        stats,
      };
    });

    return NextResponse.json({
      success: true,
      data: eventsWithStats,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      image,
      hostId: hostIdRaw,
      hobbyId: hobbyIdRaw,
      hobbyIds: hobbyIdsRaw, // Accept array of hobby IDs
      locationId: locationIdRaw,
      date,
      maxParticipants = 10,
      minParticipants = 2,
      isPrivate = false,
      requiresApproval = false,
    } = body;

    // Parse IDs
    const hostId = parseId(hostIdRaw);
    const locationId = parseId(locationIdRaw);

    // Determine hobbies to use - prioritize hobbyIds array, fallback to single hobbyId
    let selectedHobbyIds: number[] = [];
    if (hobbyIdsRaw && Array.isArray(hobbyIdsRaw) && hobbyIdsRaw.length > 0) {
      selectedHobbyIds = parseIds(hobbyIdsRaw);
    } else if (hobbyIdRaw) {
      const parsed = parseId(hobbyIdRaw);
      if (parsed) selectedHobbyIds = [parsed];
    }

    if (
      !title ||
      !hostId ||
      selectedHobbyIds.length === 0 ||
      !locationId ||
      !date
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify all hobbies exist
    const [hobbiesExist, locationExists] = await Promise.all([
      prisma.hobby.findMany({
        where: { id: { in: selectedHobbyIds } },
      }),
      prisma.location.findUnique({ where: { id: locationId } }),
    ]);

    if (hobbiesExist.length !== selectedHobbyIds.length) {
      const foundIds = hobbiesExist.map((h) => h.id);
      const missingIds = selectedHobbyIds.filter(
        (id) => !foundIds.includes(id)
      );
      console.error("Hobbies not found:", missingIds);
      return NextResponse.json(
        {
          success: false,
          error: `Hobbies not found: ${missingIds.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!locationExists) {
      console.error("Location not found:", locationId);
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 400 }
      );
    }

    let eventDate;
    try {
      eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date");
      }
    } catch (dateError) {
      console.error("Date conversion error:", dateError);
      return NextResponse.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Create event with multiple hobbies using transaction
    const event = await prisma.$transaction(async (prisma) => {
      // Create the event
      const createdEvent = await prisma.event.create({
        data: {
          title,
          description,
          image,
          hostId,
          locationId,
          date: eventDate,
          maxParticipants: parseInt(maxParticipants.toString()),
          minParticipants: parseInt(minParticipants.toString()),
          isPrivate,
          requiresApproval,
          status: "OPEN",
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

      // Create EventHobby entries
      await Promise.all(
        selectedHobbyIds.map((hobbyId, index) =>
          prisma.eventHobby.create({
            data: {
              eventId: createdEvent.id,
              hobbyId,
              isPrimary: index === 0, // First hobby is primary
            },
          })
        )
      );

      // Fetch complete event with hobbies
      return await prisma.event.findUnique({
        where: { id: createdEvent.id },
        include: {
          host: {
            select: { id: true, name: true, image: true },
          },
          location: {
            include: { city: true },
          },
          hobbies: {
            include: { hobby: true },
            orderBy: { isPrimary: "desc" },
          },
          _count: {
            select: { participants: true },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
