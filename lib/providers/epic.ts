import { ProviderFetchResult, ProviderGameResult } from './types';
import { generateSlug, validateAndCalculateDeal } from '../engine/validation';

export interface EpicFetchOptions {
  countryCode?: string;
  limit?: number;
}

export function formatEpicStoreUrl(el: any): string {
  const isHexHash = (s: string) => /^[a-f0-9]{24,36}$/i.test(s || '');

  let slug: string | null = null;

  // 1. Try offerMappings pageSlug (e.g. firestone-online-idle-rpg-bfd04b)
  if (el.offerMappings && Array.isArray(el.offerMappings)) {
    for (const m of el.offerMappings) {
      if (m.pageSlug && !isHexHash(m.pageSlug)) {
        slug = m.pageSlug;
        break;
      }
    }
  }

  // 2. Try catalogNs mappings pageSlug
  if (!slug && el.catalogNs?.mappings && Array.isArray(el.catalogNs.mappings)) {
    for (const m of el.catalogNs.mappings) {
      if (m.pageSlug && !isHexHash(m.pageSlug)) {
        slug = m.pageSlug;
        break;
      }
    }
  }

  // 3. Try productSlug (e.g. ghostrunner-2)
  if (!slug && el.productSlug && !isHexHash(el.productSlug)) {
    slug = el.productSlug;
  }

  // 4. Try urlSlug
  if (!slug && el.urlSlug && !isHexHash(el.urlSlug)) {
    slug = el.urlSlug;
  }

  if (slug) {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '').replace(/\/home$/i, '');
    return `https://store.epicgames.com/p/${cleanSlug}`;
  }

  // 5. Guaranteed fallback: Search on Epic Games Store (never 404s)
  return `https://store.epicgames.com/browse?q=${encodeURIComponent(el.title)}`;
}

export async function fetchEpicDeals(options: EpicFetchOptions = {}): Promise<ProviderFetchResult> {
  const { countryCode = 'IN', limit = 40 } = options;
  const errors: string[] = [];
  const games: ProviderGameResult[] = [];
  const seenIds = new Set<string>();

  // 1. Fetch official Epic Games Store promotions (Free games & highlighted discounts)
  try {
    const promoUrl = `https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=${countryCode}&allowCountries=${countryCode}`;
    const res = await fetch(promoUrl, {
      headers: {
        'User-Agent': 'GameDiscountTracker/1.0',
        'Accept': 'application/json',
      },
      next: { revalidate: 1800 },
    });

    if (res.ok) {
      const data = await res.json();
      const elements = data?.data?.Catalog?.searchStore?.elements || [];

      for (const el of elements) {
        if (!el || !el.id || seenIds.has(el.id)) continue;
        seenIds.add(el.id);

        const title = el.title;
        const externalId = el.id;
        const description = el.description || `${title} on Epic Games Store`;

        // Pricing
        const totalPrice = el.price?.totalPrice;
        const currency = totalPrice?.currencyCode || (countryCode.toUpperCase() === 'IN' ? 'INR' : 'USD');
        const originalPrice = (totalPrice?.originalPrice || 0) / 100;
        let currentPrice = (totalPrice?.discountPrice || 0) / 100;

        // Check promotions
        let promotionStart: string | null = null;
        let promotionEnd: string | null = null;
        let isPromotionalFree = false;

        const currentPromos = el.promotions?.promotionalOffers?.[0]?.promotionalOffers || [];
        const upcomingPromos = el.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers || [];

        if (currentPromos.length > 0) {
          const promo = currentPromos[0];
          promotionStart = promo.startDate || null;
          promotionEnd = promo.endDate || null;
          if (promo.discountSetting?.discountPercentage === 0 && currentPrice === 0) {
            isPromotionalFree = true;
          }
        } else if (upcomingPromos.length > 0) {
          const promo = upcomingPromos[0];
          promotionStart = promo.startDate || null;
          promotionEnd = promo.endDate || null;
        }

        // Store URL using robust resolver
        const storeUrl = formatEpicStoreUrl(el);

        // Artwork
        const keyImages = el.keyImages || [];
        const wideImg = keyImages.find((img: any) => img.type === 'OfferImageWide' || img.type === 'DieselStoreFrontWide');
        const tallImg = keyImages.find((img: any) => img.type === 'OfferImageTall' || img.type === 'DieselGameBoxTall');
        const thumbImg = keyImages.find((img: any) => img.type === 'Thumbnail');
        const artworkUrl = wideImg?.url || tallImg?.url || thumbImg?.url || (keyImages[0]?.url ?? '');

        // Categories / Tags as genres
        const genres: string[] = [];
        if (el.categories && Array.isArray(el.categories)) {
          for (const c of el.categories) {
            const p = c.path?.split('/').pop();
            if (p && p !== 'games' && p !== 'applications') {
              genres.push(p.charAt(0).toUpperCase() + p.slice(1));
            }
          }
        }
        if (genres.length === 0) genres.push('Adventure');

        const validated = validateAndCalculateDeal({
          externalGameId: externalId,
          platform: 'EPIC',
          title,
          originalPrice,
          currentPrice,
          currency,
          promotionStart,
          promotionEnd,
          storeUrl,
          isPromotionalFree,
          isPermanentlyFree: originalPrice === 0 && !promotionEnd,
        });

        if (validated.isValid) {
          games.push({
            externalId,
            platform: 'EPIC',
            title,
            slug: generateSlug(title, externalId),
            description,
            developer: el.seller?.name || 'Epic Partner Studio',
            publisher: el.seller?.name || 'Epic Games',
            genre: genres,
            artworkUrl,
            bannerUrl: wideImg?.url || artworkUrl,
            storeUrl,
            releaseDate: el.effectiveDate || null,
            currency,
            originalPrice: validated.originalPrice,
            currentPrice: validated.currentPrice,
            discountPercentage: validated.discountPercentage,
            savingsAmount: validated.savingsAmount,
            promotionStart,
            promotionEnd,
            isPromotionalFree,
            status: validated.status,
            source: 'EPIC_STORE',
          });
        }
      }
    }
  } catch (err: any) {
    errors.push(`Epic official promo fetch error: ${err.message || String(err)}`);
  }

  // 2. Fetch catalog deals from EGData provider adapter
  try {
    const egRes = await fetch(`https://api.egdata.app/offers?limit=30&country=${countryCode}`, {
      headers: {
        'User-Agent': 'GameDiscountTracker/1.0',
        'Accept': 'application/json',
      },
    });

    if (egRes.ok) {
      const egData = await egRes.json();
      const elements = egData.elements || [];

      for (const el of elements) {
        if (!el || !el.id || seenIds.has(el.id)) continue;
        if (games.length >= limit) break;
        seenIds.add(el.id);

        const title = el.title;
        const externalId = el.id;
        const description = el.description || `${title} on Epic Games Store`;

        const priceObj = el.price?.price;
        if (!priceObj) continue;

        const currency = priceObj.currencyCode || (countryCode.toUpperCase() === 'IN' ? 'INR' : 'USD');
        const originalPrice = (priceObj.originalPrice || 0) / 100;
        const currentPrice = (priceObj.discountPrice || 0) / 100;

        // Store URL using robust resolver
        const storeUrl = formatEpicStoreUrl(el);

        const keyImages = el.keyImages || [];
        const wideImg = keyImages.find((img: any) => img.type === 'OfferImageWide' || img.type === 'featuredMedia');
        const tallImg = keyImages.find((img: any) => img.type === 'OfferImageTall' || img.type === 'DieselGameBoxTall');
        const thumbImg = keyImages.find((img: any) => img.type === 'Thumbnail');
        const artworkUrl = wideImg?.url || tallImg?.url || thumbImg?.url || (keyImages[0]?.url ?? '');

        const tags = (el.tags || []).map((t: any) => t.name).filter((n: string) => n && !n.includes(' '));
        const genres = tags.length > 0 ? tags.slice(0, 3) : ['Action', 'Indie'];

        const validated = validateAndCalculateDeal({
          externalGameId: externalId,
          platform: 'EPIC',
          title,
          originalPrice,
          currentPrice,
          currency,
          storeUrl,
        });

        if (validated.isValid) {
          games.push({
            externalId,
            platform: 'EPIC',
            title,
            slug: generateSlug(title, externalId),
            description,
            developer: el.developerDisplayName || el.seller?.name || 'Epic Partner',
            publisher: el.publisherDisplayName || el.seller?.name || 'Epic Games',
            genre: genres,
            artworkUrl,
            bannerUrl: wideImg?.url || artworkUrl,
            storeUrl,
            releaseDate: el.releaseDate || el.pcReleaseDate || null,
            currency,
            originalPrice: validated.originalPrice,
            currentPrice: validated.currentPrice,
            discountPercentage: validated.discountPercentage,
            savingsAmount: validated.savingsAmount,
            status: validated.status,
            source: 'EGDATA',
          });
        }
      }
    }
  } catch (err: any) {
    errors.push(`EGData fetch error: ${err.message || String(err)}`);
  }

  return {
    success: games.length > 0,
    provider: 'EPIC',
    games,
    totalFetched: games.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}
