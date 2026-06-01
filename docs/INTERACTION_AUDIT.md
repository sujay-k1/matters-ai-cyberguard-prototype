| Surface | Control | Expected result | Implementation status | QA result |
|---|---|---|---|---|
| Work Queue | Segments | Filter All, Cases, Alerts | Implemented | Pass |
| Work Queue | Search | Filter queue rows | Implemented | Pass |
| Work Queue | Sorting | Reorder rows by selected sort | Implemented | Pass |
| Work Queue | Columns | Open customize columns modal | Implemented | Pass |
| Work Queue | Filter families | Open filter flyout and apply values | Implemented | Pass |
| Work Queue | Clear filters | Clear active filters | Implemented | Pass |
| Work Queue | Row preview | Open preview drawer | Implemented | Pass |
| Work Queue | Selection | Select rows without opening preview | Implemented | Pass |
| Work Queue | Bulk assign | Update selected assignees | Implemented | Pass |
| Work Queue | Bulk status | Update selected statuses | Implemented | Pass |
| Work Queue | Bulk consolidate | Open merge review | Implemented | Pass |
| Work Queue | Bulk tags | Add tag to selected items | Implemented | Pass |
| Work Queue | Pagination | Navigate result pages | Implemented | Pass |
| Preview | Close | Close preview drawer | Implemented | Pass |
| Preview | Assign to me / Reassign | Update assignee and log activity | Implemented | Pass |
| Preview | Status | Update status or reopen | Implemented | Pass |
| Preview | Open investigation | Open investigation modal | Implemented | Pass |
| Preview | Change severity | Require comment and update severity | Implemented | Pass |
| Preview | Add comment | Open comment modal and save comment | Implemented | Pass |
| Preview | Edit tags | Open tag editor and save tags | Implemented | Pass |
| Preview | Rename case | Open rename modal and save title | Implemented | Pass |
| Preview | Reopen | Require reopening comment | Implemented | Pass |
| Preview | Activity log | Switch to module activity log | Implemented | Pass |
| Preview | Classify | Open classification modal | Implemented | Pass |
| Preview | Review related alerts | Open investigation evidence context | Implemented | Pass |
| Preview | Consolidate into case | Seed merge review with related alerts | Implemented | Pass |
| Investigation Header | Classify item | Open classification modal | Implemented | Pass |
| Investigation Header | Resolve | Open resolution modal | Implemented | Pass |
| Investigation Header | More actions | Open overflow actions | Implemented | Pass |
| Investigation Header | Add comment | Open note modal | Implemented | Pass |
| Investigation Header | View activity | Switch to Activity tab | Implemented | Pass |
| Investigation Header | Change severity | Open severity override modal | Implemented | Pass |
| Investigation Header | Status | Open status selector | Implemented | Pass |
| Investigation Header | Assign / Reassign | Open assignee flow | Implemented | Pass |
| Investigation Header | Close | Close investigation and return to queue context | Implemented | Pass |
| Summary | Task complete | Toggle completion and log activity | Implemented | Pass |
| Summary | Add task | Open task modal and add task | Implemented | Pass |
| Summary | Assign task | Open owner modal and update owner | Implemented | Pass |
| Summary | Quick note | Add note to workspace | Implemented | Pass |
| Summary | Hypothesis | Open hypothesis modal and update text | Implemented | Pass |
| Timeline | Filters | Filter timeline items | Implemented | Pass |
| Timeline | Relevance | Toggle relevant / irrelevant | Implemented | Pass |
| Timeline | Add note | Open note modal | Implemented | Pass |
| Timeline | Attach / detach | Synchronize timeline and evidence attachment | Implemented | Pass |
| Timeline | Open related alert | Open alert detail dialog | Implemented | Pass |
| Timeline | View raw evidence | Open evidence detail when linked; disabled with explanation when unavailable | Implemented | Pass |
| Alert detail | Relevance | Toggle alert relevance | Implemented | Pass |
| Alert detail | Add note | Open note modal | Implemented | Pass |
| Alert detail | Detach | Detach alert from case and restore standalone queue item | Implemented | Pass |
| Alert detail | Move to another case | Open move modal and update source/destination composition | Implemented | Pass |
| Alert detail | Evidence links | Open linked evidence dialog | Implemented | Pass |
| Alert detail | Entity links | Open related entity dialog | Implemented | Pass |
| Evidence detail | Verdict | Toggle relevant / irrelevant | Implemented | Pass |
| Evidence detail | Attach / detach | Synchronize evidence and timeline state | Implemented | Pass |
| Evidence detail | Add note | Open note modal | Implemented | Pass |
| Evidence detail | Hunt | Open hunt results modal | Implemented | Pass |
| Evidence detail | Open related alert | Open linked alert dialog | Implemented | Pass |
| Evidence detail | Raw JSON | Toggle raw JSON view when available | Implemented | Pass |
| Evidence detail | Open in source system | Prototype-only toast | Implemented | Pass |
| Entity detail | View all activity | Switch detail dialog to activity mode | Implemented | Pass |
| Entity detail | Compare with baseline | Switch detail dialog to baseline mode | Implemented | Pass |
| Entity detail | Hunt | Open hunt results modal | Implemented | Pass |
| Entity detail | Add note | Open note modal | Implemented | Pass |
| Entity detail | Evidence links | Open evidence from related activity | Implemented | Pass |
| Actions | View details | Open action detail dialog | Implemented | Pass |
| Actions | Request approval / Approve / Reject / Start / Complete / Fail / Retry / Cancel | Follow valid state transitions only | Implemented | Pass |
| Actions | Escalate | Open escalation modal or escalate from failed action | Implemented | Pass |
| Activity Log | Filters | Filter by search, actor type, action type, item type, system, result, time | Implemented | Pass |
| Activity Log | Row detail | Open activity detail dialog | Implemented | Pass |
| Activity Log | Open work item | Return to queue and open matching preview | Implemented | Pass |
| Overview | Metric tiles | Switch to queue with applied preset | Implemented | Pass |
| Overview | Applied preset clear | Remove preset and restore normal queue browsing | Implemented | Pass |
| Resolution | Normal resolve | Resolve without exception when warnings absent | Implemented | Pass |
| Resolution | Resolve with exception | Require exception reason and log result | Implemented | Pass |
| Resolution | Resolve all child alerts | Preserve child history and resolve children | Partially implemented | Needs live QA |
| Resolution | Detach selected children | Detach selected alerts and keep them open | Partially implemented | Needs live QA |
| Resolution | Reopen | Preserve last resolution and increment reopened count | Implemented | Pass |
