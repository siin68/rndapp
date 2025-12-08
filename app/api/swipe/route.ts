import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId: userIdRaw, targetId: targetIdRaw, action } = body;

    // Convert to integers
    const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;
    const targetId = typeof targetIdRaw === 'string' ? parseInt(targetIdRaw, 10) : targetIdRaw;

    console.log(`[SWIPE] Received request: userId=${userId}, targetId=${targetId}, action=${action}`);

    // Validate input
    if (!userId || !targetId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, targetId, action" },
        { status: 400 }
      );
    }

    if (isNaN(userId) || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId or targetId format" },
        { status: 400 }
      );
    }

    if (!["LIKE", "NOPE"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be LIKE or NOPE" },
        { status: 400 }
      );
    }

    if (userId === targetId) {
      return NextResponse.json(
        { success: false, error: "Cannot swipe on yourself" },
        { status: 400 }
      );
    }

    // Check if user already swiped on this target
    const existingSwipe = await prisma.swipe.findUnique({
      where: {
        userId_targetId: {
          userId,
          targetId,
        },
      },
    });

    // If LIKE exists, still check for match (in case target liked after)
    if (existingSwipe && existingSwipe.action === "LIKE") {
      console.log(`[SWIPE] User already liked target, checking for match...`);
      
      // Don't create duplicate swipe, but check for match
      let isMatch = false;
      let friendship = null;

      const mutualLike = await prisma.swipe.findUnique({
        where: {
          userId_targetId: {
            userId: targetId,
            targetId: userId,
          },
        },
      });

      if (mutualLike && mutualLike.action === "LIKE") {
        isMatch = true;

        // Check if friendship already exists
        const existingFriendship = await prisma.friendship.findFirst({
          where: {
            OR: [
              { user1Id: userId, user2Id: targetId },
              { user1Id: targetId, user2Id: userId },
            ],
          },
        });

        if (!existingFriendship) {
          const [user1Id, user2Id] = userId < targetId 
            ? [userId, targetId] 
            : [targetId, userId];

          friendship = await prisma.friendship.create({
            data: { user1Id, user2Id },
            include: {
              user1: { select: { id: true, name: true, image: true, bio: true } },
              user2: { select: { id: true, name: true, image: true, bio: true } },
            },
          });

          // Create notifications
          await Promise.all([
            prisma.notification.create({
              data: {
                userId: userId,
                type: "MATCH",
                title: "New Match!",
                message: `You and ${friendship.user2Id === userId ? friendship.user1.name : friendship.user2.name} are now friends!`,
                data: JSON.stringify({ friendId: targetId }),
              },
            }),
            prisma.notification.create({
              data: {
                userId: targetId,
                type: "MATCH",
                title: "New Match!",
                message: `You and ${friendship.user1Id === targetId ? friendship.user2.name : friendship.user1.name} are now friends!`,
                data: JSON.stringify({ friendId: userId }),
              },
            }),
          ]);
        } else {
          friendship = existingFriendship;
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          swipe: existingSwipe,
          isMatch,
          friendship,
        },
        message: isMatch ? "It's a match! 🎉" : "Already liked",
      });
    }

    // If NOPE exists and not expired, don't allow new swipe
    if (existingSwipe && existingSwipe.action === "NOPE") {
      const now = new Date();
      if (existingSwipe.expiresAt && existingSwipe.expiresAt > now) {
        return NextResponse.json(
          { 
            success: false, 
            error: "You already passed on this user. Try again later.",
            expiresAt: existingSwipe.expiresAt 
          },
          { status: 400 }
        );
      }
      // If expired, delete the old NOPE
      await prisma.swipe.delete({
        where: { id: existingSwipe.id },
      });
    }

    // Calculate expiry date for NOPE (1 week from now)
    const expiresAt = action === "NOPE" 
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      : null;

    console.log(`[SWIPE] Creating new swipe: userId=${userId}, targetId=${targetId}, action=${action}`);

    // Create the swipe
    const swipe = await prisma.swipe.create({
      data: {
        userId,
        targetId,
        action,
        expiresAt,
      },
    });

    console.log(`[SWIPE] Swipe created successfully:`, swipe.id);

    let isMatch = false;
    let friendship = null;

    // If action is LIKE, check if target also liked this user
    if (action === "LIKE") {
      console.log(`[SWIPE] Checking mutual like: userId=${userId}, targetId=${targetId}`);
      
      const mutualLike = await prisma.swipe.findUnique({
        where: {
          userId_targetId: {
            userId: targetId,
            targetId: userId,
          },
        },
      });

      console.log(`[SWIPE] Mutual like found:`, mutualLike);

      // If mutual like exists and hasn't expired (for NOPE), create friendship
      if (mutualLike && mutualLike.action === "LIKE") {
        const now = new Date();
        const isValid = !mutualLike.expiresAt || mutualLike.expiresAt > now;

        console.log(`[SWIPE] Mutual like is valid: ${isValid}`);

        if (isValid) {
          isMatch = true;

          // Check if friendship already exists
          const existingFriendship = await prisma.friendship.findFirst({
            where: {
              OR: [
                { user1Id: userId, user2Id: targetId },
                { user1Id: targetId, user2Id: userId },
              ],
            },
          });

          console.log(`[SWIPE] Existing friendship:`, existingFriendship);

          if (!existingFriendship) {
            // Create friendship (ensure user1Id < user2Id for consistency)
            const [user1Id, user2Id] = userId < targetId 
              ? [userId, targetId] 
              : [targetId, userId];

            console.log(`[SWIPE] Creating friendship: user1=${user1Id}, user2=${user2Id}`);

            friendship = await prisma.friendship.create({
              data: {
                user1Id,
                user2Id,
              },
              include: {
                user1: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    bio: true,
                  },
                },
                user2: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    bio: true,
                  },
                },
              },
            });

            console.log(`[SWIPE] Friendship created successfully:`, friendship.id);

            // TODO: Create notification for both users about the match
            await Promise.all([
              prisma.notification.create({
                data: {
                  userId: userId,
                  type: "MATCH",
                  title: "New Match!",
                  message: `You and ${friendship.user2.name} are now friends!`,
                  data: JSON.stringify({ friendId: targetId }),
                },
              }),
              prisma.notification.create({
                data: {
                  userId: targetId,
                  type: "MATCH",
                  title: "New Match!",
                  message: `You and ${friendship.user1.name} are now friends!`,
                  data: JSON.stringify({ friendId: userId }),
                },
              }),
            ]);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        swipe,
        isMatch,
        friendship,
      },
      message: isMatch ? "It's a match! 🎉" : "Swipe recorded",
    });
  } catch (error) {
    console.error("Error processing swipe:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { success: false, error: "Failed to process swipe" },
      { status: 500 }
    );
  }
}

// GET endpoint to check swipe status between two users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get("userId");
    const targetIdStr = searchParams.get("targetId");

    if (!userIdStr || !targetIdStr) {
      return NextResponse.json(
        { success: false, error: "Missing userId or targetId" },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdStr, 10);
    const targetId = parseInt(targetIdStr, 10);

    if (isNaN(userId) || isNaN(targetId)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId or targetId format" },
        { status: 400 }
      );
    }

    const swipe = await prisma.swipe.findUnique({
      where: {
        userId_targetId: {
          userId,
          targetId,
        },
      },
    });

    // Check if swipe is expired
    let isExpired = false;
    if (swipe && swipe.expiresAt) {
      const now = new Date();
      isExpired = swipe.expiresAt < now;
    }

    return NextResponse.json({
      success: true,
      data: {
        swipe: isExpired ? null : swipe,
        isExpired,
      },
    });
  } catch (error) {
    console.error("Error fetching swipe status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch swipe status" },
      { status: 500 }
    );
  }
}
