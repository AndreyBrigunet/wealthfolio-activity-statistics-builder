import type { StorageAPI } from '@wealthfolio/addon-sdk/host-api';
import { DASHBOARD_SCHEMA_VERSION } from '../types';

export const STORAGE_KEYS = {
  schemaVersion: 'dashboard.schema-version',
  widgetIndex: 'dashboard.widget-index',
  desktopLayout: 'dashboard.layout.desktop',
  tabletLayout: 'dashboard.layout.tablet',
  mobileLayout: 'dashboard.layout.mobile',
} as const;

export async function migrateStorage(storage: StorageAPI): Promise<void> {
  const storedVersion = await storage.get(STORAGE_KEYS.schemaVersion);
  const version = storedVersion ? Number.parseInt(storedVersion, 10) : 0;
  if (!Number.isFinite(version) || version < DASHBOARD_SCHEMA_VERSION) {
    if (!storedVersion) await storage.set(STORAGE_KEYS.widgetIndex, JSON.stringify([]));
    await storage.set(STORAGE_KEYS.schemaVersion, String(DASHBOARD_SCHEMA_VERSION));
  }
}
