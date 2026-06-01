import { Button, Tag } from '@carbon/react';
import type { InvestigationResponseAction, ResponseActionState } from '../types/investigation';

interface InvestigationActionsProps {
  actions: InvestigationResponseAction[];
  onUpdateActionState: (actionId: string, next: ResponseActionState, note?: string) => void;
  onAddNote: () => void;
}

const ACTION_STATES: ResponseActionState[] = [
  'Recommended',
  'Pending approval',
  'In progress',
  'Completed',
  'Failed',
  'Rejected',
];

export function InvestigationActions({
  actions,
  onUpdateActionState,
  onAddNote,
}: InvestigationActionsProps) {
  return (
    <div className="cg-investigation-tab-stack">
      {ACTION_STATES.map((state) => {
        const grouped = actions.filter((action) => action.currentState === state);
        if (!grouped.length) return null;
        return (
          <section key={state} className="cg-investigation-pane">
            <h3>{state}</h3>
            <div className="cg-investigation-card-list">
              {grouped.map((action) => (
                <article key={action.id} className="cg-investigation-card">
                  <div className="cg-investigation-card__header">
                    <div>
                      <Tag type={actionStateTagType(action.currentState)}>{action.currentState}</Tag>
                      <h4>{action.title}</h4>
                    </div>
                    <span>{action.auditTimestamp}</span>
                  </div>
                  <div className="cg-investigation-definition-list">
                    <div>
                      <dt>Affected entity</dt>
                      <dd>{action.affectedEntity}</dd>
                    </div>
                    <div>
                      <dt>Approval</dt>
                      <dd>{action.approvalRequirement}</dd>
                    </div>
                    <div>
                      <dt>Created by</dt>
                      <dd>{action.createdBy}</dd>
                    </div>
                    <div>
                      <dt>Reversibility</dt>
                      <dd>{action.reversibility}</dd>
                    </div>
                  </div>
                  <p>{action.reason}</p>
                  <p>
                    <strong>Expected effect:</strong> {action.expectedEffect}
                  </p>
                  <p>
                    <strong>Potential business impact:</strong> {action.businessImpact}
                  </p>
                  <div className="cg-investigation-action-row">
                    <Button kind="ghost" size="sm" onClick={() => onUpdateActionState(action.id, 'Pending approval')}>
                      Request approval
                    </Button>
                    <Button kind="ghost" size="sm" onClick={() => onUpdateActionState(action.id, 'In progress')}>
                      Mark in progress
                    </Button>
                    <Button kind="ghost" size="sm" onClick={() => onUpdateActionState(action.id, 'Completed')}>
                      Mark completed
                    </Button>
                    <Button kind="ghost" size="sm" onClick={() => onUpdateActionState(action.id, 'Rejected', 'Rejected in prototype review')}>
                      Reject
                    </Button>
                    <Button kind="ghost" size="sm" onClick={onAddNote}>
                      Add note
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function actionStateTagType(state: ResponseActionState) {
  if (state === 'Completed') return 'green';
  if (state === 'Failed' || state === 'Rejected') return 'red';
  if (state === 'In progress') return 'blue';
  return 'cool-gray';
}
