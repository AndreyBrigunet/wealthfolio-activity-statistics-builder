import { describe, expect, it } from 'vitest';
import type { WidgetLayout } from '../types';
import { arrangeLayout, findAvailableLayoutPosition, resizeLayoutItem, widthForPreset } from './layout';

const item = (i: string, x: number, y: number, w = 6, h = 4): WidgetLayout => ({
  i,
  x,
  y,
  w,
  h,
  minW: 3,
  minH: 3,
});

describe('dashboard layout utilities', () => {
  it('places widgets side by side before creating another row', () => {
    const first = item('first', 0, 0);
    expect(findAvailableLayoutPosition([first], item('second', 0, 0))).toMatchObject({ x: 6, y: 0 });
    expect(findAvailableLayoutPosition([first, item('second', 6, 0)], item('third', 0, 0))).toMatchObject({ x: 0, y: 4 });
  });

  it('supports four compact widgets per desktop row', () => {
    expect(widthForPreset('compact', 12, 3)).toBe(3);
    expect(widthForPreset('third', 12, 3)).toBe(4);
    expect(widthForPreset('half', 12, 3)).toBe(6);
    expect(widthForPreset('full', 12, 3)).toBe(12);
  });

  it('moves an expanding widget to a free position when it would overlap', () => {
    const resized = resizeLayoutItem([item('first', 0, 0), item('second', 6, 0)], 'first', 12, 12);
    expect(resized.find(({ i }) => i === 'first')).toMatchObject({ x: 0, y: 4, w: 12 });
  });

  it('packs existing stacked widgets into the same row', () => {
    const arranged = arrangeLayout([item('first', 0, 0), item('second', 0, 4)], 12);
    expect(arranged).toEqual([item('first', 0, 0), item('second', 6, 0)]);
  });
});
