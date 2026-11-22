import React from 'react';
import HeroSection from '@/components/HeroSection';
import DealsGrid from '@/components/DealsGrid';
import FreeGamesSection from '@/components/FreeGamesSection';
import { db } from '@/lib/db';
import { ensureInitialData } from '@/lib/sync/sync-engine';
import { Sparkles, Flame, Clock, Gamepad, Award } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Ensure we have live data
  await ensureInitialData();

  const stats = db.getStats();

  // 1. Featured Spotlight Deal (highest discount or historical low with image)
  const bestDealsResult = db.getDeals({
    sortBy: 'discount_desc',
    limit: 12,
  });
  const bestDeals = bestDealsResult.items;
  const featuredDeal = bestDeals.find(d => d.banner_url || d.artwork_url) || bestDeals[0] || null;

  // 2. Trending Deals (best value, high savings)
  const trendingDeals = db.getDeals({
    sortBy: 'savings_desc',
    limit: 8,
  }).items;

  // 3. Free Games
  const freeDeals = db.getDeals({
    freeOnly: true,
    limit: 12,
  }).items;

  // 4. Steam Specials
  const steamDeals = db.getDeals({
    platform: 'STEAM',
    sortBy: 'discount_desc',
    limit: 8,
  }).items;

  // 5. Epic Games Store Deals
  const epicDeals = db.getDeals({
    platform: 'EPIC',
    sortBy: 'discount_desc',
    limit: 8,
  }).items;

  // 6. Recently Updated Deals
  const recentlyUpdated = db.getDeals({
    sortBy: 'updated_desc',
    limit: 8,
  }).items;

  return (
    <div className="w-full">
      {/* Editorial Hero */}
      <HeroSection stats={stats} featuredDeal={featuredDeal} />

      {/* Free Games & Giveaways Section */}
      <FreeGamesSection freeDeals={freeDeals} />

      {/* Today's Best Deals */}
      <DealsGrid
        title="Today's Best Deals"
        subtitle="Verified top discounts and steepest price drops calculated from live store records."
        games={bestDeals.slice(0, 8)}
        viewAllHref="/discover?sortBy=discount_desc"
        icon={<Flame className="w-5 h-5 text-accent-amber" />}
      />

      {/* Steam Highlights Section */}
      <div className="bg-[#12161A]/50 border-y border-[#1D2226]">
        <DealsGrid
          title="Steam Specials & Publisher Sales"
          subtitle="Directly synchronized with Steam Store India catalog."
          games={steamDeals}
          viewAllHref="/deals/steam"
          icon={<span className="w-3 h-3 rounded-full bg-brand-steam inline-block" />}
        />
      </div>

      {/* Trending / Highest Savings Deals */}
      <DealsGrid
        title="Trending Deals & Massive Savings"
        subtitle="Games with the largest monetary savings off their standard regional MSRP."
        games={trendingDeals}
        viewAllHref="/discover?sortBy=savings_desc"
        icon={<Sparkles className="w-5 h-5 text-accent-emerald" />}
      />

      {/* Epic Games Store Highlights */}
      <div className="bg-[#14171A] border-y border-[#1D2226]">
        <DealsGrid
          title="Epic Games Store Promotions"
          subtitle="Weekly giveaways, exclusive catalog sales, and verified publisher deals."
          games={epicDeals}
          viewAllHref="/deals/epic"
          icon={<span className="w-3 h-3 rounded-full bg-white inline-block" />}
        />
      </div>

      {/* Recently Updated Deals */}
      <DealsGrid
        title="Recently Updated Price Changes"
        subtitle="Games whose pricing, discount brackets, or availability recently shifted."
        games={recentlyUpdated}
        viewAllHref="/discover?sortBy=updated_desc"
        icon={<Clock className="w-5 h-5 text-text-muted" />}
      />

      {/* Trust & Transparency Banner */}
      <section className="py-12 bg-[#101214] border-t border-[#1D2226]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171A1D] border border-[#252B30] text-xs text-text-secondary">
            <Award className="w-4 h-4 text-accent-amber" />
            <span>Honest & Transparent Price Tracking</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Built for Gamers Who Value Authentic Savings
          </h2>
          <p className="text-text-muted text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            We never fabricate discounts, inflate MSRPs, or fake countdown timers. Every price is verified against official Steam and Epic Games Store endpoints for the India market.
          </p>
          <div className="pt-2">
            <Link
              href="/data-sources"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-amber hover:underline"
            >
              <span>Learn how we verify and synchronize store data</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
