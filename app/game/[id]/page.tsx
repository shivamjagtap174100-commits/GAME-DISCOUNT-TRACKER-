'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Bookmark, 
  ExternalLink, 
  Bell, 
  Share2, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  Tag, 
  TrendingDown, 
  Sparkles,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { GameWithDeal, PriceHistoryRecord } from '@/lib/db/types';
import { formatPrice } from '@/lib/engine/validation';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import PriceAlertModal from '@/components/PriceAlertModal';
import GameCard from '@/components/GameCard';
import { useApp } from '@/components/AppContext';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { wishlistIds, toggleWishlist, showToast, region } = useApp();

  const [game, setGame] = useState<GameWithDeal | null>(null);
  const [history, setHistory] = useState<PriceHistoryRecord[]>([]);
  const [similar, setSimilar] = useState<GameWithDeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);

  const gameId = params?.id as string;

  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    fetch(`/api/deals/${gameId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.game) {
          setGame(data.game);
          setHistory(data.priceHistory || []);
          setSimilar(data.similar || []);
        } else {
          setGame(null);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
          <div className="h-8 skeleton-box rounded w-1/4" />
          <div className="h-96 skeleton-box rounded-xl" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-accent-red mx-auto" />
        <h2 className="font-heading text-2xl font-bold text-text-primary">Game Not Found</h2>
        <p className="text-sm text-text-muted">
          The requested title is not currently cataloged or may have been unlisted.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-amber text-[#101214] font-bold text-xs rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistIds.has(game.id);
  const deal = game.deal;
  const isFree = deal.status === 'FREE_PROMOTION' || deal.status === 'PERMANENTLY_FREE' || deal.current_price === 0;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Game page URL copied to clipboard', 'success');
    }
  };

  return (
    <div className="w-full pb-16">
      {/* Breadcrumb / Top Bar */}
      <div className="bg-[#14171A] border-b border-[#1D2226] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-text-primary">Home</Link>
            <span>/</span>
            <Link href="/discover" className="hover:text-text-primary">Deals</Link>
            <span>/</span>
            <span className="text-text-secondary truncate max-w-xs">{game.title}</span>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 hover:text-text-primary"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Game Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column: Artwork & Media */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[16/9] w-full bg-[#171A1D] rounded-xl overflow-hidden border border-[#2B333A] shadow-2xl">
              <img
                src={game.banner_url || game.artwork_url}
                alt={game.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                    game.platform === 'STEAM'
                      ? 'bg-[#101214]/90 text-brand-steam border border-brand-steam/40'
                      : 'bg-[#101214]/90 text-white border border-white/40'
                  }`}
                >
                  {game.platform === 'STEAM' ? 'Steam Store' : 'Epic Games Store'}
                </span>
                {game.is_historical_low && (
                  <span className="px-3 py-1 rounded text-xs font-bold bg-[#17231E]/95 text-accent-emerald border border-accent-emerald/40 flex items-center gap-1 backdrop-blur-md">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Lowest Price Ever Recorded</span>
                  </span>
                )}
              </div>

              {deal.discount_percentage > 0 && (
                <div className="absolute top-4 right-4 bg-accent-emerald text-[#101214] font-heading font-extrabold text-base px-3 py-1 rounded-md shadow-lg">
                  -{deal.discount_percentage}%
                </div>
              )}
            </div>

            {/* Price History Chart */}
            <PriceHistoryChart
              history={history}
              currency={deal.currency}
              originalPrice={deal.original_price}
              currentPrice={deal.current_price}
            />
          </div>

          {/* Right Column: Pricing, Deal Summary & CTAs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-6 shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {game.genre.map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#1D2226] text-text-muted border border-[#2B333A]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary leading-tight">
                  {game.title}
                </h1>
              </div>

              {/* Verified Pricing Card */}
              <div className="bg-[#1D2226] border border-[#2B333A] rounded-lg p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Store Region: <strong>India ({deal.currency} {deal.currency === 'INR' ? '₹' : '$'})</strong></span>
                  <span className="flex items-center gap-1 text-accent-emerald text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Deal</span>
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    {deal.original_price > deal.current_price && (
                      <div className="text-sm text-text-muted line-through">
                        {formatPrice(deal.original_price, deal.currency)}
                      </div>
                    )}
                    <div className="font-heading font-bold text-3xl sm:text-4xl text-accent-emerald">
                      {isFree ? 'FREE' : formatPrice(deal.current_price, deal.currency)}
                    </div>
                  </div>

                  {deal.savings_amount > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-text-muted">Total Savings</div>
                      <div className="font-heading font-bold text-base text-accent-emerald bg-[#17231E] px-2 py-1 rounded border border-accent-emerald/30">
                        Save {formatPrice(deal.savings_amount, deal.currency)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expiration date */}
                {deal.promotion_end && (
                  <div className="pt-2 border-t border-[#252B30] flex items-center gap-1.5 text-xs text-accent-amber font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Offer ends: {new Date(deal.promotion_end).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={game.official_store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-accent-amber hover:bg-[#D9932B] text-[#101214] font-heading font-bold text-sm uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent-amber/10"
                >
                  <span>Buy on {game.platform === 'STEAM' ? 'Steam Store' : 'Epic Games Store'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => toggleWishlist(game.id)}
                    className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                      isWishlisted
                        ? 'bg-accent-amber text-[#101214] border-accent-amber'
                        : 'bg-[#1D2226] text-text-secondary hover:text-text-primary border-[#2B333A] hover:bg-[#252B30]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                    <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                  </button>

                  <button
                    onClick={() => setIsAlertModalOpen(true)}
                    className="py-2 px-3 bg-[#1D2226] hover:bg-[#252B30] text-text-secondary hover:text-accent-amber text-xs font-semibold rounded-md border border-[#2B333A] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Price Alert</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="py-2 px-3 bg-[#1D2226] hover:bg-[#252B30] text-text-secondary hover:text-text-primary text-xs font-semibold rounded-md border border-[#2B333A] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Game Metadata Table */}
              <div className="pt-4 border-t border-[#252B30] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Developer</span>
                  </span>
                  <span className="font-medium text-text-primary text-right">{game.developer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Publisher</span>
                  </span>
                  <span className="font-medium text-text-primary text-right">{game.publisher}</span>
                </div>
                {game.release_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Release Date</span>
                    </span>
                    <span className="font-medium text-text-primary">{game.release_date}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Data Source</span>
                  <span className="font-mono text-[11px] text-accent-amber">{deal.source}</span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 bg-[#1D2226] border border-[#2B333A] rounded text-[11px] text-text-muted leading-relaxed">
                Prices and promotions may change without prior notice. Always verify the final checkout price on the official storefront before purchasing.
              </div>

            </div>
          </div>
        </div>

        {/* Game Description & Overview */}
        <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 mb-12 space-y-4">
          <h2 className="font-heading text-lg font-bold text-text-primary">About {game.title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {game.description}
          </p>
        </div>

        {/* Similar Discounted Games */}
        {similar.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-text-primary">
                Similar Discounted Games in {game.genre[0] || 'Genre'}
              </h2>
              <Link
                href={`/discover?genre=${game.genre[0] || ''}`}
                className="text-xs font-semibold text-accent-amber hover:underline"
              >
                View More →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {similar.map((sim) => (
                <GameCard key={sim.id} game={sim} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Price Alert Modal */}
      <PriceAlertModal
        game={game}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </div>
  );
}
