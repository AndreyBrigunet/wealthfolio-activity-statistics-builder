import type { DashboardWidget, StatisticBucket } from '../../types';

export const CHART_COLORS = [
  'hsl(var(--primary))',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
];

export function chartData(buckets: StatisticBucket[]): Array<Record<string, string | number>> {
  return buckets.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    ...Object.fromEntries(
      Object.entries(bucket.values).map(([currency, value]) => [currency, Number(value)]),
    ),
  }));
}

export function resultCurrencies(buckets: StatisticBucket[]): string[] {
  return [...new Set(buckets.flatMap((bucket) => Object.keys(bucket.values)))].sort();
}

export function sortedBuckets(widget: DashboardWidget, buckets: StatisticBucket[]): StatisticBucket[] {
  return widget.formatting.sortDirection === 'descending' ? [...buckets].reverse() : buckets;
}

export function activeBucketKey(event: unknown, buckets: StatisticBucket[]): string | undefined {
  if (typeof event !== 'object' || event === null || !('activeLabel' in event)) return undefined;
  const label = Reflect.get(event, 'activeLabel');
  return typeof label === 'string' ? buckets.find((bucket) => bucket.label === label)?.key : undefined;
}
