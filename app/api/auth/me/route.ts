import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { userQueries } from "@/lib/database/queries";
import { authOptions } from "../[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await userQueries.getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    await userQueries.updateLastActive(user.id);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      age: user.age,
      gender: user.gender,
      isActive: user.isActive,
      isVerified: user.isVerified,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      profileVisibility: user.profileVisibility,
      distanceRadius: user.distanceRadius,
      ageRangeMin: user.ageRangeMin,
      ageRangeMax: user.ageRangeMax,
      hobbies: user.hobbies.map((userHobby) => ({
        id: userHobby.hobby.id,
        name: userHobby.hobby.name,
        nameVi: userHobby.hobby.nameVi,
        category: userHobby.hobby.category,
        icon: userHobby.hobby.icon,
        skillLevel: userHobby.skillLevel,
        isPrimary: userHobby.isPrimary,
      })),
      locations: user.locations.map((userLocation) => ({
        id: userLocation.location.id,
        name: userLocation.location.name,
        nameVi: userLocation.location.nameVi,
        city: userLocation.location.city,
        isPrimary: userLocation.isPrimary,
      })),
    };

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
