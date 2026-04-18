import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 10 * 60 * 1000;

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < TTL) return entry.data;
  return null;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query) return NextResponse.json({ error: 'Query is required' }, { status: 400 });

  const key = `search_${query.toLowerCase()}`;
  const cached = getCached(key);
  if (cached) return NextResponse.json(cached);

  try {
    const res = await fetch(
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${API_KEY}`,
      { cache: 'no-store' }
    );
    const data = await res.json();

    if (data['Note'] || data['Information']) {
      return NextResponse.json({ error: 'API rate limit exceeded.' }, { status: 429 });
    }

    const matches = data['bestMatches'] || [];
    const result = matches.slice(0, 8).map((r: Record<string, string>) => ({
      symbol: r['1. symbol'],
      name: r['2. name'],
      type: r['3. type'],
      region: r['4. region'],
      currency: r['8. currency'],
    }));

    cache.set(key, { data: result, ts: Date.now() });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
