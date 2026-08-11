import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AddonContext } from '@wealthfolio/addon-sdk';
import { AddonErrorBoundary, AddonStyles } from '../components';
import { StatisticsDashboardPage } from './statistics-dashboard-page';

export default function StatisticsDashboardRoute({ ctx }: { ctx: AddonContext }) {
  return (
    <QueryClientProvider client={ctx.api.query.getClient() as QueryClient}>
      <AddonErrorBoundary>
        <AddonStyles />
        <StatisticsDashboardPage ctx={ctx} />
      </AddonErrorBoundary>
    </QueryClientProvider>
  );
}
