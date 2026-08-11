import { Button, Switch } from '@wealthfolio/ui';
import { Plus } from 'lucide-react';
import type { FormulaCalculation } from '../../types';
import { createUuid } from '../../utils/id';
import type { FilterOptions } from './builder-types';
import { FormulaComponentEditor } from './formula-component-editor';

interface Props { value: FormulaCalculation; options: FilterOptions; cumulativeDisabled: boolean; onChange: (value: FormulaCalculation) => void }

export function FormulaEditor({ value, options, cumulativeDisabled, onChange }: Props) {
  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between rounded-md border p-3"><span><span className="block text-sm font-medium">Cumulative result</span><span className="text-xs text-muted-foreground">Available only for chronological grouping.</span></span><Switch disabled={cumulativeDisabled} checked={value.cumulative} onCheckedChange={(cumulative) => onChange({ ...value, cumulative })} /></label>
      {value.components.map((component) => (
        <FormulaComponentEditor key={component.id} value={component} options={options} onChange={(next) => onChange({ ...value, components: value.components.map((item) => item.id === next.id ? next : item) })} onDelete={() => onChange({ ...value, components: value.components.filter((item) => item.id !== component.id) })} />
      ))}
      <Button variant="outline" onClick={() => onChange({ ...value, components: [...value.components, { id: createUuid(), label: `Component ${value.components.length + 1}`, operator: 'add', aggregation: 'sum', field: 'amount', valueMode: 'absolute', filters: {} }] })}><Plus className="mr-2 h-4 w-4" />Add component</Button>
    </div>
  );
}
