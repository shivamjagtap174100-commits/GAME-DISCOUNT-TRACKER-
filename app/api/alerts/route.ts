import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEMO_USER_ID = 'usr_default_demo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || DEMO_USER_ID;

    const alerts = db.getPriceAlerts(userId);
    // Enrich with game details
    const enriched = alerts.map(alert => {
      const game = db.getGameById(alert.game_id);
      return {
        ...alert,
        game,
      };
    });

    return NextResponse.json({
      success: true,
      alerts: enriched,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, targetPrice, currency = 'INR', userId = DEMO_USER_ID } = body;

    if (!gameId || targetPrice === undefined || isNaN(targetPrice)) {
      return NextResponse.json(
        { success: false, error: 'gameId and valid numeric targetPrice are required' },
        { status: 400 }
      );
    }

    const alert = db.setPriceAlert(userId, gameId, parseFloat(targetPrice), currency);
    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create alert' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'Alert id is required' },
        { status: 400 }
      );
    }

    const removed = db.removePriceAlert(alertId);
    return NextResponse.json({
      success: removed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove alert' },
      { status: 500 }
    );
  }
}
