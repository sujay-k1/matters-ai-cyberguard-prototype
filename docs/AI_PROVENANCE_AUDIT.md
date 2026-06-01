| Surface | Content | Source | Required UI marker | Implemented | QA result |
|---|---|---|---|---|---|
| Preview | AI summary | AI | `AILabel` summary marker | Yes | Build verified |
| Preview | Risk interpretation | AI | `Risk interpretation` provenance label | Yes | Build verified |
| Preview | Recommended next step | AI | `Suggested next step` provenance label | Yes | Build verified |
| Preview | Grouping rationale | AI | `Correlation rationale` provenance label | Yes | Build verified |
| Preview | Correlation suggestion | AI | `Correlation suggestion` provenance label | Yes | Build verified |
| Preview | AI summary loading / unavailable | AI | Preserve `AILabel` while showing loading or unavailable state | Yes | Build verified |
| Investigation summary | AI summary | AI | Existing `AILabel` summary marker | Yes | Build verified |
| Investigation summary | Suggested checks | AI | `Suggested investigation checks` provenance label | Yes | Build verified |
| Investigation summary | Open questions | AI | `Suggested open questions` provenance label | Yes | Build verified |
| Investigation summary | Grouping rationale | AI | `Correlation rationale` provenance label | Yes | Build verified |
| Investigation summary | Hypothesis provenance | Analyst / AI-assisted | Draft-source label in right rail | Yes | Build verified |
| Alerts & evidence | Alert linking rationale | AI | `Correlation rationale` provenance label | Yes | Build verified |
| Alerts & evidence | Evidence description | Normalized evidence | `Normalized evidence` label | Yes | Build verified |
| Alerts & evidence | Raw JSON | Raw evidence | `Raw source record` label | Yes | Build verified |
| Alerts & evidence | Raw record unavailable | Raw evidence unavailable | Explicit unavailable state without AI labeling | Yes | Build verified |
| Alerts & evidence | Relevance verdict source | AI or Analyst | Subtle verdict-source line | Yes | Build verified |
| Entities | Entity summary | AI | `Entity risk summary` provenance label | Yes | Build verified |
| Entities | Suggested checks | AI | `Suggested checks` provenance label | Yes | Build verified |
| Entities | Response candidates | AI | `Suggested response candidates` provenance label | Yes | Build verified |
| Entities | Baseline comparison | System-derived | `Baseline comparison` provenance label | Yes | Build verified |
| Actions | AI-created actions | AI | `Suggested response action` provenance label | Yes | Build verified |
| Actions | Analyst-created actions | Analyst-authored | `Analyst added` provenance label | Yes | Build verified |
| Actions | System actions | System-derived | `System action` provenance label | Yes | Build verified |
| Actions | Containment derivation | System-derived | `Containment` provenance label + Why? | Yes | Build verified |
| Merge review | Proposed title | AI | `AI suggested` helper copy | Yes | Build verified |
| Merge review | Severity roll-up | System-derived | `System-derived` helper copy | Yes | Build verified |
| Merge review | Priority recalculation | System-derived | `System-derived` helper copy | Yes | Build verified |
| Merge review | Status roll-up | System-derived | `System-derived` helper copy | Yes | Build verified |
| Merge review | Conflict warnings | System guardrail | `System guardrail` helper copy | Yes | Build verified |
| Text inputs | Hypothesis | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Task title | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Severity override | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Reopen reason | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Merge reopen reason | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Approval justification | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Rejection reason | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Cancellation reason | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Move-alert reason | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Classification comment | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Resolution fields | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Escalation reason | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Escalation note | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | General note | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
| Text inputs | Quick note | AI-assisted drafting | Tab-to-accept suggestion hint | Yes | Build verified |
