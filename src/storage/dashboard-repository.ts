import type { StorageAPI } from '@wealthfolio/addon-sdk/host-api';
import { z } from 'zod';
import {
  DASHBOARD_SCHEMA_VERSION,
  type DashboardLayouts,
  type DashboardState,
  type DashboardWidget,
  type WidgetLayout,
} from '../types';
import { cloneSerializable } from '../utils/clone';
import { createUuid } from '../utils/id';
import { DESKTOP_GRID_COLUMNS, findAvailableLayoutPosition } from '../utils/layout';
import { widgetSchema } from '../validation/widget-schema';
import { migrateStorage, STORAGE_KEYS } from './storage-migrations';

const indexSchema = z.array(z.string());
const layoutSchema = z.array(
  z.object({
    i: z.string(),
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    w: z.number().int().positive(),
    h: z.number().int().positive(),
    minW: z.number().int().positive().optional(),
    minH: z.number().int().positive().optional(),
  }),
);

function parseStored<T>(value: string | null, schema: z.ZodType<T>, fallback: T): T {
  if (!value) return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}

function defaultLayouts(): DashboardLayouts {
  return { desktop: [], tablet: [], mobile: [] };
}

export class DashboardRepository {
  constructor(private readonly storage: StorageAPI) {}

  private widgetKey(id: string): string {
    return `widget.${id}`;
  }

  async load(): Promise<DashboardState> {
    await migrateStorage(this.storage);
    const ids = parseStored(await this.storage.get(STORAGE_KEYS.widgetIndex), indexSchema, []);
    const storedWidgets = await Promise.all(ids.map((id) => this.storage.get(this.widgetKey(id))));
    const widgets = storedWidgets.flatMap((stored) => {
      if (!stored) return [];
      try {
        const result = widgetSchema.safeParse(JSON.parse(stored) as unknown);
        return result.success ? [result.data] : [];
      } catch {
        return [];
      }
    });
    const layouts = defaultLayouts();
    layouts.desktop = parseStored(
      await this.storage.get(STORAGE_KEYS.desktopLayout),
      layoutSchema,
      widgets.map((widget) => widget.layout),
    );
    layouts.tablet = parseStored(await this.storage.get(STORAGE_KEYS.tabletLayout), layoutSchema, []);
    layouts.mobile = parseStored(await this.storage.get(STORAGE_KEYS.mobileLayout), layoutSchema, []);
    return { schemaVersion: DASHBOARD_SCHEMA_VERSION, widgets, layouts };
  }

  async saveWidget(widget: DashboardWidget): Promise<DashboardWidget> {
    const state = await this.load();
    const ids = state.widgets.map(({ id }) => id);
    const isNew = !ids.includes(widget.id);
    if (isNew) ids.push(widget.id);
    const positionedLayout = findAvailableLayoutPosition(
      state.layouts.desktop,
      widget.layout,
      DESKTOP_GRID_COLUMNS,
    );
    const savedWidget = isNew
      ? { ...widget, layout: positionedLayout }
      : widget;
    await this.storage.set(this.widgetKey(widget.id), JSON.stringify(savedWidget));
    await this.storage.set(STORAGE_KEYS.widgetIndex, JSON.stringify(ids));
    if (isNew) {
      await this.saveLayouts({
        ...state.layouts,
        desktop: [...state.layouts.desktop, savedWidget.layout],
      });
    }
    return savedWidget;
  }

  async deleteWidget(id: string): Promise<void> {
    const state = await this.load();
    const ids = state.widgets.map((widget) => widget.id).filter((widgetId) => widgetId !== id);
    const layouts: DashboardLayouts = {
      desktop: state.layouts.desktop.filter((layout) => layout.i !== id),
      tablet: state.layouts.tablet.filter((layout) => layout.i !== id),
      mobile: state.layouts.mobile.filter((layout) => layout.i !== id),
    };
    await this.storage.set(STORAGE_KEYS.widgetIndex, JSON.stringify(ids));
    await this.storage.delete(this.widgetKey(id));
    await this.saveLayouts(layouts);
  }

  async saveLayouts(layouts: DashboardLayouts): Promise<void> {
    await Promise.all([
      this.storage.set(STORAGE_KEYS.desktopLayout, JSON.stringify(layouts.desktop)),
      this.storage.set(STORAGE_KEYS.tabletLayout, JSON.stringify(layouts.tablet)),
      this.storage.set(STORAGE_KEYS.mobileLayout, JSON.stringify(layouts.mobile)),
    ]);
  }

  async duplicateWidget(widget: DashboardWidget): Promise<DashboardWidget> {
    const state = await this.load();
    const id = createUuid();
    const now = new Date().toISOString();
    const sourceLayout = state.layouts.desktop.find((layout) => layout.i === widget.id) ?? widget.layout;
    const layout: WidgetLayout = { ...sourceLayout, i: id };
    const copy: DashboardWidget = {
      ...cloneSerializable(widget),
      id,
      title: `${widget.title} Copy`,
      layout,
      createdAt: now,
      updatedAt: now,
    };
    return this.saveWidget(copy);
  }
}
