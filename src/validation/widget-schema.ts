import { z } from 'zod';
import type { DashboardWidget } from '../types';

const filterSchema = z
  .object({
    mode: z.enum(['include', 'exclude']),
    values: z.array(z.string()),
  })
  .optional();

const filtersSchema = z.object({
  accounts: filterSchema,
  types: filterSchema,
  instruments: filterSchema,
  currencies: filterSchema,
  statuses: filterSchema,
});

const periodSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('fixed'), startDate: z.string(), endDate: z.string() }),
  z.object({
    kind: z.literal('dynamic'),
    preset: z.enum([
      'all',
      'current-month',
      'current-year',
      'previous-year',
      'last-7-days',
      'last-30-days',
      'last-90-days',
      'last-12-months',
      'relative',
    ]),
    relativeValue: z.number().int().positive().optional(),
    relativeUnit: z.enum(['days', 'weeks', 'months', 'years']).optional(),
  }),
]);

const simpleCalculationSchema = z.object({
  kind: z.literal('simple'),
  aggregation: z.enum(['sum', 'count', 'average', 'min', 'max', 'cumulative']),
  field: z.enum(['amount', 'quantity', 'fee', 'unitPrice']).optional(),
  valueMode: z.enum(['raw', 'absolute']),
  filters: filtersSchema,
});

const formulaComponentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  operator: z.enum(['add', 'subtract']),
  field: z.enum(['amount', 'quantity', 'fee', 'unitPrice']).optional(),
  aggregation: z.enum(['sum', 'count', 'average', 'min', 'max']),
  valueMode: z.enum(['raw', 'absolute']),
  filters: filtersSchema,
  period: periodSchema.optional(),
});

const calculationSchema = z.discriminatedUnion('kind', [
  simpleCalculationSchema,
  z.object({
    kind: z.literal('formula'),
    components: z.array(formulaComponentSchema),
    cumulative: z.boolean(),
  }),
]);

const layoutSchema = z.object({
  i: z.string(),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  w: z.number().int().positive(),
  h: z.number().int().positive(),
  minW: z.number().int().positive().optional(),
  minH: z.number().int().positive().optional(),
});

export const widgetSchema: z.ZodType<DashboardWidget> = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  visualization: z.enum(['value', 'table', 'line', 'bar', 'pie']),
  calculation: calculationSchema,
  groupBy: z
    .enum(['day', 'week', 'month', 'quarter', 'year', 'account', 'instrument', 'type', 'currency'])
    .optional(),
  period: periodSchema,
  formatting: z.object({
    decimals: z.number().int().min(0).max(12),
    compact: z.boolean(),
    sortDirection: z.enum(['ascending', 'descending']),
    showLegend: z.boolean(),
  }),
  layout: layoutSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
