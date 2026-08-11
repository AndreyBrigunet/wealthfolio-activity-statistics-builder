import type { ActivityFilters } from '../../types';
import type { FilterOptions } from './builder-types';
import { MultiValueFilterEditor } from './multi-value-filter';

interface Props {
  value: ActivityFilters;
  options: FilterOptions;
  onChange: (filters: ActivityFilters) => void;
}

export function FilterEditor({ value, options, onChange }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MultiValueFilterEditor label="Account" value={value.accounts} options={options.accounts} onChange={(accounts) => onChange({ ...value, accounts })} />
      <MultiValueFilterEditor label="Type" value={value.types} options={options.types} onChange={(types) => onChange({ ...value, types })} />
      <MultiValueFilterEditor label="Instrument" value={value.instruments} options={options.instruments} onChange={(instruments) => onChange({ ...value, instruments })} />
      <MultiValueFilterEditor label="Currency" value={value.currencies} options={options.currencies} onChange={(currencies) => onChange({ ...value, currencies })} />
      <MultiValueFilterEditor label="Status" value={value.statuses} options={options.statuses} onChange={(statuses) => onChange({ ...value, statuses })} />
    </div>
  );
}
