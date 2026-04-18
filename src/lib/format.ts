export function formatCurrency(v: number | null | undefined): string {
  if (v == null || isNaN(v) || v === 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

export function formatLargeNumber(v: number | null | undefined): string {
  if (v == null || isNaN(v) || v === 0) return 'N/A';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v.toFixed(2)}`;
}

export function formatVolume(v: number | null | undefined): string {
  if (v == null || isNaN(v) || v === 0) return 'N/A';
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toString();
}

export function formatPercent(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return 'N/A';
  return `${(v * 100).toFixed(2)}%`;
}

export function formatDecimal(v: number | null | undefined, decimals = 2): string {
  if (v == null || isNaN(v) || v === 0) return 'N/A';
  return v.toFixed(decimals);
}
