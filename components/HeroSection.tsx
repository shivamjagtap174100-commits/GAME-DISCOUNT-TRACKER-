'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Gift, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { GameWithDeal } from '@/lib/db/types';
import { formatPrice } from '@/lib/engine/validation';

interface HeroSectionProps {
  stats: {
    totalGames: number;
    activeDealsCount: number;
    freeGamesCount: number;
    steamDealsCount: number;
    epicDealsCount: number;
    lastSyncTime: string | null;
  };
  featuredDeal?: GameWithDeal | null;
}

export default function HeroSection({ stats, featuredDeal }: HeroSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/discover?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative w-full pt-12 pb-16 border-b border-[#1D2226] overflow-hidden bg-gradient-to-b from-[#14171A] to-[#101214]">
      {/* Subtle background ambient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(240,168,58,0.04),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(102,192,244,0.03),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Editorial Headline & Search */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Sync Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171A1D] border border-[#252B30] text-[11px] text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <span className="font-medium text-text-primary">Live Store Synchronization</span>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted">India Region (INR ₹)</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-[1.08]">
              Your Next Favourite Game. <br />
              <span className="text-accent-amber">At a Better Price.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-text-secondary text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Discover verified gaming deals, steep historical discounts, and free promotions across <strong className="text-brand-steam font-medium">Steam</strong> and <strong className="text-white font-medium">Epic Games Store</strong> in real time.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="max-w-xl relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games, studios, or genres (e.g. Witcher, EA, RPG)..."
                className="w-full bg-[#171A1D] border border-[#252B30] hover:border-[#38424B] focus:border-accent-amber text-sm text-text-primary rounded-lg pl-10 pr-28 py-3 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-2 bg-accent-amber hover:bg-[#D9932B] text-[#101214] text-xs font-bold rounded-md transition-colors shadow"
              >
                Search
              </button>
            </form>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/discover"
                className="px-5 py-2.5 bg-accent-amber hover:bg-[#D9932B] text-[#101214] font-heading font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-2 transition-colors shadow"
              >
                <span>Explore All Deals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/free-games"
                className="px-5 py-2.5 bg-[#1D2226] hover:bg-[#252B30] text-text-primary font-heading font-semibold text-xs uppercase tracking-wider rounded-md border border-[#2B333A] flex items-center gap-2 transition-colors"
              >
                <Gift className="w-3.5 h-3.5 text-accent-emerald" />
                <span>View Free Games ({stats.freeGamesCount})</span>
              </Link>
            </div>

            {/* Real Stats Bar */}
            <div className="pt-4 grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-xl border-t border-[#1D2226]">
              <div>
                <div className="font-heading font-bold text-xl text-text-primary">
                  {stats.totalGames > 0 ? stats.totalGames : '—'}
                </div>
                <div className="text-[11px] text-text-muted uppercase tracking-wider">Tracked Games</div>
              </div>
              <div>
                <div className="font-heading font-bold text-xl text-accent-amber">
                  {stats.activeDealsCount > 0 ? stats.activeDealsCount : '—'}
                </div>
                <div className="text-[11px] text-text-muted uppercase tracking-wider">Active Deals</div>
              </div>
              <div>
                <div className="font-heading font-bold text-xl text-accent-emerald">
                  {stats.freeGamesCount > 0 ? stats.freeGamesCount : '—'}
                </div>
                <div className="text-[11px] text-text-muted uppercase tracking-wider">Free Offers</div>
              </div>
              <div className="hidden sm:block">
                <div className="font-heading font-bold text-xl text-brand-steam">
                  {stats.steamDealsCount > 0 ? stats.steamDealsCount : '—'}
                </div>
                <div className="text-[11px] text-text-muted uppercase tracking-wider">Steam Deals</div>
              </div>
            </div>

          </div>

          {/* Right Column: Featured Deal Spotlight */}
          <div className="lg:col-span-5">
            {featuredDeal ? (
              <div className="bg-[#1D2226] border border-[#2B333A] rounded-xl overflow-hidden shadow-2xl relative group">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#171A1D]">
                  <img
                    src={featuredDeal.banner_url || featuredDeal.artwork_url}
                    alt={featuredDeal.title}
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1D2226] via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#101214]/90 text-accent-amber text-[10px] font-bold tracking-wider uppercase border border-accent-amber/40 flex items-center gap-1 backdrop-blur-md">
                      <Flame className="w-3 h-3 text-accent-amber" />
                      <span>Featured Spotlight</span>
                    </span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-md ${
                      featuredDeal.platform === 'STEAM'
                        ? 'bg-[#171A1D]/90 text-[#66C0F4] border border-[#66C0F4]/40'
                        : 'bg-[#171A1D]/90 text-white border border-white/40'
                    }`}>
                      {featuredDeal.platform}
                    </span>
                  </div>

                  {featuredDeal.deal.discount_percentage > 0 && (
                    <div className="absolute top-3 right-3 bg-accent-emerald text-[#101214] font-heading font-extrabold text-sm px-2.5 py-1 rounded shadow-lg">
                      -{featuredDeal.deal.discount_percentage}%
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                      {featuredDeal.genre.slice(0, 2).join(' • ')}
                    </span>
                    <h3 className="font-heading text-xl font-bold text-text-primary mt-1 line-clamp-1">
                      {featuredDeal.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                      {featuredDeal.description}
                    </p>
                  </div>

                  <div className="flex items-end justify-between pt-3 border-t border-[#262D33]">
                    <div>
                      {featuredDeal.deal.original_price > featuredDeal.deal.current_price && (
                        <div className="text-xs text-text-muted line-through">
                          {formatPrice(featuredDeal.deal.original_price, featuredDeal.deal.currency)}
                        </div>
                      )}
                      <div className="font-heading font-bold text-2xl text-accent-emerald">
                        {featuredDeal.deal.current_price === 0 ? 'FREE' : formatPrice(featuredDeal.deal.current_price, featuredDeal.deal.currency)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/game/${featuredDeal.slug || featuredDeal.id}`}
                        className="px-3 py-2 bg-[#252B30] hover:bg-[#2E363D] text-xs font-semibold rounded-md transition-colors"
                      >
                        Details
                      </Link>
                      <a
                        href={featuredDeal.official_store_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-accent-amber hover:bg-[#D9932B] text-[#101214] text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors shadow"
                      >
                        <span>Visit Store</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-72 rounded-xl bg-[#1D2226] border border-[#262D33] p-6 flex flex-col justify-center items-center text-center">
                <Sparkles className="w-8 h-8 text-accent-amber mb-2 animate-bounce" />
                <h4 className="font-heading font-bold text-sm text-text-primary">Synchronizing Store Catalogs</h4>
                <p className="text-xs text-text-muted max-w-xs mt-1">
                  Connecting to Steam and Epic Games Store to bring live regional prices and active discounts...
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
