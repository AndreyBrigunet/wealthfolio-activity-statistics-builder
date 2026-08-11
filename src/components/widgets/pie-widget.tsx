import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@wealthfolio/ui';
import { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { DashboardWidget, DrilldownSelection, StatisticsResult } from '../../types';
import { CHART_COLORS, resultCurrencies, sortedBuckets } from './chart-utils';

interface Props {
  widget: DashboardWidget;
  result: StatisticsResult;
  onDrilldown: (selection: DrilldownSelection) => void;
}

export function PieWidget({ widget, result, onDrilldown }: Props) {
  const currencies = resultCurrencies(result.buckets);
  const [currency, setCurrency] = useState(currencies[0] ?? '');
  useEffect(() => {
    if (!currencies.includes(currency)) setCurrency(currencies[0] ?? '');
  }, [currencies, currency]);
  const data = sortedBuckets(widget, result.buckets).map((bucket) => ({
    name: bucket.label,
    value: Number(bucket.values[currency] ?? '0'),
    key: bucket.key,
  }));
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {currencies.length > 1 && (
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>{currencies.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      )}
      <div className="min-h-[180px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            {widget.formatting.showLegend && <Legend />}
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="35%" outerRadius="75%">
              {data.map((item, index) => (
                <Cell
                  key={item.key}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  className="cursor-pointer"
                  onClick={() => onDrilldown({ bucketKey: item.key, currency })}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
