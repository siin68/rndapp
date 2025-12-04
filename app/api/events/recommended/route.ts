import { NextRequest, NextResponse } from "next/server";
import { eventQueries } from "@/lib/database/queries";
import { EventService } from "@/lib/database/services";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
        { status: 400 }
      );
    }

    const recommendedEvents = await eventQueries.findRecommendedEvents(
      userId,
      limit
    );

    const eventsWithStats = recommendedEvents.map((event) => {
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
    console.error("Error fetching recommended events:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
