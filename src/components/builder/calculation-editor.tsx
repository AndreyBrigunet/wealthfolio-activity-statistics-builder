import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@wealthfolio/ui';
import type { DashboardWidget, SimpleCalculation } from '../../types';
import { createUuid } from '../../utils/id';

interface Props { value: DashboardWidget['calculation']; onChange: (value: DashboardWidget['calculation']) => void }

const defaultSimple: SimpleCalculation = { kind: 'simple', aggregation: 'sum', field: 'amount', valueMode: 'raw', filters: {} };

export function CalculationEditor({ value, onChange }: Props) {
  const setKind = (kind: 'simple' | 'formula') => {
    if (kind === 'simple') onChange(defaultSimple);
    else onChange({
      kind: 'formula', cumulative: false, components: [{
        id: createUuid(), label: 'Component 1', operator: 'add', aggregation: 'sum',
        field: 'amount', valueMode: 'absolute', filters: {},
      }],
    });
  };
  return (
    <div className="space-y-4">
      <div className="space-y-2"><Label>Calculation mode</Label><Select value={value.kind} onValueChange={setKind}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="simple">Simple</SelectItem><SelectItem value="formula">Formula</SelectItem></SelectContent></Select></div>
      {value.kind === 'simple' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>Aggregation</Label><Select value={value.aggregation} onValueChange={(aggregation: SimpleCalculation['aggregation']) => onChange({ ...value, aggregation })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sum">Sum</SelectItem><SelectItem value="count">Count</SelectItem><SelectItem value="average">Average</SelectItem><SelectItem value="min">Minimum</SelectItem><SelectItem value="max">Maximum</SelectItem><SelectItem value="cumulative">Cumulative sum</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Numeric field</Label><Select disabled={value.aggregation === 'count'} value={value.field ?? 'amount'} onValueChange={(field: NonNullable<SimpleCalculation['field']>) => onChange({ ...value, field })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="amount">Amount</SelectItem><SelectItem value="quantity">Quantity</SelectItem><SelectItem value="fee">Fee</SelectItem><SelectItem value="unitPrice">Unit price</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Value mode</Label><Select value={value.valueMode} onValueChange={(valueMode: SimpleCalculation['valueMode']) => onChange({ ...value, valueMode })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="raw">Raw</SelectItem><SelectItem value="absolute">Absolute</SelectItem></SelectContent></Select></div>
        </div>
      )}
    </div>
  );
}
