import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { runSync } from '@/lib/sync/sync-engine';
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
    const result = await runSync({ provider: 'EPIC', countryCode: 'IN' });

    // Revalidate affected pages
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/deals/epic');
      revalidatePath('/free-games');
      revalidatePath('/discover');
    } catch (revalidateErr) {
      console.warn('[Cron:Epic] Revalidation warning:', revalidateErr);
    }

    return NextResponse.json({
      success: result.success,
      endpoint: '/api/cron/sync-epic',
      authSource: auth.source,
      provider: 'EPIC',
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
        endpoint: '/api/cron/sync-epic',
        error: err.message || 'Epic Games cron synchronization failed',
        executionDurationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
