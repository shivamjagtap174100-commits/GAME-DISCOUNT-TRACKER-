import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let game = db.getGameById(id);
    if (!game) {
      game = db.getGameBySlug(id);
    }

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    // Get price history
    const priceHistory = db.getPriceHistory(game.id);

    // Get similar discounted games (same genre or platform, excluding self)
    const primaryGenre = game.genre[0] || 'Action';
    const similar = db.getDeals({
      genre: primaryGenre,
      limit: 6,
    }).items.filter(item => item.id !== game!.id).slice(0, 4);

    return NextResponse.json({
      success: true,
      game,
      priceHistory,
      similar,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve game details' },
      { status: 500 }
    );
  }
}
