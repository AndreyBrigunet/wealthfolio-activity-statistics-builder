import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@wealthfolio/ui';
import type { ChangeEvent } from 'react';
import type { MultiValueFilter } from '../../types';
import type { FilterOption } from './builder-types';

interface Props {
  label: string;
  value?: MultiValueFilter;
  options: FilterOption[];
  onChange: (value: MultiValueFilter | undefined) => void;
}

export function MultiValueFilterEditor({ label, value, options, onChange }: Props) {
  const selection = value?.values ?? [];
  const onSelectionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const values = [...event.target.selectedOptions].map((option) => option.value);
    onChange(values.length ? { mode: value?.mode ?? 'include', values } : undefined);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <Select
          value={value?.mode ?? 'include'}
          onValueChange={(mode: 'include' | 'exclude') =>
            onChange(selection.length ? { mode, values: selection } : undefined)
          }
        >
          <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="include">Include</SelectItem>
            <SelectItem value="exclude">Exclude</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <select
        multiple
        value={selection}
        onChange={onSelectionChange}
        className="min-h-24 w-full rounded-md border bg-background px-2 py-1 text-sm"
        aria-label={`${label} values`}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <p className="text-xs text-muted-foreground">Ctrl/Cmd-click for multiple. No selection means unrestricted.</p>
    </div>
  );
}
