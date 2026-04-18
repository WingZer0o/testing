export interface StockQuote {
  symbol: string;
  open: number;
  high: number;
  low: number;
  price: number;
  volume: number;
  latestTradingDay: string;
  previousClose: number;
  change: number;
  changePercent: string;
}

export interface OHLCVData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
}

export interface CompanyOverview {
  symbol: string;
  name: string;
  description: string;
  exchange: string;
  currency: string;
  country: string;
  sector: string;
  industry: string;
  marketCapitalization: number;
  peRatio: number;
  eps: number;
  dividendYield: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  beta: number;
}

export type Timeframe = '1W' | '1M' | '3M' | '6M' | '1Y';

export const TIMEFRAME_TRADING_DAYS: Record<Timeframe, number> = {
  '1W': 5,
  '1M': 22,
  '3M': 66,
  '6M': 130,
  '1Y': 252,
};
