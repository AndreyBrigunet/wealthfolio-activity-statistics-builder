import { Button, EmptyPlaceholder } from '@wealthfolio/ui';
import { BarChart3, Plus } from 'lucide-react';

export function EmptyDashboard({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyPlaceholder icon={<BarChart3 className="h-10 w-10" />} title="Build your first statistic" description="Create a value, table, or chart from existing Wealthfolio activities.">
      <Button onClick={onAdd}><Plus className="mr-2 h-4 w-4" />Add widget</Button>
    </EmptyPlaceholder>
  );
}
