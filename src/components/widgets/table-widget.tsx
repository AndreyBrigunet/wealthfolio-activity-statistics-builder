import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@wealthfolio/ui';
import type { DashboardWidget, DrilldownSelection, StatisticsResult } from '../../types';
import { formatDecimal } from '../../utils/format';
import { resultCurrencies } from './chart-utils';

interface Props {
  widget: DashboardWidget;
  result: StatisticsResult;
  onDrilldown: (selection: DrilldownSelection) => void;
}

export function TableWidget({ widget, result, onDrilldown }: Props) {
  const currencies = resultCurrencies(result.buckets);
  const buckets =
    widget.formatting.sortDirection === 'descending' ? [...result.buckets].reverse() : result.buckets;
  return (
    <div className="max-h-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group</TableHead>
            {currencies.map((currency) => <TableHead key={currency} className="text-right">{currency}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {buckets.map((bucket) => (
            <TableRow key={bucket.key} className="cursor-pointer" onClick={() => onDrilldown({ bucketKey: bucket.key })}>
              <TableCell>{bucket.label}</TableCell>
              {currencies.map((currency) => (
                <TableCell key={currency} className="text-right">
                  {formatDecimal(bucket.values[currency] ?? '0', widget.formatting.decimals, widget.formatting.compact)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
