import { NextRequest } from 'next/server';

export interface CronAuthResult {
  authorized: boolean;
  reason?: string;
  source?: 'VERCEL_CRON' | 'MANUAL_AUTH' | 'DEV_BYPASS';
}

/**
 * Validates authorization for scheduled background cron endpoints.
 * Protects endpoints from unauthorized public invocations.
 */
export function verifyCronAuthorization(request: NextRequest): CronAuthResult {
  const cronSecret = process.env.CRON_SECRET;
  const adminSecret = process.env.ADMIN_SECRET_KEY;
  const authHeader = request.headers.get('authorization');
  const querySecret = request.nextUrl.searchParams.get('secret') || request.nextUrl.searchParams.get('key');

  // 1. If CRON_SECRET is configured, check Bearer token or URL parameter
  if (cronSecret) {
    if (authHeader === `Bearer ${cronSecret}`) {
      return { authorized: true, source: 'VERCEL_CRON' };
    }
    if (querySecret === cronSecret) {
      return { authorized: true, source: 'MANUAL_AUTH' };
    }
    // Also allow ADMIN_SECRET_KEY as fallback for manual administrator triggers
    if (adminSecret && (authHeader === `Bearer ${adminSecret}` || querySecret === adminSecret)) {
      return { authorized: true, source: 'MANUAL_AUTH' };
    }
    return {
      authorized: false,
      reason: 'Unauthorized: Invalid CRON_SECRET token provided.',
    };
  }

  // 2. If ADMIN_SECRET_KEY is configured (and CRON_SECRET was omitted)
  if (adminSecret) {
    if (authHeader === `Bearer ${adminSecret}` || querySecret === adminSecret) {
      return { authorized: true, source: 'MANUAL_AUTH' };
    }
    return {
      authorized: false,
      reason: 'Unauthorized: Invalid admin credentials.',
    };
  }

  // 3. In development / local testing environments without secrets set, allow requests
  if (process.env.NODE_ENV !== 'production') {
    return { authorized: true, source: 'DEV_BYPASS' };
  }

  // 4. In production without any secret configured, disallow to prevent abuse
  return {
    authorized: false,
    reason: 'Security error: CRON_SECRET environment variable is not configured on production deployment.',
  };
}
