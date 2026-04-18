'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faArrowUp,
  faArrowDown,
  faRotateLeft,
  faChartBar,
  faBuildingColumns,
  faPercent,
  faDollarSign,
  faTrophy,
  faExclamationTriangle,
  faLeaf,
  faWaveSquare,
} from '@fortawesome/free-solid-svg-icons';
import { StockQuote, CompanyOverview } from '@/types/stock';
import { formatCurrency, formatLargeNumber, formatVolume, formatDecimal } from '@/lib/format';

interface MetricCardProps {
  icon: React.ComponentProps<typeof FontAwesomeIcon>['icon'];
  label: string;
  value: string;
  subValue?: string;
  accent?: 'green' | 'red' | 'blue' | 'default';
}

function MetricCard({ icon, label, value, subValue, accent = 'default' }: MetricCardProps) {
  const accentColors = {
    green: 'text-[#00d4aa]',
    red: 'text-[#ff4d6d]',
    blue: 'text-[#4d9eff]',
    default: 'text-[#8888aa]',
  };

  return (
    <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4 hover:border-[#2e2e4e] transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <FontAwesomeIcon icon={icon} className={`text-xs ${accentColors[accent]}`} />
        <span className="text-[10px] font-semibold tracking-widest text-[#44445a] uppercase">{label}</span>
      </div>
      <p className="text-[#e8e8f0] font-semibold font-mono text-base">{value}</p>
      {subValue && <p className="text-[#44445a] text-xs mt-0.5">{subValue}</p>}
    </div>
  );
}

interface MetricsCardsProps {
  quote: StockQuote;
  overview: CompanyOverview | null;
}

export default function MetricsCards({ quote, overview }: MetricsCardsProps) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold tracking-widest text-[#44445a] uppercase px-1">Key Metrics</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={faPlay}
          label="Open"
          value={formatCurrency(quote.open)}
          accent="blue"
        />
        <MetricCard
          icon={faArrowUp}
          label="Day High"
          value={formatCurrency(quote.high)}
          accent="green"
        />
        <MetricCard
          icon={faArrowDown}
          label="Day Low"
          value={formatCurrency(quote.low)}
          accent="red"
        />
        <MetricCard
          icon={faRotateLeft}
          label="Prev Close"
          value={formatCurrency(quote.previousClose)}
        />
        <MetricCard
          icon={faChartBar}
          label="Volume"
          value={formatVolume(quote.volume)}
          accent="blue"
        />
        <MetricCard
          icon={faBuildingColumns}
          label="Market Cap"
          value={overview ? formatLargeNumber(overview.marketCapitalization) : 'N/A'}
        />
        <MetricCard
          icon={faPercent}
          label="P/E Ratio"
          value={overview ? formatDecimal(overview.peRatio) : 'N/A'}
        />
        <MetricCard
          icon={faDollarSign}
          label="EPS"
          value={overview ? formatCurrency(overview.eps) : 'N/A'}
        />
        <MetricCard
          icon={faTrophy}
          label="52W High"
          value={overview ? formatCurrency(overview.fiftyTwoWeekHigh) : 'N/A'}
          accent="green"
        />
        <MetricCard
          icon={faExclamationTriangle}
          label="52W Low"
          value={overview ? formatCurrency(overview.fiftyTwoWeekLow) : 'N/A'}
          accent="red"
        />
        <MetricCard
          icon={faLeaf}
          label="Div. Yield"
          value={
            overview && overview.dividendYield > 0
              ? `${(overview.dividendYield * 100).toFixed(2)}%`
              : 'N/A'
          }
          accent="green"
        />
        <MetricCard
          icon={faWaveSquare}
          label="Beta"
          value={overview ? formatDecimal(overview.beta) : 'N/A'}
          subValue="Market sensitivity"
        />
      </div>
    </div>
  );
}
