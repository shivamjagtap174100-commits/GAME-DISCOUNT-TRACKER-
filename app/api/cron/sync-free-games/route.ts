import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { syncFreeGames } from '@/lib/sync/sync-engine';
import { verifyCronAuthorization } from '@/lib/cron/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const auth = verifyCronAuthorization(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const result = await syncFreeGames({ countryCode: 'IN' });

    // Revalidate free games hub and home
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/free-games');
    } catch (revalidateErr) {
      console.warn('[Cron:FreeGames] Revalidation warning:', revalidateErr);
    }

    return NextResponse.json({
      success: result.success,
      endpoint: '/api/cron/sync-free-games',
      authSource: auth.source,
      freeGamesProcessed: result.freeGamesProcessed,
      promotionsUpdated: result.promotionsUpdated,
      errors: result.errors,
      executionDurationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        endpoint: '/api/cron/sync-free-games',
        error: err.message || 'Free games synchronization failed',
        executionDurationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
