import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get("userId");

    if (!userIdStr) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
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

    // Get all friendships for the user
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            lastActive: true,
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
            locations: {
              include: {
                location: {
                  select: {
                    id: true,
                    name: true,
                    nameVi: true,
                  },
                },
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            lastActive: true,
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
            locations: {
              include: {
                location: {
                  select: {
                    id: true,
                    name: true,
                    nameVi: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map friendships to return the friend (not the current user)
    const friends = friendships.map((friendship) => {
      const friend = friendship.user1Id === userId ? friendship.user2 : friendship.user1;
      
      return {
        friendshipId: friendship.id,
        createdAt: friendship.createdAt,
        friend: {
          ...friend,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: friends,
      count: friends.length,
    });
  } catch (error) {
    console.error("Error fetching mutual matches:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch mutual matches",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a friendship (unmatch)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const friendshipIdStr = searchParams.get("friendshipId");

    if (!friendshipIdStr) {
      return NextResponse.json(
        { success: false, error: "Missing friendshipId" },
        { status: 400 }
      );
    }

    const friendshipId = parseInt(friendshipIdStr, 10);
    if (isNaN(friendshipId)) {
      return NextResponse.json(
        { success: false, error: "Invalid friendshipId format" },
        { status: 400 }
      );
    }

    // Get friendship details before deleting
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      select: {
        user1Id: true,
        user2Id: true,
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: "Friendship not found" },
        { status: 404 }
      );
    }

    // Delete friendship and swipe records in a transaction
    await prisma.$transaction([
      // Delete the friendship
      prisma.friendship.delete({
        where: { id: friendshipId },
      }),
      // Delete swipe records between these two users
      prisma.swipe.deleteMany({
        where: {
          OR: [
            { userId: friendship.user1Id, targetId: friendship.user2Id },
            { userId: friendship.user2Id, targetId: friendship.user1Id },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Friendship removed successfully",
    });
  } catch (error) {
    console.error("Error removing friendship:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove friendship" },
      { status: 500 }
    );
  }
}
