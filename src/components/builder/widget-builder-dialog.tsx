import type { Account } from '@wealthfolio/addon-sdk';
import { Alert, AlertDescription, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@wealthfolio/ui';
import { useEffect, useMemo, useState } from 'react';
import type { ActivityFilters, DashboardWidget, NormalizedActivity, VisualizationType } from '../../types';
import { createDefaultWidget } from '../../types';
import { cloneSerializable } from '../../utils/clone';
import { isChronologicalGroup } from '../../utils/dates';
import { validateWidgetCompatibility } from '../../validation/compatibility-rules';
import { useDebouncedValue } from '../../hooks';
import { buildFilterOptions } from './builder-types';
import { CalculationEditor } from './calculation-editor';
import { FilterEditor } from './filter-editor';
import { FormattingEditor } from './formatting-editor';
import { FormulaEditor } from './formula-editor';
import { GroupingEditor } from './grouping-editor';
import { PeriodEditor } from './period-editor';
import { WidgetPreview } from './widget-preview';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widget?: DashboardWidget;
  activities: NormalizedActivity[];
  accounts: Account[];
  onSave: (widget: DashboardWidget) => Promise<void>;
}

export function WidgetBuilderDialog({ open, onOpenChange, widget, activities, accounts, onSave }: Props) {
  const [draft, setDraft] = useState<DashboardWidget>(() => cloneSerializable(widget ?? createDefaultWidget()));
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setDraft(cloneSerializable(widget ?? createDefaultWidget()));
  }, [open, widget]);
  const options = useMemo(() => buildFilterOptions(accounts, activities), [accounts, activities]);
  const debouncedDraft = useDebouncedValue(draft, 275);
  const errors = validateWidgetCompatibility(draft);
  const previewErrors = validateWidgetCompatibility(debouncedDraft);

  const updateSimpleFilters = (filters: ActivityFilters) => {
    if (draft.calculation.kind !== 'simple') return;
    setDraft({ ...draft, calculation: { ...draft.calculation, filters } });
  };

  const save = async () => {
    if (errors.length > 0) return;
    setSaving(true);
    try {
      await onSave({ ...draft, updatedAt: new Date().toISOString() });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-[96vw] flex-col lg:max-w-6xl">
        <DialogHeader><DialogTitle>{widget ? 'Edit widget' : 'Create widget'}</DialogTitle><DialogDescription>Build a statistic from existing Wealthfolio activities. Preview updates after 275 ms.</DialogDescription></DialogHeader>
        <Tabs defaultValue="general" className="min-h-0 flex-1 overflow-auto">
          <TabsList className="h-auto w-full flex-wrap justify-start">
            {['general','visualization','calculation','formula','filters','period','grouping','formatting','preview'].map((tab) => <TabsTrigger key={tab} value={tab}>{tab[0].toUpperCase() + tab.slice(1)}</TabsTrigger>)}
          </TabsList>
          <TabsContent value="general" className="space-y-4 p-1"><div className="space-y-2"><Label>Title</Label><Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></div><div className="space-y-2"><Label>Description</Label><Textarea value={draft.description ?? ''} onChange={(event) => setDraft({ ...draft, description: event.target.value || undefined })} /></div></TabsContent>
          <TabsContent value="visualization" className="p-1"><Label>Visualization</Label><Select value={draft.visualization} onValueChange={(visualization: VisualizationType) => setDraft({ ...draft, visualization })}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="value">Simple value</SelectItem><SelectItem value="table">Table</SelectItem><SelectItem value="line">Line chart</SelectItem><SelectItem value="bar">Bar chart</SelectItem><SelectItem value="pie">Pie chart</SelectItem></SelectContent></Select></TabsContent>
          <TabsContent value="calculation" className="p-1"><CalculationEditor value={draft.calculation} onChange={(calculation) => setDraft({ ...draft, calculation })} /></TabsContent>
          <TabsContent value="formula" className="p-1">{draft.calculation.kind === 'formula' ? <FormulaEditor value={draft.calculation} options={options} cumulativeDisabled={!isChronologicalGroup(draft.groupBy)} onChange={(calculation) => setDraft({ ...draft, calculation })} /> : <p className="text-sm text-muted-foreground">Switch Calculation mode to Formula to configure components.</p>}</TabsContent>
          <TabsContent value="filters" className="p-1">{draft.calculation.kind === 'simple' ? <FilterEditor value={draft.calculation.filters} options={options} onChange={updateSimpleFilters} /> : <p className="text-sm text-muted-foreground">Formula filters are configured independently inside each Formula component.</p>}</TabsContent>
          <TabsContent value="period" className="p-1"><PeriodEditor value={draft.period} onChange={(period) => setDraft({ ...draft, period })} /></TabsContent>
          <TabsContent value="grouping" className="p-1"><GroupingEditor value={draft.groupBy} onChange={(groupBy) => setDraft({ ...draft, groupBy })} /></TabsContent>
          <TabsContent value="formatting" className="p-1"><FormattingEditor value={draft.formatting} onChange={(formatting) => setDraft({ ...draft, formatting })} /></TabsContent>
          <TabsContent value="preview" className="p-1"><WidgetPreview widget={debouncedDraft} activities={activities} errors={previewErrors} /></TabsContent>
        </Tabs>
        {errors.length > 0 && <Alert variant="destructive"><AlertDescription>{errors.join(' ')}</AlertDescription></Alert>}
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={saving || errors.length > 0} onClick={() => void save()}>{saving ? 'Saving…' : 'Save widget'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
