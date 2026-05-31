# Implementation Notes

## Stitch MCP screens used

- Project `48503881178617761` — `Carbon Data Security Workspace`
- Primary visual reference: `9957766507544784295` — `CyberGuard — Work Queue (Default)`
- Secondary visual reference: `d5a2801a12ba4a6789c00884c738a9f8` — `CyberGuard — Work Queue (Preview Open)`
- Additional available screen: `d8028ce0e85c420e8e284c3279846a33` — `CyberGuard — Work Queue (Default)`

## Stitch MCP fallback behavior

- If Stitch metadata or visual states were incomplete, local implementation deferred to:
  - `src/data/cyberguard_work_queue_content_spec_v1.json`
  - `docs/stitch-design.md`
  - manually supplied local screenshots
- No Stitch write operations were used.

## Carbon components used

- `Header`, `HeaderName`, `HeaderGlobalAction`, `HeaderGlobalBar`, `SkipToContent`
- `Search`
- `Button`
- `Dropdown`
- `Toggle`
- `Tag`
- `Checkbox`
- `Modal`
- `ToastNotification`
- `Table`, `TableHead`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`

## Minimal custom wrappers used

- Filter family list and nested flyout positioning
- Sticky pinned table columns and sticky footer bulk bar
- Right-side overlay preview drawer
- Lightweight pagination footer
- DnD column customizer around `@dnd-kit/sortable`

## Decisions made for speed

- Kept the app as one SPA with focused component boundaries and most state in `App.tsx`
- Used the provided JSON fixture directly instead of introducing a mock API layer
- Used Carbon primitives plus targeted SCSS rather than building a custom design system
- Implemented lightweight HTTP-level dev-server verification when full browser automation was unavailable

## Known limitations

- Query-string presets initialize core states, but deeper visual QA still benefits from manual browser review
- Segment counts are driven by the JSON-backed prototype state rather than hard-coded Stitch screenshot totals
- The build emits large bundle warnings because Carbon styles and components are included in one bundle for speed
- No automated screenshot capture was produced in this environment

## Suggested next steps

- Add browser-automation regression checks for each preset state
- Tune responsive behavior for narrower laptop widths
- Split Carbon-heavy views into code-split chunks if bundle size matters
- Expand Overview and Activity Log after downstream workflow scope is defined
