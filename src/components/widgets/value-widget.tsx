import { Button } from '@wealthfolio/ui';
import type { DashboardWidget, DrilldownSelection, StatisticsResult } from '../../types';
import { formatDecimal } from '../../utils/format';

interface Props {
  widget: DashboardWidget;
  result: StatisticsResult;
  onDrilldown: (selection: DrilldownSelection) => void;
}

export function ValueWidget({ widget, result, onDrilldown }: Props) {
  const entries = Object.entries(result.totals);
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">No matching activities.</p>;
  return (
    <div className="flex h-full flex-wrap items-center gap-3">
      {entries.map(([currency, value]) => (
        <Button
          key={currency}
          variant="ghost"
          className="h-auto flex-col items-start px-2 py-1"
          onClick={() => onDrilldown({ bucketKey: 'all', currency })}
        >
          <span className="text-2xl font-semibold">
            {formatDecimal(value, widget.formatting.decimals, widget.formatting.compact, currency)}
          </span>
          <span className="text-xs text-muted-foreground">{currency}</span>
        </Button>
      ))}
    </div>
  );
}
