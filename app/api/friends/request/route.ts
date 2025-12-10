import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import prisma from '@/lib/prisma';

/**
 * POST /api/friends/request
 * Send a friend request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { receiverId, message } = await request.json();
    const senderId = session.user.id;

    if (!receiverId) {
      return NextResponse.json(
        { success:false, error: 'receiverId is required' },
        { status: 400 }
      );
    }

    // Check if user is trying to send friend request to themselves
    if (senderId === receiverId) {
      return NextResponse.json(
        { success: false, error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // Check if already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        { success: false, error: 'Already friends' },
        { status: 400 }
      );
    }

    // Check for existing friend request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId, status: 'PENDING' },
          { senderId: receiverId, receiverId: senderId, status: 'PENDING' },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Friend request already exists' },
        { status: 400 }
      );
    }

    // Get sender info
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, name: true, image: true },
    });

    // Create friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        message,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true, bio: true },
        },
        receiver: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Create notification for receiver
    const notification = await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'FRIEND_REQUEST',
        title: 'New friend request',
        message: `${sender?.name || 'Someone'} sent you a friend request`,
        data: JSON.stringify({
          friendRequestId: friendRequest.id,
          senderId: senderId,
          senderName: sender?.name,
          senderImage: sender?.image,
          message: message,
        }),
      },
    });

    // Emit real-time notification via Socket.IO
    try {
      const { socketEmit } = await import('@/lib/socket');

      // Send notification to receiver
      socketEmit.toUser(String(receiverId), 'notification', {
        id: notification.id,
        type: 'FRIEND_REQUEST',
        title: notification.title,
        message: notification.message,
        data: {
          friendRequestId: friendRequest.id,
          senderId,
          senderName: sender?.name,
          senderImage: sender?.image,
          message: message,
        },
        createdAt: notification.createdAt,
      });

      // Also emit friend-request specific event
      socketEmit.toUser(String(receiverId), 'friend-request-received', {
        friendRequest: {
          id: friendRequest.id,
          sender: friendRequest.sender,
          message: message,
          sentAt: friendRequest.sentAt,
        },
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    return NextResponse.json({
      success: true,
      message: 'Friend request sent successfully',
      data: friendRequest,
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/friends/request
 * Get friend requests (both sent and received)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'received'; // 'sent' or 'received'

    let friendRequests;

    if (type === 'sent') {
      friendRequests = await prisma.friendRequest.findMany({
        where: {
          senderId: userId,
          status: 'PENDING',
        },
        include: {
          receiver: {
            select: { id: true, name: true, image: true, bio: true },
          },
        },
        orderBy: { sentAt: 'desc' },
      });
    } else {
      friendRequests = await prisma.friendRequest.findMany({
        where: {
          receiverId: userId,
          status: 'PENDING',
        },
        include: {
          sender: {
            select: { id: true, name: true, image: true, bio: true },
          },
        },
        orderBy: { sentAt: 'desc' },
      });
    }

    return NextResponse.json({
      success: true,
      data: friendRequests,
    });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
