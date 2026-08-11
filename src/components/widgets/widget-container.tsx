import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@wealthfolio/ui';
import { Columns2, Copy, GripVertical, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useWidgetResult } from '../../hooks';
import type { DashboardWidget, DrilldownSelection, NormalizedActivity, WidgetWidthPreset } from '../../types';
import { ActivityDrilldownDialog } from '../drilldown/activity-drilldown-dialog';
import { WidgetVisualization } from './widget-visualization';

interface Props {
  widget: DashboardWidget;
  activities: NormalizedActivity[];
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSetWidth: (preset: WidgetWidthPreset) => void;
}

export function WidgetContainer({ widget, activities, onEdit, onDuplicate, onDelete, onSetWidth }: Props) {
  const result = useWidgetResult(widget, activities);
  const [selection, setSelection] = useState<DrilldownSelection>();
  return (
    <>
      <Card className="flex h-full min-h-0 flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 px-4 py-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{widget.title}</CardTitle>
            {widget.description && <CardDescription className="line-clamp-1">{widget.description}</CardDescription>}
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="statistics-no-drag hidden sm:inline-flex">{result.matchedActivityCount}</Badge>
            <button type="button" className="statistics-drag-handle touch-none cursor-grab rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing" aria-label="Move widget" title="Drag to move widget">
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="statistics-no-drag">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Widget actions"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onEdit}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                <DropdownMenuItem onSelect={onDuplicate}><Copy className="mr-2 h-4 w-4" />Duplicate</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger><Columns2 className="mr-2 h-4 w-4" />Width</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onSelect={() => onSetWidth('compact')}>Compact · ¼ row</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onSetWidth('third')}>One third</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onSetWidth('half')}>Half row</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onSetWidth('full')}>Full row</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={onDelete}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="statistics-no-drag min-h-0 flex-1 px-4 pb-4">
          <WidgetVisualization widget={widget} result={result} onDrilldown={setSelection} />
          {result.warnings.length > 0 && <p className="mt-1 text-xs text-amber-600">{result.warnings.join(' ')}</p>}
        </CardContent>
      </Card>
      <ActivityDrilldownDialog open={Boolean(selection)} onOpenChange={(open) => !open && setSelection(undefined)} selection={selection} result={result} activities={activities} />
    </>
  );
}
