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
- `ComposedModal`, `ModalHeader`, `ModalBody`
- `Dropdown`
- `Tabs`, `TabList`, `Tab`, `TabPanels`, `TabPanel`
- `Toggle`
- `Tag`
- `Checkbox`
- `Modal`
- `ToastNotification`
- `TextArea`
- `ComboBox`
- `Accordion`, `AccordionItem`
- `Table`, `TableHead`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`

## Minimal custom wrappers used

- Filter family list and nested flyout positioning
- Sticky pinned table columns and sticky footer bulk bar
- Right-side overlay preview drawer with triage-first sticky header/footer and accordion sections
- Large Carbon `ComposedModal` investigation workspace with split-body layout, sticky header, and inline detail dialogs
- Lightweight pagination footer
- DnD column customizer around `@dnd-kit/sortable`

## Decisions made for speed

- Kept the app as one SPA with focused component boundaries and most state in `App.tsx`
- Used the provided JSON fixture directly instead of introducing a mock API layer
- Used Carbon primitives plus targeted SCSS rather than building a custom design system
- Refactored the preview drawer around existing `WorkItem` and `preview` payload fields instead of introducing a second data model
- Implemented lightweight HTTP-level dev-server verification when full browser automation was unavailable

## Shared workflow state

- Added a lightweight local workflow-state hook instead of introducing Redux, Zustand, MobX, or another dependency
- Investigation workspace state is now keyed by item ID and survives modal close / reopen during the current browser session
- Queue composition updates, alert restoration, classification, escalation metadata, and local audit events now route through the same shared workflow layer
- Shared workflow state also drives:
  - derived containment
  - classification
  - resolution history
  - escalations
  - hunt-result attachment
  - module-level Activity Log aggregation
  - Overview metrics

## Preview drawer refinements

- Redesigned the preview drawer as a triage-first panel with a sticky decision header, an above-the-fold brief, and expandable supporting context
- Moved assignment and workflow-status actions inline beside their current values for faster updates during triage
- Added severity override safeguards with a mandatory analyst comment and a visible override indicator
- Added a reopening rule so resolved work must collect a comment before moving back into an open workflow state
- Kept workflow status and containment separate in the drawer and in shared status-option constants
- Replaced the long flat section list with Carbon accordion groupings for scope, case composition or correlation, intelligence, and detection details
- Split case and alert rendering paths so cases show composition and alerts show correlation guidance
- Suppressed low-value fields like repeated `Not applicable` destination values from the quick-facts layer
- Updated merge review to show conservative merged workflow status roll-up and require a reopen comment when open work is merged into a resolved destination case
- Preview overflow actions now complete local workflows for comments, tags, rename, classification, reopen, related-alert review, and consolidation seeding

## Investigation workspace

- Replaced the placeholder investigation modal with a Carbon `ComposedModal` so the queue remains dimly visible underneath while preserving the current preview and queue context
- Preserved the header-first investigation design and intentionally kept the investigation workspace footer removed
- Preserved information continuity from the preview drawer by carrying identity, urgency, triage brief, scope, correlation, and AI intelligence into the Summary tab
- Added a compositional risk-playbook model keyed by risk type to generate recommended checks, likely response actions, and false-positive explanations
- Added config-driven system evidence modules so investigation guidance can adapt to databases, endpoints, cloud, network, SaaS, identity, and other system categories without creating separate pages
- Added a polished hero fixture for `CASE-3001`, a contrasting cloud-exposure fixture for `CASE-3002`, and generic fallback investigation generation for any selected alert or case
- Kept assignee, workflow status, severity override, and reopen controls wired to shared queue state so changes stay synchronized across the table, preview drawer, and investigation header
- Implemented local-only investigation interactions for tasks, notes, hypothesis editing, timeline relevance, evidence relevance, entity panels, and response-action state changes
- Timeline and evidence detail now share synchronized attach / detach state, and timeline raw-evidence actions hide or disable when no evidence exists
- Alert-detail workflows now support detaching alerts back into the Work Queue, moving alerts to another case, and opening related evidence and entities
- Entity-detail workflows now support Overview, Activity, and Baseline modes without leaving the dialog pattern
- Deferred the real remediation workflow and all external integrations while keeping response planning visible in the Actions tab

## Response and resolution workflow

- Response actions now follow a guarded local state machine rather than exposing every state transition at once
- Containment is derived from action progress and is not manually editable
- Workflow status remains separate from containment and can still be manually overridden by the analyst
- Added:
  - approval request
  - approval
  - rejection with mandatory comment
  - failure with mandatory reason
  - retry
  - cancellation
  - escalation / handoff
- Added classification and resolution flows with local guardrails
- Resolve-with-exception requires a mandatory comment when open warnings remain
- Child-alert handling supports default resolution or selective detach-keep-open behavior, with composition synchronization and standalone alert restoration
- Previous resolution state is preserved when a resolved item is reopened

## Activity and overview

- Added a module-level Activity Log that aggregates queue updates, investigation events, remediation progress, containment changes, classifications, resolutions, reopenings, handoffs, evidence attachment changes, alert moves, and comments
- Deduplicated overlapping queue / workspace / global activity entries before rendering the module log
- Added an analyst-operational Overview surface with immediate-attention metrics, workflow load, risk-pattern rollups, and Work Queue click-through actions
- Overview click-through now uses real queue presets rather than relying on queue-search text for approval and failed-action scenarios

## Lightweight hunting and detail depth

- Added a deterministic lightweight hunt-results flow instead of a full hunt engine
- Added raw-evidence view, alert detail, richer evidence detail, and deeper entity-detail sections without introducing new full-screen routes

## Classification and escalation metadata

- Classification records now preserve analyst comment, timestamp, duplicate-case context, accepted-risk owner, and false-positive tuning-feedback intent
- Escalation records now preserve team, urgency, note, task owner, and data-owner notification intent
- These metadata fields are shown in activity surfaces and remain available through the current browser session

## Known limitations

- Query-string presets initialize core states, but deeper visual QA still benefits from manual browser review
- Segment counts are driven by the JSON-backed prototype state rather than hard-coded Stitch screenshot totals
- The build emits large bundle warnings because Carbon styles and components are included in one bundle for speed
- No automated screenshot capture was produced in this environment
- The investigation workspace uses static hero fixtures plus deterministic fallback generation rather than real cross-system evidence retrieval
- Nested investigation note and task workflows are local-only and reset on refresh
- Activity Log and Overview are local aggregations rather than backend-backed operational telemetry
- Child-alert detach, move-to-case, and composition recalculation flows remain intentionally lightweight and deterministic
- Remediation execution, approvals, escalations, and source-system links are simulated
- Investigation footer remains intentionally removed; header actions are the primary control surface

## Suggested next steps

- Add browser-automation regression checks for each preset state
- Tune responsive behavior for narrower laptop widths
- Split Carbon-heavy views into code-split chunks if bundle size matters
- Expand Overview and Activity Log after downstream workflow scope is defined
