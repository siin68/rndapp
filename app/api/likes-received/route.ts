import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get("userId");

    if (!userIdStr) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    // Convert userId to integer
    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId format" },
        { status: 400 }
      );
    }

    // Get all LIKE swipes where current user is the target
    // and exclude already matched users (friends)
    const likesReceived = await prisma.swipe.findMany({
      where: {
        targetId: userId,
        action: "LIKE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            age: true,
            bio: true,
            hobbies: {
              include: {
                hobby: {
                  select: {
                    id: true,
                    name: true,
                    nameVi: true,
                    icon: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check which ones are already friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      select: {
        user1Id: true,
        user2Id: true,
      },
    });

    // Get friend IDs
    const friendIds = new Set(
      friendships.flatMap(f => [f.user1Id, f.user2Id]).filter(id => id !== userId)
    );

    // Filter out friends (already matched)
    const nonFriendLikes = likesReceived.filter(
      like => !friendIds.has(like.userId)
    );

    return NextResponse.json({
      success: true,
      data: nonFriendLikes,
      count: nonFriendLikes.length,
    });
  } catch (error) {
    console.error("Error fetching likes received:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}
