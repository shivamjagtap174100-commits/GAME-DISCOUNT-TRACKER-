import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { runSync } from '@/lib/sync/sync-engine';
import { db } from '@/lib/db';
import { DailyReport } from '@/lib/db/types';
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
    // 1. Run full provider synchronization
    const syncRes = await runSync({ provider: 'ALL', countryCode: 'IN' });

    // 2. Expire old deals
    const expireRes = db.expireOldDeals();

    // 3. Compile Daily Report
    const stats = db.getStats();
    const today = new Date().toISOString().split('T')[0];
    const report: DailyReport = {
      id: `rep_${Date.now()}`,
      date: today,
      generated_at: new Date().toISOString(),
      total_steam_deals: stats.steamDealsCount,
      total_epic_deals: stats.epicDealsCount,
      new_discounts: syncRes.dealsUpdated,
      increased_discounts: 0,
      expired_deals: expireRes.expiredCount,
      free_promotions: stats.freeGamesCount,
      failed_jobs: syncRes.errors.length,
      steam_status: syncRes.errors.some(e => e.includes('Steam')) ? 'DEGRADED' : 'HEALTHY',
      epic_status: syncRes.errors.some(e => e.includes('Epic')) ? 'DEGRADED' : 'HEALTHY',
      notes: `Automated 24/7 Vercel catalog refresh completed in ${Date.now() - startTime}ms.`,
    };
    db.saveDailyReport(report);

    // 4. Invalidate all cached frontend routes
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/deals/steam');
      revalidatePath('/deals/epic');
      revalidatePath('/free-games');
      revalidatePath('/discover');
      revalidatePath('/upcoming');
    } catch (revalErr) {
      console.warn('[Cron:FullRefresh] Revalidation warning:', revalErr);
    }

    return NextResponse.json({
      success: syncRes.success,
      endpoint: '/api/cron/full-refresh',
      authSource: auth.source,
      gamesProcessed: syncRes.gamesProcessed,
      dealsUpdated: syncRes.dealsUpdated,
      expiredDealsCleaned: expireRes.expiredCount,
      dailyReport: report,
      executionDurationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        endpoint: '/api/cron/full-refresh',
        error: err.message || 'Full catalog refresh failed',
        executionDurationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
