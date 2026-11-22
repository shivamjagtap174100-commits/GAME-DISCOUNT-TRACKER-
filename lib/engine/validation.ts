import { DealStatus } from '../db/types';

export interface RawDealInput {
  externalGameId: string;
  platform: 'STEAM' | 'EPIC';
  title: string;
  originalPrice: number;
  currentPrice: number;
  currency: string;
  promotionStart?: string | null;
  promotionEnd?: string | null;
  storeUrl: string;
  isPromotionalFree?: boolean;
  isPermanentlyFree?: boolean;
}

export interface ValidatedDealCalculation {
  isValid: boolean;
  error?: string;
  originalPrice: number;
  currentPrice: number;
  discountPercentage: number;
  savingsAmount: number;
  status: DealStatus;
}

/**
 * Phase 5 Data Accuracy Engine - Validation and Calculation rules
 */
export function validateAndCalculateDeal(input: RawDealInput): ValidatedDealCalculation {
  // Validate game identifier
  if (!input.externalGameId || typeof input.externalGameId !== 'string' || input.externalGameId.trim() === '') {
    return { isValid: false, error: 'Invalid or missing external game identifier', originalPrice: 0, currentPrice: 0, discountPercentage: 0, savingsAmount: 0, status: 'UNAVAILABLE' };
  }

  // Validate platform
  if (input.platform !== 'STEAM' && input.platform !== 'EPIC') {
    return { isValid: false, error: `Invalid platform: ${input.platform}`, originalPrice: 0, currentPrice: 0, discountPercentage: 0, savingsAmount: 0, status: 'UNAVAILABLE' };
  }

  // Validate currency
  if (!input.currency || typeof input.currency !== 'string') {
    return { isValid: false, error: 'Missing currency code', originalPrice: 0, currentPrice: 0, discountPercentage: 0, savingsAmount: 0, status: 'UNAVAILABLE' };
  }

  // Validate store URL
  if (!input.storeUrl || !input.storeUrl.startsWith('http')) {
    return { isValid: false, error: 'Malformed or missing store URL', originalPrice: 0, currentPrice: 0, discountPercentage: 0, savingsAmount: 0, status: 'UNAVAILABLE' };
  }

  // Ensure prices are non-negative numbers
  const orig = Number(input.originalPrice);
  const curr = Number(input.currentPrice);

  if (isNaN(orig) || isNaN(curr) || orig < 0 || curr < 0) {
    return { isValid: false, error: 'Prices must be non-negative numbers', originalPrice: 0, currentPrice: 0, discountPercentage: 0, savingsAmount: 0, status: 'UNAVAILABLE' };
  }

  // Current price cannot exceed original price in normal deals
  if (curr > orig && orig > 0) {
    return { isValid: false, error: 'Current price cannot exceed original price', originalPrice: orig, currentPrice: curr, discountPercentage: 0, savingsAmount: 0, status: 'VERIFICATION_REQUIRED' };
  }

  // Calculate discount percentage
  let discountPercentage = 0;
  if (orig > 0) {
    discountPercentage = Math.round(((orig - curr) / orig) * 100);
    // Clamp to 0-100
    discountPercentage = Math.min(100, Math.max(0, discountPercentage));
  } else if (curr === 0) {
    discountPercentage = 100;
  }

  // Calculate savings amount
  const savingsAmount = Math.max(0, Math.round((orig - curr) * 100) / 100);

  // Check offer expiration
  const now = new Date();
  let status: DealStatus = 'ACTIVE';

  if (input.promotionEnd) {
    const endDate = new Date(input.promotionEnd);
    if (!isNaN(endDate.getTime()) && endDate < now) {
      status = 'EXPIRED';
    }
  }

  if (input.promotionStart && status !== 'EXPIRED') {
    const startDate = new Date(input.promotionStart);
    if (!isNaN(startDate.getTime()) && startDate > now) {
      status = 'UPCOMING';
    }
  }

  // Check free states
  if (curr === 0 && status !== 'EXPIRED' && status !== 'UPCOMING') {
    if (input.isPermanentlyFree) {
      status = 'PERMANENTLY_FREE';
    } else if (input.isPromotionalFree || orig > 0) {
      status = 'FREE_PROMOTION';
    } else {
      status = 'PERMANENTLY_FREE';
    }
  }

  return {
    isValid: true,
    originalPrice: orig,
    currentPrice: curr,
    discountPercentage,
    savingsAmount,
    status,
  };
}

/**
 * Format currency with proper Indian Rupee or international symbols
 */
export function formatPrice(amount: number, currency: string = 'INR'): string {
  if (amount === 0) {
    return 'Free';
  }

  if (currency === 'INR') {
    // Standard Indian number format (e.g. ₹2,499)
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
    return `₹${formatted}`;
  }

  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  }

  if (currency === 'EUR') {
    return `€${amount.toFixed(2)}`;
  }

  if (currency === 'GBP') {
    return `£${amount.toFixed(2)}`;
  }

  return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Create a clean URL slug from a title and ID
 */
export function generateSlug(title: string, externalId: string): string {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${cleanTitle || 'game'}-${externalId}`;
}
