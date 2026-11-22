'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Database, 
  Activity, 
  Key, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Play, 
  Layers, 
  Calendar,
  FileCheck2,
  ExternalLink,
  Lock,
  Radio,
  Cpu
} from 'lucide-react';
import { useApp } from '@/components/AppContext';

export default function AdminPage() {
  const { showToast } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [cronJobs, setCronJobs] = useState<any[]>([]);
  const [supabaseActive, setSupabaseActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [activeCronTrigger, setActiveCronTrigger] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('gdt_admin_key');
    if (saved) setAdminKey(saved);
  }, []);

  const handleKeyChange = (val: string) => {
    setAdminKey(val);
    localStorage.setItem('gdt_admin_key', val);
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setLogs(data.logs || []);
        setDailyReports(data.dailyReports || []);
        setCronJobs(data.cronJobs || []);
        setSupabaseActive(Boolean(data.supabaseActive));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000); // Poll status every 30s
    return () => clearInterval(interval);
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

  const handleTriggerCron = async (jobPath: string, jobName: string) => {
    setActiveCronTrigger(jobPath);
    showToast(`Invoking scheduled cron endpoint ${jobPath}...`, 'info');
    try {
      const url = adminKey ? `${jobPath}?secret=${encodeURIComponent(adminKey)}` : jobPath;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${adminKey || 'demo_admin_session'}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        showToast(`Cron ${jobName} executed successfully!`, 'success');
        fetchAdminData();
      } else {
        showToast(`Cron execution rejected: ${data.error || 'Check authorization secret.'}`, 'error');
      }
    } catch (e: any) {
      showToast(`Failed invoking ${jobPath}: ${e.message}`, 'error');
    } finally {
      setActiveCronTrigger(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101214] border border-accent-amber/40 text-xs text-accent-amber font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vercel Serverless & Automation Console</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Store Synchronization Engine
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Production cron schedules, database replication telemetry, and automated price monitoring.
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

      {/* Security Credentials Bar */}
      <div className="bg-[#1D2226] border border-[#262D33] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#252B30] flex items-center justify-center text-accent-amber">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-text-primary">Cron & Admin Authorization Key</div>
            <div className="text-[11px] text-text-muted">Enter CRON_SECRET or ADMIN_SECRET_KEY to invoke protected endpoints directly</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="password"
            placeholder="Paste secret token..."
            value={adminKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            className="px-3 py-1.5 bg-[#101214] border border-[#2A3138] rounded text-xs text-text-primary font-mono focus:outline-none focus:border-accent-amber w-60"
          />
          <button
            onClick={() => showToast('Authorization token saved locally.', 'success')}
            className="px-3 py-1.5 bg-[#252B30] hover:bg-[#2F373E] text-text-primary text-xs font-semibold rounded border border-[#353D45] transition-colors"
          >
            Save
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
            <div className="text-[10px] text-text-muted mt-0.5">Games in Catalog</div>
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
            <div className="text-[11px] font-mono uppercase text-text-muted">Postgres Cloud</div>
            <div className="font-heading font-bold text-sm text-accent-emerald mt-2 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${supabaseActive ? 'bg-accent-emerald animate-pulse' : 'bg-accent-amber'}`} />
              <span>{supabaseActive ? 'SUPABASE' : 'STANDBY'}</span>
            </div>
            <div className="text-[10px] text-text-muted mt-1 truncate">
              {supabaseActive ? 'PostgreSQL Active' : 'Local Storage Mode'}
            </div>
          </div>
        </div>
      )}

      {/* Vercel Cron Schedules Grid */}
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-accent-amber animate-pulse" />
            <h3 className="font-heading font-bold text-base text-text-primary">
              Vercel Cron Automation Pipeline
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#101214] border border-[#252B30] font-mono text-[11px]">
              <Cpu className="w-3 h-3 text-accent-emerald" /> vercel.json Registered (6 Tasks)
            </span>
            <span>Target: UTC / IST</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {cronJobs.map((job) => {
            const isTriggering = activeCronTrigger === job.path;
            return (
              <div 
                key={job.path} 
                className="bg-[#1D2226] border border-[#282F36] rounded-lg p-4 flex flex-col justify-between space-y-3 hover:border-accent-amber/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-heading font-bold text-xs text-text-primary">
                      {job.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#17231E] text-accent-emerald border border-accent-emerald/30">
                      SCHEDULED
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-accent-amber flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" />
                    <span>{job.frequency}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-snug">
                    {job.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#252B30] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-muted truncate max-w-[150px]">
                    {job.schedule}
                  </span>
                  <button
                    onClick={() => handleTriggerCron(job.path, job.name)}
                    disabled={isTriggering}
                    className="px-2.5 py-1 bg-[#252B30] hover:bg-accent-amber hover:text-[#101214] text-text-primary text-[11px] font-semibold rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Play className={`w-3 h-3 ${isTriggering ? 'animate-spin' : ''}`} />
                    <span>{isTriggering ? 'Running...' : 'Run Now'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provider Connectivity & Daily Audit Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Steam & Epic Status */}
        <div className="space-y-6">
          <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-steam" />
                <h3 className="font-heading font-bold text-sm text-text-primary">
                  Steam Store Provider API
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#17231E] text-accent-emerald border border-accent-emerald/30">
                ACTIVE
              </span>
            </div>
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex justify-between py-1 border-b border-[#252B30]">
                <span className="text-text-muted">Primary Feed:</span>
                <span className="font-mono text-[11px] text-text-primary">/api/featuredcategories/?cc=in</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#252B30]">
                <span className="text-text-muted">Enrichment:</span>
                <span className="font-mono text-[11px] text-text-primary">/api/appdetails/?appids=...</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Currency Enforcement:</span>
                <span className="text-accent-emerald font-semibold">INR (₹) Native — No Synthetic Conversion</span>
              </div>
            </div>
          </div>

          <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white" />
                <h3 className="font-heading font-bold text-sm text-text-primary">
                  Epic Games Store API
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#17231E] text-accent-emerald border border-accent-emerald/30">
                ACTIVE
              </span>
            </div>
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex justify-between py-1 border-b border-[#252B30]">
                <span className="text-text-muted">Free Games Feed:</span>
                <span className="font-mono text-[11px] text-text-primary">/freeGamesPromotions?country=IN</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#252B30]">
                <span className="text-text-muted">URL Canonicalization:</span>
                <span className="font-mono text-[11px] text-accent-emerald">en-US PageSlug with Fallback (No 404s)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Catalog Mirror:</span>
                <span className="font-mono text-[11px] text-text-primary">EGData Items & Offers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Reports & Data Audit History */}
        <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-accent-emerald" />
              <h3 className="font-heading font-bold text-sm text-text-primary">
                Daily Verification & Data Audit Reports
              </h3>
            </div>
            <span className="text-xs text-text-muted font-mono">Last 7 Days</span>
          </div>

          <div className="space-y-3">
            {dailyReports.length > 0 ? (
              dailyReports.map((report) => (
                <div key={report.id} className="bg-[#1D2226] border border-[#262D33] p-3 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-heading font-bold text-text-primary flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-accent-amber" />
                      <span>{report.date}</span>
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Generated: {new Date(report.generated_at).toLocaleTimeString('en-IN')}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-mono font-bold text-accent-emerald">
                        {(report.total_steam_deals || 0) + (report.total_epic_deals || 0)}
                      </div>
                      <div className="text-[10px] text-text-muted">Total Deals</div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-brand-steam">{report.total_steam_deals || 0}</div>
                      <div className="text-[10px] text-text-muted">Steam</div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-white">{report.total_epic_deals || 0}</div>
                      <div className="text-[10px] text-text-muted">Epic</div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-accent-amber">{report.free_promotions || 0}</div>
                      <div className="text-[10px] text-text-muted">Free</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-text-muted">
                No daily audits recorded yet. Run the &quot;Daily Catalog Refresh&quot; cron or click Run Now above.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync Execution Logs Table */}
      <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-amber" />
            <span>Audit Trail & Synchronization Logs</span>
          </h3>
          <span className="text-xs text-text-muted">Showing latest 20 background executions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#252B30] text-text-muted font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp (IST)</th>
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
                    No sync logs recorded yet.
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
