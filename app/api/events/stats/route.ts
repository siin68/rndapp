import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Get event counts
    const openEventsCount = await prisma.event.count({
      where: {
        status: "OPEN",
        date: { gte: new Date() },
      },
    });

    let userStats = {};

    if (userId) {
      const [hostedCount, participatingCount, matchingHobbies] =
        await Promise.all([
          prisma.event.count({
            where: { hostId: userId },
          }),
          prisma.event.count({
            where: {
              participants: {
                some: {
                  userId,
                  status: "JOINED",
                },
              },
            },
          }),
          // Count of people who share same hobbies
          prisma.user.count({
            where: {
              AND: [
                { id: { not: userId } },
                {
                  hobbies: {
                    some: {
                      hobbyId: {
                        in: await prisma.userHobby
                          .findMany({
                            where: { userId },
                            select: { hobbyId: true },
                          })
                          .then((hobbies) => hobbies.map((h) => h.hobbyId)),
                      },
                    },
                  },
                },
              ],
            },
          }),
        ]);

      userStats = {
        hosted: hostedCount,
        participating: participatingCount,
        matches: matchingHobbies,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        openEvents: openEventsCount,
        user: userStats,
      },
    });
  } catch (error) {
    console.error("Error fetching event stats:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
