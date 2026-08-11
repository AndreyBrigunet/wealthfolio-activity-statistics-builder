import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '@wealthfolio/ui';
import type { WidgetFormatting } from '../../types';

interface Props { value: WidgetFormatting; onChange: (value: WidgetFormatting) => void }

export function FormattingEditor({ value, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label>Decimal places</Label><Input type="number" min={0} max={12} value={value.decimals} onChange={(event) => onChange({ ...value, decimals: Number(event.target.value) })} /></div>
      <div className="space-y-2"><Label>Sort</Label><Select value={value.sortDirection} onValueChange={(sortDirection: WidgetFormatting['sortDirection']) => onChange({ ...value, sortDirection })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ascending">Ascending</SelectItem><SelectItem value="descending">Descending</SelectItem></SelectContent></Select></div>
      <label className="flex items-center justify-between gap-3 rounded-md border p-3"><span className="text-sm">Compact format (12.5K)</span><Switch checked={value.compact} onCheckedChange={(compact) => onChange({ ...value, compact })} /></label>
      <label className="flex items-center justify-between gap-3 rounded-md border p-3"><span className="text-sm">Show chart legend</span><Switch checked={value.showLegend} onCheckedChange={(showLegend) => onChange({ ...value, showLegend })} /></label>
    </div>
  );
}
