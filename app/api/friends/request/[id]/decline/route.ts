import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import prisma from '@/lib/prisma';

/**
 * POST /api/friends/request/[id]/decline
 * Decline a friend request
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
        { success: false, error: 'Not authorized to decline this request' },
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
        status: 'DECLINED',
        respondedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Friend request declined',
    });
  } catch (error) {
    console.error('Error declining friend request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
