import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 5 * 60 * 1000;

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < TTL) return entry.data;
  return null;
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol');
  if (!symbol) return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });

  const key = `quote_${symbol.toUpperCase()}`;
  const cached = getCached(key);
  if (cached) return NextResponse.json(cached);

  try {
    const res = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`,
      { cache: 'no-store' }
    );
    const data = await res.json();

    if (data['Note'] || data['Information']) {
      return NextResponse.json({ error: 'API rate limit exceeded. Please wait before retrying.' }, { status: 429 });
    }

    const q = data['Global Quote'];
    if (!q || !q['01. symbol']) {
      return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
    }

    const result = {
      symbol: q['01. symbol'],
      open: parseFloat(q['02. open']),
      high: parseFloat(q['03. high']),
      low: parseFloat(q['04. low']),
      price: parseFloat(q['05. price']),
      volume: parseInt(q['06. volume']),
      latestTradingDay: q['07. latest trading day'],
      previousClose: parseFloat(q['08. previous close']),
      change: parseFloat(q['09. change']),
      changePercent: q['10. change percent'],
    };

    cache.set(key, { data: result, ts: Date.now() });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}
