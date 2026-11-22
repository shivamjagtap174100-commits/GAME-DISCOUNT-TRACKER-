import React from 'react';
import { db } from '@/lib/db';
import { ensureInitialData } from '@/lib/sync/sync-engine';
import { ShieldCheck, Database, RefreshCw, AlertCircle, ExternalLink, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DataSourcesPage() {
  await ensureInitialData();
  const stats = db.getStats();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171A1D] border border-accent-emerald/30 text-xs text-accent-emerald font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Transparency Manifesto</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary">
          Data Sources & Verification Engine
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Game Discount Tracker is built on strict data honesty principles. We never simulate discounts, fake countdown timers, or guess regional currency conversions.
        </p>
      </div>

      {/* Sync Status Banner */}
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-text-muted">Last Engine Synchronization</div>
          <div className="font-heading font-bold text-base text-text-primary mt-0.5">
            {stats.lastSyncTime ? new Date(stats.lastSyncTime).toLocaleString('en-IN') : 'Live Sync Active'}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse" />
          <span className="font-semibold text-text-primary">All Providers Synchronized</span>
        </div>
      </div>

      {/* Provider Details */}
      <div className="space-y-6">
        <h2 className="font-heading text-xl font-bold text-text-primary">
          Store Integration Adapters
        </h2>

        {/* 1. Steam Provider */}
        <div className="bg-[#1D2226] border border-[#262D33] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-brand-steam" />
              <h3 className="font-heading font-bold text-base text-text-primary">
                Valve Steam Storefront
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#171A1D] text-brand-steam border border-brand-steam/30">
              OFFICIAL PUBLIC API
            </span>
          </div>

          <div className="text-xs text-text-secondary leading-relaxed space-y-2">
            <p>
              We query Steam&apos;s documented public store endpoints including <code className="font-mono text-accent-amber">/api/featuredcategories</code> and <code className="font-mono text-accent-amber">/api/appdetails</code> with region tag <code className="font-mono text-text-primary">cc=in</code>.
            </p>
            <p>
              All original prices, discounted prices, savings, and discount expiration dates are directly provided by Steam&apos;s store servers in Indian Rupees (INR) without any intermediate currency conversions.
            </p>
          </div>
        </div>

        {/* 2. Epic Games Store Provider */}
        <div className="bg-[#1D2226] border border-[#262D33] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-white" />
              <h3 className="font-heading font-bold text-base text-text-primary">
                Epic Games Store
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#171A1D] text-white border border-white/30">
              OFFICIAL STOREFRONT & EGDATA
            </span>
          </div>

          <div className="text-xs text-text-secondary leading-relaxed space-y-2">
            <p>
              Epic Games weekly promotional giveaways and scheduled deals are tracked through Epic&apos;s public promotional endpoint <code className="font-mono text-accent-amber">/freeGamesPromotions</code> with country parameter <code className="font-mono text-text-primary">country=IN</code>.
            </p>
            <p>
              Catalog-wide deals and item observations are supplemented through the documented community indexing provider EGData (<a href="https://docs.egdata.app/docs" target="_blank" rel="noopener noreferrer" className="text-accent-amber underline">docs.egdata.app</a>). In the database and UI, records sourced from EGData are clearly stamped as <code className="font-mono text-accent-amber">EGDATA</code>.
            </p>
          </div>
        </div>

        {/* Regional Pricing Rules */}
        <div className="bg-[#1D2226] border border-[#262D33] rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-accent-amber">
            <Globe className="w-4 h-4" />
            <h3 className="font-heading font-bold text-base text-text-primary">
              Regional Pricing Integrity
            </h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Publishers on Steam and Epic Games Store frequently set custom regional pricing for the Indian market (often 50%–70% lower than US dollar MSRP). We <strong className="text-text-primary">never convert USD into INR</strong> and present it as an authentic Indian store price. We strictly present the authentic regional storefront price.
          </p>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-text-muted">
            <AlertCircle className="w-4 h-4 text-accent-red" />
            <h3 className="font-heading font-bold text-base text-text-primary">
              Legal Disclaimer & Trademarks
            </h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Game Discount Tracker is an independent, non-commercial discovery service created to help players save money. We are not affiliated with, endorsed by, or authorized by Valve Corporation, Steam, Epic Games, Inc., or any game publisher. All logos, box art, trademarks, and registered trademarks are properties of their respective owners.
          </p>
        </div>

      </div>
    </div>
  );
}
