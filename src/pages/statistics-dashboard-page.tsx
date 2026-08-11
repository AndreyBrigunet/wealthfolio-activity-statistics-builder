import { useQueryClient } from '@tanstack/react-query';
import type { AddonContext } from '@wealthfolio/addon-sdk';
import {
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDescription,
  Page,
  PageContent,
  PageHeader,
  Skeleton,
} from '@wealthfolio/ui';
import { lazy, Suspense, useMemo, useState } from 'react';
import { DashboardToolbar } from '../components/dashboard/dashboard-toolbar';
import { EmptyDashboard } from '../components/dashboard/empty-dashboard';
import { normalizeActivities } from '../engine/normalize-activities';
import { accountsQueryKey, activitiesQueryKey, useAccounts, useActivities, useDashboard, usePortfolioEvents } from '../hooks';
import type { DashboardWidget } from '../types';

const WidgetBuilderDialog = lazy(() =>
  import('../components/builder/widget-builder-dialog').then(({ WidgetBuilderDialog: component }) => ({
    default: component,
  })),
);

const DashboardGrid = lazy(() =>
  import('../components/dashboard/dashboard-grid').then(({ DashboardGrid: component }) => ({
    default: component,
  })),
);

export function StatisticsDashboardPage({ ctx }: { ctx: AddonContext }) {
  const queryClient = useQueryClient();
  const activitiesQuery = useActivities(ctx);
  const accountsQuery = useAccounts(ctx);
  const dashboard = useDashboard(ctx);
  usePortfolioEvents(ctx, queryClient);
  const activities = useMemo(() => normalizeActivities(activitiesQuery.data ?? []), [activitiesQuery.data]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget>();
  const [deleteTarget, setDeleteTarget] = useState<DashboardWidget>();

  const openBuilder = (widget?: DashboardWidget) => { setEditingWidget(widget); setBuilderOpen(true); };
  const refresh = () => {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: activitiesQueryKey }),
      queryClient.invalidateQueries({ queryKey: accountsQueryKey }),
    ]);
  };
  const loading = activitiesQuery.isLoading || accountsQuery.isLoading || dashboard.isLoading;
  const error = activitiesQuery.error ?? accountsQuery.error ?? dashboard.error;

  return (
    <Page>
      <PageHeader heading="Statistics" text="Build and arrange statistics calculated from your existing activities." />
      <PageContent className="space-y-5">
        {loading ? <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-72 w-full" /></div> : error ? (
          <Alert variant="destructive"><AlertDescription>{error instanceof Error ? error.message : String(error)}</AlertDescription></Alert>
        ) : (
          <>
            <DashboardToolbar activityCount={activities.length} accountCount={accountsQuery.data?.length ?? 0} refreshing={activitiesQuery.isFetching || accountsQuery.isFetching} onAdd={() => openBuilder()} onRefresh={refresh} />
            {(dashboard.data?.widgets.length ?? 0) === 0 ? <EmptyDashboard onAdd={() => openBuilder()} /> : dashboard.data && (
              <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <DashboardGrid widgets={dashboard.data.widgets} layouts={dashboard.data.layouts} activities={activities} onLayoutsChange={dashboard.saveLayouts} onEdit={openBuilder} onDuplicate={(widget) => void dashboard.duplicateWidget(widget)} onDelete={setDeleteTarget} />
              </Suspense>
            )}
          </>
        )}
      </PageContent>
      {builderOpen && (
        <Suspense fallback={null}>
          <WidgetBuilderDialog open={builderOpen} onOpenChange={setBuilderOpen} widget={editingWidget} activities={activities} accounts={accountsQuery.data ?? []} onSave={dashboard.saveWidget} />
        </Suspense>
      )}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(undefined)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this widget?</AlertDialogTitle><AlertDialogDescription>The widget configuration and every saved layout position will be removed. Wealthfolio activities are never changed.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteTarget) void dashboard.deleteWidget(deleteTarget.id); setDeleteTarget(undefined); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}
