export function AddonStyles() {
  return (
    <style>{`
      .react-grid-item { transition: transform 160ms ease; }
      .react-grid-item.react-draggable-dragging { transition: none; z-index: 50; }
      .react-grid-item.resizing { transition: none; z-index: 50; }
      .react-grid-placeholder { background: hsl(var(--primary) / 0.15); border-radius: 0.5rem; }
      .react-grid-item > .react-resizable-handle { position: absolute; z-index: 30; opacity: 0.7; transition: opacity 120ms ease, background-color 120ms ease; }
      .react-grid-item > .react-resizable-handle-se { width: 30px; height: 30px; right: 0; bottom: 0; cursor: se-resize; border-bottom-right-radius: 0.5rem; background: linear-gradient(135deg, transparent 52%, hsl(var(--primary) / 0.16) 52%); }
      .react-grid-item > .react-resizable-handle-se::after { content: ''; position: absolute; right: 7px; bottom: 7px; width: 10px; height: 10px; border-right: 2px solid hsl(var(--primary)); border-bottom: 2px solid hsl(var(--primary)); }
      .react-grid-item:hover > .react-resizable-handle, .react-grid-item.resizing > .react-resizable-handle { opacity: 1; background-color: hsl(var(--primary) / 0.08); }
    `}</style>
  );
}
