## Figma capture strategy

- Use remote Figma MCP.
- Create one Figma Design file in personal Drafts.
- Capture all states into that same Draft file.
- Prefer Entire screen for contextual overlays.
- Use Select element only for component close-ups.
- Arrange and rename frames manually in Figma after capture.
- Wire only the primary flow manually.
- Keep the operational-state gallery static.

| Section | Order | Frame name | Route or manual interaction | Overlay? | Capture type | Captured? | Notes |
|---|---:|---|---|---|---|---|---|
| 00 — Cover and reading guide | 1 | Cover — CyberGuard prototype | `/public/figma-capture-index.html` | No | Entire screen | No | Use as capture launchpad / reading guide |
| 01 — Core analyst journey | 2 | Overview — Default | `/?state=overview` | No | Entire screen | No | Analyst landing surface |
| 01 — Core analyst journey | 3 | Queue — Default | `/?state=default` | No | Entire screen | No | Use app root with no preset or `/?state=default` if supported locally |
| 01 — Core analyst journey | 4 | Preview — CASE-3001 | `/?state=preview` | Drawer | Entire screen | No | Core preview entry |
| 01 — Core analyst journey | 5 | Investigation — CASE-3001 Summary | `/?state=investigation` | Modal | Entire screen | No | Primary investigation entry |
| 01 — Core analyst journey | 6 | Investigation — Timeline | `/?state=investigation-timeline` | Modal | Entire screen | No | Timeline tab |
| 01 — Core analyst journey | 7 | Evidence detail — raw evidence | `/?state=raw-evidence` | Dialog | Entire screen | No | Timeline-driven raw evidence overlay |
| 01 — Core analyst journey | 8 | Investigation — Alerts & Evidence | `/?state=investigation-evidence` | Modal | Entire screen | No | Main alerts/evidence tab |
| 01 — Core analyst journey | 9 | Alert detail — CASE-3001 | `/?state=alert-detail` | Dialog | Entire screen | No | Direct overlay capture |
| 01 — Core analyst journey | 10 | Investigation — Entities & Assets | `/?state=investigation-entities` | Modal | Entire screen | No | Main entities tab |
| 01 — Core analyst journey | 11 | Entity baseline — CASE-3001 | `/?state=entity-baseline` | Dialog | Entire screen | No | Direct overlay capture |
| 01 — Core analyst journey | 12 | Investigation — Actions | `/?state=investigation-actions` | Modal | Entire screen | No | Main actions tab |
| 01 — Core analyst journey | 13 | Response action detail | `/?state=response-action` | Dialog | Entire screen | No | Direct action detail |
| 01 — Core analyst journey | 14 | Pending approval | `/?state=pending-approval` | Dialog | Entire screen | No | Approval-ready action detail |
| 01 — Core analyst journey | 15 | Failed action | `/?state=failed-action` | Dialog | Entire screen | No | Failed action / retry |
| 01 — Core analyst journey | 16 | Escalation handoff | `/?state=handoff` | Modal | Entire screen | No | Escalation modal |
| 01 — Core analyst journey | 17 | Classification | `/?state=classification` | Modal | Entire screen | No | Classification modal |
| 01 — Core analyst journey | 18 | Resolve with exception | `/?state=resolve-exception` | Modal | Entire screen | No | CASE-3001 guarded resolution |
| 01 — Core analyst journey | 19 | Investigation activity | `/?state=investigation-activity` | Modal | Entire screen | No | Case activity tab |
| 01 — Core analyst journey | 20 | Module activity log | `/?state=module-activity-log` | No | Entire screen | No | Top-level activity log |
| 02 — Queue and triage interactions | 21 | Preview — standalone alert | `/?state=alert-preview` | Drawer | Entire screen | No | Alert preview variant |
| 02 — Queue and triage interactions | 22 | Filter panel open | `/?state=filter-open` | Flyout | Entire screen | No | Filter-family interaction |
| 02 — Queue and triage interactions | 23 | Bulk selection | `/?state=bulk-selected` | Bulk bar | Entire screen | No | Selection + bulk actions |
| 02 — Queue and triage interactions | 24 | Merge review | `/?state=merge-review` | Modal | Entire screen | No | Consolidation review |
| 02 — Queue and triage interactions | 25 | Column customizer | `/?state=columns-open` | Modal | Entire screen | No | Table-column customization |
| 02 — Queue and triage interactions | 26 | Shortcut guide | `/?state=shortcut-guide` | Modal | Entire screen | No | Keyboard help |
| 03 — Investigation deep dives | 27 | Evidence detail — normalized | `/?state=evidence-detail` | Dialog | Entire screen | No | Direct evidence overlay |
| 03 — Investigation deep dives | 28 | Evidence detail — raw JSON expanded | `/?state=evidence-raw-json` | Dialog | Entire screen | No | Raw JSON visible |
| 03 — Investigation deep dives | 29 | Entity activity | `/?state=entity-activity` | Dialog | Entire screen | No | Direct entity activity mode |
| 03 — Investigation deep dives | 30 | Move alert to another case | `/?state=move-alert` | Nested modal | Entire screen | No | Alert detail + move modal |
| 03 — Investigation deep dives | 31 | Hunt results | `/?state=hunt-results` | Modal | Entire screen | No | Deterministic hunt results |
| 03 — Investigation deep dives | 32 | Timeline detached | `/?state=timeline-detached` | Modal | Entire screen | No | Detached event state visible |
| 03 — Investigation deep dives | 33 | Investigation cloud exposure | `/?state=investigation-cloud-exposure` | Modal | Entire screen | No | CASE-3002 summary |
| 04 — Response, containment, and resolution | 34 | Action in progress — CASE-3002 | `/?state=action-in-progress` | Modal | Entire screen | No | Review repository sharing scope = In progress |
| 04 — Response, containment, and resolution | 35 | Action completed — CASE-3002 | `/?state=action-completed` | Modal | Entire screen | No | Review repository sharing scope = Completed |
| 04 — Response, containment, and resolution | 36 | Resolve case — normal | `/?state=resolve-case` | Modal | Entire screen | No | CASE-3002 preferred resolution |
| 04 — Response, containment, and resolution | 37 | Reopen item | `/?state=reopen-item` | Modal | Entire screen | No | Resolved representative case + reopen modal |
| 04 — Response, containment, and resolution | 38 | System-derived containment | `/?state=system-derived-containment` | Modal | Entire screen | No | Actions + containment provenance |
| 05 — Responsible AI patterns | 39 | AI provenance — preview | `/?state=ai-provenance-preview` | Drawer | Entire screen | No | AI labels in preview |
| 05 — Responsible AI patterns | 40 | AI provenance — investigation | `/?state=ai-provenance-investigation` | Modal | Entire screen | No | AI labels in summary / rail |
| 05 — Responsible AI patterns | 41 | AI suggestion — resolution | `/?state=ai-suggestion-resolution` | Modal | Entire screen | No | Focus field before capture |
| 05 — Responsible AI patterns | 42 | AI suggestion — approval | `/?state=ai-suggestion-approval` | Modal | Entire screen | No | Focus field before capture |
| 05 — Responsible AI patterns | 43 | System-derived baseline | `/?state=system-derived-baseline` | Dialog | Entire screen | No | Baseline provenance |
| 06 — Operational-state gallery | 44 | Queue loading | `/?state=queue-loading` | No | Entire screen | No | P0 |
| 06 — Operational-state gallery | 45 | Queue refreshing | `/?state=queue-refreshing` | No | Entire screen | No | Preserve rows + inline refresh |
| 06 — Operational-state gallery | 46 | Queue empty | `/?state=queue-empty` | No | Entire screen | No | P0 |
| 06 — Operational-state gallery | 47 | Queue no results | `/?state=queue-no-results` | No | Entire screen | No | P0 |
| 06 — Operational-state gallery | 48 | Queue error | `/?state=queue-error` | No | Entire screen | No | P0 |
| 06 — Operational-state gallery | 49 | Filter no results | `/?state=filter-no-results` | No | Entire screen | No | Compact filter state |
| 06 — Operational-state gallery | 50 | Overview loading | `/?state=overview-loading` | No | Entire screen | No | Skeleton overview |
| 06 — Operational-state gallery | 51 | Overview empty | `/?state=overview-empty` | No | Entire screen | No | Empty overview |
| 06 — Operational-state gallery | 52 | Overview partial error | `/?state=overview-partial-error` | No | Entire screen | No | Partial metrics preserved |
| 06 — Operational-state gallery | 53 | Preview loading | `/?state=preview-loading` | Drawer | Entire screen | No | Skeleton preview |
| 06 — Operational-state gallery | 54 | Preview AI loading | `/?state=preview-ai-loading` | Drawer | Entire screen | No | AI section loading only |
| 06 — Operational-state gallery | 55 | Preview AI error | `/?state=preview-ai-error` | Drawer | Entire screen | No | AI unavailable only |
| 06 — Operational-state gallery | 56 | Investigation loading | `/?state=investigation-loading` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 57 | Investigation error | `/?state=investigation-error` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 58 | Investigation partial | `/?state=investigation-partial` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 59 | Summary AI loading | `/?state=summary-ai-loading` | Modal | Entire screen | No | Summary AI only |
| 06 — Operational-state gallery | 60 | Summary AI error | `/?state=summary-ai-error` | Modal | Entire screen | No | Summary AI unavailable |
| 06 — Operational-state gallery | 61 | Summary empty tasks | `/?state=summary-empty-tasks` | Modal | Entire screen | No | Task empty state |
| 06 — Operational-state gallery | 62 | Timeline loading | `/?state=timeline-loading` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 63 | Timeline empty | `/?state=timeline-empty` | Modal | Entire screen | No | P1 |
| 06 — Operational-state gallery | 64 | Timeline no results | `/?state=timeline-no-results` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 65 | Timeline error | `/?state=timeline-error` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 66 | Evidence loading | `/?state=evidence-loading` | Modal | Entire screen | No | P1 |
| 06 — Operational-state gallery | 67 | Evidence empty | `/?state=evidence-empty` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 68 | Evidence error | `/?state=evidence-error` | Modal | Entire screen | No | P1 |
| 06 — Operational-state gallery | 69 | Entities loading | `/?state=entities-loading` | Modal | Entire screen | No | P1 |
| 06 — Operational-state gallery | 70 | Entities empty | `/?state=entities-empty` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 71 | Baseline error | `/?state=baseline-error` | Dialog | Entire screen | No | P0 |
| 06 — Operational-state gallery | 72 | Actions loading | `/?state=actions-loading` | Modal | Entire screen | No | P1 |
| 06 — Operational-state gallery | 73 | Actions empty | `/?state=actions-empty` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 74 | Containment error | `/?state=containment-error` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 75 | Activity empty | `/?state=activity-empty` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 76 | Activity no results | `/?state=activity-no-results` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 77 | Activity error | `/?state=activity-error` | Modal | Entire screen | No | P1 |
| 06 — Operational-state gallery | 78 | Hunt loading | `/?state=hunt-loading` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 79 | Hunt empty | `/?state=hunt-empty` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 80 | Hunt no results | `/?state=hunt-no-results` | Modal | Entire screen | No | P1 |
| 06 — Operational-state gallery | 81 | Hunt error | `/?state=hunt-error` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 82 | Source-system info | `/?state=source-system-info` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 83 | Source-system unavailable | `/?state=source-system-error` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 84 | Source-system permission denied | `/?state=source-system-permission-denied` | Modal | Entire screen | No | P0 |
| 06 — Operational-state gallery | 85 | Source-system record unavailable | `/?state=source-system-record-unavailable` | Modal | Entire screen | No | P1 |
| 06 — Operational-state gallery | 86 | Source-system timeout | `/?state=source-system-timeout` | Modal | Entire screen | No | P1 |
| 06 — Operational-state gallery | 87 | Approval submit error | `/?state=approval-submit-error` | Modal | Entire screen | No | P1 |
| 06 — Operational-state gallery | 88 | Escalation submit error | `/?state=escalation-submit-error` | Modal | Entire screen | No | P1 |
| 06 — Operational-state gallery | 89 | Resolution submit error | `/?state=resolution-submit-error` | Modal | Entire screen | No | P1 |
| 07 — Overview and Activity Log | 90 | Activity log — default | `/?state=module-activity-log` | No | Entire screen | No | Top-level table |
| 07 — Overview and Activity Log | 91 | Overview — partial operational state | `/?state=overview-partial-error` | No | Entire screen | No | Useful review close-out frame |
