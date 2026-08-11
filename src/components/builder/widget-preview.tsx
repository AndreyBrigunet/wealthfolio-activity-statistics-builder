import { Alert, AlertDescription, Badge } from '@wealthfolio/ui';
import type { DashboardWidget, NormalizedActivity } from '../../types';
import { calculateWidgetStatistics } from '../../engine/statistics-engine';
import { WidgetVisualization } from '../widgets/widget-visualization';

interface Props { widget: DashboardWidget; activities: NormalizedActivity[]; errors: string[] }

export function WidgetPreview({ widget, activities, errors }: Props) {
  if (errors.length > 0) return <Alert variant="destructive"><AlertDescription>{errors.join(' ')}</AlertDescription></Alert>;
  const result = calculateWidgetStatistics(widget, activities);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2"><Badge variant="secondary">{result.matchedActivityCount} activities</Badge>{Object.keys(result.totals).map((currency) => <Badge key={currency} variant="outline">{currency}</Badge>)}</div>
      {result.warnings.map((warning) => <Alert key={warning} variant="warning"><AlertDescription>{warning}</AlertDescription></Alert>)}
      <div className="h-72 rounded-md border p-3"><WidgetVisualization widget={widget} result={result} onDrilldown={() => undefined} /></div>
    </div>
  );
}
