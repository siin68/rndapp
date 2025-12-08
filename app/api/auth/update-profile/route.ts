import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from '@/lib/auth.config';

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

    await prisma.user.update({
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

    await prisma.$executeRaw`UPDATE "User" SET "onboardingCompleted" = true WHERE "id" = ${existingUser.id}`;

    if (hobbies && Array.isArray(hobbies)) {
      await prisma.userHobby.deleteMany({
        where: { userId: existingUser.id },
      });

      for (let i = 0; i < hobbies.length; i++) {
        const hobbyData = hobbies[i];
        let hobbyId: number | undefined;
        if (typeof hobbyData === 'number') {
          hobbyId = hobbyData;
        } else if (typeof hobbyData === 'string') {
          hobbyId = parseInt(hobbyData, 10);
        } else if (hobbyData && typeof hobbyData === 'object') {
          hobbyId = typeof hobbyData.hobbyId === 'number' ? hobbyData.hobbyId : parseInt(hobbyData.hobbyId, 10);
        }
        
        if (hobbyId && !isNaN(hobbyId)) {
          await prisma.userHobby.create({
            data: {
              userId: existingUser.id,
              hobbyId: hobbyId,
              skillLevel: typeof hobbyData === 'object' ? hobbyData.skillLevel || "BEGINNER" : "BEGINNER",
              isPrimary: typeof hobbyData === 'object' ? hobbyData.isPrimary || (i === 0) : (i === 0),
            },
          });
        }
      }
    }

    if (locations && Array.isArray(locations)) {
      await prisma.userLocation.deleteMany({
        where: { userId: existingUser.id },
      });

      for (let i = 0; i < locations.length; i++) {
        const locationData = locations[i];
        let locationId: number | undefined;
        if (typeof locationData === 'number') {
          locationId = locationData;
        } else if (typeof locationData === 'string') {
          locationId = parseInt(locationData, 10);
        } else if (locationData && typeof locationData === 'object') {
          locationId = typeof locationData.locationId === 'number' ? locationData.locationId : parseInt(locationData.locationId, 10);
        }
        
        if (locationId && !isNaN(locationId)) {
          await prisma.userLocation.create({
            data: {
              userId: existingUser.id,
              locationId: locationId,
              isPrimary: typeof locationData === 'object' ? locationData.isPrimary || (i === 0) : (i === 0),
            },
          });
        }
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
