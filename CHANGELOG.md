# Changelog

All notable changes to the activity-statistics-builder addon will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1] - 2026-08-12

### Fixed
- Removed a controlled-layout feedback loop that repeatedly changed widget dimensions after adding a widget.
- Record intermediate responsive layout calculations without re-rendering the grid; commit state only when an interaction finishes.
- Restricted grid animation to position changes so width and height cannot pulse through CSS transitions.

## [1.1.0] - 2026-08-09

### Added
- Visible per-widget drag handles and highlighted bottom-right resize handles.
- Quick width presets for compact, one-third, half-row, and full-row widgets.
- Auto-arrange action that packs existing widgets into available horizontal space.

### Changed
- New and duplicated widgets fill free space in the current row before creating another row.
- Drag and resize completion now persists the exact active-breakpoint layout directly.

### Fixed
- The displayed dotted move handle was incorrectly inside the grid's drag-cancel region.
- Duplicating a widget could overwrite its newly calculated persisted position.

## [1.0.3] - 2026-08-08

### Changed
- Start eagerly with Wealthfolio and register the Statistics navigation item at runtime, allowing the sandbox to reuse warm host assets during application startup.
- Split the dashboard grid, widget visualizations, and widget builder into on-demand chunks.
- Reduced the initial Statistics route chunk from roughly 328 kB to 161 kB.

### Fixed
- Added a JSON-compatible clone fallback for runtimes without `structuredClone`.

## [1.0.2] - 2026-08-06

### Fixed
- Generate dashboard and formula IDs when `crypto.randomUUID` is unavailable on non-secure HTTP origins.
- Fall back to `crypto.getRandomValues` and finally to a non-security-sensitive UUID v4 generator.

## [1.0.1] - 2026-08-05

### Changed
- Reduced the synchronous addon bootstrap from the full dashboard bundle to a minimal route registrar.
- Load the dashboard engine and visualization UI only when the Statistics route is rendered.
- Package every generated JavaScript chunk with portable forward-slash ZIP paths.

### Fixed
- Added a bootstrap error boundary so lazy-route failures remain visible and are logged.

## [1.0.0] - 2026-08-05

### Added
- Initial release of activity-statistics-builder addon
- Activity-based statistics builder and dashboard
- Integration with Wealthfolio Addon SDK 3.6.2
- Sidebar navigation integration for easy access
- Responsive design for all screen sizes
- Statistics dashboard with persistent responsive widget layouts.
- Value, table, line, bar, and currency-separated pie visualizations.
- Decimal aggregation/formula engine, filters, periods, grouping, cumulative sums, and drill-down.
- Live widget builder preview and automatic portfolio refresh handling.

### Features
- A Wealthfolio addon for activity-statistics-builder
- User-friendly interface
- Compatible with Wealthfolio platform

### Permissions
- UI components access for sidebar and routing
