import { Badge, Button } from '@wealthfolio/ui';
import { Move, Plus, RefreshCw } from 'lucide-react';

interface Props {
  activityCount: number;
  accountCount: number;
  refreshing: boolean;
  onAdd: () => void;
  onRefresh: () => void;
}

export function DashboardToolbar({ activityCount, accountCount, refreshing, onAdd, onRefresh }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{activityCount} activities</Badge>
        <Badge variant="secondary">{accountCount} accounts</Badge>
        <span className="hidden items-center gap-1 text-xs text-muted-foreground md:flex"><Move className="h-3.5 w-3.5" />Drag the dotted handle to move · resize from the bottom-right corner</span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={refreshing}><RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh</Button>
        <Button onClick={onAdd}><Plus className="mr-2 h-4 w-4" />Add widget</Button>
      </div>
    </div>
  );
}
