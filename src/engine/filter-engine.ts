import type { ActivityFilters, MultiValueFilter, NormalizedActivity, PeriodDefinition } from '../types';
import { isWithinBounds, resolvePeriod } from '../utils/dates';

function matchesValue(value: string, filter: MultiValueFilter | undefined): boolean {
  if (!filter || filter.values.length === 0) return true;
  const contains = filter.values.includes(value);
  return filter.mode === 'include' ? contains : !contains;
}

function matchesInstrument(activity: NormalizedActivity, filter: MultiValueFilter | undefined): boolean {
  if (!filter || filter.values.length === 0) return true;
  const contains = filter.values.includes(activity.assetId) || filter.values.includes(activity.instrument);
  return filter.mode === 'include' ? contains : !contains;
}

export function matchesActivityFilters(activity: NormalizedActivity, filters: ActivityFilters): boolean {
  return (
    matchesValue(activity.accountId, filters.accounts) &&
    matchesValue(activity.effectiveType, filters.types) &&
    matchesInstrument(activity, filters.instruments) &&
    matchesValue(activity.currency, filters.currencies) &&
    matchesValue(activity.status, filters.statuses)
  );
}

export function filterActivities(
  activities: NormalizedActivity[],
  filters: ActivityFilters,
  period: PeriodDefinition,
  now = new Date(),
): NormalizedActivity[] {
  const bounds = resolvePeriod(period, now);
  return activities.filter(
    (activity) => isWithinBounds(activity.date, bounds) && matchesActivityFilters(activity, filters),
  );
}
