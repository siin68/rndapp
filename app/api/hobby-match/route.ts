import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { userQueries } from "@/lib/database/queries/user";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const distance = parseInt(searchParams.get("distance") || "10");
    const limit = parseInt(searchParams.get("limit") || "20");

    const currentUser = await userQueries.getUserByEmail(session.user.email);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const compatibleUsers = await userQueries.findCompatibleUsers(
      currentUser.id,
      distance
    );

    const matches = compatibleUsers
      .map((user) => {
        const userHobbyIds = currentUser.hobbies.map((h) => h.hobbyId);
        const matchHobbyIds = user.hobbies.map((h) => h.hobbyId);

        const commonHobbies = userHobbyIds.filter((hobbyId) =>
          matchHobbyIds.includes(hobbyId)
        );

        const hobbyCompatibility =
          commonHobbies.length > 0
            ? (commonHobbies.length /
                Math.max(userHobbyIds.length, matchHobbyIds.length)) *
              100
            : 0;

        const userLocationIds = currentUser.locations.map((l) => l.locationId);
        const matchLocationIds = user.locations.map((l) => l.locationId);

        const commonLocations = userLocationIds.filter((locationId) =>
          matchLocationIds.includes(locationId)
        );

        const locationCompatibility =
          commonLocations.length > 0
            ? (commonLocations.length /
                Math.max(userLocationIds.length, matchLocationIds.length)) *
              100
            : 0;

        const overallScore =
          hobbyCompatibility * 0.7 + locationCompatibility * 0.3;

        const avgRating =
          user.receivedReviews.length > 0
            ? user.receivedReviews.reduce(
                (sum, review) => sum + review.rating,
                0
              ) / user.receivedReviews.length
            : 0;

        return {
          id: user.id,
          name: user.name,
          image: user.image,
          bio: user.bio,
          age: user.age,
          gender: user.gender,
          compatibilityScore: Math.round(overallScore),
          hobbyCompatibility: Math.round(hobbyCompatibility),
          locationCompatibility: Math.round(locationCompatibility),
          commonHobbies: user.hobbies
            .filter((h) => userHobbyIds.includes(h.hobbyId))
            .map((h) => h.hobby),
          commonLocations: user.locations
            .filter((l) => userLocationIds.includes(l.locationId))
            .map((l) => l.location),
          hobbies: user.hobbies.map((h) => ({
            ...h.hobby,
            skillLevel: h.skillLevel,
            isPrimary: h.isPrimary,
          })),
          locations: user.locations.map((l) => ({
            ...l.location,
            city: l.location.city,
            isPrimary: l.isPrimary,
          })),
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: user.receivedReviews.length,
          lastActive: user.lastActive,
        };
      })
      // Sort by compatibility score
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      // Take only the requested limit
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        matches,
        total: matches.length,
        currentUser: {
          id: currentUser.id,
          hobbies: currentUser.hobbies.map((h) => h.hobby),
          locations: currentUser.locations.map((l) => ({
            ...l.location,
            city: l.location.city,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Error finding hobby matches:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { hobbyIds, locationIds, distance = 10 } = await request.json();

    // Get current user
    const currentUser = await userQueries.getUserByEmail(session.user.email);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Find users with specific hobbies and locations
    const matches = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUser.id } },
          { isActive: true },
          hobbyIds
            ? {
                hobbies: { some: { hobbyId: { in: hobbyIds } } },
              }
            : {},
          locationIds
            ? {
                locations: { some: { locationId: { in: locationIds } } },
              }
            : {},
        ],
      },
      include: {
        hobbies: { include: { hobby: true } },
        locations: { include: { location: { include: { city: true } } } },
        receivedReviews: { select: { rating: true } },
      },
      take: 50,
    });

    const formattedMatches = matches
      .map((user) => {
        const userHobbyIds =
          hobbyIds || currentUser.hobbies.map((h) => h.hobbyId);
        const userLocationIds =
          locationIds || currentUser.locations.map((l) => l.locationId);

        const matchHobbyIds = user.hobbies.map((h) => h.hobbyId);
        const matchLocationIds = user.locations.map((l) => l.locationId);

        const commonHobbies = userHobbyIds.filter((hobbyId: any) =>
          matchHobbyIds.includes(hobbyId)
        );

        const commonLocations = userLocationIds.filter((locationId: any) =>
          matchLocationIds.includes(locationId)
        );

        const hobbyScore = (commonHobbies.length / userHobbyIds.length) * 100;
        const locationScore =
          (commonLocations.length / userLocationIds.length) * 100;
        const overallScore = hobbyScore * 0.7 + locationScore * 0.3;

        const avgRating =
          user.receivedReviews.length > 0
            ? user.receivedReviews.reduce(
                (sum, review) => sum + review.rating,
                0
              ) / user.receivedReviews.length
            : 0;

        return {
          id: user.id,
          name: user.name,
          image: user.image,
          bio: user.bio,
          age: user.age,
          gender: user.gender,
          compatibilityScore: Math.round(overallScore),
          commonHobbies: user.hobbies
            .filter((h) => userHobbyIds.includes(h.hobbyId))
            .map((h) => h.hobby),
          commonLocations: user.locations
            .filter((l) => userLocationIds.includes(l.locationId))
            .map((l) => l.location),
          hobbies: user.hobbies.map((h) => h.hobby),
          locations: user.locations.map((l) => l.location),
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: user.receivedReviews.length,
          lastActive: user.lastActive,
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return NextResponse.json({
      success: true,
      data: {
        matches: formattedMatches,
        total: formattedMatches.length,
        filters: { hobbyIds, locationIds, distance },
      },
    });
  } catch (error) {
    console.error("Error finding custom hobby matches:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
