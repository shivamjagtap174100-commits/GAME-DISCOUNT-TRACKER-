import fs from 'fs';
import path from 'path';
import { DatabaseSchema, Game, Deal, PriceHistoryRecord, User, WishlistItem, PriceAlert, NotificationItem, SyncLog, GameWithDeal, Platform } from './types';
import { validateAndCalculateDeal, RawDealInput } from '../engine/validation';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Global in-memory cache to make reads instantaneous
let memoryDb: DatabaseSchema | null = null;

function getInitialSchema(): DatabaseSchema {
  return {
    games: [],
    deals: [],
    price_history: [],
    users: [
      {
        id: 'usr_default_demo',
        email: 'gamer@example.com',
        role: 'USER',
        created_at: new Date().toISOString(),
      },
      {
        id: 'usr_admin_demo',
        email: 'admin@gamediscounttracker.com',
        role: 'ADMIN',
        created_at: new Date().toISOString(),
      },
    ],
    wishlist: [],
    price_alerts: [],
    notifications: [],
    sync_logs: [],
  };
}

export function loadDatabase(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialSchema();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    memoryDb = initial;
    return memoryDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    memoryDb = JSON.parse(raw);
    if (!memoryDb) {
      memoryDb = getInitialSchema();
    }
    // Ensure all arrays exist
    memoryDb.games = memoryDb.games || [];
    memoryDb.deals = memoryDb.deals || [];
    memoryDb.price_history = memoryDb.price_history || [];
    memoryDb.users = memoryDb.users || [];
    memoryDb.wishlist = memoryDb.wishlist || [];
    memoryDb.price_alerts = memoryDb.price_alerts || [];
    memoryDb.notifications = memoryDb.notifications || [];
    memoryDb.sync_logs = memoryDb.sync_logs || [];
    return memoryDb;
  } catch (err) {
    console.error('Error reading db.json, reinitializing schema:', err);
    memoryDb = getInitialSchema();
    return memoryDb;
  }
}

export function saveDatabase(): void {
  if (!memoryDb) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(memoryDb, null, 2), 'utf8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

export interface DealQueryFilters {
  platform?: Platform | 'ALL';
  search?: string;
  genre?: string;
  minDiscount?: number;
  maxPrice?: number;
  minPrice?: number;
  freeOnly?: boolean;
  status?: string;
  endingSoon?: boolean;
  region?: string;
  sortBy?: 'discount_desc' | 'price_asc' | 'price_desc' | 'updated_desc' | 'ending_soon' | 'title_asc' | 'savings_desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const db = {
  // Stats
  getStats() {
    const db = loadDatabase();
    const activeDeals = db.deals.filter(d => d.status === 'ACTIVE' || d.status === 'FREE_PROMOTION');
    const freeDeals = db.deals.filter(d => d.status === 'FREE_PROMOTION' || d.status === 'PERMANENTLY_FREE');
    const steamDeals = db.deals.filter(d => {
      const g = db.games.find(gm => gm.id === d.game_id);
      return g?.platform === 'STEAM' && (d.status === 'ACTIVE' || d.status === 'FREE_PROMOTION');
    });
    const epicDeals = db.deals.filter(d => {
      const g = db.games.find(gm => gm.id === d.game_id);
      return g?.platform === 'EPIC' && (d.status === 'ACTIVE' || d.status === 'FREE_PROMOTION');
    });

    const lastSync = db.sync_logs.length > 0 ? db.sync_logs[0] : null;

    return {
      totalGames: db.games.length,
      activeDealsCount: activeDeals.length,
      freeGamesCount: freeDeals.length,
      steamDealsCount: steamDeals.length,
      epicDealsCount: epicDeals.length,
      lastSyncTime: lastSync?.completed_at || lastSync?.started_at || null,
      lastSyncStatus: lastSync?.status || 'IDLE',
    };
  },

  // Game queries
  getGameById(id: string): GameWithDeal | null {
    const db = loadDatabase();
    const game = db.games.find(g => g.id === id);
    if (!game) return null;

    const deal = db.deals.find(d => d.game_id === game.id) || {
      id: `deal_stub_${game.id}`,
      game_id: game.id,
      region: 'IN',
      currency: 'INR',
      original_price: 0,
      current_price: 0,
      discount_percentage: 0,
      savings_amount: 0,
      promotion_start: null,
      promotion_end: null,
      status: 'UNAVAILABLE' as const,
      source: (game.platform === 'STEAM' ? 'STEAM_STORE' : 'EPIC_STORE') as any,
      last_verified_at: new Date().toISOString(),
      created_at: game.created_at,
      updated_at: game.updated_at,
    };

    // Historical calculations
    const history = db.price_history.filter(h => h.game_id === game.id);
    const lowest_price_historical = history.length > 0
      ? Math.min(...history.map(h => h.current_price))
      : deal.current_price;

    const is_historical_low = history.length >= 2 && deal.current_price <= lowest_price_historical && deal.discount_percentage > 0;

    return {
      ...game,
      deal,
      lowest_price_historical,
      is_historical_low,
    };
  },

  getGameBySlug(slug: string): GameWithDeal | null {
    const db = loadDatabase();
    const game = db.games.find(g => g.slug === slug);
    if (!game) return null;
    return this.getGameById(game.id);
  },

  // Query Deals with pagination and filters
  getDeals(filters: DealQueryFilters = {}): PaginatedResult<GameWithDeal> {
    const db = loadDatabase();
    const {
      platform,
      search,
      genre,
      minDiscount,
      maxPrice,
      minPrice,
      freeOnly,
      status,
      endingSoon,
      region = 'IN',
      sortBy = 'discount_desc',
      page = 1,
      limit = 24,
    } = filters;

    // Join games and deals
    let items: GameWithDeal[] = [];

    const now = new Date().getTime();

    for (const deal of db.deals) {
      // Filter region if specified
      if (region && deal.region !== region) {
        // If exact region not matched, continue unless it's only currency
      }

      const game = db.games.find(g => g.id === deal.game_id);
      if (!game) continue;

      // Platform filter
      if (platform && platform !== 'ALL' && game.platform !== platform) {
        continue;
      }

      // Status filter
      if (status) {
        if (deal.status !== status) continue;
      } else {
        // By default, exclude EXPIRED and UNAVAILABLE unless requested
        if (deal.status === 'EXPIRED' || deal.status === 'UNAVAILABLE') {
          continue;
        }
      }

      // Free games filter
      if (freeOnly) {
        if (deal.status !== 'FREE_PROMOTION' && deal.status !== 'PERMANENTLY_FREE' && deal.current_price !== 0) {
          continue;
        }
      }

      // Min discount
      if (typeof minDiscount === 'number' && deal.discount_percentage < minDiscount) {
        continue;
      }

      // Price ranges
      if (typeof minPrice === 'number' && deal.current_price < minPrice) {
        continue;
      }
      if (typeof maxPrice === 'number' && deal.current_price > maxPrice) {
        continue;
      }

      // Ending soon filter (ending in next 72 hours)
      if (endingSoon) {
        if (!deal.promotion_end) continue;
        const endTime = new Date(deal.promotion_end).getTime();
        const hoursLeft = (endTime - now) / (1000 * 60 * 60);
        if (hoursLeft <= 0 || hoursLeft > 72) continue;
      }

      // Genre filter
      if (genre && genre !== 'ALL') {
        const hasGenre = game.genre.some(g => g.toLowerCase() === genre.toLowerCase());
        if (!hasGenre) continue;
      }

      // Search query (title, developer, publisher)
      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        const titleMatch = game.title.toLowerCase().includes(q);
        const devMatch = game.developer.toLowerCase().includes(q);
        const pubMatch = game.publisher.toLowerCase().includes(q);
        if (!titleMatch && !devMatch && !pubMatch) continue;
      }

      // Historical low check
      const history = db.price_history.filter(h => h.game_id === game.id);
      const lowest_price_historical = history.length > 0
        ? Math.min(...history.map(h => h.current_price))
        : deal.current_price;
      const is_historical_low = history.length >= 2 && deal.current_price <= lowest_price_historical && deal.discount_percentage > 0;

      items.push({
        ...game,
        deal,
        lowest_price_historical,
        is_historical_low,
      });
    }

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'discount_desc':
          return b.deal.discount_percentage - a.deal.discount_percentage;
        case 'price_asc':
          return a.deal.current_price - b.deal.current_price;
        case 'price_desc':
          return b.deal.current_price - a.deal.current_price;
        case 'savings_desc':
          return b.deal.savings_amount - a.deal.savings_amount;
        case 'ending_soon': {
          const endA = a.deal.promotion_end ? new Date(a.deal.promotion_end).getTime() : Infinity;
          const endB = b.deal.promotion_end ? new Date(b.deal.promotion_end).getTime() : Infinity;
          return endA - endB;
        }
        case 'updated_desc': {
          const updA = new Date(a.deal.updated_at).getTime();
          const updB = new Date(b.deal.updated_at).getTime();
          return updB - updA;
        }
        case 'title_asc':
          return a.title.localeCompare(b.title);
        default:
          return b.deal.discount_percentage - a.deal.discount_percentage;
      }
    });

    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const validPage = Math.max(1, Math.min(page, totalPages));
    const startIdx = (validPage - 1) * limit;
    const paginatedItems = items.slice(startIdx, startIdx + limit);

    return {
      items: paginatedItems,
      total,
      page: validPage,
      limit,
      totalPages,
    };
  },

  // Price History
  getPriceHistory(gameId: string): PriceHistoryRecord[] {
    const db = loadDatabase();
    return db.price_history
      .filter(h => h.game_id === gameId)
      .sort((a, b) => new Date(a.observed_at).getTime() - new Date(b.observed_at).getTime());
  },

  // Save or update game + deal + price history
  upsertGameAndDeal(
    gameData: Omit<Game, 'created_at' | 'updated_at'>,
    dealInput: RawDealInput,
    source: Deal['source']
  ): { game: Game; deal: Deal | null; error?: string } {
    const db = loadDatabase();
    const now = new Date().toISOString();

    // 1. Validate deal according to Phase 5 accuracy engine
    const validated = validateAndCalculateDeal(dealInput);
    if (!validated.isValid) {
      return { game: gameData as Game, deal: null, error: validated.error };
    }

    // 2. Upsert Game
    let game = db.games.find(g => g.id === gameData.id || (g.platform === gameData.platform && g.external_game_id === gameData.external_game_id));
    if (game) {
      game.title = gameData.title || game.title;
      game.slug = gameData.slug || game.slug;
      game.description = gameData.description || game.description;
      game.developer = gameData.developer || game.developer;
      game.publisher = gameData.publisher || game.publisher;
      game.genre = gameData.genre?.length ? gameData.genre : game.genre;
      game.artwork_url = gameData.artwork_url || game.artwork_url;
      game.banner_url = gameData.banner_url || game.banner_url;
      game.official_store_url = gameData.official_store_url || game.official_store_url;
      game.release_date = gameData.release_date || game.release_date;
      game.updated_at = now;
    } else {
      game = {
        ...gameData,
        created_at: now,
        updated_at: now,
      };
      db.games.push(game);
    }

    // 3. Upsert Deal
    let deal = db.deals.find(d => d.game_id === game!.id && d.region === (dealInput.currency === 'INR' ? 'IN' : 'US'));
    const isNewPrice = !deal || deal.current_price !== validated.currentPrice || deal.discount_percentage !== validated.discountPercentage;

    if (deal) {
      deal.original_price = validated.originalPrice;
      deal.current_price = validated.currentPrice;
      deal.discount_percentage = validated.discountPercentage;
      deal.savings_amount = validated.savingsAmount;
      deal.promotion_start = dealInput.promotionStart || deal.promotion_start;
      deal.promotion_end = dealInput.promotionEnd || deal.promotion_end;
      deal.status = validated.status;
      deal.source = source;
      deal.last_verified_at = now;
      deal.updated_at = now;
    } else {
      deal = {
        id: `deal_${game.id}_${dealInput.currency.toLowerCase()}`,
        game_id: game.id,
        region: dealInput.currency === 'INR' ? 'IN' : 'US',
        currency: dealInput.currency,
        original_price: validated.originalPrice,
        current_price: validated.currentPrice,
        discount_percentage: validated.discountPercentage,
        savings_amount: validated.savingsAmount,
        promotion_start: dealInput.promotionStart || null,
        promotion_end: dealInput.promotionEnd || null,
        status: validated.status,
        source: source,
        last_verified_at: now,
        created_at: now,
        updated_at: now,
      };
      db.deals.push(deal);
    }

    // 4. Record Price History Observation if price changed or first seen
    if (isNewPrice) {
      db.price_history.push({
        id: `ph_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        game_id: game.id,
        region: deal.region,
        original_price: deal.original_price,
        current_price: deal.current_price,
        discount_percentage: deal.discount_percentage,
        observed_at: now,
        source: source,
      });

      // 5. Trigger Price Alerts (Phase 9)
      const matchingAlerts = db.price_alerts.filter(
        a => a.game_id === game!.id && a.is_active && deal!.current_price <= a.target_price
      );

      for (const alert of matchingAlerts) {
        db.notifications.push({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          user_id: alert.user_id,
          title: `Price Alert Triggered: ${game.title}`,
          message: `${game.title} is now ${deal.current_price === 0 ? 'FREE' : `₹${deal.current_price}`}, hitting your target price of ₹${alert.target_price}!`,
          type: deal.current_price === 0 ? 'FREE_GAME' : 'PRICE_DROP',
          is_read: false,
          game_id: game.id,
          created_at: now,
        });
      }
    }

    saveDatabase();
    return { game, deal };
  },

  // Wishlist
  getWishlist(userId: string): GameWithDeal[] {
    const db = loadDatabase();
    const userWishlist = db.wishlist.filter(w => w.user_id === userId);
    const result: GameWithDeal[] = [];

    for (const item of userWishlist) {
      const gwd = this.getGameById(item.game_id);
      if (gwd) {
        result.push(gwd);
      }
    }
    return result;
  },

  isWishlisted(userId: string, gameId: string): boolean {
    const db = loadDatabase();
    return db.wishlist.some(w => w.user_id === userId && w.game_id === gameId);
  },

  toggleWishlist(userId: string, gameId: string): boolean {
    const db = loadDatabase();
    const idx = db.wishlist.findIndex(w => w.user_id === userId && w.game_id === gameId);
    let wishlisted = false;
    if (idx >= 0) {
      db.wishlist.splice(idx, 1);
      wishlisted = false;
    } else {
      db.wishlist.push({
        id: `wish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        game_id: gameId,
        created_at: new Date().toISOString(),
      });
      wishlisted = true;
    }
    saveDatabase();
    return wishlisted;
  },

  // Price Alerts
  getPriceAlerts(userId: string): PriceAlert[] {
    const db = loadDatabase();
    return db.price_alerts.filter(a => a.user_id === userId);
  },

  setPriceAlert(userId: string, gameId: string, targetPrice: number, currency: string = 'INR'): PriceAlert {
    const db = loadDatabase();
    const existing = db.price_alerts.find(a => a.user_id === userId && a.game_id === gameId);
    if (existing) {
      existing.target_price = targetPrice;
      existing.currency = currency;
      existing.is_active = true;
      saveDatabase();
      return existing;
    }

    const alert: PriceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      game_id: gameId,
      target_price: targetPrice,
      currency,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    db.price_alerts.push(alert);
    saveDatabase();
    return alert;
  },

  removePriceAlert(id: string): boolean {
    const db = loadDatabase();
    const idx = db.price_alerts.findIndex(a => a.id === id);
    if (idx >= 0) {
      db.price_alerts.splice(idx, 1);
      saveDatabase();
      return true;
    }
    return false;
  },

  // Notifications
  getNotifications(userId: string): NotificationItem[] {
    const db = loadDatabase();
    return db.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  markNotificationAsRead(id: string): void {
    const db = loadDatabase();
    const notif = db.notifications.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      saveDatabase();
    }
  },

  markAllNotificationsRead(userId: string): void {
    const db = loadDatabase();
    for (const notif of db.notifications) {
      if (notif.user_id === userId) {
        notif.is_read = true;
      }
    }
    saveDatabase();
  },

  // Sync Logs
  getSyncLogs(limit: number = 20): SyncLog[] {
    const db = loadDatabase();
    return [...db.sync_logs]
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, limit);
  },

  startSyncLog(provider: 'STEAM' | 'EPIC' | 'ALL'): SyncLog {
    const db = loadDatabase();
    const log: SyncLog = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      provider,
      status: 'RUNNING',
      games_processed: 0,
      deals_updated: 0,
      errors: null,
      started_at: new Date().toISOString(),
      completed_at: null,
    };
    db.sync_logs.unshift(log);
    saveDatabase();
    return log;
  },

  finishSyncLog(id: string, status: 'SUCCESS' | 'PARTIAL' | 'FAILED', processed: number, updated: number, errors?: string | null): void {
    const db = loadDatabase();
    const log = db.sync_logs.find(l => l.id === id);
    if (log) {
      log.status = status;
      log.games_processed = processed;
      log.deals_updated = updated;
      log.errors = errors || null;
      log.completed_at = new Date().toISOString();
      saveDatabase();
    }
  },
};
