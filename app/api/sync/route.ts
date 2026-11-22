import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runSync } from '@/lib/sync/sync-engine';
import { isSupabaseConfigured } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = db.getStats();
    const logs = db.getSyncLogs(20);
    const dailyReports = db.getDailyReports(7);
    const supabaseActive = isSupabaseConfigured();

    const cronJobs = [
      {
        name: 'Steam Sync',
        path: '/api/cron/sync-steam',
        schedule: '0 * * * *',
        description: 'Synchronizes active Steam specials, discounts, and regional prices hourly',
        frequency: 'Every hour (:00 UTC)',
      },
      {
        name: 'Epic Sync',
        path: '/api/cron/sync-epic',
        schedule: '30 * * * *',
        description: 'Synchronizes Epic Games Store promotions and EGData catalog hourly',
        frequency: 'Every hour (:30 UTC)',
      },
      {
        name: 'Free Games Sync',
        path: '/api/cron/sync-free-games',
        schedule: '15 * * * *',
        description: 'Discovers active giveaways, 100% discount promotions, and claim windows',
        frequency: 'Every hour (:15 UTC)',
      },
      {
        name: 'Expire Deals',
        path: '/api/cron/expire-deals',
        schedule: '45 * * * *',
        description: 'Automatically flags past-deadline discounts as EXPIRED',
        frequency: 'Every hour (:45 UTC)',
      },
      {
        name: 'Daily Catalog Refresh',
        path: '/api/cron/full-refresh',
        schedule: '0 4 * * *',
        description: 'Executes full dual-store sync, purges stale records, generates daily metrics report',
        frequency: 'Daily at 04:00 UTC (09:30 AM IST)',
      },
      {
        name: 'Data Integrity Audit',
        path: '/api/cron/data-audit',
        schedule: '0 6 * * *',
        description: 'Verifies price math, savings percentage calculations, and storefront URL integrity',
        frequency: 'Daily at 06:00 UTC (11:30 AM IST)',
      },
    ];

    return NextResponse.json({
      success: true,
      stats,
      logs,
      dailyReports,
      supabaseActive,
      cronJobs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Optional secret key check (accepts either configured secret or admin demo header)
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_SECRET_KEY || 'admin_secure_secret_key_2026';

    const body = await request.json().catch(() => ({}));
    const provider = body.provider || 'ALL';
    const countryCode = body.countryCode || 'IN';

    // Allow internal admin demo or secret key
    if (authHeader && authHeader !== `Bearer ${adminKey}` && authHeader !== 'Bearer demo_admin_session') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid Admin Secret Key' },
        { status: 401 }
      );
    }

    const result = await runSync({ provider, countryCode, force: true });

    return NextResponse.json({
      success: result.success,
      result,
      stats: db.getStats(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Synchronization failed' },
      { status: 500 }
    );
  }
}
