'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSync,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/SearchBar';
import Watchlist from '@/components/Watchlist';
import StockHeader from '@/components/StockHeader';
import MetricsCards from '@/components/MetricsCards';
import TimeframeSelector from '@/components/TimeframeSelector';
import {
  StockQuote,
  OHLCVData,
  CompanyOverview,
  WatchlistItem,
  SearchResult,
  Timeframe,
  TIMEFRAME_TRADING_DAYS,
} from '@/types/stock';

const CandlestickChart = dynamic(() => import('@/components/CandlestickChart'), { ssr: false });

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
];

function SkeletonCard() {
  return <div className="h-24 bg-[#13131a] rounded-xl border border-[#1e1e2e] animate-pulse" />;
}

function SkeletonHeader() {
  return (
    <div className="bg-[#13131a] rounded-xl border border-[#1e1e2e] p-5 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-7 w-24 bg-[#1a1a24] rounded" />
          <div className="h-4 w-40 bg-[#1a1a24] rounded" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-10 w-32 bg-[#1a1a24] rounded ml-auto" />
          <div className="h-6 w-28 bg-[#1a1a24] rounded ml-auto" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(DEFAULT_WATCHLIST);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<OHLCVData[]>([]);
  const [fullHistory, setFullHistory] = useState<OHLCVData[]>([]);
  const [hasFullData, setHasFullData] = useState(false);
  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('3M');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist watchlist in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fv_watchlist');
      if (saved) setWatchlist(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('fv_watchlist', JSON.stringify(watchlist));
    } catch {}
  }, [watchlist]);

  const fetchStockData = useCallback(async (symbol: string) => {
    setLoading(true);
    setError(null);
    setQuote(null);
    setOverview(null);
    setHistory([]);
    setFullHistory([]);
    setHasFullData(false);

    try {
      const [quoteRes, historyRes, overviewRes] = await Promise.all([
        fetch(`/api/quote?symbol=${symbol}`),
        fetch(`/api/history?symbol=${symbol}&outputsize=compact`),
        fetch(`/api/overview?symbol=${symbol}`),
      ]);

      const [quoteData, historyData, overviewData] = await Promise.all([
        quoteRes.json(),
        historyRes.json(),
        overviewRes.json(),
      ]);

      if (quoteData.error) throw new Error(quoteData.error);
      if (historyData.error) throw new Error(historyData.error);

      setQuote(quoteData);
      setHistory(historyData);
      if (!overviewData.error) setOverview(overviewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockData(selectedSymbol);
  }, [selectedSymbol, fetchStockData]);

  const handleTimeframeChange = async (tf: Timeframe) => {
    setTimeframe(tf);
    if ((tf === '6M' || tf === '1Y') && !hasFullData) {
      setChartLoading(true);
      try {
        const res = await fetch(`/api/history?symbol=${selectedSymbol}&outputsize=full`);
        const data = await res.json();
        if (!data.error) {
          setFullHistory(data);
          setHasFullData(true);
        }
      } catch {}
      setChartLoading(false);
    }
  };

  const handleSelectSymbol = (result: SearchResult) => {
    setSelectedSymbol(result.symbol);
    if (!watchlist.find((w) => w.symbol === result.symbol)) {
      setWatchlist((prev) => [...prev, { symbol: result.symbol, name: result.name }]);
    }
  };

  const filteredHistory = (() => {
    const days = TIMEFRAME_TRADING_DAYS[timeframe];
    const source = hasFullData && (timeframe === '6M' || timeframe === '1Y') ? fullHistory : history;
    return source.slice(-days);
  })();

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-[#e8e8f0] overflow-hidden">
      <Watchlist
        items={watchlist}
        selectedSymbol={selectedSymbol}
        quote={quote}
        onSelect={setSelectedSymbol}
        onRemove={(sym) => setWatchlist((prev) => prev.filter((w) => w.symbol !== sym))}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-3 border-b border-[#1e1e2e] bg-[#0d0d14] shrink-0">
          <div className="flex-1 max-w-md">
            <SearchBar onSelect={handleSelectSymbol} />
          </div>
          <button
            onClick={() => fetchStockData(selectedSymbol)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs text-[#8888aa] hover:text-[#e8e8f0] bg-[#1a1a24] hover:bg-[#1e1e2e] rounded-lg border border-[#1e1e2e] transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <FontAwesomeIcon icon={faSync} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <div className="text-xs text-[#44445a] hidden sm:block">
            {selectedSymbol} · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {error ? (
            <div className="flex items-start gap-3 text-[#ff4d6d] bg-[#ff4d6d]/10 border border-[#ff4d6d]/20 rounded-xl p-4">
              <FontAwesomeIcon icon={faExclamationCircle} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Error loading {selectedSymbol}</p>
                <p className="text-sm mt-1 text-[#ff4d6d]/80">{error}</p>
              </div>
            </div>
          ) : loading ? (
            <>
              <SkeletonHeader />
              <div className="bg-[#13131a] rounded-xl border border-[#1e1e2e] p-4 animate-pulse">
                <div className="h-96 bg-[#1a1a24] rounded-lg" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </>
          ) : quote ? (
            <>
              <StockHeader quote={quote} overview={overview} />

              <div className="bg-[#13131a] rounded-xl border border-[#1e1e2e] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold tracking-widest text-[#44445a] uppercase">
                    Price · Volume Chart
                  </p>
                  <TimeframeSelector timeframe={timeframe} onChange={handleTimeframeChange} />
                </div>
                <div className="h-96">
                  {chartLoading ? (
                    <div className="flex items-center justify-center h-full text-[#8888aa] text-sm gap-2">
                      <FontAwesomeIcon icon={faSync} className="animate-spin" />
                      Loading extended history…
                    </div>
                  ) : (
                    <CandlestickChart data={filteredHistory} symbol={selectedSymbol} />
                  )}
                </div>
              </div>

              <MetricsCards quote={quote} overview={overview} />

              {overview?.description && overview.description !== 'None' && (
                <div className="bg-[#13131a] rounded-xl border border-[#1e1e2e] p-5">
                  <p className="text-[10px] font-semibold tracking-widest text-[#44445a] uppercase mb-3">
                    About {overview.name}
                  </p>
                  <p className="text-[#8888aa] text-sm leading-relaxed line-clamp-4">
                    {overview.description}
                  </p>
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
