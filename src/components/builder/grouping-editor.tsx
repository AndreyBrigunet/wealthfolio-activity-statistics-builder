import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@wealthfolio/ui';
import type { GroupBy } from '../../types';

interface Props { value?: GroupBy; onChange: (value?: GroupBy) => void }

export function GroupingEditor({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label>Group by</Label>
      <Select value={value ?? 'none'} onValueChange={(next) => onChange(next === 'none' ? undefined : next as GroupBy)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No grouping</SelectItem><SelectItem value="day">Day</SelectItem>
          <SelectItem value="week">ISO week</SelectItem><SelectItem value="month">Month</SelectItem>
          <SelectItem value="quarter">Quarter</SelectItem><SelectItem value="year">Year</SelectItem>
          <SelectItem value="account">Account</SelectItem><SelectItem value="instrument">Instrument</SelectItem>
          <SelectItem value="type">Type</SelectItem><SelectItem value="currency">Currency</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
