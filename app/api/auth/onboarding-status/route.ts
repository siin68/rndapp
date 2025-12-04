import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from '@/lib/auth.config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        bio: true,
        age: true,
        gender: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    let isOnboardingCompleted = false;
    try {
      const onboardingStatus = await prisma.$queryRaw<
        { onboardingCompleted: boolean }[]
      >`
        SELECT "onboardingCompleted" FROM "User" WHERE "id" = ${user.id}
      `;
      isOnboardingCompleted = onboardingStatus[0]?.onboardingCompleted || false;
    } catch (error) {
      console.error("Error getting onboarding status:", error);
      isOnboardingCompleted = false;
    }

    const hasBasicProfile = user.bio && user.age && user.gender;

    const needsOnboarding = !isOnboardingCompleted && !hasBasicProfile;

    return NextResponse.json({
      success: true,
      onboardingCompleted: isOnboardingCompleted || hasBasicProfile,
      needsOnboarding,
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
