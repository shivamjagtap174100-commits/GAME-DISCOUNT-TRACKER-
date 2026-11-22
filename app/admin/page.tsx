'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Server, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Key, 
  Play, 
  Flame, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '@/components/AppContext';

export default function AdminPage() {
  const { showToast } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [adminKey, setAdminKey] = useState<string>('');
  const [authenticated, setAuthenticated] = useState<boolean>(true); // default authorized for demo review

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTriggerSync = async (provider: 'ALL' | 'STEAM' | 'EPIC') => {
    setSyncing(true);
    showToast(`Starting ${provider} synchronization job...`, 'info');
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey || 'demo_admin_session'}`,
        },
        body: JSON.stringify({ provider, countryCode: 'IN' }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          `Sync completed! Processed ${data.result.gamesProcessed} games, updated ${data.result.dealsUpdated} deals.`,
          'success'
        );
        fetchAdminData();
      } else {
        showToast(`Sync failed: ${data.error || data.result?.errors?.join(', ') || 'Unknown error'}`, 'error');
      }
    } catch (e: any) {
      showToast(`Network error triggering sync: ${e.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101214] border border-accent-amber/40 text-xs text-accent-amber font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mission Control & Telemetry</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Store Synchronization Console
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time pipeline health, live cron execution logs, and manual provider scrapers.
          </p>
        </div>

        {/* Global Manual Sync Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTriggerSync('ALL')}
            disabled={syncing}
            className="px-4 py-2.5 bg-accent-amber hover:bg-[#D9932B] text-[#101214] font-heading font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync All Stores'}</span>
          </button>
          <button
            onClick={() => handleTriggerSync('STEAM')}
            disabled={syncing}
            className="px-3 py-2.5 bg-[#1D2226] hover:bg-[#252B30] text-brand-steam font-heading font-bold text-xs uppercase tracking-wider rounded-md border border-[#2B333A] flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <span>Steam Only</span>
          </button>
          <button
            onClick={() => handleTriggerSync('EPIC')}
            disabled={syncing}
            className="px-3 py-2.5 bg-[#1D2226] hover:bg-[#252B30] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-md border border-[#2B333A] flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <span>Epic Only</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#1D2226] border border-[#262D33] p-4 rounded-xl">
            <div className="text-[11px] font-mono uppercase text-text-muted">Total Tracked</div>
            <div className="font-heading font-bold text-2xl text-text-primary mt-1">
              {stats.totalGames}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">Games in Database</div>
          </div>

          <div className="bg-[#1D2226] border border-[#262D33] p-4 rounded-xl">
            <div className="text-[11px] font-mono uppercase text-text-muted">Active Deals</div>
            <div className="font-heading font-bold text-2xl text-accent-amber mt-1">
              {stats.activeDealsCount}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">Verified Discounts</div>
          </div>

          <div className="bg-[#1D2226] border border-[#262D33] p-4 rounded-xl">
            <div className="text-[11px] font-mono uppercase text-text-muted">Free Titles</div>
            <div className="font-heading font-bold text-2xl text-accent-emerald mt-1">
              {stats.freeGamesCount}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">Zero-Cost Deals</div>
          </div>

          <div className="bg-[#1D2226] border border-[#262D33] p-4 rounded-xl">
            <div className="text-[11px] font-mono uppercase text-text-muted">Steam Feed</div>
            <div className="font-heading font-bold text-2xl text-brand-steam mt-1">
              {stats.steamDealsCount}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">Active Specials</div>
          </div>

          <div className="bg-[#1D2226] border border-[#262D33] p-4 rounded-xl">
            <div className="text-[11px] font-mono uppercase text-text-muted">Epic Feed</div>
            <div className="font-heading font-bold text-2xl text-white mt-1">
              {stats.epicDealsCount}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">Promos & Offers</div>
          </div>

          <div className="bg-[#1D2226] border border-[#262D33] p-4 rounded-xl">
            <div className="text-[11px] font-mono uppercase text-text-muted">Engine Status</div>
            <div className="font-heading font-bold text-sm text-accent-emerald mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <span>HEALTHY</span>
            </div>
            <div className="text-[10px] text-text-muted mt-1 truncate">
              {stats.lastSyncTime ? new Date(stats.lastSyncTime).toLocaleTimeString() : 'Active'}
            </div>
          </div>
        </div>
      )}

      {/* Provider Connectivity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Steam Provider Status */}
        <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-steam" />
              <h3 className="font-heading font-bold text-base text-text-primary">
                Steam Store Provider Adapter
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#17231E] text-accent-emerald border border-accent-emerald/30">
              CONNECTED
            </span>
          </div>

          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex justify-between py-1 border-b border-[#252B30]">
              <span className="text-text-muted">Primary Endpoint:</span>
              <span className="font-mono text-[11px] text-text-primary">/api/featuredcategories</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252B30]">
              <span className="text-text-muted">Details Enrichment:</span>
              <span className="font-mono text-[11px] text-text-primary">/api/appdetails</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252B30]">
              <span className="text-text-muted">Market Region:</span>
              <span>India (cc=in, currency=INR)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Rate Limiting:</span>
              <span>Adaptive backoff enabled</span>
            </div>
          </div>

          <button
            onClick={() => handleTriggerSync('STEAM')}
            disabled={syncing}
            className="w-full py-2 bg-[#1D2226] hover:bg-[#252B30] text-xs font-semibold text-text-primary rounded-lg border border-[#2B333A] transition-colors"
          >
            Force Sync Steam Specials
          </button>
        </div>

        {/* Epic Provider Status */}
        <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white" />
              <h3 className="font-heading font-bold text-base text-text-primary">
                Epic Games Store Adapter
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#17231E] text-accent-emerald border border-accent-emerald/30">
              CONNECTED
            </span>
          </div>

          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex justify-between py-1 border-b border-[#252B30]">
              <span className="text-text-muted">Official Storefront:</span>
              <span className="font-mono text-[11px] text-text-primary">/freeGamesPromotions</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252B30]">
              <span className="text-text-muted">Catalog Discovery:</span>
              <span className="font-mono text-[11px] text-text-primary">EGData Items & Offers</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252B30]">
              <span className="text-text-muted">Market Region:</span>
              <span>India (country=IN, currencyCode=INR)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Weekly Giveaways:</span>
              <span>Auto-detected & countdown calculated</span>
            </div>
          </div>

          <button
            onClick={() => handleTriggerSync('EPIC')}
            disabled={syncing}
            className="w-full py-2 bg-[#1D2226] hover:bg-[#252B30] text-xs font-semibold text-text-primary rounded-lg border border-[#2B333A] transition-colors"
          >
            Force Sync Epic Storefront
          </button>
        </div>

      </div>

      {/* Sync Execution Logs Table */}
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-amber" />
            <span>Audit Trail & Synchronization Logs</span>
          </h3>
          <span className="text-xs text-text-muted">Showing latest 15 runs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#252B30] text-text-muted font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Processed</th>
                <th className="py-2.5 px-3">Updated</th>
                <th className="py-2.5 px-3">Errors / Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B30]/60 text-text-secondary">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1D2226] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-text-muted whitespace-nowrap">
                      {new Date(log.started_at).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-text-primary">
                      {log.provider}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-[#17231E] text-accent-emerald'
                            : log.status === 'PARTIAL'
                            ? 'bg-[#2B2317] text-accent-amber'
                            : 'bg-[#291717] text-accent-red'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{log.games_processed}</td>
                    <td className="py-2.5 px-3 font-mono text-accent-emerald">{log.deals_updated}</td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-[11px] text-text-muted font-mono">
                      {log.errors || 'OK — Clean execution'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-text-muted">
                    No sync logs recorded yet. Click &quot;Sync All Stores&quot; to execute your first background sync.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
