import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { verifyCronAuthorization } from '@/lib/cron/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const auth = verifyCronAuthorization(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const { expiredCount } = db.expireOldDeals();

    if (expiredCount > 0) {
      try {
        revalidatePath('/', 'layout');
        revalidatePath('/deals/steam');
        revalidatePath('/deals/epic');
        revalidatePath('/free-games');
        revalidatePath('/discover');
      } catch (revalidateErr) {
        console.warn('[Cron:ExpireDeals] Revalidation warning:', revalidateErr);
      }
    }

    return NextResponse.json({
      success: true,
      endpoint: '/api/cron/expire-deals',
      authSource: auth.source,
      expiredDealsCount: expiredCount,
      executionDurationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        endpoint: '/api/cron/expire-deals',
        error: err.message || 'Deal expiration task failed',
        executionDurationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
