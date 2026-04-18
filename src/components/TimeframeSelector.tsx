'use client';

import { Timeframe } from '@/types/stock';

interface TimeframeSelectorProps {
  timeframe: Timeframe;
  onChange: (tf: Timeframe) => void;
}

const TIMEFRAMES: Timeframe[] = ['1W', '1M', '3M', '6M', '1Y'];

export default function TimeframeSelector({ timeframe, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-[#0d0d14] rounded-lg p-1">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
            timeframe === tf
              ? 'bg-[#4d9eff] text-white shadow'
              : 'text-[#8888aa] hover:text-[#e8e8f0] hover:bg-[#1a1a24]'
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
