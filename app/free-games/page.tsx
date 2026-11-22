import React from 'react';
import FreeGamesSection from '@/components/FreeGamesSection';
import DealsGrid from '@/components/DealsGrid';
import { db } from '@/lib/db';
import { ensureInitialData } from '@/lib/sync/sync-engine';
import { Gift, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FreeGamesPage() {
  await ensureInitialData();

  const allFree = db.getDeals({
    freeOnly: true,
    limit: 50,
  }).items;

  return (
    <div className="w-full pb-16 space-y-8">
      {/* Page Header */}
      <div className="bg-[#14171A] border-b border-[#1D2226] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101214] border border-accent-emerald/30 text-xs text-accent-emerald font-semibold">
            <Gift className="w-3.5 h-3.5" />
            <span>Zero Cost Gaming Hub</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary">
            Free PC Games & Giveaways
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            Keep 100% of your wallet. We strictly separate limited-time promotional giveaways from permanent free-to-play titles.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FreeGamesSection freeDeals={allFree} />
      </div>
    </div>
  );
}
