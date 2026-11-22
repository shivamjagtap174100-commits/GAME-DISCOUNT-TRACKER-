'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, Bell, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { GameWithDeal } from '@/lib/db/types';
import { formatPrice } from '@/lib/engine/validation';
import GameCard from '@/components/GameCard';
import { useApp } from '@/components/AppContext';

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist, refreshUserData } = useApp();
  const [games, setGames] = useState<GameWithDeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/wishlist')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGames(data.wishlist || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101214] border border-accent-amber/30 text-xs text-accent-amber font-semibold mb-2">
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Saved Titles</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            My Game Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Track price changes, current discounts, and target alerts for your saved games.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[#252B30] hover:bg-[#2F363E] text-text-primary text-xs font-semibold rounded-md border border-[#2B333A] flex items-center gap-2"
          >
            <Bell className="w-3.5 h-3.5 text-accent-amber" />
            <span>Alerts Center</span>
          </Link>
          <Link
            href="/discover"
            className="px-4 py-2 bg-accent-amber hover:bg-[#D9932B] text-[#101214] text-xs font-bold rounded-md"
          >
            Find More Games
          </Link>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1D2226] border border-[#252B30] rounded-lg p-3 space-y-3">
              <div className="aspect-[16/9] skeleton-box rounded" />
              <div className="h-4 skeleton-box rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : games.length > 0 ? (
        <div>
          <div className="text-xs text-text-muted mb-4">
            You are tracking <strong className="text-text-primary">{games.length}</strong> title{games.length > 1 ? 's' : ''} in your wishlist.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#1D2226] flex items-center justify-center text-text-muted mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-text-primary">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Click the bookmark icon on any game card to track its prices, set discount alerts, and get notified when it drops to your target budget.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-amber text-[#101214] text-xs font-bold rounded-md"
          >
            <span>Browse Active Deals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
