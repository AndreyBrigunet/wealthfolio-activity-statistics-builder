import type { StorageAPI } from '@wealthfolio/addon-sdk/host-api';
import { describe, expect, it } from 'vitest';
import { createDefaultWidget } from '../types';
import { DashboardRepository } from './dashboard-repository';
import { STORAGE_KEYS } from './storage-migrations';

class MemoryStorage implements StorageAPI {
  readonly values = new Map<string, string>();
  async get(key: string): Promise<string | null> { return this.values.get(key) ?? null; }
  async set(key: string, value: string): Promise<void> { this.values.set(key, value); }
  async delete(key: string): Promise<void> { this.values.delete(key); }
}

describe('DashboardRepository', () => {
  it('persists widgets, the index, schema, and responsive layouts', async () => {
    const storage = new MemoryStorage();
    const repository = new DashboardRepository(storage);
    const widget = createDefaultWidget();
    await repository.saveWidget(widget);
    const loaded = await repository.load();
    expect(loaded.widgets).toHaveLength(1);
    expect(loaded.widgets[0]?.id).toBe(widget.id);
    expect(loaded.layouts.desktop[0]?.i).toBe(widget.id);
    expect(storage.values.get(STORAGE_KEYS.schemaVersion)).toBe('1');
    expect(JSON.parse(storage.values.get(STORAGE_KEYS.widgetIndex) ?? '[]')).toEqual([widget.id]);
  });

  it('duplicates into a free horizontal slot and deletes widget and layout keys', async () => {
    const storage = new MemoryStorage();
    const repository = new DashboardRepository(storage);
    const widget = createDefaultWidget();
    await repository.saveWidget(widget);
    const copy = await repository.duplicateWidget(widget);
    expect(copy.id).not.toBe(widget.id);
    expect(copy.title).toBe(`${widget.title} Copy`);
    expect(copy.layout).toMatchObject({ x: 6, y: 0 });
    expect((await repository.load()).layouts.desktop.find(({ i }) => i === copy.id)).toMatchObject({ x: 6, y: 0 });
    await repository.deleteWidget(widget.id);
    const loaded = await repository.load();
    expect(loaded.widgets.map(({ id }) => id)).toEqual([copy.id]);
    expect(loaded.layouts.desktop.every(({ i }) => i !== widget.id)).toBe(true);
    expect(storage.values.has(`widget.${widget.id}`)).toBe(false);
  });
});
