'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faMinus } from '@fortawesome/free-solid-svg-icons';
import { StockQuote, CompanyOverview } from '@/types/stock';

interface StockHeaderProps {
  quote: StockQuote;
  overview: CompanyOverview | null;
}

export default function StockHeader({ quote, overview }: StockHeaderProps) {
  const changeNum = quote.change;
  const isPositive = changeNum > 0;
  const isNeutral = changeNum === 0;
  const changePercent = quote.changePercent.replace('%', '');

  const colorClass = isNeutral
    ? 'text-[#8888aa]'
    : isPositive
    ? 'text-[#00d4aa]'
    : 'text-[#ff4d6d]';

  const bgClass = isNeutral
    ? 'bg-[#8888aa]/10 border-[#8888aa]/20'
    : isPositive
    ? 'bg-[#00d4aa]/10 border-[#00d4aa]/20'
    : 'bg-[#ff4d6d]/10 border-[#ff4d6d]/20';

  const icon = isNeutral ? faMinus : isPositive ? faArrowUp : faArrowDown;

  return (
    <div className="bg-[#13131a] rounded-xl border border-[#1e1e2e] p-5">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold font-mono text-[#e8e8f0]">{quote.symbol}</h1>
            {overview && (
              <>
                <span className="text-[#44445a] text-sm bg-[#1a1a24] px-2 py-0.5 rounded">
                  {overview.exchange}
                </span>
                {overview.sector && overview.sector !== 'None' && (
                  <span className="text-[#44445a] text-sm bg-[#1a1a24] px-2 py-0.5 rounded">
                    {overview.sector}
                  </span>
                )}
              </>
            )}
          </div>
          <p className="text-[#8888aa] text-sm">
            {overview?.name ?? quote.symbol} · {quote.latestTradingDay}
          </p>
          {overview?.industry && overview.industry !== 'None' && (
            <p className="text-[#44445a] text-xs mt-0.5">{overview.industry}</p>
          )}
        </div>

        <div className="text-right">
          <div className="text-4xl font-bold font-mono text-[#e8e8f0] mb-1">
            ${quote.price.toFixed(2)}
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold font-mono ${colorClass} ${bgClass}`}>
            <FontAwesomeIcon icon={icon} className="text-xs" />
            <span>{isPositive ? '+' : ''}{changeNum.toFixed(2)}</span>
            <span>({isPositive ? '+' : ''}{changePercent}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
