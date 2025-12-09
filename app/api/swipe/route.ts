import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId: userIdRaw, targetId: targetIdRaw, action } = body;

    const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;
    const targetId = typeof targetIdRaw === 'string' ? parseInt(targetIdRaw, 10) : targetIdRaw;

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

    const existingSwipe = await prisma.swipe.findUnique({
      where: {
        userId_targetId: {
          userId,
          targetId,
        },
      },
    });

    if (existingSwipe && existingSwipe.action === "LIKE") {
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
      await prisma.swipe.delete({
        where: { id: existingSwipe.id },
      });
    }

    const expiresAt = action === "NOPE" 
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : null;

    const swipe = await prisma.swipe.create({
      data: {
        userId,
        targetId,
        action,
        expiresAt,
      },
    });

    let isMatch = false;
    let friendship = null;

    if (action === "LIKE") {
      const mutualLike = await prisma.swipe.findUnique({
        where: {
          userId_targetId: {
            userId: targetId,
            targetId: userId,
          },
        },
      });

      if (mutualLike && mutualLike.action === "LIKE") {
        const now = new Date();
        const isValid = !mutualLike.expiresAt || mutualLike.expiresAt > now;

        if (isValid) {
          isMatch = true;

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
    return NextResponse.json(
      { success: false, error: "Failed to process swipe" },
      { status: 500 }
    );
  }
}

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
