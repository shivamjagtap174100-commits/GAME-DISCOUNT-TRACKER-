import { NextRequest, NextResponse } from 'next/server';
import { db, DealQueryFilters } from '@/lib/db';
import { ensureInitialData } from '@/lib/sync/sync-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureInitialData();

    const { searchParams } = new URL(request.url);

    const platform = (searchParams.get('platform') as any) || 'ALL';
    const search = searchParams.get('search') || undefined;
    const genre = searchParams.get('genre') || undefined;
    const minDiscountParam = searchParams.get('minDiscount');
    const maxPriceParam = searchParams.get('maxPrice');
    const minPriceParam = searchParams.get('minPrice');
    const freeOnly = searchParams.get('freeOnly') === 'true';
    const endingSoon = searchParams.get('endingSoon') === 'true';
    const status = searchParams.get('status') || undefined;
    const region = searchParams.get('region') || 'IN';
    const sortBy = (searchParams.get('sortBy') as any) || 'discount_desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);

    const filters: DealQueryFilters = {
      platform,
      search,
      genre,
      minDiscount: minDiscountParam ? parseInt(minDiscountParam, 10) : undefined,
      maxPrice: maxPriceParam ? parseFloat(maxPriceParam) : undefined,
      minPrice: minPriceParam ? parseFloat(minPriceParam) : undefined,
      freeOnly,
      endingSoon,
      status,
      region,
      sortBy,
      page,
      limit,
    };

    const result = db.getDeals(filters);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}
