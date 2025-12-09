import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid userId' },
        { status: 400 }
      );
    }

    await prisma.notification.deleteMany({
      where: {
        userId: userIdNum,
        isRead: true,
      },
    });

    await prisma.notification.updateMany({
      where: { userId: userIdNum },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Notifications cleared',
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
