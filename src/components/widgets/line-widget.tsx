import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardWidget, DrilldownSelection, StatisticsResult } from '../../types';
import { activeBucketKey, chartData, CHART_COLORS, resultCurrencies, sortedBuckets } from './chart-utils';

interface Props {
  widget: DashboardWidget;
  result: StatisticsResult;
  onDrilldown: (selection: DrilldownSelection) => void;
}

export function LineWidget({ widget, result, onDrilldown }: Props) {
  const currencies = resultCurrencies(result.buckets);
  const buckets = sortedBuckets(widget, result.buckets);
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={180}>
      <LineChart
        data={chartData(buckets)}
        onClick={(event: unknown) => {
          const key = activeBucketKey(event, buckets);
          if (key) onDrilldown({ bucketKey: key });
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        {widget.formatting.showLegend && <Legend />}
        {currencies.map((currency, index) => (
          <Line
            key={currency}
            type="monotone"
            dataKey={currency}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            connectNulls
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
