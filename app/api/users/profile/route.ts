import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { userQueries } from "@/lib/database/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
        { status: 400 }
      );
    }

    const userProfile = await userQueries.getUserProfile(userId);

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const averageRating =
      userProfile.receivedReviews.length > 0
        ? userProfile.receivedReviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / userProfile.receivedReviews.length
        : 0;

    const responseData = {
      profile: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        image: userProfile.image,
        bio: userProfile.bio,
        age: userProfile.age,
        gender: userProfile.gender,
        isActive: userProfile.isActive,
        isVerified: userProfile.isVerified,
        lastActive: userProfile.lastActive,
        createdAt: userProfile.createdAt,
      },
      hobbies: userProfile.hobbies.map((userHobby) => ({
        id: userHobby.hobby.id,
        name: userHobby.hobby.name,
        nameVi: userHobby.hobby.nameVi,
        category: userHobby.hobby.category,
        icon: userHobby.hobby.icon,
        skillLevel: userHobby.skillLevel,
        isPrimary: userHobby.isPrimary,
      })),
      locations: userProfile.locations.map((userLocation) => ({
        id: userLocation.location.id,
        name: userLocation.location.name,
        nameVi: userLocation.location.nameVi,
        city: userLocation.location.city,
        isPrimary: userLocation.isPrimary,
      })),
      stats: {
        eventsHosted: userProfile._count.hostedEvents,
        eventsAttended: userProfile._count.eventParticipants,
        totalReviews: userProfile._count.receivedReviews,
        averageRating: Math.round(averageRating * 10) / 10, 
      },
      recentReviews: userProfile.receivedReviews.slice(-5).map((review) => ({
        rating: review.rating,
        comment: review.comment,
        reviewer: review.reviewer,
      })),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
        { status: 400 }
      );
    }

    const { profile, hobbies, locations } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: profile.name,
        bio: profile.bio,
        age: profile.age,
        gender: profile.gender,
        profileVisibility: profile.profileVisibility,
        distanceRadius: profile.distanceRadius,
        ageRangeMin: profile.ageRangeMin,
        ageRangeMax: profile.ageRangeMax,
      },
    });

    if (hobbies && Array.isArray(hobbies)) {
      await prisma.userHobby.deleteMany({
        where: { userId },
      });

      for (const hobby of hobbies) {
        await prisma.userHobby.create({
          data: {
            userId,
            hobbyId: hobby.hobbyId,
            skillLevel: hobby.skillLevel || "BEGINNER",
            isPrimary: hobby.isPrimary || false,
          },
        });
      }
    }

    if (locations && Array.isArray(locations)) {
      await prisma.userLocation.deleteMany({
        where: { userId },
      });

      for (const location of locations) {
        await prisma.userLocation.create({
          data: {
            userId,
            locationId: location.locationId,
            isPrimary: location.isPrimary || false,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { message: "Profile updated successfully" },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
