import type { QueryClient } from '@tanstack/react-query';
import type { AddonContext, UnlistenFn } from '@wealthfolio/addon-sdk';
import { useEffect } from 'react';
import { accountsQueryKey } from './use-accounts';
import { activitiesQueryKey } from './use-activities';

export function usePortfolioEvents(ctx: AddonContext, queryClient: QueryClient): void {
  useEffect(() => {
    let active = true;
    let unlisten: UnlistenFn | undefined;
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: activitiesQueryKey });
      void queryClient.invalidateQueries({ queryKey: accountsQueryKey });
    };
    void ctx.api.events.portfolio
      .onUpdateComplete<unknown>(refresh)
      .then((cleanup) => {
        if (active) unlisten = cleanup;
        else cleanup();
      })
      .catch((error: unknown) => {
        ctx.api.logger.error(`Could not subscribe to portfolio updates: ${String(error)}`);
      });

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      active = false;
      unlisten?.();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [ctx, queryClient]);
}
