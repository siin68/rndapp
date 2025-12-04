import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { userQueries } from "@/lib/database/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
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
      hobbies: userProfile.hobbies.map((userHobby) => ({
        id: userHobby.hobby.id,
        name: userHobby.hobby.name,
        emoji: userHobby.hobby.icon,
        isPrimary: userHobby.isPrimary,
      })),
      preferredLocations: userProfile.locations.map((userLocation) => ({
        id: userLocation.location.id,
        name: userLocation.location.name,
        nameVi: userLocation.location.nameVi,
        city: {
          id: userLocation.location.city.id,
          name: userLocation.location.city.name,
          nameVi: userLocation.location.city.nameVi,
        },
      })),
      events: userProfile.eventParticipants.map((participant) => ({
        id: participant.event.id,
        title: participant.event.title,
        description: participant.event.description,
        date: participant.event.date,
        status: participant.event.status,
        image: participant.event.image,
      })),
      hostedEvents: userProfile.hostedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        status: event.status,
        image: event.image,
      })),
      stats: {
        eventsHosted: userProfile._count.hostedEvents,
        eventsAttended: userProfile._count.eventParticipants,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: userProfile._count.receivedReviews,
      },
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
