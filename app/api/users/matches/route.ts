import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");

    const hobbiesFilter = searchParams.get("hobbies")?.split(",") || [];
    const minAge = searchParams.get("minAge")
      ? parseInt(searchParams.get("minAge")!)
      : undefined;
    const maxAge = searchParams.get("maxAge")
      ? parseInt(searchParams.get("maxAge")!)
      : undefined;
    const maxDistance = searchParams.get("maxDistance")
      ? parseInt(searchParams.get("maxDistance")!)
      : undefined;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hobbies: { include: { hobby: true } },
        locations: { include: { location: true } },
        hostedEvents: {
          include: {
            participants: {
              select: { userId: true },
            },
          },
        },
        eventParticipants: {
          select: {
            event: {
              select: {
                hostId: true,
                participants: {
                  select: { userId: true },
                },
              },
            },
          },
        },
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

    const whereConditions: any = {
      AND: [
        { id: { not: userId } }, 
        { isActive: true },
      ],
    };

    if (minAge !== undefined || maxAge !== undefined) {
      const ageConditions: any = {};

      if (minAge !== undefined) {
        ageConditions.gte = minAge;
      }

      if (maxAge !== undefined) {
        ageConditions.lte = maxAge;
      }

      if (Object.keys(ageConditions).length > 0) {
        whereConditions.AND.push({ age: ageConditions });
      }
    }

    if (hobbiesFilter.length > 0) {
      whereConditions.AND.push({
        hobbies: {
          some: {
            hobbyId: { in: hobbiesFilter },
          },
        },
      });
    } else {
      whereConditions.AND.push({
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
      });
    }

    const matchedUsers = await prisma.user.findMany({
      where: whereConditions,
      include: {
        hobbies: {
          include: { hobby: true },
          where:
            hobbiesFilter.length > 0
              ? { hobbyId: { in: hobbiesFilter } }
              : { hobbyId: { in: userHobbyIds } },
        },
        locations: {
          include: { location: true },
          where: { locationId: { in: userLocationIds } },
        },
      },
      take: limit,
    });

    let usersWithScores = matchedUsers.map((matchedUser) => {
      const sharedHobbies = matchedUser.hobbies.length;
      const sharedLocations = matchedUser.locations.length;
      const matchScore = sharedHobbies * 2 + sharedLocations; 

      return {
        id: matchedUser.id,
        name: matchedUser.name,
        image: matchedUser.image,
        bio: matchedUser.bio,
        sharedHobbies: matchedUser.hobbies,
        sharedLocations: matchedUser.locations,
        matchScore,
        lastActive: matchedUser.lastActive,
        // Add distance for potential filtering (mock data for now)
        distance: Math.floor(Math.random() * 50) + 1, // 1-50 km
      };
    });

    // Apply distance filtering if specified
    if (maxDistance !== undefined) {
      usersWithScores = usersWithScores.filter(
        (user) => user.distance <= maxDistance
      );
    }

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
