import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEMO_USER_ID = 'usr_default_demo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || DEMO_USER_ID;

    const notifications = db.getNotifications(userId);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, markAll, userId = DEMO_USER_ID } = body;

    if (markAll) {
      db.markAllNotificationsRead(userId);
    } else if (id) {
      db.markNotificationAsRead(id);
    }

    return NextResponse.json({
      success: true,
      notifications: db.getNotifications(userId),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
