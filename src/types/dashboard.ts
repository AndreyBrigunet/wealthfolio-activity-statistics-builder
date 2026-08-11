import { createUuid } from '../utils/id';

export type VisualizationType = 'value' | 'table' | 'line' | 'bar' | 'pie';
export type NumericField = 'amount' | 'quantity' | 'fee' | 'unitPrice';
export type Aggregation = 'sum' | 'count' | 'average' | 'min' | 'max' | 'cumulative';
export type GroupBy =
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'account'
  | 'instrument'
  | 'type'
  | 'currency';
export type ChronologicalGroupBy = Extract<GroupBy, 'day' | 'week' | 'month' | 'quarter' | 'year'>;
export type ValueMode = 'raw' | 'absolute';
export type FilterMode = 'include' | 'exclude';
export type SortDirection = 'ascending' | 'descending';
export type WidgetWidthPreset = 'compact' | 'third' | 'half' | 'full';

export interface MultiValueFilter {
  mode: FilterMode;
  values: string[];
}

export interface ActivityFilters {
  accounts?: MultiValueFilter;
  types?: MultiValueFilter;
  instruments?: MultiValueFilter;
  currencies?: MultiValueFilter;
  statuses?: MultiValueFilter;
}

export type DynamicPeriodPreset =
  | 'all'
  | 'current-month'
  | 'current-year'
  | 'previous-year'
  | 'last-7-days'
  | 'last-30-days'
  | 'last-90-days'
  | 'last-12-months'
  | 'relative';

export type RelativePeriodUnit = 'days' | 'weeks' | 'months' | 'years';

export type PeriodDefinition =
  | { kind: 'fixed'; startDate: string; endDate: string }
  | {
      kind: 'dynamic';
      preset: DynamicPeriodPreset;
      relativeValue?: number;
      relativeUnit?: RelativePeriodUnit;
    };

export interface SimpleCalculation {
  kind: 'simple';
  aggregation: Aggregation;
  field?: NumericField;
  valueMode: ValueMode;
  filters: ActivityFilters;
}

export interface FormulaComponent {
  id: string;
  label: string;
  operator: 'add' | 'subtract';
  field?: NumericField;
  aggregation: Exclude<Aggregation, 'cumulative'>;
  valueMode: ValueMode;
  filters: ActivityFilters;
  period?: PeriodDefinition;
}

export interface FormulaCalculation {
  kind: 'formula';
  components: FormulaComponent[];
  cumulative: boolean;
}

export interface WidgetFormatting {
  decimals: number;
  compact: boolean;
  sortDirection: SortDirection;
  showLegend: boolean;
}

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export type DashboardLayouts = Record<'desktop' | 'tablet' | 'mobile', WidgetLayout[]>;

export interface DashboardWidget {
  id: string;
  title: string;
  description?: string;
  visualization: VisualizationType;
  calculation: SimpleCalculation | FormulaCalculation;
  groupBy?: GroupBy;
  period: PeriodDefinition;
  formatting: WidgetFormatting;
  layout: WidgetLayout;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardState {
  schemaVersion: number;
  widgets: DashboardWidget[];
  layouts: DashboardLayouts;
}

export const DASHBOARD_SCHEMA_VERSION = 1;

export const EMPTY_FILTERS: ActivityFilters = {};

export function createDefaultWidget(): DashboardWidget {
  const id = createUuid();
  const now = new Date().toISOString();
  return {
    id,
    title: 'New statistic',
    visualization: 'value',
    calculation: {
      kind: 'simple',
      aggregation: 'sum',
      field: 'amount',
      valueMode: 'raw',
      filters: {},
    },
    period: { kind: 'dynamic', preset: 'all' },
    formatting: {
      decimals: 2,
      compact: false,
      sortDirection: 'ascending',
      showLegend: true,
    },
    layout: { i: id, x: 0, y: 0, w: 6, h: 5, minW: 3, minH: 3 },
    createdAt: now,
    updatedAt: now,
  };
}
