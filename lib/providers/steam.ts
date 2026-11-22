import { ProviderFetchResult, ProviderGameResult } from './types';
import { generateSlug, validateAndCalculateDeal } from '../engine/validation';

export interface SteamFetchOptions {
  countryCode?: string;
  limit?: number;
}

export async function fetchSteamDeals(options: SteamFetchOptions = {}): Promise<ProviderFetchResult> {
  const { countryCode = 'in', limit = 40 } = options;
  const errors: string[] = [];
  const games: ProviderGameResult[] = [];
  const seenIds = new Set<string>();

  try {
    // 1. Fetch Steam Featured Categories (specials & top sellers)
    const featuredUrl = `https://store.steampowered.com/api/featuredcategories/?cc=${countryCode}&l=english`;
    const response = await fetch(featuredUrl, {
      headers: {
        'User-Agent': 'GameDiscountTracker/1.0 (Mozilla/5.0 Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
      },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error(`Steam API responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const candidateItems: any[] = [];

    if (data.specials?.items) {
      candidateItems.push(...data.specials.items);
    }
    if (data.top_sellers?.items) {
      const discountedTop = data.top_sellers.items.filter((i: any) => i.discounted);
      candidateItems.push(...discountedTop);
    }

    // Also fetch standard featured endpoint to expand pool
    try {
      const featRes = await fetch(`https://store.steampowered.com/api/featured/?cc=${countryCode}`, {
        headers: { 'User-Agent': 'GameDiscountTracker/1.0' },
      });
      if (featRes.ok) {
        const featData = await featRes.json();
        if (featData.featured_win) {
          const discounted = featData.featured_win.filter((i: any) => i.discounted);
          candidateItems.push(...discounted);
        }
      }
    } catch (e: any) {
      // Non-fatal supplementary source
    }

    // Process candidate games
    for (const item of candidateItems) {
      if (games.length >= limit) break;
      const appId = String(item.id);
      if (seenIds.has(appId)) continue;
      seenIds.add(appId);

      const title = item.name || `Steam App ${appId}`;
      const originalPrice = (item.original_price || item.final_price || 0) / 100;
      const currentPrice = (item.final_price || 0) / 100;
      const currency = item.currency || (countryCode.toUpperCase() === 'IN' ? 'INR' : 'USD');
      const storeUrl = `https://store.steampowered.com/app/${appId}/`;

      let promotionEnd: string | null = null;
      if (item.discount_expiration && typeof item.discount_expiration === 'number') {
        promotionEnd = new Date(item.discount_expiration * 1000).toISOString();
      }

      const validated = validateAndCalculateDeal({
        externalGameId: appId,
        platform: 'STEAM',
        title,
        originalPrice,
        currentPrice,
        currency,
        promotionEnd,
        storeUrl,
      });

      if (!validated.isValid) {
        continue;
      }

      // Default genre fallback based on common Steam tags
      const genres: string[] = [];
      if (item.genres && Array.isArray(item.genres)) {
        genres.push(...item.genres);
      } else {
        genres.push('Action');
      }

      const artwork = item.large_capsule_image || item.header_image || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;

      games.push({
        externalId: appId,
        platform: 'STEAM',
        title,
        slug: generateSlug(title, appId),
        description: `${title} available on Steam with verified regional pricing.`,
        developer: 'Valve / Partner Studios',
        publisher: 'Steam Publisher',
        genre: genres,
        artworkUrl: artwork,
        bannerUrl: artwork,
        storeUrl,
        releaseDate: null,
        currency,
        originalPrice: validated.originalPrice,
        currentPrice: validated.currentPrice,
        discountPercentage: validated.discountPercentage,
        savingsAmount: validated.savingsAmount,
        promotionEnd,
        status: validated.status,
        source: 'STEAM_STORE',
      });
    }

    // Enrich top 10 items with detailed app details for rich developer/publisher/genre metadata
    const enrichSubset = games.slice(0, 10);
    await Promise.allSettled(
      enrichSubset.map(async (g) => {
        try {
          const detailRes = await fetch(
            `https://store.steampowered.com/api/appdetails?appids=${g.externalId}&cc=${countryCode}`,
            { headers: { 'User-Agent': 'GameDiscountTracker/1.0' } }
          );
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            const app = detailData[g.externalId]?.data;
            if (app) {
              if (app.developers?.length) g.developer = app.developers.join(', ');
              if (app.publishers?.length) g.publisher = app.publishers.join(', ');
              if (app.short_description) g.description = app.short_description;
              if (app.genres?.length) g.genre = app.genres.map((gn: any) => gn.description);
              if (app.release_date?.date) g.releaseDate = app.release_date.date;
              if (app.header_image) g.bannerUrl = app.header_image;
            }
          }
        } catch (err) {
          // ignore appdetails enrichment error for individual game
        }
      })
    );

    return {
      success: games.length > 0,
      provider: 'STEAM',
      games,
      totalFetched: games.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    errors.push(`Steam fetch error: ${error.message || String(error)}`);
    return {
      success: false,
      provider: 'STEAM',
      games,
      totalFetched: 0,
      errors,
    };
  }
}
