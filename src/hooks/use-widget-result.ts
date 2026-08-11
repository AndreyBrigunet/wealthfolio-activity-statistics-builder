import { useMemo } from 'react';
import { calculateWidgetStatistics } from '../engine/statistics-engine';
import type { DashboardWidget, NormalizedActivity } from '../types';

export function useWidgetResult(widget: DashboardWidget, activities: NormalizedActivity[]) {
  return useMemo(() => calculateWidgetStatistics(widget, activities), [activities, widget]);
}
