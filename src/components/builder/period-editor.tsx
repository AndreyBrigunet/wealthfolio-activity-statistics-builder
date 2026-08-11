import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@wealthfolio/ui';
import type { PeriodDefinition } from '../../types';

interface Props {
  value: PeriodDefinition;
  onChange: (period: PeriodDefinition) => void;
}

export function PeriodEditor({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Period type</Label>
        <Select
          value={value.kind}
          onValueChange={(kind: 'fixed' | 'dynamic') =>
            onChange(
              kind === 'fixed'
                ? { kind: 'fixed', startDate: '', endDate: '' }
                : { kind: 'dynamic', preset: 'all' },
            )
          }
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="dynamic">Dynamic</SelectItem><SelectItem value="fixed">Fixed</SelectItem></SelectContent>
        </Select>
      </div>
      {value.kind === 'fixed' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Start date</Label><Input type="date" value={value.startDate} onChange={(event) => onChange({ ...value, startDate: event.target.value })} /></div>
          <div className="space-y-2"><Label>End date</Label><Input type="date" value={value.endDate} onChange={(event) => onChange({ ...value, endDate: event.target.value })} /></div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Dynamic period</Label>
            <Select value={value.preset} onValueChange={(preset: typeof value.preset) => onChange({ kind: 'dynamic', preset })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">From the beginning</SelectItem><SelectItem value="current-month">Current month</SelectItem>
                <SelectItem value="current-year">Current year</SelectItem><SelectItem value="previous-year">Previous year</SelectItem>
                <SelectItem value="last-7-days">Last 7 days</SelectItem><SelectItem value="last-30-days">Last 30 days</SelectItem>
                <SelectItem value="last-90-days">Last 90 days</SelectItem><SelectItem value="last-12-months">Last 12 months</SelectItem>
                <SelectItem value="relative">Custom relative interval</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {value.preset === 'relative' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Length</Label><Input type="number" min={1} value={value.relativeValue ?? 1} onChange={(event) => onChange({ ...value, relativeValue: Number(event.target.value) })} /></div>
              <div className="space-y-2"><Label>Unit</Label><Select value={value.relativeUnit ?? 'days'} onValueChange={(relativeUnit: 'days' | 'weeks' | 'months' | 'years') => onChange({ ...value, relativeUnit })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="days">Days</SelectItem><SelectItem value="weeks">Weeks</SelectItem><SelectItem value="months">Months</SelectItem><SelectItem value="years">Years</SelectItem></SelectContent></Select></div>
            </div>
          )}
        </>
      )}
      <p className="text-xs text-muted-foreground">All boundaries use the browser's local timezone; weeks start on ISO Monday.</p>
    </div>
  );
}
