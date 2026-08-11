import type { DashboardWidget, DrilldownSelection, StatisticsResult } from '../../types';
import { BarWidget } from './bar-widget';
import { LineWidget } from './line-widget';
import { PieWidget } from './pie-widget';
import { TableWidget } from './table-widget';
import { ValueWidget } from './value-widget';

interface Props {
  widget: DashboardWidget;
  result: StatisticsResult;
  onDrilldown: (selection: DrilldownSelection) => void;
}

export function WidgetVisualization(props: Props) {
  switch (props.widget.visualization) {
    case 'value':
      return <ValueWidget {...props} />;
    case 'table':
      return <TableWidget {...props} />;
    case 'line':
      return <LineWidget {...props} />;
    case 'bar':
      return <BarWidget {...props} />;
    case 'pie':
      return <PieWidget {...props} />;
  }
}
