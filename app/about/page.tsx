import React from 'react';
import { Gamepad2, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#1D2226] border border-[#2B333A] flex items-center justify-center text-accent-amber">
          <Gamepad2 className="w-6 h-6" />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary">
          About Game Discount Tracker
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          <strong>Never Miss a Game Deal.</strong> We are dedicated to providing PC gamers with accurate, continuous price tracking and honest discount notifications across major gaming storefronts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-3">
          <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-emerald" />
            <span>Honest Deal Tracking</span>
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Unlike many deal aggregators that convert USD prices into arbitrary local numbers, we fetch actual store listings directly in your local currency.
          </p>
        </div>

        <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-3">
          <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-amber" />
            <span>Multi-Store Discovery</span>
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Consolidating Steam and Epic Games Store into one unified, responsive interface so you don&apos;t have to check multiple storefronts every Thursday.
          </p>
        </div>
      </div>

      <div className="bg-[#1D2226] border border-[#262D33] rounded-xl p-8 space-y-4">
        <h2 className="font-heading text-xl font-bold text-text-primary">Our Mission</h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          Gaming is one of the most rewarding entertainment mediums in the world, but keeping up with multiple storefront sales, seasonal discounts, flash specials, and limited-time giveaways can be exhausting. Our mission is to build the most trustworthy, lightning-fast price discovery tool for gamers everywhere.
        </p>
        <div className="pt-2">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-amber text-[#101214] text-xs font-bold rounded-md"
          >
            Explore Today&apos;s Deals
          </Link>
        </div>
      </div>
    </div>
  );
}
