# Prototype Scope

## Work Queue purpose

The prototype supports security analysts triaging alerts and cases in one enterprise work surface, with quick prioritization, filtering, preview, and consolidation actions.

## Object model

Events / evidence → Alerts → Optional cases → Remediation → Resolution

## Unified Work Queue

- `All`
- `Cases`
- `Alerts`

The queue is designed so standalone alerts and grouped cases can be reviewed within the same operator workspace.

## Key triage fields

- Type
- Priority
- Severity
- Title
- Affected systems
- Risk type
- Data sensitivity
- Status
- Assignee
- SLA
- Last activity
- Alert count
- ID
- Key resource
- Primary actor / entity
- Detection time
- Containment
- Detection source

## Filter-panel rationale

All filter families remain directly visible to reduce hunting and mode-switching. Search narrows the family list, and nested flyouts preserve density without introducing a separate “More filters” bucket.

## Keyboard-navigation rationale

The shortcut model lets reviewers jump quickly between search, filters, the table, and pagination. Filter-navigation mode makes the dense filter panel usable without relying entirely on a mouse.

## Preview-drawer rationale

The right-side overlay drawer preserves list context while giving analysts enough structured detail to assign, escalate, or consolidate items quickly.

## Investigation workflow

Queue → Preview triage → Investigation workspace → Response planning → Resolution

The full investigation workspace extends the preview drawer into a richer overlay without navigating away from the queue, so analysts can validate evidence and plan response actions while keeping the Work Queue context underneath.

## Pagination rationale

Pagination keeps the table readable while supporting larger fixture sets. Page size changes, filters, search, sorting, and segments all work together and reset to page 1 when the result set changes.

## Column-customization rationale

Analysts can tailor the queue to their current task while preserving the core pinned hierarchy of Type, Priority, Severity, and Title.

## Bulk-consolidation rules

- Two or more alerts create a new case
- One case plus one or more alerts adds alerts to an existing case
- Two or more cases merge into a destination case
- Mixed case-and-alert selections merge into one destination case
- Priority recalculation uses highest severity, affected-system breadth, sensitive-data scope, active exposure, and containment state, capped at 100
