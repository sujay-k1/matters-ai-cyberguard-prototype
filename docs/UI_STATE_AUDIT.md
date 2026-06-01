| Surface | State | User message | Recovery action | Implemented | QA result |
|---|---|---|---|---|---|
| Global shell | Investigation partial | Some telemetry sources are temporarily unavailable. Loaded evidence remains available. | Continue investigation | Yes | Build verified |
| Overview | Loading | Calculating operational metrics… | None | Yes | Build verified |
| Overview | Empty | No urgent items require attention. | None | Yes | Build verified |
| Overview | Partial | Some Overview metrics could not be calculated. Showing available operational data. | Retry | Yes | Build verified |
| Work Queue | Loading | Loading work items | None | Yes | Build verified |
| Work Queue | Refreshing | Refreshing work items… | None | Yes | Build verified |
| Work Queue | Empty | No alerts or cases require attention. | None | Yes | Build verified |
| Work Queue | No results | No work items match the current search / filters / preset / segment. | Clear search / filters / preset | Yes | Build verified |
| Work Queue | Error | Unable to load work items. | Retry | Yes | Build verified |
| Filter panel | Family search no results | No filter families match the current search. | Clear search | Yes | Build verified |
| Filter panel | Metadata warning | Some filter metadata could not be loaded. Queue browsing remains available. | Retry | Yes | Build verified |
| Preview drawer | Loading | Retrieving item details… | None | Yes | Build verified |
| Preview drawer | AI loading | Generating AI summary… | Continue review | Yes | Build verified |
| Preview drawer | AI unavailable | AI summary unavailable. Review quick facts and evidence directly. | Continue review | Yes | Build verified |
| Investigation shell | Loading | Retrieving correlated evidence… | None | Yes | Build verified |
| Investigation shell | Error | Unable to load investigation workspace. | Retry / Return to queue | Yes | Build verified |
| Summary | AI loading | Generating investigation summary… | Continue review | Yes | Build verified |
| Summary | AI unavailable | AI summary unavailable. Review the timeline and evidence directly. | Continue review | Yes | Build verified |
| Summary | Empty tasks | No investigation tasks yet. | Add task | Yes | Build verified |
| Timeline | Loading | Retrieving correlated timeline events… | None | Yes | Build verified |
| Timeline | Empty | No timeline events are attached to this investigation yet. | Go hunt | Yes | Build verified |
| Timeline | No results | No timeline events match the current filters. | Clear timeline filters | Yes | Build verified |
| Timeline | Error | Unable to retrieve timeline events. | Retry | Yes | Build verified |
| Alerts & Evidence | Loading | Loading alerts and evidence | None | Yes | Build verified |
| Alerts & Evidence | Alerts empty | No alerts are currently attached to this case. | Go hunt | Yes | Build verified |
| Alerts & Evidence | Evidence empty | No evidence items are attached yet. | Go hunt | Yes | Build verified |
| Alerts & Evidence | Evidence error | Unable to retrieve evidence items. | Retry | Yes | Build verified |
| Evidence detail | Raw record unavailable | Raw source record is unavailable for this normalized evidence item. | Continue with normalized evidence | Partially | Needs live QA |
| Entities | Loading | Identifying people, devices, resources, and destinations… | None | Yes | Build verified |
| Entities | Empty | No entities or assets have been identified yet. | Go hunt | Yes | Build verified |
| Entities | Relationship empty | Relationship view will appear after related entities are identified. | Continue review | Yes | Build verified |
| Baseline | Error | Unable to calculate baseline comparison. | View all activity / Go hunt | Partially | Needs live QA |
| Actions | Loading | Loading response actions | None | Yes | Build verified |
| Actions | Empty | No immediate response actions are recommended. | Continue investigation | Yes | Build verified |
| Containment | Derivation error | Unable to derive containment state. Review required action progress manually. | Retry | Yes | Build verified |
| Case Activity | Empty | No analyst or system activity has been recorded yet. | None | Yes | Build verified |
| Case Activity | No results | No activity events match the current filters. | Adjust filter context | Yes | Build verified |
| Case Activity | Error | Unable to retrieve activity history. | Retry | Yes | Build verified |
| Module Activity Log | Loading | Loading activity history | None | Yes | Build verified |
| Module Activity Log | Empty | No activity has been recorded yet. | None | Yes | Build verified |
| Module Activity Log | No results | No activity events match the current filters. | Clear filters | Yes | Build verified |
| Module Activity Log | Error | Unable to retrieve activity history. | Retry | Yes | Build verified |
| Hunt | Loading | Searching related activity… | None | Yes | Build verified |
| Hunt | Empty | No additional related activity was found. | Continue investigation | Yes | Build verified |
| Hunt | No results | No hunt results match your search. | Clear search | Yes | Build verified |
| Hunt | Error | Unable to search related activity. | Retry | Yes | Build verified |
| Source system launch | Prototype-only | Source-system launch simulated | Copy record ID / Close | Yes | Needs live QA |
| Source system launch | Integration unavailable | Unable to open source-system record | Retry / Continue investigation | Yes | Needs live QA |
| Source system launch | Permission denied | Permission required | Continue investigation | Yes | Needs live QA |
| Source system launch | Record unavailable | Source record unavailable | Continue investigation | Yes | Needs live QA |
| Source system launch | Timeout | Source system did not respond | Retry / Continue investigation | Yes | Needs live QA |
| Approval | Submit error | Approval routing failed. | Retry | Yes | Build verified |
| Escalation | Submit error | Handoff failed. | Retry | Yes | Build verified |
| Resolution | Submit error | Resolution could not be saved. | Retry | Yes | Build verified |
| Merge | Submit error | Not fully simulated in this pass. | N/A | Partially | Needs live QA |
| Classification | Submit error | Not fully simulated in this pass. | N/A | Partially | Needs live QA |
| Reopen | Normal flow | Required reopen comment remains enforced. | Submit comment | Preserved | Needs live QA |
