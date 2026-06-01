## Primary flow

Manual wiring order for the Figma prototype:

1. Overview
2. Work Queue
3. Case preview
4. Investigation Summary
5. Timeline
6. Raw evidence overlay
7. Alerts & Evidence
8. Alert-detail overlay
9. Entities & Assets
10. Entity baseline overlay
11. Actions
12. Response-action detail
13. Approval
14. Failed action / retry
15. Escalation
16. Classification
17. Resolution
18. Activity Log

Recommended frame-to-frame mapping:

- `Overview — Default` → `Queue — Default`
- `Queue — Default` → `Preview — CASE-3001`
- `Preview — CASE-3001` → `Investigation — CASE-3001 Summary`
- `Investigation — CASE-3001 Summary` → `Investigation — Timeline`
- `Investigation — Timeline` → `Evidence detail — raw evidence`
- `Investigation — Timeline` → `Investigation — Alerts & Evidence`
- `Investigation — Alerts & Evidence` → `Alert detail — CASE-3001`
- `Investigation — Alerts & Evidence` → `Investigation — Entities & Assets`
- `Investigation — Entities & Assets` → `Entity baseline — CASE-3001`
- `Investigation — Entities & Assets` → `Investigation — Actions`
- `Investigation — Actions` → `Response action detail`
- `Response action detail` → `Pending approval`
- `Response action detail` → `Failed action`
- `Failed action` → `Escalation handoff`
- `Investigation — CASE-3001 Summary` → `Classification`
- `Investigation — CASE-3001 Summary` → `Resolve with exception`
- `Resolve with exception` → `Module activity log`

## Secondary branches

Queue interactions:

- Filter panel open
- Bulk selection
- Merge review
- Column customizer
- Shortcut guide

Investigation deep dives:

- Evidence detail — normalized
- Evidence detail — raw JSON expanded
- Entity activity
- Move alert to another case
- Hunt results
- Timeline detached

Response and resolution variants:

- Action in progress — CASE-3002
- Action completed — CASE-3002
- Resolve case — normal
- Reopen item
- System-derived containment

Responsible AI variants:

- AI provenance — preview
- AI provenance — investigation
- AI suggestion — resolution
- AI suggestion — approval
- System-derived baseline

AI drafting capture notes:

- Capture one frame with the field focused and the suggestion visible.
- Capture one frame after `Tab` acceptance.
- Capture one frame after analyst editing, when useful.
- Prioritize:
  - hypothesis
  - approval justification
  - resolution summary
  - escalation reason

Operational-state gallery:

- Keep this gallery static in Figma.
- Do not prototype every error-state transition.
- Link back only to the primary journey or leave gallery frames unlinked.
