import type { WidgetLayout, WidgetWidthPreset } from '../types';

export const DESKTOP_GRID_COLUMNS = 12;

function collides(left: WidgetLayout, right: WidgetLayout): boolean {
  return !(
    left.x + left.w <= right.x ||
    right.x + right.w <= left.x ||
    left.y + left.h <= right.y ||
    right.y + right.h <= left.y
  );
}

export function findAvailableLayoutPosition(
  layout: WidgetLayout[],
  item: WidgetLayout,
  columns = DESKTOP_GRID_COLUMNS,
): WidgetLayout {
  const width = Math.min(columns, Math.max(item.minW ?? 1, item.w));
  const normalized = { ...item, w: width };
  const occupied = layout.filter(({ i }) => i !== item.i);
  const maxBottom = Math.max(0, ...occupied.map(({ y, h }) => y + h));

  for (let y = 0; y <= maxBottom; y += 1) {
    for (let x = 0; x <= columns - width; x += 1) {
      const candidate = { ...normalized, x, y };
      if (occupied.every((other) => !collides(candidate, other))) {
        return candidate;
      }
    }
  }

  return { ...normalized, x: 0, y: maxBottom };
}

export function widthForPreset(
  preset: WidgetWidthPreset,
  columns: number,
  minimumWidth = 1,
): number {
  const requested = {
    compact: 3,
    third: Math.ceil(columns / 3),
    half: Math.ceil(columns / 2),
    full: columns,
  }[preset];
  return Math.min(columns, Math.max(minimumWidth, requested));
}

export function resizeLayoutItem(
  layout: WidgetLayout[],
  itemId: string,
  width: number,
  columns: number,
): WidgetLayout[] {
  const item = layout.find(({ i }) => i === itemId);
  if (!item) return layout;
  const occupied = layout.filter(({ i }) => i !== itemId);
  const candidate = {
    ...item,
    x: Math.min(item.x, Math.max(0, columns - width)),
    w: Math.min(columns, Math.max(item.minW ?? 1, width)),
  };
  const positioned = occupied.every((other) => !collides(candidate, other))
    ? candidate
    : findAvailableLayoutPosition(occupied, candidate, columns);
  return layout.map((entry) => (entry.i === itemId ? positioned : entry));
}

export function arrangeLayout(layout: WidgetLayout[], columns: number): WidgetLayout[] {
  const ordered = [...layout].sort((left, right) => left.y - right.y || left.x - right.x);
  return ordered.reduce<WidgetLayout[]>((placed, item) => {
    const candidate = { ...item, x: 0, y: 0 };
    return [...placed, findAvailableLayoutPosition(placed, candidate, columns)];
  }, []);
}
