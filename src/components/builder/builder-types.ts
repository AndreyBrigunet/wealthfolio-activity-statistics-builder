import type { Account } from '@wealthfolio/addon-sdk';
import type { NormalizedActivity } from '../../types';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterOptions {
  accounts: FilterOption[];
  types: FilterOption[];
  instruments: FilterOption[];
  currencies: FilterOption[];
  statuses: FilterOption[];
}

function uniqueOptions(values: FilterOption[]): FilterOption[] {
  return [...new Map(values.map((option) => [option.value, option])).values()].sort((left, right) =>
    left.label.localeCompare(right.label),
  );
}

export function buildFilterOptions(accounts: Account[], activities: NormalizedActivity[]): FilterOptions {
  return {
    accounts: uniqueOptions(accounts.map((account) => ({ value: account.id, label: account.name }))),
    types: uniqueOptions(activities.map((activity) => ({ value: activity.effectiveType, label: activity.effectiveType }))),
    instruments: uniqueOptions(
      activities.map((activity) => ({
        value: activity.assetId,
        label: activity.instrumentName
          ? `${activity.instrument} — ${activity.instrumentName}`
          : activity.instrument,
      })),
    ),
    currencies: uniqueOptions(activities.map((activity) => ({ value: activity.currency, label: activity.currency }))),
    statuses: uniqueOptions(activities.map((activity) => ({ value: activity.status, label: activity.status }))),
  };
}
