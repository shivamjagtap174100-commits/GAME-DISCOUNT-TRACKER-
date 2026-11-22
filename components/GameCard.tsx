'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Bookmark, 
  ExternalLink, 
  Share2, 
  Clock, 
  TrendingDown, 
  CheckCircle2, 
  Sparkles,
  Flame,
  Gift
} from 'lucide-react';
import { GameWithDeal } from '@/lib/db/types';
import { formatPrice } from '@/lib/engine/validation';
import { useApp } from './AppContext';

interface GameCardProps {
  game: GameWithDeal;
  priority?: boolean;
}

export default function GameCard({ game, priority = false }: GameCardProps) {
  const { wishlistIds, toggleWishlist, showToast, region } = useApp();
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  const isWishlisted = wishlistIds.has(game.id);
  const deal = game.deal;

  // Determine expiration countdown text
  const getExpirationText = () => {
    if (!deal.promotion_end) return null;
    const end = new Date(deal.promotion_end).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return 'Offer expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 1) return `Ends in ${days} days`;
    if (hours > 0) return `Ends in ${hours}h`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `Ends in ${minutes}m`;
  };

  const expirationText = getExpirationText();
  const isFree = deal.status === 'FREE_PROMOTION' || deal.status === 'PERMANENTLY_FREE' || deal.current_price === 0;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/game/${game.slug || game.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Game deal link copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(game.id);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group relative bg-[#1D2226] border border-[#262D33] hover:border-[#38424B] rounded-lg overflow-hidden transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:shadow-black/40">
      {/* Top Banner / Image Area */}
      <Link href={`/game/${game.slug || game.id}`} className="relative block aspect-[16/9] w-full overflow-hidden bg-[#171A1D]">
        <img
          src={imageError || !game.artwork_url ? fallbackImage : game.artwork_url}
          alt={game.title}
          onError={() => setImageError(true)}
          className="game-card-img w-full h-full object-cover object-center"
          loading={priority ? 'eager' : 'lazy'}
        />

        {/* Platform Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm flex items-center gap-1 ${
              game.platform === 'STEAM'
                ? 'bg-[#171A1D]/90 text-[#66C0F4] border border-[#66C0F4]/30'
                : 'bg-[#171A1D]/90 text-white border border-white/30'
            }`}
          >
            {game.platform === 'STEAM' ? 'STEAM' : 'EPIC GAMES'}
          </span>

          {game.is_historical_low && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#17231E]/95 text-accent-emerald border border-accent-emerald/40 flex items-center gap-0.5">
              <TrendingDown className="w-2.5 h-2.5" />
              <span>LOWEST EVER</span>
            </span>
          )}

          {isFree && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-emerald text-[#101214] flex items-center gap-0.5 shadow-sm">
              <Gift className="w-2.5 h-2.5" />
              <span>100% FREE</span>
            </span>
          )}
        </div>

        {/* Quick Action Overlays (Wishlist & Share) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlistClick}
            className={`p-1.5 rounded-md backdrop-blur-md transition-all ${
              isWishlisted
                ? 'bg-accent-amber text-[#101214]'
                : 'bg-[#171A1D]/80 text-text-secondary hover:text-text-primary hover:bg-[#1D2226]'
            }`}
            title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-md bg-[#171A1D]/80 backdrop-blur-md text-text-secondary hover:text-text-primary hover:bg-[#1D2226] transition-all"
            title="Share deal"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Discount Tag on bottom-right of image */}
        {deal.discount_percentage > 0 && !isFree && (
          <div className="absolute bottom-2.5 right-2.5 bg-accent-emerald text-[#101214] font-heading font-bold text-xs px-2 py-0.5 rounded shadow">
            -{deal.discount_percentage}%
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Genre and Expiry line */}
          <div className="flex items-center justify-between text-[11px] text-text-muted mb-1.5">
            <span className="truncate max-w-[140px] uppercase tracking-wider font-mono text-[10px]">
              {game.genre?.[0] || 'Game'}
            </span>
            {expirationText && (
              <span className="flex items-center gap-1 text-accent-amber text-[10px] font-medium shrink-0">
                <Clock className="w-2.5 h-2.5" />
                <span>{expirationText}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            href={`/game/${game.slug || game.id}`}
            className="font-heading font-semibold text-sm text-text-primary hover:text-accent-amber transition-colors line-clamp-1 block mb-2"
            title={game.title}
          >
            {game.title}
          </Link>
        </div>

        {/* Pricing & Savings Block */}
        <div className="pt-2 border-t border-[#262D33]/80">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              {deal.original_price > deal.current_price && (
                <span className="text-[11px] text-text-muted line-through mr-2">
                  {formatPrice(deal.original_price, deal.currency)}
                </span>
              )}
              <span className={`font-heading font-bold text-base ${isFree ? 'text-accent-emerald' : 'text-text-primary'}`}>
                {isFree ? 'FREE' : formatPrice(deal.current_price, deal.currency)}
              </span>
            </div>

            {deal.savings_amount > 0 && (
              <span className="text-[11px] font-medium text-accent-emerald bg-[#17231E] px-1.5 py-0.5 rounded border border-accent-emerald/20">
                Save {formatPrice(deal.savings_amount, deal.currency)}
              </span>
            )}
          </div>

          {/* Bottom Actions: View Details & Direct Store Link */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href={`/game/${game.slug || game.id}`}
              className="w-full py-1.5 px-2 bg-[#252B30] hover:bg-[#2E363D] text-text-primary text-[11px] font-semibold rounded text-center transition-colors"
            >
              Details
            </Link>
            <a
              href={game.official_store_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 px-2 bg-accent-amber hover:bg-[#D9932B] text-[#101214] text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-colors"
            >
              <span>View Deal</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
