'use client';

import React, { useState } from 'react';
import { Bell, X, Check, TrendingDown } from 'lucide-react';
import { GameWithDeal } from '@/lib/db/types';
import { formatPrice } from '@/lib/engine/validation';
import { useApp } from './AppContext';

interface PriceAlertModalProps {
  game: GameWithDeal;
  isOpen: boolean;
  onClose: () => void;
  onAlertCreated?: () => void;
}

export default function PriceAlertModal({
  game,
  isOpen,
  onClose,
  onAlertCreated,
}: PriceAlertModalProps) {
  const { showToast } = useApp();
  const currentPrice = game.deal.current_price;
  const originalPrice = game.deal.original_price;

  // Default target recommendation: 20% lower than current or next round step
  const recommendedTarget = Math.max(0, Math.floor(currentPrice * 0.8));
  const [targetPrice, setTargetPrice] = useState<number>(recommendedTarget);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(targetPrice) || targetPrice < 0) {
      showToast('Please enter a valid target price', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          targetPrice,
          currency: game.deal.currency,
        }),
      });

      if (res.ok) {
        showToast(`Price alert activated for ${formatPrice(targetPrice, game.deal.currency)}`, 'success');
        if (onAlertCreated) onAlertCreated();
        onClose();
      } else {
        showToast('Failed to create alert', 'error');
      }
    } catch {
      showToast('Network error creating alert', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1D2226] border border-[#2B333A] rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-md bg-[#17231E] border border-accent-emerald/30 flex items-center justify-center text-accent-emerald">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-text-primary">
              Set Price Drop Alert
            </h3>
            <p className="text-xs text-text-muted">
              Get notified when this game hits your target price.
            </p>
          </div>
        </div>

        {/* Game summary */}
        <div className="flex items-center gap-3 p-3 bg-[#171A1D] border border-[#252B30] rounded-lg mb-4">
          <img
            src={game.artwork_url}
            alt={game.title}
            className="w-16 h-10 object-cover rounded bg-[#101214]"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-semibold text-xs text-text-primary truncate">
              {game.title}
            </h4>
            <div className="flex items-baseline gap-2 mt-0.5 text-xs">
              <span className="text-text-muted">Current:</span>
              <span className="font-bold text-accent-amber">
                {formatPrice(currentPrice, game.deal.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Target Price Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Target Price ({game.deal.currency})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-text-muted text-sm font-semibold">
                {game.deal.currency === 'INR' ? '₹' : '$'}
              </span>
              <input
                type="number"
                min="0"
                max={originalPrice}
                step="1"
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#101214] border border-[#2B333A] text-sm text-text-primary rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-accent-amber font-mono"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2">
            {[0.5, 0.7, 0.85].map((factor) => {
              const preset = Math.floor(currentPrice * factor);
              return (
                <button
                  type="button"
                  key={factor}
                  onClick={() => setTargetPrice(preset)}
                  className="flex-1 py-1 px-2 text-[11px] rounded bg-[#252B30] hover:bg-[#2F363E] text-text-secondary hover:text-text-primary border border-[#2B333A] transition-colors"
                >
                  {Math.round((1 - factor) * 100)}% lower ({formatPrice(preset, game.deal.currency)})
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-text-muted bg-[#171A1D] p-2.5 rounded border border-[#252B30]">
            When the verified regional store price drops to or below <strong className="text-accent-amber">{formatPrice(targetPrice, game.deal.currency)}</strong>, you will receive an in-app alert.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-accent-amber hover:bg-[#D9932B] text-[#101214] text-xs font-bold rounded-md shadow flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Activating...' : 'Activate Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
