'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Gamepad2, 
  Search, 
  Bookmark, 
  Bell, 
  Globe, 
  ShieldCheck, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from './AppContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { region, setRegion, wishlistIds, unreadCount } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionDropdown, setRegionDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Discover', href: '/discover' },
    { name: 'Steam Deals', href: '/deals/steam' },
    { name: 'Epic Deals', href: '/deals/epic' },
    { name: 'Free Games', href: '/free-games' },
    { name: 'Upcoming', href: '/upcoming' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
        isScrolled
          ? 'bg-[#101214]/95 backdrop-blur-md border-[#252B30] shadow-md'
          : 'bg-[#101214] border-[#1D2226]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-md bg-[#1D2226] border border-[#2B333A] flex items-center justify-center text-accent-amber group-hover:border-accent-amber transition-colors">
            <Gamepad2 className="w-5 h-5 text-accent-amber" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-base tracking-tight text-text-primary leading-none">
              GAME DISCOUNT <span className="text-accent-amber">TRACKER</span>
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] tracking-wider text-text-muted uppercase font-medium">
                Never Miss A Deal
              </span>
              <span className="text-[9px] text-[#2F363E]">•</span>
              <span className="text-[10px] font-semibold text-accent-amber">
                by Shivam Jagtap
              </span>
            </div>
          </div>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-text-primary bg-[#1D2226] border border-[#2B333A]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-[#171A1D]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <Search className="w-3.5 h-3.5 absolute left-3 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games, devs..."
              className="bg-[#171A1D] border border-[#252B30] text-xs text-text-primary rounded-md pl-8 pr-3 py-1.5 w-44 lg:w-56 focus:outline-none focus:border-accent-amber transition-all placeholder:text-text-muted"
            />
          </form>

          {/* Region Switcher */}
          <div className="relative">
            <button
              onClick={() => setRegionDropdown(!regionDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#171A1D] border border-[#252B30] text-xs font-medium text-text-secondary hover:text-text-primary hover:border-[#38424B] transition-colors"
              title="Change Pricing Region"
            >
              <Globe className="w-3.5 h-3.5 text-accent-amber" />
              <span>{region} ({region === 'IN' ? '₹' : '$'})</span>
            </button>

            {regionDropdown && (
              <div className="absolute right-0 mt-1.5 w-44 bg-[#1D2226] border border-[#2B333A] rounded-md shadow-xl py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-text-muted border-b border-[#2B333A]">
                  Store Currency
                </div>
                {[
                  { code: 'IN', label: 'India (₹ INR)', flag: '🇮🇳' },
                  { code: 'US', label: 'United States ($ USD)', flag: '🇺🇸' },
                  { code: 'EU', label: 'Europe (€ EUR)', flag: '🇪🇺' },
                  { code: 'GB', label: 'United Kingdom (£ GBP)', flag: '🇬🇧' },
                ].map((r) => (
                  <button
                    key={r.code}
                    onClick={() => {
                      setRegion(r.code);
                      setRegionDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#252B30] transition-colors ${
                      region === r.code ? 'text-accent-amber font-semibold' : 'text-text-secondary'
                    }`}
                  >
                    <span>{r.flag} {r.label}</span>
                    {region === r.code && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="relative p-2 rounded-md bg-[#171A1D] border border-[#252B30] text-text-secondary hover:text-text-primary hover:border-[#38424B] transition-colors"
            title="My Wishlist"
          >
            <Bookmark className="w-4 h-4" />
            {wishlistIds.size > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-amber text-[#101214] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {wishlistIds.size}
              </span>
            )}
          </Link>

          {/* Notifications Link */}
          <Link
            href="/dashboard"
            className="relative p-2 rounded-md bg-[#171A1D] border border-[#252B30] text-text-secondary hover:text-text-primary hover:border-[#38424B] transition-colors"
            title="Notifications & Dashboard"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-emerald text-[#101214] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Admin Link */}
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1D2226] border border-[#2B333A] text-xs font-medium text-text-secondary hover:text-accent-amber hover:border-accent-amber/50 transition-colors"
            title="Admin Console"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md bg-[#171A1D] border border-[#252B30] text-text-secondary hover:text-text-primary"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#171A1D] border-b border-[#252B30] px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games, publishers, genres..."
              className="w-full bg-[#101214] border border-[#252B30] text-sm text-text-primary rounded-md pl-9 pr-3 py-2 focus:outline-none focus:border-accent-amber"
            />
          </form>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === link.href
                    ? 'text-accent-amber bg-[#1D2226]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-[#1D2226]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-accent-amber hover:bg-[#1D2226] flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-accent-amber" />
              <span>Admin Management</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
