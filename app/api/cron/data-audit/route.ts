import { NextRequest, NextResponse } from 'next/server';
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
    const auditResult = db.performDataAudit();

    return NextResponse.json({
      success: true,
      endpoint: '/api/cron/data-audit',
      authSource: auth.source,
      audit: auditResult,
      executionDurationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        endpoint: '/api/cron/data-audit',
        error: err.message || 'Data integrity audit failed',
        executionDurationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
