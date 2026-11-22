import { fetchSteamDeals } from '../providers/steam';
import { fetchEpicDeals } from '../providers/epic';
import { db } from '../db';
import { Platform } from '../db/types';

export interface SyncOptions {
  provider?: 'STEAM' | 'EPIC' | 'ALL';
  countryCode?: string;
  force?: boolean;
}

export interface SyncResult {
  success: boolean;
  provider: 'STEAM' | 'EPIC' | 'ALL';
  gamesProcessed: number;
  dealsUpdated: number;
  errors: string[];
  durationMs: number;
  timestamp: string;
}

let isSyncRunning = false;

export async function runSync(options: SyncOptions = {}): Promise<SyncResult> {
  const { provider = 'ALL', countryCode = 'IN' } = options;

  if (isSyncRunning) {
    return {
      success: false,
      provider,
      gamesProcessed: 0,
      dealsUpdated: 0,
      errors: ['A synchronization job is already running in background.'],
      durationMs: 0,
      timestamp: new Date().toISOString(),
    };
  }

  isSyncRunning = true;
  const startTime = Date.now();
  const log = db.startSyncLog(provider);
  const errors: string[] = [];
  let totalProcessed = 0;
  let totalUpdated = 0;

  try {
    // 1. Sync Steam if requested
    if (provider === 'STEAM' || provider === 'ALL') {
      try {
        const steamRes = await fetchSteamDeals({ countryCode: countryCode.toLowerCase(), limit: 40 });
        if (steamRes.errors) errors.push(...steamRes.errors);

        for (const item of steamRes.games) {
          totalProcessed++;
          const upsertRes = db.upsertGameAndDeal(
            {
              id: `steam_${item.externalId}`,
              platform: 'STEAM',
              external_game_id: item.externalId,
              title: item.title,
              slug: item.slug,
              description: item.description,
              developer: item.developer,
              publisher: item.publisher,
              genre: item.genre,
              artwork_url: item.artworkUrl,
              banner_url: item.bannerUrl,
              official_store_url: item.storeUrl,
              release_date: item.releaseDate,
            },
            {
              externalGameId: item.externalId,
              platform: 'STEAM',
              title: item.title,
              originalPrice: item.originalPrice,
              currentPrice: item.currentPrice,
              currency: item.currency,
              promotionStart: item.promotionStart,
              promotionEnd: item.promotionEnd,
              storeUrl: item.storeUrl,
            },
            item.source
          );

          if (upsertRes.deal) {
            totalUpdated++;
          } else if (upsertRes.error) {
            errors.push(`Steam [${item.title}]: ${upsertRes.error}`);
          }
        }
      } catch (err: any) {
        errors.push(`Steam sync failed: ${err.message || String(err)}`);
      }
    }

    // 2. Sync Epic if requested
    if (provider === 'EPIC' || provider === 'ALL') {
      try {
        const epicRes = await fetchEpicDeals({ countryCode: countryCode.toUpperCase(), limit: 40 });
        if (epicRes.errors) errors.push(...epicRes.errors);

        for (const item of epicRes.games) {
          totalProcessed++;
          const upsertRes = db.upsertGameAndDeal(
            {
              id: `epic_${item.externalId}`,
              platform: 'EPIC',
              external_game_id: item.externalId,
              title: item.title,
              slug: item.slug,
              description: item.description,
              developer: item.developer,
              publisher: item.publisher,
              genre: item.genre,
              artwork_url: item.artworkUrl,
              banner_url: item.bannerUrl,
              official_store_url: item.storeUrl,
              release_date: item.releaseDate,
            },
            {
              externalGameId: item.externalId,
              platform: 'EPIC',
              title: item.title,
              originalPrice: item.originalPrice,
              currentPrice: item.currentPrice,
              currency: item.currency,
              promotionStart: item.promotionStart,
              promotionEnd: item.promotionEnd,
              storeUrl: item.storeUrl,
              isPromotionalFree: item.isPromotionalFree,
              isPermanentlyFree: item.isPermanentlyFree,
            },
            item.source
          );

          if (upsertRes.deal) {
            totalUpdated++;
          } else if (upsertRes.error) {
            errors.push(`Epic [${item.title}]: ${upsertRes.error}`);
          }
        }
      } catch (err: any) {
        errors.push(`Epic sync failed: ${err.message || String(err)}`);
      }
    }

    const durationMs = Date.now() - startTime;
    const isSuccess = totalUpdated > 0 && errors.length === 0;
    const isPartial = totalUpdated > 0 && errors.length > 0;
    const status = isSuccess ? 'SUCCESS' : isPartial ? 'PARTIAL' : 'FAILED';

    db.finishSyncLog(log.id, status, totalProcessed, totalUpdated, errors.length ? errors.join('; ') : null);

    return {
      success: isSuccess || isPartial,
      provider,
      gamesProcessed: totalProcessed,
      dealsUpdated: totalUpdated,
      errors,
      durationMs,
      timestamp: new Date().toISOString(),
    };
  } finally {
    isSyncRunning = false;
  }
}

/**
 * Sync Free Game promotions specifically (e.g. Epic weekly giveaways & Steam free promotions)
 */
export async function syncFreeGames(options: { countryCode?: string } = {}): Promise<{
  success: boolean;
  freeGamesProcessed: number;
  promotionsUpdated: number;
  errors: string[];
  durationMs: number;
  timestamp: string;
}> {
  const { countryCode = 'IN' } = options;
  const startTime = Date.now();
  const errors: string[] = [];
  let freeGamesProcessed = 0;
  let promotionsUpdated = 0;

  try {
    const epicRes = await fetchEpicDeals({ countryCode: countryCode.toUpperCase(), limit: 40 });
    if (epicRes.errors) errors.push(...epicRes.errors);

    const freeItems = epicRes.games.filter(g => g.currentPrice === 0 || g.isPromotionalFree || g.isPermanentlyFree);

    for (const item of freeItems) {
      freeGamesProcessed++;
      const upsertRes = db.upsertGameAndDeal(
        {
          id: `epic_${item.externalId}`,
          platform: 'EPIC',
          external_game_id: item.externalId,
          title: item.title,
          slug: item.slug,
          description: item.description,
          developer: item.developer,
          publisher: item.publisher,
          genre: item.genre,
          artwork_url: item.artworkUrl,
          banner_url: item.bannerUrl,
          official_store_url: item.storeUrl,
          release_date: item.releaseDate,
        },
        {
          externalGameId: item.externalId,
          platform: 'EPIC',
          title: item.title,
          originalPrice: item.originalPrice,
          currentPrice: 0,
          currency: item.currency,
          promotionStart: item.promotionStart,
          promotionEnd: item.promotionEnd,
          storeUrl: item.storeUrl,
          isPromotionalFree: item.isPromotionalFree,
          isPermanentlyFree: item.isPermanentlyFree,
        },
        item.source
      );

      if (upsertRes.deal) {
        promotionsUpdated++;
      } else if (upsertRes.error) {
        errors.push(`Epic Free [${item.title}]: ${upsertRes.error}`);
      }
    }

    const durationMs = Date.now() - startTime;
    return {
      success: freeGamesProcessed > 0,
      freeGamesProcessed,
      promotionsUpdated,
      errors,
      durationMs,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    errors.push(`Free games sync failed: ${err.message || String(err)}`);
    return {
      success: false,
      freeGamesProcessed,
      promotionsUpdated,
      errors,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Auto-seed or verify sync has run at least once
 */
export async function ensureInitialData(): Promise<void> {
  const stats = db.getStats();
  if (stats.totalGames === 0) {
    console.log('[SyncEngine] Database is empty. Running initial live synchronization...');
    await runSync({ provider: 'ALL', countryCode: 'IN' });
  }
}
