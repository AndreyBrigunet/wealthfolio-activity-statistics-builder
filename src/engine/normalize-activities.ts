import type { ActivityDetails } from '@wealthfolio/addon-sdk';
import type { NormalizedActivity } from '../types';

function readRuntimeString(value: unknown, key: string): string | undefined {
  if (typeof value !== 'object' || value === null || !(key in value)) return undefined;
  const field = Reflect.get(value, key);
  return typeof field === 'string' && field.length > 0 ? field : undefined;
}

export function normalizeActivity(activity: ActivityDetails): NormalizedActivity {
  const runtimeOverride = readRuntimeString(activity, 'activityTypeOverride');
  const date = activity.date instanceof Date ? new Date(activity.date) : new Date(activity.date);
  return {
    id: activity.id,
    accountId: activity.accountId,
    accountName: activity.accountName,
    effectiveType: runtimeOverride ?? activity.activityType,
    status: activity.status ?? 'POSTED',
    date,
    dateIso: Number.isNaN(date.getTime()) ? '' : date.toISOString(),
    assetId: activity.assetId,
    instrument: activity.assetSymbol || activity.assetId,
    instrumentName: activity.assetName,
    amount: activity.amount,
    quantity: activity.quantity,
    unitPrice: activity.unitPrice,
    fee: activity.fee,
    currency: activity.currency || activity.accountCurrency,
    source: activity,
  };
}

export function normalizeActivities(activities: ActivityDetails[]): NormalizedActivity[] {
  return activities.map(normalizeActivity).filter((activity) => !Number.isNaN(activity.date.getTime()));
}
