import React from 'react';
import { db } from '@/lib/db';
import { ensureInitialData } from '@/lib/sync/sync-engine';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UpcomingPage() {
  await ensureInitialData();

  const allDeals = db.getDeals({ limit: 100 }).items;
  const upcoming = allDeals.filter(d => d.deal.status === 'UPCOMING' || (d.deal.promotion_start && new Date(d.deal.promotion_start).getTime() > Date.now()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101214] border border-accent-amber/30 text-xs text-accent-amber font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          <span>Scheduled Promotions</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary">
          Upcoming Deals & Sales Calendar
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          Verified promotional campaigns scheduled by Steam and Epic Games Store partners with confirmed future start dates.
        </p>
      </div>

      {upcoming.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcoming.map((game) => (
            <div
              key={game.id}
              className="bg-[#1D2226] border border-[#252B30] rounded-xl overflow-hidden p-5 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-[#171A1D] mb-4">
                  <img src={game.artwork_url} alt={game.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-[10px] text-text-muted uppercase">{game.platform}</span>
                  {game.deal.promotion_start && (
                    <span className="text-accent-amber font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Starts {new Date(game.deal.promotion_start).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-bold text-base text-text-primary">{game.title}</h3>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{game.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#252B30] flex items-center justify-between">
                <span className="text-xs text-text-muted">Standard MSRP: ₹{game.deal.original_price}</span>
                <Link
                  href={`/game/${game.slug || game.id}`}
                  className="px-3 py-1.5 bg-[#252B30] hover:bg-[#2F363E] text-text-primary text-xs font-semibold rounded"
                >
                  View Preview
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-12 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-accent-amber mx-auto" />
          <h3 className="font-heading font-bold text-base text-text-primary">
            No Confirmed Upcoming Deals at this Instant
          </h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Stores frequently release future promotional schedules on Thursdays. In the meantime, explore active discounts!
          </p>
          <Link
            href="/discover"
            className="inline-block px-4 py-2 bg-accent-amber text-[#101214] text-xs font-bold rounded-md"
          >
            Explore Active Deals
          </Link>
        </div>
      )}
    </div>
  );
}
