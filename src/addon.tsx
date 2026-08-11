import type { AddonContext, AddonEnableFunction } from '@wealthfolio/addon-sdk';
import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react';

let addonContext: AddonContext | undefined;

const StatisticsDashboardRoute = lazy(() => import('./pages/statistics-dashboard-route'));

interface BootstrapErrorBoundaryState {
  error?: Error;
}

class BootstrapErrorBoundary extends Component<{ children: ReactNode }, BootstrapErrorBoundaryState> {
  state: BootstrapErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): BootstrapErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const componentStack = info.componentStack ? `\n${info.componentStack}` : '';
    addonContext?.api.logger.error(`Statistics route failed to load: ${error.message}${componentStack}`);
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" style={{ padding: '1rem' }}>
          Failed to load Statistics: {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}

function RouteLoadingFallback() {
  return (
    <div aria-live="polite" style={{ padding: '1rem' }}>
      Loading Statistics…
    </div>
  );
}

function AddonRoute() {
  if (!addonContext) return null;
  return (
    <BootstrapErrorBoundary>
      <Suspense fallback={<RouteLoadingFallback />}>
        <StatisticsDashboardRoute ctx={addonContext} />
      </Suspense>
    </BootstrapErrorBoundary>
  );
}

const enable: AddonEnableFunction = (ctx) => {
  addonContext = ctx;
  const sidebarItem = ctx.sidebar.addItem({
    id: 'activity-statistics',
    route: '/addons/activity-statistics-builder',
    label: 'Statistics',
    icon: 'chart-bar',
    order: 110,
  });
  ctx.router.add({
    id: 'activity-statistics',
    path: '/addons/activity-statistics-builder',
    title: 'Statistics',
    component: AddonRoute,
  });
  ctx.onDisable(async () => {
    addonContext = undefined;
    await sidebarItem.remove();
  });
};

export default enable;
