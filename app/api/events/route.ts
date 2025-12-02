import { NextRequest, NextResponse } from "next/server";
import { eventQueries } from "@/lib/database/queries";
import { EventService } from "@/lib/database/services";

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
      events = await eventQueries.searchEvents("", {}, limit);
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
      hostId,
      hobbyId,
      locationId,
      date,
      duration,
      maxParticipants = 10,
      minParticipants = 2,
      price = 0,
      isPrivate = false,
      requiresApproval = false,
    } = body;

    // Validate required fields
    if (!title || !hostId || !hobbyId || !locationId || !date) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create event
    const event = await eventQueries.createEvent({
      title,
      description,
      image,
      hostId,
      hobbyId,
      locationId,
      date: new Date(date),
      duration,
      maxParticipants,
      minParticipants,
      price,
      isPrivate,
      requiresApproval,
      status: "OPEN",
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
