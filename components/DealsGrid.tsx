'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingDown, ArrowRight, Flame, Clock } from 'lucide-react';
import { GameWithDeal } from '@/lib/db/types';
import GameCard from './GameCard';

interface DealsGridProps {
  title: string;
  subtitle?: string;
  games: GameWithDeal[];
  viewAllHref?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export default function DealsGrid({
  title,
  subtitle,
  games,
  viewAllHref,
  icon,
}: DealsGridProps) {
  if (!games || games.length === 0) return null;

  return (
    <section className="w-full py-10 border-b border-[#1D2226]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {icon}
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-text-secondary">
                {subtitle}
              </p>
            )}
          </div>

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-semibold text-accent-amber hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {games.map((game, idx) => (
            <GameCard key={game.id} game={game} priority={idx < 4} />
          ))}
        </div>

      </div>
    </section>
  );
}
