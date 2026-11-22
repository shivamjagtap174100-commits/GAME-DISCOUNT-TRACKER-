# GAME DISCOUNT TRACKER
**Tagline: Never Miss a Game Deal.**

> **Architect & Lead Developer**: **Shivam Jagtap** ([@shivamjagtap174100-commits](https://github.com/shivamjagtap174100-commits))

Game Discount Tracker is a production-grade, commercial web application designed to continuously monitor, verify, and discover PC gaming deals, price drops, steep historical discounts, and free promotions from **Steam** and the **Epic Games Store**.

Built with an editorial aesthetic, dark UI philosophy, real-time store APIs, a data accuracy engine, price history tracking, and regional currency support defaulting to India (INR ₹).

---

## Key Features

1. **Live Store Integrations**:
   - **Steam Store**: Queries official public storefront specials (`/api/featuredcategories`), app details (`/api/appdetails`), and featured catalogs with Indian regional pricing (`cc=in`), verified discounts, and promotional expiration dates.
   - **Epic Games Store**: Queries official public storefront promotional endpoints (`/freeGamesPromotions?country=IN`) and the community catalog indexer **EGData** (`docs.egdata.app`) for full-catalog deals and weekly giveaways.
   - **Source Transparency**: Every single deal is tagged with its authentic data source (`STEAM_STORE`, `EPIC_STORE`, or `EGDATA`).

2. **Phase 1 Design Philosophy (/unslop)**:
   - Deep charcoal color palette:
     - Primary background: `#101214`
     - Secondary background: `#171A1D`
     - Card background: `#1D2226`
     - Elevated surfaces: `#252B30`
     - Primary text: `#F4F5F6`, Secondary text: `#A0A8AE`, Muted text: `#727B83`
     - Warm amber (`#F0A83A`) for deal highlights, Muted emerald (`#35B779`) for verified savings, Steam blue (`#66C0F4`), Epic white (`#FFFFFF`).
   - Clean 8px spacing system, crisp borders, subtle shadows, no glowing neon, no oversized cards, and no generic AI templates.

3. **Data Accuracy Engine (Phase 5)**:
   - Verified formula:
     $$\text{Discount Percentage} = \text{round}\left(\frac{\text{Original Price} - \text{Current Price}}{\text{Original Price}} \times 100\right)$$
     $$\text{Savings} = \text{Original Price} - \text{Current Price}$$
   - Status transitions: `ACTIVE`, `UPCOMING`, `EXPIRED`, `FREE_PROMOTION`, `PERMANENTLY_FREE`, `UNAVAILABLE`, `VERIFICATION_REQUIRED`.
   - Historical low indicator: dynamically computes if current price is lowest ever observed.
   - Strict regional rules: NEVER simulates INR prices by converting USD; directly queries regional store catalogs.

4. **Interactive Game Cards (Phase 3)**:
   - Game artwork with fallback protection
   - Platform badge with direct link to platform filters
   - Strikethrough MSRP & discounted price
   - Calculated savings badge
   - Offer expiration countdown timer
   - Wishlist toggle
   - One-click shareable deal link with toast notification
   - Direct button to official storefront checkout

5. **Search & Multi-Facet Filtering (Phase 7)**:
   - Search by title, developer, or publisher
   - Platform filter: All, Steam, Epic Games Store
   - Discount tiers: 25%+, 50%+, 75%+, 90%+
   - Price brackets: Free Only, Under ₹250, Under ₹500, Under ₹1,000, Under ₹2,000
   - Genre tags: Action, Adventure, RPG, Strategy, Indie, Racing, Simulation, Horror, Sports
   - Sorting: Highest Discount, Biggest Savings, Price Low/High, Ending Soon, Recently Updated, Alphabetical
   - Pagination and clear-all filters

6. **Price History Charting (Phase 8)**:
   - Responsive Recharts line chart showing historical price fluctuations over time
   - Identifies all-time lows and MSRP reference lines

7. **Wishlist & Price Alerts (Phase 9 & 10)**:
   - Save games to personal wishlist
   - Set custom target price alert threshold in INR
   - Automatic background triggers generating in-app notifications when prices drop below target

8. **Admin Mission Control (Phase 11)**:
   - System telemetry and live database stats
   - Manual sync triggers (Sync All, Steam Only, Epic Only)
   - Real-time audit logs of synchronization runs, counts, and error outputs
   - Adapter connection diagnostics

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript + React
- **Styling**: Tailwind CSS with custom editorial design tokens
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database**:
  - Local runtime: High-performance ACID JSON/WAL persistence in `data/db.json` with in-memory caching.
  - Production ready: PostgreSQL / Supabase migration schema included at `supabase/schema.sql`.

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 24)
- npm / npx

### Setup & Installation

1. Clone or navigate to the repository:
   ```bash
   cd "game discount tracker"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

4. Build production application:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

The application will be live at `http://localhost:3000`.

---

## API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/stats` | GET | Platform statistics (total games, active deals, free games, last sync) |
| `/api/deals` | GET | Paginated deals with filtering, search, and sorting |
| `/api/deals/[id]` | GET | Game detail, verified pricing, price history, and similar games |
| `/api/sync` | GET / POST | View sync logs or trigger manual store synchronization |
| `/api/wishlist` | GET / POST | Get wishlist or toggle game saved status |
| `/api/alerts` | GET / POST / DELETE | Manage price drop target alerts |
| `/api/notifications` | GET / POST | Get user notifications or mark as read |

---

## Production Deployment

### Vercel / Railway / Supabase
- The application is standard Next.js App Router.
- For Supabase or PostgreSQL deployments, apply the schema located in `supabase/schema.sql`.
- Configure `ADMIN_SECRET_KEY` and `NEXT_PUBLIC_APP_URL` in environment variables.

---

## Data Transparency & Disclaimer

Game Discount Tracker is an independent discovery platform and is not affiliated with, sponsored by, or endorsed by Valve Corporation or Epic Games, Inc. All trademarks and logos belong to their respective copyright holders.
