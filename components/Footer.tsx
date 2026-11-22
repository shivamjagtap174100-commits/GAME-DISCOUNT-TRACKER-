import React from 'react';
import Link from 'next/link';
import { Gamepad2, ShieldAlert, RefreshCw, ExternalLink } from 'lucide-react';

interface FooterProps {
  lastSyncTime?: string | null;
}

export default function Footer({ lastSyncTime }: FooterProps) {
  return (
    <footer className="w-full bg-[#101214] border-t border-[#1D2226] pt-12 pb-8 text-text-secondary text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1D2226]">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-md bg-[#1D2226] border border-[#2B333A] flex items-center justify-center text-accent-amber">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-sm tracking-tight text-text-primary">
                GAME DISCOUNT <span className="text-accent-amber">TRACKER</span>
              </span>
            </Link>
            <p className="text-text-muted leading-relaxed text-[11px]">
              Independent gaming deals discovery platform continuously tracking discounts, price drops, and verified free promotions across Steam and Epic Games Store.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-text-muted pt-1">
              <RefreshCw className="w-3 h-3 text-accent-emerald animate-pulse" />
              <span>
                Engine Sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleString('en-IN') : 'Live Sync Active'}
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-text-primary mb-3">
              Explore Deals
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/discover" className="hover:text-accent-amber transition-colors">
                  All Active Deals
                </Link>
              </li>
              <li>
                <Link href="/deals/steam" className="hover:text-brand-steam transition-colors">
                  Steam Specials
                </Link>
              </li>
              <li>
                <Link href="/deals/epic" className="hover:text-text-primary transition-colors">
                  Epic Games Offers
                </Link>
              </li>
              <li>
                <Link href="/free-games" className="hover:text-accent-emerald transition-colors">
                  Free Games & Giveaways
                </Link>
              </li>
              <li>
                <Link href="/upcoming" className="hover:text-accent-amber transition-colors">
                  Upcoming Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Product & Tools */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-text-primary mb-3">
              Platform Tools
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/wishlist" className="hover:text-text-primary transition-colors">
                  Wishlist & Tracking
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-text-primary transition-colors">
                  Price Alerts Center
                </Link>
              </li>
              <li>
                <Link href="/data-sources" className="hover:text-accent-amber transition-colors">
                  Data Sources & Transparency
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-accent-amber transition-colors">
                  Admin System Health
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust, Transparency & Disclaimer */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-text-primary mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-accent-amber" />
              <span>Trust & Disclaimers</span>
            </h4>
            <p className="text-text-muted text-[11px] leading-relaxed mb-3">
              Game Discount Tracker is an independent project. We are not affiliated with, endorsed by, or sponsored by Valve Corporation, Steam, or Epic Games, Inc.
            </p>
            <p className="text-text-muted text-[10px] leading-relaxed">
              All game titles, trademarks, and logos belong to their respective copyright holders. Always verify the final checkout price on the official storefront.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-muted">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span>© {new Date().getFullYear()} Game Discount Tracker. Never Miss a Game Deal.</span>
            <span className="hidden sm:inline text-text-muted">•</span>
            <span>
              Engineered with precision by <strong className="text-text-primary font-semibold hover:text-accent-amber transition-colors">Shivam Jagtap</strong>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-text-primary transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/data-sources" className="hover:text-text-primary transition-colors">
              Data Transparency
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
