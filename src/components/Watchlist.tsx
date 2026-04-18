'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faTimes,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { WatchlistItem, StockQuote } from '@/types/stock';

interface WatchlistProps {
  items: WatchlistItem[];
  selectedSymbol: string;
  quote: StockQuote | null;
  onSelect: (symbol: string) => void;
  onRemove: (symbol: string) => void;
}

export default function Watchlist({
  items,
  selectedSymbol,
  quote,
  onSelect,
  onRemove,
}: WatchlistProps) {
  const isPositive = quote && quote.change >= 0;

  return (
    <aside className="w-56 shrink-0 bg-[#0d0d14] border-r border-[#1e1e2e] flex flex-col h-full">
      <div className="px-4 py-5 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-2 text-[#4d9eff]">
          <FontAwesomeIcon icon={faChartLine} />
          <span className="font-bold tracking-widest text-sm">FINVISION</span>
        </div>
      </div>

      <div className="px-4 pt-5 pb-2">
        <p className="text-[10px] font-semibold tracking-widest text-[#44445a] uppercase">Watchlist</p>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {items.map((item) => {
          const isSelected = item.symbol === selectedSymbol;
          const showQuote = isSelected && quote;

          return (
            <div
              key={item.symbol}
              className={`group relative flex items-center justify-between px-4 py-3 cursor-pointer border-l-2 transition-all ${
                isSelected
                  ? 'bg-[#13131a] border-[#4d9eff]'
                  : 'border-transparent hover:bg-[#13131a] hover:border-[#2e2e4e]'
              }`}
              onClick={() => onSelect(item.symbol)}
            >
              <div className="flex items-center gap-2 min-w-0">
                {isSelected ? (
                  <FontAwesomeIcon
                    icon={faCircle}
                    className="text-[#4d9eff] text-[6px] shrink-0"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faCircle}
                    className="text-[#2e2e4e] text-[6px] shrink-0 group-hover:text-[#44445a]"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold font-mono text-[#e8e8f0]">{item.symbol}</p>
                  {showQuote ? (
                    <p
                      className={`text-xs font-mono ${
                        isPositive ? 'text-[#00d4aa]' : 'text-[#ff4d6d]'
                      }`}
                    >
                      ${quote.price.toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-xs text-[#44445a] truncate">{item.name.split(' ').slice(0, 2).join(' ')}</p>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.symbol);
                }}
                className="opacity-0 group-hover:opacity-100 text-[#44445a] hover:text-[#ff4d6d] transition-all shrink-0 ml-1"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="px-4 py-6 text-center text-[#44445a] text-sm">
            Search for a stock to add it here
          </div>
        )}
      </nav>

      <div className="px-4 py-3 border-t border-[#1e1e2e]">
        <p className="text-[10px] text-[#44445a] text-center">Alpha Vantage · 25 req/day</p>
      </div>
    </aside>
  );
}
