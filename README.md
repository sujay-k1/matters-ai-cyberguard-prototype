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
- Right-side triage-first preview drawer for alerts and cases with sticky decision header, inline assignee/status actions, classification, recommended next step, quick facts, and progressive disclosure accordions
- Carbon `ComposedModal` investigation workspace with Summary, Timeline, Alerts & Evidence, Entities & Assets, Actions, and Activity tabs
- Shared local workflow state so investigation updates survive modal close and reopen during the current browser session
- Interaction hardening pass so core visible controls do not dead-end silently; where an action remains simulated, the UI now says so explicitly
- Investigation workspace keeps its header-first action model; the workspace footer remains intentionally removed
- Guarded response-action workflow with approval, rejection, failure, retry, cancellation, derived containment, and simulated remediation progress
- Classification, resolution, resolve-with-exception, escalation / handoff, and lightweight hunt-result attachment flows
- Timeline and evidence attachment decisions stay synchronized, alert detachment restores standalone queue work, and Overview tiles apply real queue presets
- Module-level Activity Log with row detail and Open work item routing back into the queue
- Analyst Overview with immediate-attention metrics, workflow load, and click-through into the Work Queue
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
- `/?state=response-action`
- `/?state=pending-approval`
- `/?state=failed-action`
- `/?state=resolve-case`
- `/?state=resolve-exception`
- `/?state=classification`
- `/?state=handoff`
- `/?state=raw-evidence`
- `/?state=hunt-results`
- `/?state=timeline-detached`
- `/?state=alert-detail`
- `/?state=entity-baseline`
- `/?state=move-alert`
- `/?state=module-activity-log`
- `/?state=overview`
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
- Response execution is simulated locally and does not trigger real external actions
- No real external remediation, source-system links, or hunt execution occurs
- Core visible controls are wired locally, but external-source actions remain explicitly prototype-only
- Overview, Activity Log, and workflow metrics are derived from local fixture state plus local analyst interactions
- Resolve-with-exception, escalation, and approval flows are prototype-only governance interactions
- Stitch references were used read-only and did not include dedicated filter-open or bulk-selection screens

## AI provenance and AI-assisted drafting

- AI-authored interpretation is now labeled explicitly instead of being blended with deterministic analytics or evidence.
- Deterministic calculations such as containment and baseline comparison are labeled as system-derived rather than AI.
- Normalized evidence and raw source records are visually distinguished from AI summaries and analyst-authored notes.
- Key analyst text fields now support deterministic local draft suggestions with a `Tab to accept` interaction.
- Accepted drafts track saved provenance as `AI-assisted` or `AI-assisted · edited` when the analyst changes the accepted text before saving.
- Suggestions are generated locally from fixtures, playbooks, workflow state, and selected item context.
- No external AI service or runtime LLM call is used anywhere in the prototype.

Additional review states:
- `/?state=ai-provenance-preview`
- `/?state=ai-provenance-investigation`
- `/?state=ai-suggestion-resolution`
- `/?state=ai-suggestion-approval`
- `/?state=system-derived-baseline`
- `/?state=system-derived-containment`
