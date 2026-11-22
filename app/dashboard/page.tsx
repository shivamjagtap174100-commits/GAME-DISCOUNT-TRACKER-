'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Bookmark, 
  Trash2, 
  Check, 
  TrendingDown, 
  Globe, 
  User, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '@/components/AppContext';
import { formatPrice } from '@/lib/engine/validation';

export default function DashboardPage() {
  const { region, setRegion, wishlistIds, showToast } = useApp();

  const [alerts, setAlerts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'alerts' | 'notifications' | 'settings'>('alerts');

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, nRes] = await Promise.all([
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json()),
      ]);

      if (aRes.success) setAlerts(aRes.alerts || []);
      if (nRes.success) setNotifications(nRes.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.id !== id));
        showToast('Price alert removed', 'info');
      }
    } catch {
      showToast('Failed to delete alert', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        showToast('All notifications marked as read', 'success');
      }
    } catch {
      showToast('Error updating notifications', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Banner */}
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#1D2226] border-2 border-accent-amber flex items-center justify-center text-accent-amber font-heading font-bold text-xl">
            GD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold text-text-primary">
                Gamer Hub & Price Center
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#17231E] text-accent-emerald border border-accent-emerald/30">
                PRO ACTIVE
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              gamer@example.com • Regional Pricing: <strong>India (INR ₹)</strong>
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-2 bg-[#101214] p-1 rounded-lg border border-[#252B30] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'bg-accent-amber text-[#101214]'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Price Alerts ({alerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-accent-amber text-[#101214]'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications ({notifications.filter(n => !n.is_read).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-accent-amber text-[#101214]'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Content Tabs */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-text-primary">
              Active Price Drop Alerts
            </h2>
            <Link
              href="/discover"
              className="text-xs text-accent-amber hover:underline"
            >
              + Set new alert from catalog
            </Link>
          </div>

          {alerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => {
                const game = alert.game;
                const currentPrice = game?.deal?.current_price ?? 0;
                const isHit = currentPrice <= alert.target_price;

                return (
                  <div
                    key={alert.id}
                    className={`bg-[#1D2226] border rounded-xl p-4 flex items-center justify-between gap-4 transition-all ${
                      isHit ? 'border-accent-emerald bg-[#17231E]/40' : 'border-[#262D33]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {game?.artwork_url && (
                        <img
                          src={game.artwork_url}
                          alt={game?.title || 'Game'}
                          className="w-16 h-12 object-cover rounded bg-[#101214]"
                        />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/game/${game?.slug || game?.id}`}
                          className="font-heading font-semibold text-sm text-text-primary hover:text-accent-amber truncate block"
                        >
                          {game?.title || `Game #${alert.game_id}`}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-text-muted">Target:</span>
                          <span className="font-bold text-accent-amber">
                            {formatPrice(alert.target_price, alert.currency)}
                          </span>
                          <span className="text-text-muted">• Current:</span>
                          <span className={`font-bold ${isHit ? 'text-accent-emerald' : 'text-text-primary'}`}>
                            {formatPrice(currentPrice, alert.currency)}
                          </span>
                        </div>
                        {isHit && (
                          <div className="text-[10px] font-bold text-accent-emerald flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Target Hit! Ready to Buy.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {game?.official_store_url && (
                        <a
                          href={game.official_store_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded bg-accent-amber text-[#101214] text-xs font-bold hover:bg-[#D9932B]"
                          title="Open Store Listing"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-2 rounded bg-[#252B30] text-text-muted hover:text-accent-red hover:bg-[#2F363E] transition-colors"
                        title="Remove alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-10 text-center space-y-3">
              <TrendingDown className="w-8 h-8 text-text-muted mx-auto" />
              <h3 className="font-heading font-bold text-base text-text-primary">No Active Alerts</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Go to any game details page and click &quot;Price Alert&quot; to specify your target price.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-text-primary">
              Notification Center
            </h2>
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-accent-amber hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-2.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-colors ${
                    n.is_read
                      ? 'bg-[#171A1D] border-[#252B30] text-text-secondary'
                      : 'bg-[#1D2226] border-[#38424B] text-text-primary'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-accent-emerald shrink-0" />
                      )}
                      <h4 className="font-heading font-bold text-sm text-text-primary">{n.title}</h4>
                      <span className="text-[10px] text-text-muted">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed pl-4">{n.message}</p>
                  </div>

                  {n.game_id && (
                    <Link
                      href={`/game/${n.game_id}`}
                      className="px-3 py-1.5 bg-[#252B30] hover:bg-[#2F363E] text-xs font-semibold rounded shrink-0"
                    >
                      View Game
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-10 text-center space-y-2">
              <Bell className="w-8 h-8 text-text-muted mx-auto" />
              <h3 className="font-heading font-bold text-base text-text-primary">You are all caught up!</h3>
              <p className="text-xs text-text-secondary">No unread price drop or giveaway alerts.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-6 max-w-xl">
          <h2 className="font-heading text-lg font-bold text-text-primary">
            Store & Regional Preferences
          </h2>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Default Pricing Currency
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { code: 'IN', label: 'India (INR ₹)' },
                { code: 'US', label: 'United States (USD $)' },
                { code: 'EU', label: 'Europe (EUR €)' },
                { code: 'GB', label: 'United Kingdom (GBP £)' },
              ].map((r) => (
                <button
                  key={r.code}
                  onClick={() => setRegion(r.code)}
                  className={`p-3 rounded-lg border text-left text-xs font-medium transition-colors ${
                    region === r.code
                      ? 'border-accent-amber bg-[#1D2226] text-accent-amber font-bold'
                      : 'border-[#252B30] text-text-secondary hover:bg-[#1D2226]'
                  }`}
                >
                  <div>{r.label}</div>
                  <div className="text-[10px] text-text-muted mt-1">Direct store API regional conversion</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#252B30] text-xs text-text-muted">
            Game Discount Tracker adheres to authentic regional store pricing. We do not apply synthetic foreign exchange conversions to regional prices.
          </div>
        </div>
      )}
    </div>
  );
}
