import type { ActivityDetails } from '@wealthfolio/addon-sdk';
import { describe, expect, it } from 'vitest';
import type { DashboardWidget, NormalizedActivity } from '../types';
import { resolvePeriod } from '../utils/dates';
import { aggregateActivities } from './aggregation-engine';
import { filterActivities } from './filter-engine';
import { groupActivities } from './grouping-engine';
import { normalizeActivities, normalizeActivity } from './normalize-activities';
import { calculateWidgetStatistics } from './statistics-engine';

function details(overrides: Partial<ActivityDetails> = {}): ActivityDetails {
  const date = overrides.date ?? new Date('2026-01-10T12:00:00');
  return {
    id: overrides.id ?? crypto.randomUUID(),
    activityType: overrides.activityType ?? 'DEPOSIT',
    status: overrides.status ?? 'POSTED',
    date,
    quantity: overrides.quantity ?? null,
    unitPrice: overrides.unitPrice ?? null,
    amount: overrides.amount ?? '0',
    fee: overrides.fee ?? null,
    currency: overrides.currency ?? 'USD',
    needsReview: overrides.needsReview ?? false,
    createdAt: overrides.createdAt ?? date,
    assetId: overrides.assetId ?? 'asset-1',
    updatedAt: overrides.updatedAt ?? date,
    accountId: overrides.accountId ?? 'account-1',
    accountName: overrides.accountName ?? 'IBKR',
    accountCurrency: overrides.accountCurrency ?? 'USD',
    assetSymbol: overrides.assetSymbol ?? 'CASH',
    ...overrides,
  };
}

function widget(overrides: Partial<DashboardWidget> = {}): DashboardWidget {
  return {
    id: 'widget-1',
    title: 'Statistic',
    visualization: 'line',
    calculation: {
      kind: 'simple',
      aggregation: 'sum',
      field: 'amount',
      valueMode: 'raw',
      filters: {},
    },
    groupBy: 'month',
    period: { kind: 'dynamic', preset: 'all' },
    formatting: { decimals: 2, compact: false, sortDirection: 'ascending', showLegend: true },
    layout: { i: 'widget-1', x: 0, y: 0, w: 6, h: 5 },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('normalization and filters', () => {
  it('uses the activity type override when the runtime payload contains it', () => {
    const activity = details({ activityType: 'DEPOSIT' }) as ActivityDetails & {
      activityTypeOverride: string;
    };
    activity.activityTypeOverride = 'DIVIDEND';
    expect(normalizeActivity(activity).effectiveType).toBe('DIVIDEND');
  });

  it('supports include and exclude filters', () => {
    const activities = normalizeActivities([
      details({ id: 'a', activityType: 'DEPOSIT' }),
      details({ id: 'b', activityType: 'WITHDRAWAL' }),
    ]);
    const period = { kind: 'dynamic', preset: 'all' } as const;
    expect(
      filterActivities(activities, { types: { mode: 'include', values: ['DEPOSIT'] } }, period),
    ).toHaveLength(1);
    expect(
      filterActivities(activities, { types: { mode: 'exclude', values: ['WITHDRAWAL'] } }, period),
    ).toHaveLength(1);
  });
});

describe('periods and grouping', () => {
  it('uses inclusive local-day boundaries for fixed periods', () => {
    const activities = normalizeActivities([
      details({ id: 'inside', date: new Date('2026-02-10T23:59:59') }),
      details({ id: 'outside', date: new Date('2026-02-11T00:00:00') }),
    ]);
    const result = filterActivities(
      activities,
      {},
      { kind: 'fixed', startDate: '2026-02-10', endDate: '2026-02-10' },
    );
    expect(result.map(({ id }) => id)).toEqual(['inside']);
  });

  it('resolves dynamic current month, previous year and rolling day boundaries', () => {
    const now = new Date('2026-08-05T12:00:00');
    expect(resolvePeriod({ kind: 'dynamic', preset: 'current-month' }, now).start?.getDate()).toBe(1);
    expect(resolvePeriod({ kind: 'dynamic', preset: 'previous-year' }, now).start?.getFullYear()).toBe(2025);
    expect(resolvePeriod({ kind: 'dynamic', preset: 'last-7-days' }, now).start?.getDate()).toBe(30);
  });

  it('groups by month and quarter', () => {
    const activities = normalizeActivities([
      details({ date: new Date('2026-01-10') }),
      details({ date: new Date('2026-02-10') }),
      details({ date: new Date('2026-04-10') }),
    ]);
    expect(groupActivities(activities, 'month')).toHaveLength(3);
    expect(groupActivities(activities, 'quarter').map(({ label }) => label)).toEqual(['Q1 2026', 'Q2 2026']);
  });
});

describe('decimal aggregations', () => {
  const activities: NormalizedActivity[] = normalizeActivities([
    details({ id: 'a', amount: '0.1' }),
    details({ id: 'b', amount: '0.2' }),
    details({ id: 'c', amount: '-0.4' }),
    details({ id: 'null', amount: null }),
  ]);

  it('calculates sum, count, average, min and max without floating point arithmetic', () => {
    expect(aggregateActivities(activities, 'sum', 'amount', 'raw').value.toString()).toBe('-0.1');
    expect(aggregateActivities(activities, 'count', undefined, 'raw').value.toString()).toBe('4');
    expect(aggregateActivities(activities, 'average', 'amount', 'raw').value.toString()).toBe('-0.03333333333333333333333333333333333333333');
    expect(aggregateActivities(activities, 'min', 'amount', 'raw').value.toString()).toBe('-0.4');
    expect(aggregateActivities(activities, 'max', 'amount', 'raw').value.toString()).toBe('0.2');
  });

  it('supports raw and absolute modes while ignoring nulls', () => {
    expect(aggregateActivities(activities, 'sum', 'amount', 'absolute').value.toString()).toBe('0.7');
    expect(aggregateActivities(activities, 'sum', 'amount', 'raw').references).toHaveLength(3);
    expect(aggregateActivities(activities, 'min', 'amount', 'raw').references.map(({ activityId }) => activityId)).toEqual(['c']);
  });

  it('reports invalid decimal strings without including them in drill-down references', () => {
    const invalid = normalizeActivities([details({ id: 'bad', amount: 'not-a-decimal' })]);
    const result = calculateWidgetStatistics(widget(), invalid);
    expect(result.invalidNumericCount).toBe(1);
    expect(result.warnings).toHaveLength(1);
    expect(result.buckets[0]?.activityReferences).toEqual([]);
  });
});

describe('formula, currencies, cumulative values and drill-down', () => {
  const source = normalizeActivities([
    details({ id: 'jan-usd', date: new Date('2026-01-10'), activityType: 'DEPOSIT', amount: '1000' }),
    details({ id: 'feb-in-usd', date: new Date('2026-02-15'), activityType: 'DEPOSIT', amount: '500' }),
    details({ id: 'feb-out-usd', date: new Date('2026-02-20'), activityType: 'WITHDRAWAL', amount: '200' }),
    details({ id: 'mar-eur', date: new Date('2026-03-05'), activityType: 'DEPOSIT', amount: '300', currency: 'EUR' }),
  ]);

  const formulaWidget = widget({
    title: 'Capital net depus IBKR',
    calculation: {
      kind: 'formula',
      cumulative: true,
      components: [
        {
          id: 'deposit',
          label: 'Deposit component',
          operator: 'add',
          aggregation: 'sum',
          field: 'amount',
          valueMode: 'absolute',
          filters: {
            accounts: { mode: 'include', values: ['account-1'] },
            types: { mode: 'include', values: ['DEPOSIT'] },
            statuses: { mode: 'include', values: ['POSTED'] },
          },
        },
        {
          id: 'withdrawal',
          label: 'Withdrawal component',
          operator: 'subtract',
          aggregation: 'sum',
          field: 'amount',
          valueMode: 'absolute',
          filters: {
            accounts: { mode: 'include', values: ['account-1'] },
            types: { mode: 'include', values: ['WITHDRAWAL'] },
            statuses: { mode: 'include', values: ['POSTED'] },
          },
        },
      ],
    },
  });

  it('calculates deposit minus withdrawal and keeps currencies separated cumulatively', () => {
    const result = calculateWidgetStatistics(formulaWidget, source, new Date('2026-03-31'));
    expect(result.buckets.map(({ values }) => values)).toEqual([
      { USD: '1000', EUR: '0' },
      { USD: '1300', EUR: '0' },
      { USD: '1300', EUR: '300' },
    ]);
    expect(result.totals).toEqual({ USD: '1300', EUR: '300' });
  });

  it('preserves contributing activity IDs and formula component labels for drill-down', () => {
    const result = calculateWidgetStatistics(formulaWidget, source);
    const last = result.buckets.at(-1);
    expect(last?.activityReferences.map(({ activityId }) => activityId)).toEqual([
      'jan-usd',
      'feb-in-usd',
      'feb-out-usd',
      'mar-eur',
    ]);
    expect(new Set(last?.activityReferences.map(({ componentLabel }) => componentLabel))).toEqual(
      new Set(['Deposit component', 'Withdrawal component']),
    );
  });
});
