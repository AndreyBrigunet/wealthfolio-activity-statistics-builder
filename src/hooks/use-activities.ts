import { useQuery } from '@tanstack/react-query';
import type { AddonContext } from '@wealthfolio/addon-sdk';

export const activitiesQueryKey = ['activity-statistics', 'activities'] as const;

export function useActivities(ctx: AddonContext) {
  return useQuery({
    queryKey: activitiesQueryKey,
    queryFn: () => ctx.api.activities.getAll(),
  });
}
