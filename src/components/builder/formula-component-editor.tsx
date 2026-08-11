import { Button, Card, CardContent, CardHeader, CardTitle, Checkbox, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@wealthfolio/ui';
import { Trash2 } from 'lucide-react';
import type { FormulaComponent } from '../../types';
import type { FilterOptions } from './builder-types';
import { FilterEditor } from './filter-editor';
import { PeriodEditor } from './period-editor';

interface Props { value: FormulaComponent; options: FilterOptions; onChange: (value: FormulaComponent) => void; onDelete: () => void }

export function FormulaComponentEditor({ value, options, onChange, onDelete }: Props) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between py-3"><CardTitle className="text-sm">{value.label}</CardTitle><Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete formula component"><Trash2 className="h-4 w-4" /></Button></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2"><Label>Operator</Label><Select value={value.operator} onValueChange={(operator: FormulaComponent['operator']) => onChange({ ...value, operator })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="add">Add (+)</SelectItem><SelectItem value="subtract">Subtract (−)</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Label</Label><Input value={value.label} onChange={(event) => onChange({ ...value, label: event.target.value })} /></div>
          <div className="space-y-2"><Label>Aggregation</Label><Select value={value.aggregation} onValueChange={(aggregation: FormulaComponent['aggregation']) => onChange({ ...value, aggregation })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sum">Sum</SelectItem><SelectItem value="count">Count</SelectItem><SelectItem value="average">Average</SelectItem><SelectItem value="min">Minimum</SelectItem><SelectItem value="max">Maximum</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Field</Label><Select disabled={value.aggregation === 'count'} value={value.field ?? 'amount'} onValueChange={(field: NonNullable<FormulaComponent['field']>) => onChange({ ...value, field })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="amount">Amount</SelectItem><SelectItem value="quantity">Quantity</SelectItem><SelectItem value="fee">Fee</SelectItem><SelectItem value="unitPrice">Unit price</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Value mode</Label><Select value={value.valueMode} onValueChange={(valueMode: FormulaComponent['valueMode']) => onChange({ ...value, valueMode })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="absolute">Absolute</SelectItem><SelectItem value="raw">Raw</SelectItem></SelectContent></Select></div>
        </div>
        <FilterEditor value={value.filters} options={options} onChange={(filters) => onChange({ ...value, filters })} />
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={Boolean(value.period)} onCheckedChange={(checked) => onChange({ ...value, period: checked ? { kind: 'dynamic', preset: 'all' } : undefined })} />Use a component-specific period</label>
        {value.period && <PeriodEditor value={value.period} onChange={(period) => onChange({ ...value, period })} />}
      </CardContent>
    </Card>
  );
}
