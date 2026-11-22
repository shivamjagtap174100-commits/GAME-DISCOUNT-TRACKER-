import React from 'react';
import Link from 'next/link';
import { Gamepad2, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-[#171A1D] border border-[#252B30] flex items-center justify-center text-accent-amber">
        <Gamepad2 className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <span className="font-mono text-xs uppercase tracking-widest text-accent-amber font-bold">
          404 — Page Not Found
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary">
          Lost in the Catalog?
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
          The deal, game, or category you requested could not be found. It may have expired or been moved to a new URL slug.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/"
          className="px-4 py-2 bg-accent-amber text-[#101214] font-bold text-xs rounded-md shadow"
        >
          Return Home
        </Link>
        <Link
          href="/discover"
          className="px-4 py-2 bg-[#1D2226] hover:bg-[#252B30] text-text-primary border border-[#2B333A] font-semibold text-xs rounded-md"
        >
          Explore All Deals
        </Link>
      </div>
    </div>
  );
}
