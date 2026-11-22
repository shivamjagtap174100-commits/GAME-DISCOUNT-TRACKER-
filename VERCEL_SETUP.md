# Vercel Deployment & 24/7 Automated Updates Guide

## Game Discount Tracker ("Never Miss a Game Deal.")

This guide documents how to deploy **Game Discount Tracker** on Vercel with automated, 24/7 background cron synchronization for Steam and Epic Games Store.

---

## 1. Automated Architecture Overview

When deployed to Vercel:
- **Zero-Visitor Background Execution**: Synchronization does NOT require a visitor or an open browser tab. Vercel Cron triggers the backend serverless functions at the configured UTC intervals.
- **Vercel Cron Jobs**: Registered automatically via `vercel.json`.
- **Security**: All cron endpoints validate `Authorization: Bearer <CRON_SECRET>`. Vercel automatically passes this header on every scheduled run.
- **Dual Persistence**: Data persists in Supabase PostgreSQL (when credentials are provided) with high-speed local JSON fallback.
- **Cache Revalidation**: Every successful sync triggers Next.js `revalidatePath` to ensure instant cache invalidation.

---

## 2. Configured Vercel Cron Schedules

Configured in [`vercel.json`](./vercel.json):

| Endpoint | Schedule (UTC) | Schedule (IST) | Task Description |
|---|---|---|---|
| `/api/cron/sync-steam` | `0 * * * *` (Hourly :00) | Hourly :30 | Live Steam specials, prices, and discounts in INR |
| `/api/cron/sync-free-games` | `15 * * * *` (Hourly :15) | Hourly :45 | Scans Epic weekly giveaways & Steam 100% off deals |
| `/api/cron/sync-epic` | `30 * * * *` (Hourly :30) | Hourly :00 | Epic Games Store catalog & EGData price updates |
| `/api/cron/expire-deals` | `45 * * * *` (Hourly :45) | Hourly :15 | Detects and flags expired limited-time deals |
| `/api/cron/full-refresh` | `0 4 * * *` (Daily 04:00 UTC) | Daily 09:30 AM | Full dual-store catalog refresh & Daily Report |
| `/api/cron/data-audit` | `0 6 * * *` (Daily 06:00 UTC) | Daily 11:30 AM | Checks discount math, URL canonicalization, and logs audit |

---

## 3. Environment Variables Configuration

Add these in **Vercel Dashboard -> Project Settings -> Environment Variables**:

### Mandatory Variables

| Variable Name | Example / Recommended Value | Description |
|---|---|---|
| `CRON_SECRET` | `cron_secure_secret_gdt_2026_x89` | **CRITICAL**: Used by Vercel to authenticate scheduled cron invocations. |
| `ADMIN_SECRET_KEY` | `admin_pass_gdt_tracker_2026` | Used for manual admin trigger in the `/admin` console. |
| `NEXT_PUBLIC_APP_URL` | `https://game-deal-tracker-vert.vercel.app` | Canonical live domain. |
| `DEFAULT_REGION` | `IN` | Primary market region. |
| `DEFAULT_CURRENCY` | `INR` | Default currency. |

### Optional: Supabase PostgreSQL Variables

If you have a Supabase project created:

| Variable Name | Description |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[PROJECT-REF].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key (from Project Settings -> API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (from Project Settings -> API) |

> **Note**: To create the Supabase tables, run the SQL script found in [`supabase/schema.sql`](./supabase/schema.sql) in the **Supabase SQL Editor**.

---

## 4. Deploying to Vercel (Step-by-Step)

### Step 1: Push latest commits to GitHub
```bash
git push origin main
```

### Step 2: Import Project in Vercel
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Select your repository: `GAME-DISCOUNT-TRACKER-`.
4. Leave Framework Preset as **Next.js**.

### Step 3: Add Environment Variables
Before clicking Deploy, expand **Environment Variables** and add:
- `CRON_SECRET`
- `ADMIN_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL`
- (Optional) `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`

### Step 4: Click Deploy
Vercel will build the Next.js application and automatically parse `vercel.json` to register the 6 Cron Jobs.

---

## 5. How to Verify Production Cron Execution

1. In the Vercel Dashboard, go to your project.
2. Click on the **Settings** tab -> **Cron Jobs** in the left menu.
3. You will see all 6 cron jobs listed with their schedules and status.
4. You can click **Run Now** directly in Vercel to test-fire any cron endpoint.
5. In your web application, navigate to `/admin` to view the live execution logs, daily audit reports, and store synchronization health!
