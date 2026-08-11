import Decimal from 'decimal.js';
import type {
  ActivityReference,
  Aggregation,
  NormalizedActivity,
  NumericField,
  ValueMode,
} from '../types';
import { decimalToString, parseDecimal } from '../utils/decimal';

export interface AggregationResult {
  value: Decimal;
  references: ActivityReference[];
  invalidNumericCount: number;
}

function numericValue(
  activity: NormalizedActivity,
  field: NumericField,
  valueMode: ValueMode,
): Decimal | null {
  const value = parseDecimal(activity[field]);
  return valueMode === 'absolute' && value ? value.abs() : value;
}

export function aggregateActivities(
  activities: NormalizedActivity[],
  aggregation: Aggregation,
  field: NumericField | undefined,
  valueMode: ValueMode,
  reference?: Pick<ActivityReference, 'componentId' | 'componentLabel'>,
): AggregationResult {
  if (aggregation === 'count') {
    return {
      value: new Decimal(activities.length),
      references: activities.map((activity) => ({ activityId: activity.id, ...reference })),
      invalidNumericCount: 0,
    };
  }
  if (!field) return { value: new Decimal(0), references: [], invalidNumericCount: 0 };

  const values: Array<{ activity: NormalizedActivity; value: Decimal }> = [];
  let invalidNumericCount = 0;
  for (const activity of activities) {
    const raw = activity[field];
    if (raw == null || raw.trim() === '') continue;
    const value = numericValue(activity, field, valueMode);
    if (!value) invalidNumericCount += 1;
    else values.push({ activity, value });
  }

  let result = new Decimal(0);
  if (values.length > 0) {
    if (aggregation === 'min') result = Decimal.min(...values.map(({ value }) => value));
    else if (aggregation === 'max') result = Decimal.max(...values.map(({ value }) => value));
    else {
      result = Decimal.sum(...values.map(({ value }) => value));
      if (aggregation === 'average') result = result.div(values.length);
    }
  }

  const contributingValues =
    aggregation === 'min' || aggregation === 'max'
      ? values.filter(({ value }) => value.equals(result))
      : values;

  return {
    value: result,
    references: contributingValues.map(({ activity }) => ({ activityId: activity.id, ...reference })),
    invalidNumericCount,
  };
}

export function valuesByCurrency(
  activities: NormalizedActivity[],
  aggregation: Aggregation,
  field: NumericField | undefined,
  valueMode: ValueMode,
  reference?: Pick<ActivityReference, 'componentId' | 'componentLabel'>,
): { values: Record<string, string>; references: ActivityReference[]; invalidNumericCount: number } {
  const currencies = new Map<string, NormalizedActivity[]>();
  for (const activity of activities) {
    const current = currencies.get(activity.currency) ?? [];
    current.push(activity);
    currencies.set(activity.currency, current);
  }

  const values: Record<string, string> = {};
  const references: ActivityReference[] = [];
  let invalidNumericCount = 0;
  for (const [currency, currencyActivities] of currencies) {
    const result = aggregateActivities(currencyActivities, aggregation, field, valueMode, reference);
    values[currency] = decimalToString(result.value);
    references.push(...result.references);
    invalidNumericCount += result.invalidNumericCount;
  }
  return { values, references, invalidNumericCount };
}
