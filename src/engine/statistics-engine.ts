import Decimal from 'decimal.js';
import type {
  ActivityReference,
  DashboardWidget,
  FormulaCalculation,
  NormalizedActivity,
  StatisticBucket,
  StatisticsResult,
} from '../types';
import { decimalToString } from '../utils/decimal';
import { isChronologicalGroup } from '../utils/dates';
import { valuesByCurrency } from './aggregation-engine';
import { filterActivities } from './filter-engine';
import { chronologicalKeys, groupActivities } from './grouping-engine';

interface MutableBucket {
  key: string;
  label: string;
  sortKey: string;
  values: Record<string, Decimal>;
  activityReferences: ActivityReference[];
}

function addValue(target: Record<string, Decimal>, currency: string, value: Decimal): void {
  target[currency] = (target[currency] ?? new Decimal(0)).plus(value);
}

function serializeBuckets(buckets: MutableBucket[]): StatisticBucket[] {
  return buckets.map((bucket) => ({
    ...bucket,
    values: Object.fromEntries(
      Object.entries(bucket.values).map(([currency, value]) => [currency, decimalToString(value)]),
    ),
  }));
}

function completeChronology(
  buckets: MutableBucket[],
  activities: NormalizedActivity[],
  groupBy: DashboardWidget['groupBy'],
): MutableBucket[] {
  if (!isChronologicalGroup(groupBy)) return buckets;
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  return chronologicalKeys(activities, groupBy).map(
    (item) =>
      byKey.get(item.key) ?? {
        ...item,
        values: {},
        activityReferences: [],
      },
  );
}

function cumulativeBuckets(buckets: MutableBucket[]): MutableBucket[] {
  const currencies = [...new Set(buckets.flatMap((bucket) => Object.keys(bucket.values)))];
  const running: Record<string, Decimal> = Object.fromEntries(
    currencies.map((currency) => [currency, new Decimal(0)]),
  );
  const references: ActivityReference[] = [];
  return buckets.map((bucket) => {
    for (const [currency, value] of Object.entries(bucket.values)) addValue(running, currency, value);
    references.push(...bucket.activityReferences);
    return {
      ...bucket,
      values: Object.fromEntries(Object.entries(running).map(([currency, value]) => [currency, value])),
      activityReferences: [...references],
    };
  });
}

function finalCumulativeTotals(buckets: MutableBucket[]): Record<string, string> {
  const last = buckets.at(-1);
  if (!last) return {};
  return Object.fromEntries(
    Object.entries(last.values).map(([currency, value]) => [currency, decimalToString(value)]),
  );
}

function simpleResult(
  widget: DashboardWidget,
  activities: NormalizedActivity[],
  now: Date,
): StatisticsResult {
  if (widget.calculation.kind !== 'simple') throw new Error('Expected a simple calculation');
  const calculation = widget.calculation;
  const filtered = filterActivities(activities, calculation.filters, widget.period, now);
  let invalidNumericCount = 0;
  let buckets: MutableBucket[] = groupActivities(filtered, widget.groupBy).map((group) => {
    const aggregated = valuesByCurrency(
      group.activities,
      calculation.aggregation === 'cumulative' ? 'sum' : calculation.aggregation,
      calculation.field,
      calculation.valueMode,
    );
    invalidNumericCount += aggregated.invalidNumericCount;
    return {
      key: group.key,
      label: group.label,
      sortKey: group.sortKey,
      values: Object.fromEntries(
        Object.entries(aggregated.values).map(([currency, value]) => [currency, new Decimal(value)]),
      ),
      activityReferences: aggregated.references,
    };
  });
  buckets = completeChronology(buckets, filtered, widget.groupBy);
  if (calculation.aggregation === 'cumulative') buckets = cumulativeBuckets(buckets);

  const totalAggregation = calculation.aggregation === 'cumulative' ? 'sum' : calculation.aggregation;
  const totals =
    calculation.aggregation === 'cumulative'
      ? finalCumulativeTotals(buckets)
      : valuesByCurrency(filtered, totalAggregation, calculation.field, calculation.valueMode).values;
  return {
    buckets: serializeBuckets(buckets),
    totals,
    matchedActivityCount: new Set(filtered.map((activity) => activity.id)).size,
    invalidNumericCount,
    warnings: invalidNumericCount > 0 ? [`${invalidNumericCount} invalid numeric value(s) were ignored.`] : [],
    chronologicalGroup: isChronologicalGroup(widget.groupBy) ? widget.groupBy : undefined,
  };
}

function formulaComponentActivities(
  component: FormulaCalculation['components'][number],
  widget: DashboardWidget,
  activities: NormalizedActivity[],
  now: Date,
): NormalizedActivity[] {
  return filterActivities(activities, component.filters, component.period ?? widget.period, now);
}

function formulaResult(
  widget: DashboardWidget,
  activities: NormalizedActivity[],
  now: Date,
): StatisticsResult {
  if (widget.calculation.kind !== 'formula') throw new Error('Expected a formula calculation');
  const calculation = widget.calculation;
  const bucketMap = new Map<string, MutableBucket>();
  const allMatched: NormalizedActivity[] = [];
  let invalidNumericCount = 0;

  for (const component of calculation.components) {
    const filtered = formulaComponentActivities(component, widget, activities, now);
    allMatched.push(...filtered);
    for (const group of groupActivities(filtered, widget.groupBy)) {
      const aggregated = valuesByCurrency(
        group.activities,
        component.aggregation,
        component.field,
        component.valueMode,
        { componentId: component.id, componentLabel: component.label },
      );
      invalidNumericCount += aggregated.invalidNumericCount;
      const bucket = bucketMap.get(group.key) ?? {
        key: group.key,
        label: group.label,
        sortKey: group.sortKey,
        values: {},
        activityReferences: [],
      };
      for (const [currency, value] of Object.entries(aggregated.values)) {
        const decimal = new Decimal(value);
        addValue(bucket.values, currency, component.operator === 'subtract' ? decimal.negated() : decimal);
      }
      bucket.activityReferences.push(...aggregated.references);
      bucketMap.set(group.key, bucket);
    }
  }

  let buckets = [...bucketMap.values()].sort((left, right) => left.sortKey.localeCompare(right.sortKey));
  buckets = completeChronology(buckets, allMatched, widget.groupBy);
  if (calculation.cumulative) buckets = cumulativeBuckets(buckets);

  const totals: Record<string, Decimal> = {};
  for (const component of calculation.components) {
    const filtered = formulaComponentActivities(component, widget, activities, now);
    const aggregated = valuesByCurrency(
      filtered,
      component.aggregation,
      component.field,
      component.valueMode,
    );
    for (const [currency, value] of Object.entries(aggregated.values)) {
      const decimal = new Decimal(value);
      addValue(totals, currency, component.operator === 'subtract' ? decimal.negated() : decimal);
    }
  }

  return {
    buckets: serializeBuckets(buckets),
    totals: Object.fromEntries(
      Object.entries(totals).map(([currency, value]) => [currency, decimalToString(value)]),
    ),
    matchedActivityCount: new Set(allMatched.map((activity) => activity.id)).size,
    invalidNumericCount,
    warnings: invalidNumericCount > 0 ? [`${invalidNumericCount} invalid numeric value(s) were ignored.`] : [],
    chronologicalGroup: isChronologicalGroup(widget.groupBy) ? widget.groupBy : undefined,
  };
}

export function calculateWidgetStatistics(
  widget: DashboardWidget,
  activities: NormalizedActivity[],
  now = new Date(),
): StatisticsResult {
  return widget.calculation.kind === 'simple'
    ? simpleResult(widget, activities, now)
    : formulaResult(widget, activities, now);
}
