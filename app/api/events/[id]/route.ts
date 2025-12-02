import { NextRequest, NextResponse } from "next/server";
import { eventQueries } from "@/lib/database/queries";
import { EventService } from "@/lib/database/services";

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
    const stats = EventService.calculateEventStats(event);

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
