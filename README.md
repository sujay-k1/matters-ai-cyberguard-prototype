# CyberGuard Work Queue Prototype

Interactive React prototype for the Matters.ai Senior UI/UX Design assignment, focused on a Carbon-based desktop Work Queue for Alerts & Case Management.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Interaction summary

- Carbon-style global header with Overview, Work Queue, and Activity Log tabs
- Desktop Work Queue with direct filter families, nested filter flyouts, queue search, sorting, pagination, and sticky pinned columns
- Right-side triage-first preview drawer for alerts and cases with sticky decision header, inline assignee/status actions, recommended next step, quick facts, and progressive disclosure accordions
- Carbon `ComposedModal` investigation workspace with Summary, Timeline, Alerts & Evidence, Entities & Assets, Actions, and Activity tabs
- Bulk selection, assignment, status change, tagging, and case consolidation review flow
- Column customization with visibility toggles and drag-reordering
- Keyboard shortcuts and query-string review presets
- Local-only investigation interactions including tasks, notes, hypothesis editing, evidence relevance, entity detail panels, and simulated response planning

## Shortcuts

- `/` focuses queue search
- `?` opens the shortcut guide
- `G` then `F` focuses filters and enables filter-navigation mode
- `G` then `T` focuses the toolbar
- `G` then `L` focuses the list area
- `G` then `P` focuses pagination
- `Esc` closes flyouts, drawer, modal, or keyboard mode

## URL state presets

- `/?state=default`
- `/?state=preview`
- `/?state=alert-preview`
- `/?state=investigation`
- `/?state=investigation-timeline`
- `/?state=investigation-evidence`
- `/?state=investigation-entities`
- `/?state=investigation-actions`
- `/?state=investigation-activity`
- `/?state=investigation-cloud-exposure`
- `/?state=filter-open`
- `/?state=bulk-selected`
- `/?state=merge-review`
- `/?state=columns-open`
- `/?state=shortcut-guide`

## GitHub repository URL

https://github.com/sujay-k1/matters-ai-cyberguard-prototype

## Prototype limitations

- No backend
- Local UI state resets on refresh
- Overview is intentionally lightweight
- Activity Log is intentionally lightweight
- Response execution is simulated locally and does not trigger real external actions
- Full remediation workflows will be designed next
- Stitch references were used read-only and did not include dedicated filter-open or bulk-selection screens
