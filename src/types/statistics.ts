import type { ActivityDetails } from '@wealthfolio/addon-sdk';
import type { ChronologicalGroupBy } from './dashboard';

export interface NormalizedActivity {
  id: string;
  accountId: string;
  accountName: string;
  effectiveType: string;
  status: string;
  date: Date;
  dateIso: string;
  assetId: string;
  instrument: string;
  instrumentName?: string;
  amount: string | null;
  quantity: string | null;
  unitPrice: string | null;
  fee: string | null;
  currency: string;
  source: ActivityDetails;
}

export interface ActivityReference {
  activityId: string;
  componentId?: string;
  componentLabel?: string;
}

export interface StatisticBucket {
  key: string;
  label: string;
  sortKey: string;
  values: Record<string, string>;
  activityReferences: ActivityReference[];
}

export interface StatisticsResult {
  buckets: StatisticBucket[];
  totals: Record<string, string>;
  matchedActivityCount: number;
  invalidNumericCount: number;
  warnings: string[];
  chronologicalGroup?: ChronologicalGroupBy;
}

export interface DrilldownSelection {
  bucketKey: string;
  currency?: string;
}
