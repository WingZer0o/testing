import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL_COMPACT = 5 * 60 * 1000;
const TTL_FULL = 60 * 60 * 1000;

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < (key.includes('full') ? TTL_FULL : TTL_COMPACT)) {
    return entry.data;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol');
  const outputsize = request.nextUrl.searchParams.get('outputsize') || 'compact';

  if (!symbol) return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });

  const key = `history_${symbol.toUpperCase()}_${outputsize}`;
  const cached = getCached(key);
  if (cached) return NextResponse.json(cached);

  try {
    const res = await fetch(
      `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputsize}&apikey=${API_KEY}`,
      { cache: 'no-store' }
    );
    const data = await res.json();

    if (data['Note'] || data['Information']) {
      return NextResponse.json({ error: 'API rate limit exceeded. Please wait before retrying.' }, { status: 429 });
    }

    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      return NextResponse.json({ error: 'No historical data found' }, { status: 404 });
    }

    const result = Object.entries(timeSeries)
      .map(([date, values]) => {
        const v = values as Record<string, string>;
        return {
          date,
          open: parseFloat(v['1. open']),
          high: parseFloat(v['2. high']),
          low: parseFloat(v['3. low']),
          close: parseFloat(v['4. close']),
          volume: parseInt(v['5. volume']),
        };
      })
      .reverse();

    cache.set(key, { data: result, ts: Date.now() });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
