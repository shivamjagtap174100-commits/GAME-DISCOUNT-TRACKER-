import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runSync } from '@/lib/sync/sync-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = db.getStats();
    const logs = db.getSyncLogs(15);
    return NextResponse.json({
      success: true,
      stats,
      logs,
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
