# State Transition QA

| Scenario | Initial state | Interaction | Expected next state | Verified |
|---|---|---|---|---|
| CASE-3002 repository review | Approved | Start action | In progress | Code path updated; build passed; live browser QA pending |
| CASE-3002 repository review | In progress | Mark completed | Completed | Code path updated; build passed; live browser QA pending |
| CASE-3001 Snowflake suspension | Pending approval | Approve | Approved | Code path updated; build passed; live browser QA pending |
| CASE-3001 Snowflake suspension | Approved | Start action | In progress | Code path updated; build passed; live browser QA pending |
| CASE-3001 endpoint isolation | Failed | Retry | In progress | Code path updated; build passed; live browser QA pending |
| Running containment action | In progress | Mark completed | Contained when all required actions complete | Code path updated; build passed; live browser QA pending |
| Add note | Existing notes | Save note | Note and activity both persist | Atomic workspace mutation implemented; live browser QA pending |
| Add task | Existing tasks | Save task | Task and activity both persist | Atomic workspace mutation implemented; live browser QA pending |
| Attach hunt result | Detached hunt result | Attach | Evidence, timeline, and activity persist | Atomic workspace mutation implemented; live browser QA pending |
| Timeline detach | Attached event | Detach | Timeline and matching evidence detach | Shared sync path retained; live browser QA pending |
| Evidence attach | Detached evidence | Attach | Evidence and matching timeline attach | Shared sync path retained; live browser QA pending |

## Notes

- This pass fixes the stale React snapshot overwrite by making investigation-domain mutation and workspace activity append happen in a single workspace update.
- `updateWorkspaceState` now derives from the latest item and workspace refs so rapid sequential updates do not compute from an older pre-update workspace snapshot.
- Browser-based walkthrough verification is still recommended for the full deterministic scenarios after pulling the latest commit.
