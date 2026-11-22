export type Platform = 'STEAM' | 'EPIC';

export type DealStatus = 
  | 'ACTIVE' 
  | 'UPCOMING' 
  | 'EXPIRED' 
  | 'FREE_PROMOTION' 
  | 'PERMANENTLY_FREE' 
  | 'UNAVAILABLE' 
  | 'VERIFICATION_REQUIRED';

export type DealSource = 'STEAM_STORE' | 'EPIC_STORE' | 'EGDATA';

export interface Game {
  id: string;
  platform: Platform;
  external_game_id: string;
  title: string;
  slug: string;
  description: string;
  developer: string;
  publisher: string;
  genre: string[];
  artwork_url: string;
  banner_url?: string;
  official_store_url: string;
  release_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  game_id: string;
  region: string; // 'IN', 'US', etc.
  currency: string; // 'INR', 'USD', etc.
  original_price: number;
  current_price: number;
  discount_percentage: number;
  savings_amount: number;
  promotion_start: string | null;
  promotion_end: string | null;
  status: DealStatus;
  source: DealSource;
  last_verified_at: string;
  created_at: string;
  updated_at: string;
}

export interface PriceHistoryRecord {
  id: string;
  game_id: string;
  region: string;
  original_price: number;
  current_price: number;
  discount_percentage: number;
  observed_at: string;
  source: string;
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  game_id: string;
  created_at: string;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  game_id: string;
  target_price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'PRICE_DROP' | 'FREE_GAME' | 'EXPIRING_SOON' | 'SYSTEM';
  is_read: boolean;
  game_id?: string;
  created_at: string;
}

export interface SyncLog {
  id: string;
  provider: 'STEAM' | 'EPIC' | 'ALL';
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'RUNNING';
  games_processed: number;
  deals_updated: number;
  errors: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface DatabaseSchema {
  games: Game[];
  deals: Deal[];
  price_history: PriceHistoryRecord[];
  users: User[];
  wishlist: WishlistItem[];
  price_alerts: PriceAlert[];
  notifications: NotificationItem[];
  sync_logs: SyncLog[];
}

export interface GameWithDeal extends Game {
  deal: Deal;
  lowest_price_historical?: number;
  is_historical_low?: boolean;
}
