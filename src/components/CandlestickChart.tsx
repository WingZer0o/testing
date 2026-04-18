'use client';

import { useEffect, useRef } from 'react';
import {
  Chart,
  TimeScale,
  LinearScale,
  Tooltip,
  Legend,
  BarController,
  BarElement,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { OHLCVData } from '@/types/stock';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let registered = false;
async function registerFinancial() {
  if (registered) return;
  registered = true;
  const { CandlestickController, CandlestickElement, OhlcController, OhlcElement } =
    await import('chartjs-chart-financial');
  Chart.register(
    TimeScale,
    LinearScale,
    Tooltip,
    Legend,
    BarController,
    BarElement,
    CandlestickController,
    CandlestickElement,
    OhlcController,
    OhlcElement
  );
}

interface CandlestickChartProps {
  data: OHLCVData[];
  symbol: string;
}

function formatVolLabel(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
}

export default function CandlestickChart({ data, symbol }: CandlestickChartProps) {
  const priceCanvasRef = useRef<HTMLCanvasElement>(null);
  const volumeCanvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const priceChartRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeChartRef = useRef<any>(null);

  useEffect(() => {
    if (!priceCanvasRef.current || !volumeCanvasRef.current || data.length === 0) return;

    let cancelled = false;

    registerFinancial().then(() => {
      if (cancelled) return;
      if (!priceCanvasRef.current || !volumeCanvasRef.current) return;

      priceChartRef.current?.destroy();
      volumeChartRef.current?.destroy();

      const candleData = data.map((d) => ({
        x: new Date(d.date).getTime(),
        o: d.open,
        h: d.high,
        l: d.low,
        c: d.close,
      }));

      const volumeData = data.map((d) => ({
        x: new Date(d.date).getTime(),
        y: d.volume,
      }));

      const volumeColors = data.map((d) =>
        d.close >= d.open ? 'rgba(0, 212, 170, 0.55)' : 'rgba(255, 77, 109, 0.55)'
      );

      const timeUnit =
        data.length <= 5 ? 'day' : data.length <= 30 ? 'week' : 'month';

      const sharedTooltipStyle = {
        backgroundColor: '#13131a',
        borderColor: '#2e2e4e',
        borderWidth: 1,
        titleColor: '#e8e8f0',
        bodyColor: '#8888aa',
        padding: 10,
        cornerRadius: 8,
      };

      // Price chart (candlestick)
      priceChartRef.current = new Chart(priceCanvasRef.current!, {
        type: 'candlestick',
        data: {
          datasets: [
            {
              label: symbol,
              data: candleData,
              color: {
                up: '#00d4aa',
                down: '#ff4d6d',
                unchanged: '#8888aa',
              },
            } as never,
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              ...sharedTooltipStyle,
              callbacks: {
                // @ts-ignore – raw is OHLC point
                label: (ctx) => {
                  const p = ctx.raw as { o: number; h: number; l: number; c: number };
                  return [
                    `Open:  $${p.o.toFixed(2)}`,
                    `High:  $${p.h.toFixed(2)}`,
                    `Low:   $${p.l.toFixed(2)}`,
                    `Close: $${p.c.toFixed(2)}`,
                  ];
                },
              },
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: timeUnit,
                displayFormats: { day: 'MMM d', week: 'MMM d', month: 'MMM yy' },
              },
              display: false,
              grid: { color: 'rgba(255,255,255,0.03)' },
              ticks: { color: '#8888aa', maxTicksLimit: 8 },
            },
            y: {
              position: 'right',
              grid: { color: 'rgba(255,255,255,0.04)' },
              ticks: {
                color: '#8888aa',
                // @ts-ignore – value typing
                callback: (v) => `$${Number(v).toFixed(2)}`,
                maxTicksLimit: 6,
              },
            },
          },
        },
      });

      // Volume chart (bar)
      volumeChartRef.current = new Chart(volumeCanvasRef.current!, {
        type: 'bar',
        data: {
          datasets: [
            {
              label: 'Volume',
              data: volumeData,
              backgroundColor: volumeColors,
              borderWidth: 0,
              borderRadius: 1,
              barPercentage: 0.85,
              categoryPercentage: 0.9,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              ...sharedTooltipStyle,
              callbacks: {
                label: (ctx) => `Vol: ${formatVolLabel(ctx.parsed.y ?? 0)}`,
              },
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: timeUnit,
                displayFormats: { day: 'MMM d', week: 'MMM d', month: 'MMM yy' },
              },
              grid: { color: 'rgba(255,255,255,0.03)' },
              ticks: { color: '#8888aa', maxTicksLimit: 8, maxRotation: 0 },
            },
            y: {
              position: 'right',
              grid: { color: 'rgba(255,255,255,0.03)' },
              ticks: {
                color: '#8888aa',
                // @ts-ignore – value typing
                callback: (v) => formatVolLabel(Number(v)),
                maxTicksLimit: 3,
              },
            },
          },
        },
      });
    });

    return () => {
      cancelled = true;
      priceChartRef.current?.destroy();
      volumeChartRef.current?.destroy();
    };
  }, [data, symbol]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#44445a] text-sm">
        No chart data available
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-1">
      <div className="flex-1 min-h-0">
        <canvas ref={priceCanvasRef} />
      </div>
      <div className="h-16 shrink-0">
        <canvas ref={volumeCanvasRef} />
      </div>
    </div>
  );
}
