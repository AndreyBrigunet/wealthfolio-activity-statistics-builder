import { useQuery } from '@tanstack/react-query';
import type { AddonContext } from '@wealthfolio/addon-sdk';

export const accountsQueryKey = ['activity-statistics', 'accounts'] as const;

export function useAccounts(ctx: AddonContext) {
  return useQuery({
    queryKey: accountsQueryKey,
    queryFn: () => ctx.api.accounts.getAll(),
  });
}
