import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import prisma from '@/lib/prisma';

/**
 * POST /api/friends/request/[id]/accept
 * Accept a friend request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const requestId = params.id;
    const userId = session.user.id;

    // Get friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!friendRequest) {
      return NextResponse.json(
        { success: false, error: 'Friend request not found' },
        { status: 404 }
      );
    }

    // Verify user is the receiver
    if (friendRequest.receiverId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to accept this request' },
        { status: 403 }
      );
    }

    if (friendRequest.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Friend request already responded to' },
        { status: 400 }
      );
    }

    // Update friend request status
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });

    // Create friendship
    const friendship = await prisma.friendship.create({
      data: {
        user1Id: friendRequest.senderId,
        user2Id: friendRequest.receiverId,
      },
    });

    // Create notification for sender
    const notification = await prisma.notification.create({
      data: {
        userId: friendRequest.senderId,
        type: 'FRIEND_REQUEST_ACCEPTED',
        title: 'Friend request accepted',
        message: `${friendRequest.receiver.name} accepted your friend request`,
        data: JSON.stringify({
          friendRequestId: requestId,
          friendshipId: friendship.id,
          userId: friendRequest.receiverId,
          userName: friendRequest.receiver.name,
          userImage: friendRequest.receiver.image,
        }),
      },
    });

    // Emit real-time notification via Socket.IO
    try {
      const { socketEmit } = await import('@/lib/socket');

      // Notify sender that request was accepted
      socketEmit.toUser(friendRequest.senderId, 'notification', {
        id: notification.id,
        type: 'FRIEND_REQUEST_ACCEPTED',
        title: notification.title,
        message: notification.message,
        data: {
          friendRequestId: requestId,
          friendshipId: friendship.id,
          userId: friendRequest.receiverId,
          userName: friendRequest.receiver.name,
          userImage: friendRequest.receiver.image,
        },
        createdAt: notification.createdAt,
      });

      // Emit friend-request-accepted event
      socketEmit.toUser(friendRequest.senderId, 'friend-request-accepted', {
        friendRequestId: requestId,
        friendship: {
          id: friendship.id,
          friend: friendRequest.receiver,
        },
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    return NextResponse.json({
      success: true,
      message: 'Friend request accepted',
      data: {
        friendship,
        friendRequest,
      },
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
