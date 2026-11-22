import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <h1 className="font-heading text-3xl font-bold text-text-primary">Privacy Policy</h1>
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-8 space-y-6 text-xs text-text-secondary leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-heading font-bold text-sm text-text-primary">1. Data Minimization</h2>
          <p>
            Game Discount Tracker is built with strict privacy-first architecture. You can browse all gaming deals, filter discounts, inspect price histories, and search catalogs completely anonymously without registering an account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-sm text-text-primary">2. Local Storage and Wishlists</h2>
          <p>
            Your preferences, selected regional currency (INR, USD, EUR, GBP), and saved wishlist items are retained locally in your browser storage or dedicated session context to provide a seamless personalized experience.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-sm text-text-primary">3. Third-Party Links</h2>
          <p>
            Our website contains outbound links to official digital gaming storefronts (Steam, Epic Games Store). When you click these links, you will navigate directly to their official domains, which are subject to their respective privacy policies.
          </p>
        </section>
      </div>
    </div>
  );
}
