-- Game Discount Tracker Schema (PostgreSQL / Supabase Migration)

CREATE TYPE platform_type AS ENUM ('STEAM', 'EPIC');
CREATE TYPE deal_status AS ENUM ('ACTIVE', 'UPCOMING', 'EXPIRED', 'FREE_PROMOTION', 'PERMANENTLY_FREE', 'UNAVAILABLE', 'VERIFICATION_REQUIRED');
CREATE TYPE deal_source AS ENUM ('STEAM_STORE', 'EPIC_STORE', 'EGDATA');
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE sync_status AS ENUM ('SUCCESS', 'PARTIAL', 'FAILED', 'RUNNING');

-- 1. games table
CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(64) PRIMARY KEY,
  platform platform_type NOT NULL,
  external_game_id VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  developer VARCHAR(255),
  publisher VARCHAR(255),
  genre TEXT[],
  artwork_url TEXT,
  banner_url TEXT,
  official_store_url TEXT NOT NULL,
  release_date VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_platform_external UNIQUE (platform, external_game_id)
);

CREATE INDEX IF NOT EXISTS idx_games_platform ON games(platform);
CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);
CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);

-- 2. deals table
CREATE TABLE IF NOT EXISTS deals (
  id VARCHAR(64) PRIMARY KEY,
  game_id VARCHAR(64) REFERENCES games(id) ON DELETE CASCADE,
  region VARCHAR(8) NOT NULL DEFAULT 'IN',
  currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  original_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  current_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_percentage INT NOT NULL DEFAULT 0,
  savings_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  promotion_start TIMESTAMPTZ,
  promotion_end TIMESTAMPTZ,
  status deal_status NOT NULL DEFAULT 'ACTIVE',
  source deal_source NOT NULL DEFAULT 'STEAM_STORE',
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_game_region UNIQUE (game_id, region)
);

CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_discount ON deals(discount_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_deals_current_price ON deals(current_price ASC);
CREATE INDEX IF NOT EXISTS idx_deals_region ON deals(region);

-- 3. price_history table
CREATE TABLE IF NOT EXISTS price_history (
  id VARCHAR(64) PRIMARY KEY,
  game_id VARCHAR(64) REFERENCES games(id) ON DELETE CASCADE,
  region VARCHAR(8) NOT NULL DEFAULT 'IN',
  original_price NUMERIC(10, 2) NOT NULL,
  current_price NUMERIC(10, 2) NOT NULL,
  discount_percentage INT NOT NULL,
  observed_at TIMESTAMPTZ DEFAULT NOW(),
  source VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_price_history_game_region ON price_history(game_id, region);
CREATE INDEX IF NOT EXISTS idx_price_history_observed ON price_history(observed_at);

-- 4. users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'USER',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  game_id VARCHAR(64) REFERENCES games(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_wishlist_game UNIQUE (user_id, game_id)
);

-- 6. price_alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  game_id VARCHAR(64) REFERENCES games(id) ON DELETE CASCADE,
  target_price NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_game_alert UNIQUE (user_id, game_id)
);

-- 7. notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(32) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  game_id VARCHAR(64) REFERENCES games(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. sync_logs table
CREATE TABLE IF NOT EXISTS sync_logs (
  id VARCHAR(64) PRIMARY KEY,
  provider VARCHAR(32) NOT NULL,
  status sync_status NOT NULL DEFAULT 'RUNNING',
  games_processed INT NOT NULL DEFAULT 0,
  deals_updated INT NOT NULL DEFAULT 0,
  errors TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_started ON sync_logs(started_at DESC);
