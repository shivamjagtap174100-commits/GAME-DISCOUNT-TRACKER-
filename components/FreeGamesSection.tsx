'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gift, Clock, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { GameWithDeal } from '@/lib/db/types';

interface FreeGamesSectionProps {
  freeDeals: GameWithDeal[];
}

export default function FreeGamesSection({ freeDeals }: FreeGamesSectionProps) {
  // Categorize
  const promotionalFree = freeDeals.filter(
    (g) => g.deal.status === 'FREE_PROMOTION' || (g.deal.promotion_end && g.deal.current_price === 0)
  );

  const permanentFree = freeDeals.filter(
    (g) => g.deal.status === 'PERMANENTLY_FREE' || (!g.deal.promotion_end && g.deal.current_price === 0)
  );

  return (
    <section className="w-full py-12 border-b border-[#1D2226] bg-[#14171A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-accent-emerald text-xs font-semibold uppercase tracking-wider mb-1">
              <Gift className="w-4 h-4" />
              <span>Zero Cost Gaming</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Free Games & Active Giveaways
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Claim verified limited-time promotions before they expire, or explore free-to-play titles.
            </p>
          </div>

          <Link
            href="/free-games"
            className="text-xs font-semibold text-accent-amber hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Free Titles</span>
            <span>→</span>
          </Link>
        </div>

        {/* 1. Promotional Limited-Time Free Games (Highlight) */}
        {promotionalFree.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-text-primary">
                Limited-Time Promotional Giveaways (Claim to Keep Forever)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotionalFree.map((game) => (
                <FreeGamePromoCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {/* 2. Permanently Free Games or fallback */}
        {permanentFree.length > 0 && (
          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
              Permanently Free To Play
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {permanentFree.slice(0, 6).map((game) => (
                <Link
                  key={game.id}
                  href={`/game/${game.slug || game.id}`}
                  className="group bg-[#1D2226] border border-[#262D33] hover:border-[#38424B] rounded-lg p-2.5 transition-all block"
                >
                  <div className="aspect-[16/9] rounded overflow-hidden bg-[#171A1D] mb-2">
                    <img
                      src={game.artwork_url}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-heading font-semibold text-xs text-text-primary truncate group-hover:text-accent-amber">
                    {game.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-accent-emerald font-bold">Free to Play</span>
                    <span className="text-text-muted">{game.platform}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {freeDeals.length === 0 && (
          <div className="text-center py-10 bg-[#1D2226] rounded-lg border border-[#252B30]">
            <Gift className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-xs text-text-secondary">No free giveaways detected in current cycle. Check upcoming giveaways!</p>
          </div>
        )}

      </div>
    </section>
  );
}

function FreeGamePromoCard({ game }: { game: GameWithDeal }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!game.deal.promotion_end) return;
    const calculateTime = () => {
      const end = new Date(game.deal.promotion_end!).getTime();
      const diff = end - Date.now();
      if (diff <= 0) {
        setTimeLeft('Promotion Ended');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [game.deal.promotion_end]);

  return (
    <div className="bg-[#1D2226] border border-[#2B333A] hover:border-accent-emerald/50 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between group transition-all">
      <div className="relative aspect-[16/9] w-full bg-[#171A1D] overflow-hidden">
        <img
          src={game.banner_url || game.artwork_url}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform"
        />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-emerald text-[#101214] shadow flex items-center gap-1">
            <Gift className="w-2.5 h-2.5" />
            <span>100% OFF</span>
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-md uppercase ${
            game.platform === 'STEAM' ? 'bg-[#171A1D]/90 text-[#66C0F4]' : 'bg-[#171A1D]/90 text-white'
          }`}>
            {game.platform}
          </span>
        </div>

        {timeLeft && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-[#101214]/90 backdrop-blur-md border border-[#2B333A] px-2.5 py-1 rounded text-[11px] font-mono font-medium text-accent-amber flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-accent-amber" />
              <span>{timeLeft}</span>
            </div>
            <span className="text-[10px] text-text-muted">Claim window</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <Link
            href={`/game/${game.slug || game.id}`}
            className="font-heading font-bold text-base text-text-primary hover:text-accent-amber transition-colors line-clamp-1"
          >
            {game.title}
          </Link>
          <p className="text-xs text-text-muted line-clamp-2 mt-1">
            {game.description}
          </p>
        </div>

        <div className="pt-2 border-t border-[#262D33] flex items-center justify-between">
          <div>
            {game.deal.original_price > 0 && (
              <span className="text-xs text-text-muted line-through mr-2">
                ₹{game.deal.original_price}
              </span>
            )}
            <span className="font-heading font-bold text-lg text-accent-emerald">
              FREE
            </span>
          </div>

          <a
            href={game.official_store_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-accent-emerald hover:bg-[#2FA56C] text-[#101214] text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors shadow"
          >
            <span>Claim on {game.platform === 'STEAM' ? 'Steam' : 'Epic'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
