import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseId } from "@/lib/utils/id-parser";
import { calculateDistance } from "@/lib/locationUtils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");

    const hobbiesFilterParam = searchParams.get("hobbies")?.split(",") || [];
    const hobbiesFilter = hobbiesFilterParam.map(h => parseInt(h)).filter(h => !isNaN(h));
    const minAge = searchParams.get("minAge")
      ? parseInt(searchParams.get("minAge")!)
      : undefined;
    const maxAge = searchParams.get("maxAge")
      ? parseInt(searchParams.get("maxAge")!)
      : undefined;
    const maxDistance = searchParams.get("maxDistance")
      ? parseInt(searchParams.get("maxDistance")!)
      : undefined;
    const genderFilter = searchParams.get("gender") || undefined;

    if (!userIdParam) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
        { status: 400 }
      );
    }

    const userId = parseId(userIdParam);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hobbies: { include: { hobby: true } },
        locations: { 
          include: { 
            location: true 
          },
          where: {
            isPrimary: true // Get primary location for distance calculation
          }
        },
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
    
    // Get user's primary location for distance calculation
    const userPrimaryLocation = user.locations.find((ul) => ul.isPrimary)?.location;
    const userLat = userPrimaryLocation?.latitude;
    const userLng = userPrimaryLocation?.longitude;

    const whereConditions: any = {
      AND: [
        { id: { not: userId } }, 
        { isActive: true },
      ],
    };

    if (genderFilter) {
      whereConditions.AND.push({ gender: genderFilter });
    }

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
        },
      },
      take: limit * 2, // Fetch more for distance filtering
    });

    let usersWithScores = matchedUsers.map((matchedUser) => {
      const sharedHobbies = matchedUser.hobbies.filter(h => 
        userHobbyIds.includes(h.hobbyId)
      ).length;
      const sharedLocations = matchedUser.locations.filter(l => 
        userLocationIds.includes(l.locationId)
      ).length;
      const matchScore = sharedHobbies * 2 + sharedLocations; 

      // Calculate distance from user's primary location to matched user's primary location
      let distance: number | undefined = undefined;
      if (userLat !== null && userLat !== undefined && userLng !== null && userLng !== undefined) {
        const matchedUserPrimaryLocation = matchedUser.locations.find((ul) => ul.isPrimary)?.location;
        if (matchedUserPrimaryLocation?.latitude !== null && 
            matchedUserPrimaryLocation?.latitude !== undefined &&
            matchedUserPrimaryLocation?.longitude !== null && 
            matchedUserPrimaryLocation?.longitude !== undefined) {
          const calculatedDistance = calculateDistance(
            userLat,
            userLng,
            matchedUserPrimaryLocation.latitude,
            matchedUserPrimaryLocation.longitude
          );
          // Minimum 1km, if less than 1 it will show as "< 1km" on UI
          distance = Math.max(1, Math.round(calculatedDistance));
        }
      }

      return {
        id: matchedUser.id,
        name: matchedUser.name,
        image: matchedUser.image,
        bio: matchedUser.bio,
        sharedHobbies: matchedUser.hobbies.filter(h => 
          userHobbyIds.includes(h.hobbyId)
        ),
        sharedLocations: matchedUser.locations.filter(l => 
          userLocationIds.includes(l.locationId)
        ),
        matchScore,
        lastActive: matchedUser.lastActive,
        distance, // Real calculated distance in km
      };
    });

    // Apply distance filtering if specified
    if (maxDistance !== undefined) {
      usersWithScores = usersWithScores.filter(
        (user) => user.distance !== undefined && user.distance <= maxDistance
      );
    }

    // Sort by match score, then by distance (closer is better)
    const sortedMatches = usersWithScores
      .sort((a, b) => {
        // First sort by match score
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        // If match scores are equal, sort by distance (closer first)
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      })
      .slice(0, limit); // Apply limit after distance filtering

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
