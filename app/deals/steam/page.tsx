import React from 'react';
import DealsGrid from '@/components/DealsGrid';
import { db } from '@/lib/db';
import { ensureInitialData } from '@/lib/sync/sync-engine';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SteamDealsPage() {
  await ensureInitialData();

  const steamDeals = db.getDeals({
    platform: 'STEAM',
    sortBy: 'discount_desc',
    limit: 36,
  }).items;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header banner */}
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101214] border border-brand-steam/30 text-xs text-brand-steam font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand-steam" />
            <span>Valve Steam Store Live Feed</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary">
            Steam Specials & Discounts
          </h1>
          <p className="text-sm text-text-secondary max-w-xl">
            Live prices directly queried from Steam Store India catalog with verified INR currency and regional promotional expiration timestamps.
          </p>
        </div>

        <div className="text-right flex flex-col sm:items-end gap-2">
          <div className="text-2xl font-heading font-bold text-brand-steam">
            {steamDeals.length} Deals
          </div>
          <Link
            href="/discover?platform=STEAM"
            className="px-4 py-2 bg-brand-steam text-[#101214] text-xs font-bold rounded-md hover:bg-brand-steam/90 transition-colors"
          >
            Filter Steam Deals
          </Link>
        </div>
      </div>

      <DealsGrid
        title="All Steam Store Specials"
        subtitle="Ranked by highest percentage discount"
        games={steamDeals}
      />
    </div>
  );
}
