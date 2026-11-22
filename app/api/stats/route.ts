import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureInitialData } from '@/lib/sync/sync-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureInitialData();
    const stats = db.getStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve stats' },
      { status: 500 }
    );
  }
}
