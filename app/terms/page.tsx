import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <h1 className="font-heading text-3xl font-bold text-text-primary">Terms of Service</h1>
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-8 space-y-6 text-xs text-text-secondary leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-heading font-bold text-sm text-text-primary">1. Informational Service Only</h2>
          <p>
            Game Discount Tracker is an independent price discovery platform. We do not sell games, process payments, or distribute game licenses. All purchase transactions occur on the official respective digital storefronts (such as Steam or Epic Games Store).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-sm text-text-primary">2. Price Accuracy and Disclaimers</h2>
          <p>
            While we continuously synchronize store data to maintain maximum accuracy, store promotions, flash sales, and publisher regional price revisions can occur at any time. Users must always verify the final checkout price on the official merchant platform before making any purchase.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-sm text-text-primary">3. Intellectual Property</h2>
          <p>
            All game titles, cover images, descriptions, screenshots, trademarks, and associated intellectual property remain the property of their respective creators, publishers, and storefronts.
          </p>
        </section>
      </div>
    </div>
  );
}
