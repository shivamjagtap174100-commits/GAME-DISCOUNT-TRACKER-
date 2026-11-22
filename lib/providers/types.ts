import { Platform, DealStatus, DealSource } from '../db/types';

export interface ProviderGameResult {
  externalId: string;
  platform: Platform;
  title: string;
  slug: string;
  description: string;
  developer: string;
  publisher: string;
  genre: string[];
  artworkUrl: string;
  bannerUrl?: string;
  storeUrl: string;
  releaseDate: string | null;
  // Deal data
  currency: string;
  originalPrice: number;
  currentPrice: number;
  discountPercentage: number;
  savingsAmount: number;
  promotionStart?: string | null;
  promotionEnd?: string | null;
  isPromotionalFree?: boolean;
  isPermanentlyFree?: boolean;
  status: DealStatus;
  source: DealSource;
}

export interface ProviderFetchResult {
  success: boolean;
  provider: Platform;
  games: ProviderGameResult[];
  errors?: string[];
  totalFetched: number;
}
