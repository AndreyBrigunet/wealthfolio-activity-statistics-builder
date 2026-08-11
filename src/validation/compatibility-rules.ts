import { isAfter, isValid, parseISO } from 'date-fns';
import type { DashboardWidget } from '../types';
import { isChronologicalGroup } from '../utils/dates';

export function validateWidgetCompatibility(widget: DashboardWidget): string[] {
  const errors: string[] = [];
  if (widget.title.trim().length === 0) errors.push('A title is required.');
  if (widget.visualization !== 'value' && !widget.groupBy) {
    errors.push('Table and chart widgets require a Group by selection.');
  }
  if (widget.period.kind === 'fixed') {
    const start = parseISO(widget.period.startDate);
    const end = parseISO(widget.period.endDate);
    if (!isValid(start) || !isValid(end)) errors.push('The fixed period contains an invalid date.');
    else if (isAfter(start, end)) errors.push('The period start must not be after its end.');
  }
  if (
    widget.period.kind === 'dynamic' &&
    widget.period.preset === 'relative' &&
    (!widget.period.relativeValue || widget.period.relativeValue < 1)
  ) {
    errors.push('A relative period requires a positive length.');
  }

  if (widget.calculation.kind === 'simple') {
    if (widget.calculation.aggregation !== 'count' && !widget.calculation.field) {
      errors.push('The selected aggregation requires a numeric field.');
    }
    if (widget.calculation.aggregation === 'cumulative' && !isChronologicalGroup(widget.groupBy)) {
      errors.push('Cumulative sum requires a chronological grouping.');
    }
  } else {
    if (widget.calculation.components.length === 0) errors.push('A formula requires at least one component.');
    if (widget.calculation.cumulative && !isChronologicalGroup(widget.groupBy)) {
      errors.push('A cumulative formula requires a chronological grouping.');
    }
    for (const component of widget.calculation.components) {
      if (component.label.trim().length === 0) errors.push('Every formula component needs a label.');
      if (component.aggregation !== 'count' && !component.field) {
        errors.push(`${component.label || 'Formula component'} requires a numeric field.`);
      }
    }
  }
  return errors;
}
