import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEMO_USER_ID = 'usr_default_demo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || DEMO_USER_ID;

    const wishlist = db.getWishlist(userId);
    return NextResponse.json({
      success: true,
      wishlist,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get wishlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, userId = DEMO_USER_ID } = body;

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'gameId is required' },
        { status: 400 }
      );
    }

    const isWishlisted = db.toggleWishlist(userId, gameId);
    return NextResponse.json({
      success: true,
      isWishlisted,
      wishlist: db.getWishlist(userId),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update wishlist' },
      { status: 500 }
    );
  }
}
