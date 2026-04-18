import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 60 * 60 * 1000;

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < TTL) return entry.data;
  return null;
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol');
  if (!symbol) return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });

  const key = `overview_${symbol.toUpperCase()}`;
  const cached = getCached(key);
  if (cached) return NextResponse.json(cached);

  try {
    const res = await fetch(
      `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`,
      { cache: 'no-store' }
    );
    const data = await res.json();

    if (data['Note'] || data['Information']) {
      return NextResponse.json({ error: 'API rate limit exceeded.' }, { status: 429 });
    }

    if (!data['Symbol']) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const result = {
      symbol: data['Symbol'],
      name: data['Name'],
      description: data['Description'],
      exchange: data['Exchange'],
      currency: data['Currency'],
      country: data['Country'],
      sector: data['Sector'],
      industry: data['Industry'],
      marketCapitalization: parseFloat(data['MarketCapitalization']) || 0,
      peRatio: parseFloat(data['PERatio']) || 0,
      eps: parseFloat(data['EPS']) || 0,
      dividendYield: parseFloat(data['DividendYield']) || 0,
      fiftyTwoWeekHigh: parseFloat(data['52WeekHigh']) || 0,
      fiftyTwoWeekLow: parseFloat(data['52WeekLow']) || 0,
      beta: parseFloat(data['Beta']) || 0,
    };

    cache.set(key, { data: result, ts: Date.now() });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 });
  }
}
