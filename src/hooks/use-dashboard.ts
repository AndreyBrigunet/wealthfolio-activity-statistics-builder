import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddonContext } from '@wealthfolio/addon-sdk';
import { useMemo } from 'react';
import { DashboardRepository } from '../storage/dashboard-repository';
import type { DashboardLayouts, DashboardState, DashboardWidget } from '../types';

const dashboardQueryKey = ['activity-statistics', 'dashboard'] as const;

export function useDashboard(ctx: AddonContext) {
  const queryClient = useQueryClient();
  const repository = useMemo(() => new DashboardRepository(ctx.api.storage), [ctx]);
  const query = useQuery({ queryKey: dashboardQueryKey, queryFn: () => repository.load() });

  const saveWidget = async (widget: DashboardWidget) => {
    const savedWidget = await repository.saveWidget(widget);
    queryClient.setQueryData<DashboardState>(dashboardQueryKey, (current) => {
      if (!current) return current;
      const exists = current.widgets.some(({ id }) => id === savedWidget.id);
      return {
        ...current,
        widgets: exists
          ? current.widgets.map((item) => (item.id === savedWidget.id ? savedWidget : item))
          : [...current.widgets, savedWidget],
        layouts: exists
          ? current.layouts
          : { ...current.layouts, desktop: [...current.layouts.desktop, savedWidget.layout] },
      };
    });
  };

  const deleteWidget = async (id: string) => {
    await repository.deleteWidget(id);
    await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
  };

  const duplicateWidget = async (widget: DashboardWidget) => {
    await repository.duplicateWidget(widget);
    await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
  };

  const saveLayouts = async (layouts: DashboardLayouts) => {
    queryClient.setQueryData<DashboardState>(dashboardQueryKey, (current) =>
      current ? { ...current, layouts } : current,
    );
    await repository.saveLayouts(layouts);
  };

  return { ...query, saveWidget, deleteWidget, duplicateWidget, saveLayouts };
}
