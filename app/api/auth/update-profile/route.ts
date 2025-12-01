import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { hobbies, locations, profile } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: profile.name || existingUser.name,
        bio: profile.bio,
        age: profile.age,
        gender: profile.gender?.toUpperCase(),
        profileVisibility: profile.profileVisibility || "PUBLIC",
        distanceRadius: profile.distanceRadius || 10,
        ageRangeMin: profile.ageRangeMin || 18,
        ageRangeMax: profile.ageRangeMax || 50,
      },
    });

    if (hobbies && Array.isArray(hobbies)) {
      await prisma.userHobby.deleteMany({
        where: { userId: existingUser.id },
      });

      for (const hobby of hobbies) {
        await prisma.userHobby.create({
          data: {
            userId: existingUser.id,
            hobbyId: hobby.hobbyId,
            skillLevel: hobby.skillLevel || "BEGINNER",
            isPrimary: hobby.isPrimary || false,
          },
        });
      }
    }

    if (locations && Array.isArray(locations)) {
      await prisma.userLocation.deleteMany({
        where: { userId: existingUser.id },
      });

      for (const location of locations) {
        await prisma.userLocation.create({
          data: {
            userId: existingUser.id,
            locationId: location.locationId,
            isPrimary: location.isPrimary || false,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
