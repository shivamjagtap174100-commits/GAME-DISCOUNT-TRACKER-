import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Game, Deal, PriceHistoryRecord, SyncLog, DailyReport } from './types';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key && url.startsWith('http')) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
        },
      });
      return supabaseClient;
    } catch (err) {
      console.warn('[Supabase] Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

/**
 * Mirror updates to Supabase PostgreSQL when available
 */
export async function mirrorGameToSupabase(game: Game): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;

  try {
    const { error } = await sb.from('games').upsert({
      id: game.id,
      platform: game.platform,
      external_game_id: game.external_game_id,
      title: game.title,
      slug: game.slug,
      description: game.description,
      developer: game.developer,
      publisher: game.publisher,
      genre: game.genre,
      artwork_url: game.artwork_url,
      banner_url: game.banner_url || null,
      official_store_url: game.official_store_url,
      release_date: game.release_date,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'platform,external_game_id' });

    if (error) {
      console.warn('[Supabase] Game upsert warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Game mirror exception:', err);
    return false;
  }
}

export async function mirrorDealToSupabase(deal: Deal): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;

  try {
    const { error } = await sb.from('deals').upsert({
      id: deal.id,
      game_id: deal.game_id,
      region: deal.region,
      currency: deal.currency,
      original_price: deal.original_price,
      current_price: deal.current_price,
      discount_percentage: deal.discount_percentage,
      savings_amount: deal.savings_amount,
      promotion_start: deal.promotion_start,
      promotion_end: deal.promotion_end,
      status: deal.status,
      source: deal.source,
      last_verified_at: deal.last_verified_at,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'game_id,region' });

    if (error) {
      console.warn('[Supabase] Deal upsert warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Deal mirror exception:', err);
    return false;
  }
}

export async function mirrorPriceHistoryToSupabase(record: PriceHistoryRecord): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;

  try {
    const { error } = await sb.from('price_history').insert({
      id: record.id,
      game_id: record.game_id,
      region: record.region,
      original_price: record.original_price,
      current_price: record.current_price,
      discount_percentage: record.discount_percentage,
      observed_at: record.observed_at,
      source: record.source,
    });

    return !error;
  } catch {
    return false;
  }
}



export async function mirrorSyncLogToSupabase(log: SyncLog): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;

  try {
    const { error } = await sb.from('sync_logs').upsert({
      id: log.id,
      provider: log.provider,
      status: log.status,
      games_processed: log.games_processed,
      deals_updated: log.deals_updated,
      errors: log.errors,
      started_at: log.started_at,
      completed_at: log.completed_at,
    });

    return !error;
  } catch {
    return false;
  }
}

export async function mirrorDailyReportToSupabase(report: DailyReport): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;

  try {
    const { error } = await sb.from('daily_reports').upsert({
      id: report.id,
      date: report.date,
      generated_at: report.generated_at,
      total_steam_deals: report.total_steam_deals,
      total_epic_deals: report.total_epic_deals,
      new_discounts: report.new_discounts,
      increased_discounts: report.increased_discounts,
      expired_deals: report.expired_deals,
      free_promotions: report.free_promotions,
      failed_jobs: report.failed_jobs,
      steam_status: report.steam_status,
      epic_status: report.epic_status,
      notes: report.notes,
    }, { onConflict: 'date' });

    return !error;
  } catch {
    return false;
  }
}


