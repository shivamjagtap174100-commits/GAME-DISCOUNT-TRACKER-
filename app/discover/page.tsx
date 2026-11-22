'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Flame,
  ArrowUpDown
} from 'lucide-react';
import GameCard from '@/components/GameCard';
import { GameWithDeal } from '@/lib/db/types';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [games, setGames] = useState<GameWithDeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filter params from URL or defaults
  const search = searchParams.get('search') || '';
  const platform = searchParams.get('platform') || 'ALL';
  const genre = searchParams.get('genre') || 'ALL';
  const minDiscount = searchParams.get('minDiscount') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const freeOnly = searchParams.get('freeOnly') === 'true';
  const endingSoon = searchParams.get('endingSoon') === 'true';
  const sortBy = searchParams.get('sortBy') || 'discount_desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Local search input
  const [localSearch, setLocalSearch] = useState(search);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Update query helper
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'ALL') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset to page 1 on filter changes unless changing page
    if (!('page' in updates)) {
      params.delete('page');
    }
    router.push(`/discover?${params.toString()}`);
  };

  const handleClearAll = () => {
    setLocalSearch('');
    router.push('/discover');
  };

  // Fetch games when params change
  useEffect(() => {
    setLoading(true);
    const queryString = searchParams.toString();
    fetch(`/api/deals?${queryString}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGames(data.items || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const genresList = [
    'Action',
    'Adventure',
    'RPG',
    'Racing',
    'Simulation',
    'Strategy',
    'Horror',
    'Sports',
    'Indie',
    'Casual',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary">
            Discover Deals
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Browse verified discounts and price drops across Steam and Epic Games Store.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateQuery({ search: localSearch.trim() });
          }}
          className="relative flex items-center max-w-md w-full"
        >
          <Search className="w-4 h-4 absolute left-3.5 text-text-muted" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by title, publisher, studio..."
            className="w-full bg-[#171A1D] border border-[#252B30] text-sm text-text-primary rounded-lg pl-10 pr-24 py-2.5 focus:outline-none focus:border-accent-amber transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1 px-3 py-1.5 bg-accent-amber hover:bg-[#D9932B] text-[#101214] text-xs font-bold rounded-md transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between p-3 bg-[#171A1D] border border-[#252B30] rounded-lg">
          <span className="text-xs font-semibold text-text-primary flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent-amber" />
            <span>Filters ({[platform !== 'ALL', genre !== 'ALL', minDiscount, maxPrice, freeOnly].filter(Boolean).length})</span>
          </span>
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="px-3 py-1 bg-[#252B30] text-xs font-semibold rounded text-text-primary"
          >
            {mobileFilterOpen ? 'Hide' : 'Show Filters'}
          </button>
        </div>

        {/* Sidebar Filters */}
        <div className={`space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#252B30]">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-accent-amber" />
                <span>Filter Deals</span>
              </span>
              <button
                onClick={handleClearAll}
                className="text-[11px] text-text-muted hover:text-accent-amber flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
                Platform
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'STEAM', label: 'Steam' },
                  { id: 'EPIC', label: 'Epic' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => updateQuery({ platform: p.id })}
                    className={`py-1.5 text-xs font-medium rounded text-center transition-colors ${
                      platform === p.id
                        ? 'bg-accent-amber text-[#101214] font-bold'
                        : 'bg-[#1D2226] text-text-secondary hover:text-text-primary hover:bg-[#252B30]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Tiers */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
                Minimum Discount
              </label>
              <div className="space-y-1">
                {[
                  { value: '', label: 'Any discount' },
                  { value: '25', label: '25% or more' },
                  { value: '50', label: '50% or more' },
                  { value: '75', label: '75% or more' },
                  { value: '90', label: '90% or more' },
                ].map((d) => (
                  <button
                    key={d.value}
                    onClick={() => updateQuery({ minDiscount: d.value })}
                    className={`w-full text-left px-3 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                      minDiscount === d.value
                        ? 'bg-[#252B30] text-accent-amber font-semibold'
                        : 'text-text-secondary hover:bg-[#1D2226]'
                    }`}
                  >
                    <span>{d.label}</span>
                    {minDiscount === d.value && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Brackets */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
                Price Range (INR)
              </label>
              <div className="space-y-1">
                {[
                  { max: '', label: 'Any Price' },
                  { max: '0', label: 'Free Only', isFree: true },
                  { max: '250', label: 'Under ₹250' },
                  { max: '500', label: 'Under ₹500' },
                  { max: '1000', label: 'Under ₹1,000' },
                  { max: '2000', label: 'Under ₹2,000' },
                ].map((p) => {
                  const isSelected = p.isFree ? freeOnly : maxPrice === p.max && !freeOnly;
                  return (
                    <button
                      key={p.label}
                      onClick={() => {
                        if (p.isFree) {
                          updateQuery({ freeOnly: 'true', maxPrice: null });
                        } else {
                          updateQuery({ maxPrice: p.max, freeOnly: null });
                        }
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#252B30] text-accent-emerald font-semibold'
                          : 'text-text-secondary hover:bg-[#1D2226]'
                      }`}
                    >
                      <span>{p.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Genres */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
                Genre
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => updateQuery({ genre: 'ALL' })}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                    genre === 'ALL'
                      ? 'bg-accent-amber text-[#101214] font-bold'
                      : 'bg-[#1D2226] text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All Genres
                </button>
                {genresList.map((g) => (
                  <button
                    key={g}
                    onClick={() => updateQuery({ genre: g })}
                    className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                      genre.toLowerCase() === g.toLowerCase()
                        ? 'bg-accent-amber text-[#101214] font-bold'
                        : 'bg-[#1D2226] text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Flags */}
            <div className="pt-2 border-t border-[#252B30] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary hover:text-text-primary">
                <input
                  type="checkbox"
                  checked={endingSoon}
                  onChange={(e) => updateQuery({ endingSoon: e.target.checked ? 'true' : null })}
                  className="rounded bg-[#101214] border-[#252B30] text-accent-amber focus:ring-0"
                />
                <span>Ending within 72 hours</span>
              </label>
            </div>

          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting & Result Count Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171A1D] border border-[#252B30] px-4 py-3 rounded-lg">
            <div className="text-xs text-text-secondary">
              Showing <strong className="text-text-primary">{games.length}</strong> of <strong className="text-text-primary">{total}</strong> verified deals
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />
                <span>Sort by:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => updateQuery({ sortBy: e.target.value })}
                className="bg-[#1D2226] border border-[#2B333A] text-xs text-text-primary rounded px-2.5 py-1.5 focus:outline-none focus:border-accent-amber"
              >
                <option value="discount_desc">Highest Discount (%)</option>
                <option value="savings_desc">Biggest Savings (₹)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="ending_soon">Ending Soon</option>
                <option value="updated_desc">Recently Updated</option>
                <option value="title_asc">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#1D2226] border border-[#252B30] rounded-lg p-3 space-y-3">
                  <div className="aspect-[16/9] skeleton-box rounded" />
                  <div className="h-4 skeleton-box rounded w-3/4" />
                  <div className="h-4 skeleton-box rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            /* Beautiful Empty State */
            <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#1D2226] flex items-center justify-center text-text-muted mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary">
                No Deals Matching Your Filters
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Try widening your price range, clearing specific genre tags, or searching for a different keyword.
              </p>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-accent-amber text-[#101214] text-xs font-bold rounded-md transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-[#1D2226]">
              <button
                onClick={() => updateQuery({ page: String(page - 1) })}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#171A1D] border border-[#252B30] text-xs font-medium text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs text-text-muted">
                Page <strong className="text-text-primary">{page}</strong> of <strong className="text-text-primary">{totalPages}</strong>
              </span>

              <button
                onClick={() => updateQuery({ page: String(page + 1) })}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#171A1D] border border-[#252B30] text-xs font-medium text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-8 text-center text-xs text-text-muted">Loading discover deals...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
