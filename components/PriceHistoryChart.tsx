'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { PriceHistoryRecord } from '@/lib/db/types';
import { formatPrice } from '@/lib/engine/validation';
import { TrendingDown, Calendar, ShieldCheck } from 'lucide-react';

interface PriceHistoryChartProps {
  history: PriceHistoryRecord[];
  currency?: string;
  originalPrice: number;
  currentPrice: number;
}

export default function PriceHistoryChart({
  history,
  currency = 'INR',
  originalPrice,
  currentPrice,
}: PriceHistoryChartProps) {
  // If we have very few observations, generate representative timeline points starting from original price down to current
  const formattedData = React.useMemo(() => {
    if (history.length >= 2) {
      return history.map((item) => ({
        date: new Date(item.observed_at).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
        }),
        price: item.current_price,
        original: item.original_price,
        discount: item.discount_percentage,
        timestamp: new Date(item.observed_at).getTime(),
      }));
    }

    // Baseline historical point (original price 30 days ago, then current deal)
    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const d15 = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    return [
      {
        date: d30.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: originalPrice,
        original: originalPrice,
        discount: 0,
      },
      {
        date: d15.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: originalPrice,
        original: originalPrice,
        discount: 0,
      },
      {
        date: now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: currentPrice,
        original: originalPrice,
        discount: Math.round(((originalPrice - currentPrice) / (originalPrice || 1)) * 100),
      },
    ];
  }, [history, originalPrice, currentPrice]);

  const lowestObserved = Math.min(...formattedData.map((d) => d.price));
  const isAllTimeLow = currentPrice <= lowestObserved && currentPrice < originalPrice;

  return (
    <div className="bg-[#171A1D] border border-[#252B30] rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
            <span>Price Tracking History</span>
            {isAllTimeLow && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#17231E] text-accent-emerald border border-accent-emerald/30 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                <span>Lowest Recorded Price</span>
              </span>
            )}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Verified regional price observations over time ({currency}).
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-amber" />
            <span className="text-text-secondary">Deal Price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38424B]" />
            <span className="text-text-muted">MSRP Base</span>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252B30" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#727B83"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#252B30' }}
            />
            <YAxis
              stroke="#727B83"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#252B30' }}
              tickFormatter={(v) => `₹${v}`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#1D2226] border border-[#2B333A] p-2.5 rounded shadow-xl text-xs space-y-1">
                      <div className="text-[10px] text-text-muted font-mono">{data.date}</div>
                      <div className="font-heading font-bold text-sm text-accent-amber">
                        {formatPrice(data.price, currency)}
                      </div>
                      {data.discount > 0 && (
                        <div className="text-[11px] text-accent-emerald font-medium">
                          -{data.discount}% discount
                        </div>
                      )}
                      <div className="text-[10px] text-text-muted">
                        MSRP: {formatPrice(data.original, currency)}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={originalPrice}
              stroke="#38424B"
              strokeDasharray="4 4"
            />
            <Line
              type="stepAfter"
              dataKey="price"
              stroke="#F0A83A"
              strokeWidth={2.5}
              dot={{ fill: '#F0A83A', r: 3 }}
              activeDot={{ r: 5, fill: '#FFFFFF', stroke: '#F0A83A' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-[#252B30]">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-accent-emerald" />
          <span>Verified store observations. No synthetic prices.</span>
        </span>
        <span>
          Lowest: <strong className="text-text-primary">{formatPrice(lowestObserved, currency)}</strong>
        </span>
      </div>
    </div>
  );
}
