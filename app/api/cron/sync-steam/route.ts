import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { runSync } from '@/lib/sync/sync-engine';
import { verifyCronAuthorization } from '@/lib/cron/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s execution timeout for serverless

export async function GET(request: NextRequest) {
  const auth = verifyCronAuthorization(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const result = await runSync({ provider: 'STEAM', countryCode: 'IN' });

    // Revalidate affected pages so users immediately see the fresh prices
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/deals/steam');
      revalidatePath('/discover');
    } catch (revalidateErr) {
      console.warn('[Cron:Steam] Revalidation warning:', revalidateErr);
    }

    return NextResponse.json({
      success: result.success,
      endpoint: '/api/cron/sync-steam',
      authSource: auth.source,
      provider: 'STEAM',
      gamesProcessed: result.gamesProcessed,
      dealsUpdated: result.dealsUpdated,
      errors: result.errors,
      executionDurationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        endpoint: '/api/cron/sync-steam',
        error: err.message || 'Steam cron synchronization failed',
        executionDurationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
