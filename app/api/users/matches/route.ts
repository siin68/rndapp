import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // Get user's hobbies and locations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hobbies: { include: { hobby: true } },
        locations: { include: { location: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const userHobbyIds = user.hobbies.map((h) => h.hobbyId);
    const userLocationIds = user.locations.map((l) => l.locationId);

    // Find users with matching hobbies or locations
    const matchedUsers = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { isActive: true },
          {
            OR: [
              {
                hobbies: {
                  some: {
                    hobbyId: { in: userHobbyIds },
                  },
                },
              },
              {
                locations: {
                  some: {
                    locationId: { in: userLocationIds },
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        hobbies: {
          include: { hobby: true },
          where: { hobbyId: { in: userHobbyIds } },
        },
        locations: {
          include: { location: true },
          where: { locationId: { in: userLocationIds } },
        },
      },
      take: limit,
    });

    // Calculate match scores and add them to results
    const usersWithScores = matchedUsers.map((matchedUser) => {
      const sharedHobbies = matchedUser.hobbies.length;
      const sharedLocations = matchedUser.locations.length;
      const matchScore = sharedHobbies * 2 + sharedLocations; // Weight hobbies higher

      return {
        id: matchedUser.id,
        name: matchedUser.name,
        image: matchedUser.image,
        bio: matchedUser.bio,
        sharedHobbies: matchedUser.hobbies,
        sharedLocations: matchedUser.locations,
        matchScore,
        lastActive: matchedUser.lastActive,
      };
    });

    // Sort by match score
    const sortedMatches = usersWithScores.sort(
      (a, b) => b.matchScore - a.matchScore
    );

    return NextResponse.json({
      success: true,
      data: sortedMatches,
    });
  } catch (error) {
    console.error("Error fetching hobby matches:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
