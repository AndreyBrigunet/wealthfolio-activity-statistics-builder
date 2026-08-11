import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  endOfDay,
  endOfYear,
  format,
  isValid,
  parseISO,
  startOfDay,
  startOfISOWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import type { ChronologicalGroupBy, PeriodDefinition } from '../types';

export interface DateBounds {
  start?: Date;
  end?: Date;
}

export function resolvePeriod(period: PeriodDefinition, now = new Date()): DateBounds {
  if (period.kind === 'fixed') {
    const start = startOfDay(parseISO(period.startDate));
    const end = endOfDay(parseISO(period.endDate));
    return {
      start: isValid(start) ? start : undefined,
      end: isValid(end) ? end : undefined,
    };
  }

  switch (period.preset) {
    case 'all':
      return {};
    case 'current-month':
      return { start: startOfMonth(now), end: endOfDay(now) };
    case 'current-year':
      return { start: startOfYear(now), end: endOfDay(now) };
    case 'previous-year': {
      const previous = subYears(now, 1);
      return { start: startOfYear(previous), end: endOfYear(previous) };
    }
    case 'last-7-days':
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case 'last-30-days':
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
    case 'last-90-days':
      return { start: startOfDay(subDays(now, 89)), end: endOfDay(now) };
    case 'last-12-months':
      return { start: startOfDay(subMonths(now, 12)), end: endOfDay(now) };
    case 'relative': {
      const amount = Math.max(1, period.relativeValue ?? 1);
      const unit = period.relativeUnit ?? 'days';
      const subtract = {
        days: subDays,
        weeks: subWeeks,
        months: subMonths,
        years: subYears,
      }[unit];
      return { start: startOfDay(subtract(now, amount)), end: endOfDay(now) };
    }
  }
}

export function isWithinBounds(date: Date, bounds: DateBounds): boolean {
  return (!bounds.start || date >= bounds.start) && (!bounds.end || date <= bounds.end);
}

export function startOfChronologicalBucket(date: Date, groupBy: ChronologicalGroupBy): Date {
  switch (groupBy) {
    case 'day':
      return startOfDay(date);
    case 'week':
      return startOfISOWeek(date);
    case 'month':
      return startOfMonth(date);
    case 'quarter':
      return startOfQuarter(date);
    case 'year':
      return startOfYear(date);
  }
}

export function addChronologicalBucket(date: Date, groupBy: ChronologicalGroupBy): Date {
  return {
    day: addDays,
    week: addWeeks,
    month: addMonths,
    quarter: addQuarters,
    year: addYears,
  }[groupBy](date, 1);
}

export function chronologicalBucketKey(date: Date, groupBy: ChronologicalGroupBy): string {
  return format(startOfChronologicalBucket(date, groupBy), 'yyyy-MM-dd');
}

export function chronologicalBucketLabel(date: Date, groupBy: ChronologicalGroupBy): string {
  const start = startOfChronologicalBucket(date, groupBy);
  switch (groupBy) {
    case 'day':
      return format(start, 'yyyy-MM-dd');
    case 'week':
      return `ISO ${format(start, "RRRR-'W'II")}`;
    case 'month':
      return format(start, 'MMM yyyy');
    case 'quarter':
      return `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`;
    case 'year':
      return format(start, 'yyyy');
  }
}

export function isChronologicalGroup(value: string | undefined): value is ChronologicalGroupBy {
  return value === 'day' || value === 'week' || value === 'month' || value === 'quarter' || value === 'year';
}
