import React from 'react';
import DealsGrid from '@/components/DealsGrid';
import { db } from '@/lib/db';
import { ensureInitialData } from '@/lib/sync/sync-engine';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EpicDealsPage() {
  await ensureInitialData();

  const epicDeals = db.getDeals({
    platform: 'EPIC',
    sortBy: 'discount_desc',
    limit: 36,
  }).items;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header banner */}
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101214] border border-white/30 text-xs text-white font-semibold">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>Epic Games Store Live Feed</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary">
            Epic Games Store Deals
          </h1>
          <p className="text-sm text-text-secondary max-w-xl">
            Live prices and weekly promotional offers tracked from official Epic Games Store storefront endpoints and EGData catalog interfaces.
          </p>
        </div>

        <div className="text-right flex flex-col sm:items-end gap-2">
          <div className="text-2xl font-heading font-bold text-white">
            {epicDeals.length} Deals
          </div>
          <Link
            href="/discover?platform=EPIC"
            className="px-4 py-2 bg-white text-[#101214] text-xs font-bold rounded-md hover:bg-neutral-200 transition-colors"
          >
            Filter Epic Deals
          </Link>
        </div>
      </div>

      <DealsGrid
        title="All Epic Games Store Promotions"
        subtitle="Ranked by highest percentage discount"
        games={epicDeals}
      />
    </div>
  );
}
