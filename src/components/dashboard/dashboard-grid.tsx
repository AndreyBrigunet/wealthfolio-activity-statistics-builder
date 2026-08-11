import type { Layout, ResponsiveLayouts } from 'react-grid-layout';
import { ResponsiveGridLayout, useContainerWidth, verticalCompactor } from 'react-grid-layout';
import { Button } from '@wealthfolio/ui';
import { LayoutGrid } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DashboardLayouts, DashboardWidget, NormalizedActivity, WidgetLayout, WidgetWidthPreset } from '../../types';
import { arrangeLayout, resizeLayoutItem, widthForPreset } from '../../utils/layout';
import { WidgetContainer } from '../widgets/widget-container';

type BreakpointName = 'desktop' | 'tablet' | 'mobile';

const GRID_COLUMNS: Record<BreakpointName, number> = { desktop: 12, tablet: 8, mobile: 4 };

interface Props {
  widgets: DashboardWidget[];
  layouts: DashboardLayouts;
  activities: NormalizedActivity[];
  onLayoutsChange: (layouts: DashboardLayouts) => Promise<void>;
  onEdit: (widget: DashboardWidget) => void;
  onDuplicate: (widget: DashboardWidget) => void;
  onDelete: (widget: DashboardWidget) => void;
}

function generatedLayout(widget: DashboardWidget, index: number, breakpoint: BreakpointName): WidgetLayout {
  if (breakpoint === 'desktop') return widget.layout;
  if (breakpoint === 'tablet') return { ...widget.layout, x: 0, y: index * widget.layout.h, w: Math.min(8, Math.max(4, widget.layout.w)) };
  return { ...widget.layout, x: 0, y: index * widget.layout.h, w: 4 };
}

function ensureLayouts(layouts: DashboardLayouts, widgets: DashboardWidget[]): DashboardLayouts {
  return {
    desktop: widgets.map((widget, index) => layouts.desktop.find(({ i }) => i === widget.id) ?? generatedLayout(widget, index, 'desktop')),
    tablet: widgets.map((widget, index) => layouts.tablet.find(({ i }) => i === widget.id) ?? generatedLayout(widget, index, 'tablet')),
    mobile: widgets.map((widget, index) => layouts.mobile.find(({ i }) => i === widget.id) ?? generatedLayout(widget, index, 'mobile')),
  };
}

function fromLayout(layout: Layout | undefined): WidgetLayout[] {
  return (layout ?? []).map(({ i, x, y, w, h, minW, minH }) => ({ i, x, y, w, h, minW, minH }));
}

export function DashboardGrid({ widgets, layouts, activities, onLayoutsChange, onEdit, onDuplicate, onDelete }: Props) {
  const initial = useMemo(() => ensureLayouts(layouts, widgets), [layouts, widgets]);
  const [current, setCurrent] = useState(initial);
  const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointName>('desktop');
  const pending = useRef(current);
  const { width, containerRef, mounted } = useContainerWidth({ measureBeforeMount: true });
  useEffect(() => { setCurrent(initial); pending.current = initial; }, [initial]);

  const recordLayouts = (_layout: Layout, responsive: ResponsiveLayouts<BreakpointName>) => {
    const next: DashboardLayouts = {
      desktop: fromLayout(responsive.desktop),
      tablet: fromLayout(responsive.tablet),
      mobile: fromLayout(responsive.mobile),
    };
    pending.current = next;
  };
  const persistActiveLayout = (layout: Layout) => {
    const next = { ...pending.current, [activeBreakpoint]: fromLayout(layout) };
    pending.current = next;
    setCurrent(next);
    void onLayoutsChange(next);
  };

  const setWidgetWidth = (widgetId: string, preset: WidgetWidthPreset) => {
    const columns = GRID_COLUMNS[activeBreakpoint];
    const activeLayout = pending.current[activeBreakpoint];
    const item = activeLayout.find(({ i }) => i === widgetId);
    if (!item) return;
    const width = widthForPreset(preset, columns, item.minW);
    const resized = resizeLayoutItem(activeLayout, widgetId, width, columns);
    const compacted = fromLayout(verticalCompactor.compact(resized, columns));
    const next = { ...pending.current, [activeBreakpoint]: compacted };
    pending.current = next;
    setCurrent(next);
    void onLayoutsChange(next);
  };

  const autoArrange = () => {
    const columns = GRID_COLUMNS[activeBreakpoint];
    const arranged = arrangeLayout(pending.current[activeBreakpoint], columns);
    const next = { ...pending.current, [activeBreakpoint]: arranged };
    pending.current = next;
    setCurrent(next);
    void onLayoutsChange(next);
  };

  return (
    <div ref={containerRef}>
      <div className="mb-2 flex justify-end">
        <Button variant="outline" size="sm" onClick={autoArrange}>
          <LayoutGrid className="mr-2 h-4 w-4" />Auto arrange
        </Button>
      </div>
      {mounted && (
        <ResponsiveGridLayout<BreakpointName>
          width={width}
          breakpoints={{ desktop: 1200, tablet: 768, mobile: 0 }}
          cols={GRID_COLUMNS}
          layouts={current}
          rowHeight={56}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          compactor={verticalCompactor}
          dragConfig={{ handle: '.statistics-drag-handle', cancel: '.statistics-no-drag', bounded: true }}
          resizeConfig={{ enabled: true, handles: ['se'] }}
          onBreakpointChange={setActiveBreakpoint}
          onLayoutChange={recordLayouts}
          onDragStop={persistActiveLayout}
          onResizeStop={persistActiveLayout}
        >
          {widgets.map((widget) => (
            <div key={widget.id}>
              <WidgetContainer widget={widget} activities={activities} onEdit={() => onEdit(widget)} onDuplicate={() => onDuplicate(widget)} onDelete={() => onDelete(widget)} onSetWidth={(preset) => setWidgetWidth(widget.id, preset)} />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
