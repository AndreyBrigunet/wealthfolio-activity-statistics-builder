import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@wealthfolio/ui';
import type { DrilldownSelection, NormalizedActivity, StatisticsResult } from '../../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selection?: DrilldownSelection;
  result: StatisticsResult;
  activities: NormalizedActivity[];
}

export function ActivityDrilldownDialog({ open, onOpenChange, selection, result, activities }: Props) {
  const activityById = new Map(activities.map((activity) => [activity.id, activity]));
  const bucket = selection?.bucketKey === 'all'
    ? { activityReferences: result.buckets.flatMap((item) => item.activityReferences) }
    : result.buckets.find((item) => item.key === selection?.bucketKey);
  const seen = new Set<string>();
  const rows = (bucket?.activityReferences ?? []).flatMap((reference) => {
    const activity = activityById.get(reference.activityId);
    if (!activity || (selection?.currency && activity.currency !== selection.currency)) return [];
    const identity = `${activity.id}:${reference.componentId ?? ''}`;
    if (seen.has(identity)) return [];
    seen.add(identity);
    return [{ activity, reference }];
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[95vw] overflow-auto lg:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Contributing activities</DialogTitle>
          <DialogDescription>{rows.length} exact activity row(s) contributed to this result.</DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Instrument</TableHead>
              <TableHead>Amount</TableHead><TableHead>Quantity</TableHead><TableHead>Unit price</TableHead>
              <TableHead>Fee</TableHead><TableHead>Currency</TableHead><TableHead>Account</TableHead>
              <TableHead>Status</TableHead><TableHead>Component</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ activity, reference }) => (
              <TableRow key={`${activity.id}:${reference.componentId ?? ''}`}>
                <TableCell>{activity.date.toLocaleString()}</TableCell>
                <TableCell>{activity.effectiveType}</TableCell>
                <TableCell>{activity.instrument}</TableCell>
                <TableCell>{activity.amount ?? '—'}</TableCell>
                <TableCell>{activity.quantity ?? '—'}</TableCell>
                <TableCell>{activity.unitPrice ?? '—'}</TableCell>
                <TableCell>{activity.fee ?? '—'}</TableCell>
                <TableCell>{activity.currency}</TableCell>
                <TableCell>{activity.accountName}</TableCell>
                <TableCell>{activity.status}</TableCell>
                <TableCell>{reference.componentLabel ?? 'Simple calculation'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
