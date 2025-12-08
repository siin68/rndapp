import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseId } from '@/lib/utils/id-parser';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userIdParam) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const userId = parseId(userIdParam);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid userId' },
        { status: 400 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Clear all notifications for a user
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');

    if (!userIdParam) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const userId = parseId(userIdParam);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid userId' },
        { status: 400 }
      );
    }

    await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
