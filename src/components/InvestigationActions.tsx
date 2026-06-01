import { Button, InlineLoading, Tag, Tooltip } from '@carbon/react';
import type { InvestigationResponseAction, ResponseActionState } from '../types/investigation';
import { InlineStateNotice } from './InlineStateNotice';
import { OperationalState } from './OperationalState';
import { ProvenanceLabel } from './ProvenanceLabel';
import { SectionSkeleton } from './SectionSkeleton';

interface InvestigationActionsProps {
  actions: InvestigationResponseAction[];
  containment: string;
  onOpenAction: (actionId: string) => void;
  onPrimaryAction: (action: InvestigationResponseAction) => void;
  onSecondaryAction: (action: InvestigationResponseAction) => void;
  onAddNote: () => void;
  loading?: boolean;
  empty?: boolean;
  containmentError?: boolean;
  onRetryContainment?: () => void;
}

const ACTION_STATES: ResponseActionState[] = [
  'Recommended',
  'Pending approval',
  'Approved',
  'In progress',
  'Completed',
  'Failed',
  'Rejected',
  'Cancelled',
];

export function InvestigationActions({
  actions,
  containment,
  onOpenAction,
  onPrimaryAction,
  onSecondaryAction,
  onAddNote,
  loading = false,
  empty = false,
  containmentError = false,
  onRetryContainment,
}: InvestigationActionsProps) {
  const requiredContainment = actions.filter((action) => action.requiredForContainment);
  const completed = actions.filter((action) => action.currentState === 'Completed').length;
  const pendingApproval = actions.filter((action) => action.currentState === 'Pending approval').length;
  const inProgress = actions.filter((action) => action.currentState === 'In progress').length;
  const failed = actions.filter((action) => action.currentState === 'Failed').length;

  if (loading) {
    return <SectionSkeleton heading lines={2} cardCount={5} />;
  }

  if (empty || !actions.length) {
    return (
      <OperationalState
        kind="empty"
        title="No immediate response actions are recommended."
        description="Continue investigation or add an analyst note."
      />
    );
  }

  return (
    <div className="cg-investigation-tab-stack">
      <section className="cg-investigation-pane">
        {containmentError ? (
          <InlineStateNotice
            kind="warning"
            title="Unable to derive containment state."
            subtitle="Review required action progress manually."
            actionLabel="Retry"
            onAction={onRetryContainment}
          />
        ) : null}
        <div className="cg-investigation-summary-strip">
          <div><span>Required containment actions</span><strong>{requiredContainment.length}</strong></div>
          <div><span>Completed</span><strong>{completed}</strong></div>
          <div><span>Pending approval</span><strong>{pendingApproval}</strong></div>
          <div><span>In progress</span><strong>{inProgress}</strong></div>
          <div><span>Failed</span><strong>{failed}</strong></div>
          <div>
            <span>Derived containment</span>
            <ProvenanceLabel provenance="System-derived" textLabel="Containment" compact />
            <strong>{containment}</strong>
            <Tooltip align="bottom-left" label={`Required: ${requiredContainment.length} · Completed: ${completed} · Pending approval: ${pendingApproval} · In progress: ${inProgress} · Failed: ${failed}`}>
              <button type="button" className="cg-inline-linklike">Why?</button>
            </Tooltip>
          </div>
        </div>
      </section>

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
                    {action.currentState === 'In progress' ? <InlineLoading description="" status="active" iconDescription="Action in progress" /> : null}
                  </div>
                  <span>{action.auditTimestamp}</span>
                </div>
                <ProvenanceLabel
                  provenance={action.createdBy === 'AI' ? 'AI' : action.createdBy === 'System' ? 'System-derived' : 'Analyst-authored'}
                  textLabel={action.createdBy === 'AI' ? 'Suggested response action' : action.createdBy === 'System' ? 'System action' : 'Analyst added'}
                  compact
                />
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
                  <div className="cg-investigation-ai-insight">
                    <p>{action.reason}</p>
                  </div>
                  <p>
                    <strong>Expected effect:</strong> {action.expectedEffect}
                  </p>
                  <p>
                    <strong>Potential business impact:</strong> {action.businessImpact}
                  </p>
                  <div className="cg-investigation-action-row">
                    <Button kind="ghost" size="sm" onClick={() => onOpenAction(action.id)}>
                      View details
                    </Button>
                    <Button kind="ghost" size="sm" onClick={() => onSecondaryAction(action)}>
                      {secondaryActionLabel(action)}
                    </Button>
                    {primaryActionLabel(action) !== 'View details' ? (
                      <Button kind="secondary" size="sm" onClick={() => onPrimaryAction(action)}>
                        {primaryActionLabel(action)}
                      </Button>
                    ) : null}
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

function primaryActionLabel(action: InvestigationResponseAction) {
  if (action.currentState === 'Recommended') {
    return action.requiresApproval ? 'Request approval' : 'Start action';
  }
  if (action.currentState === 'Pending approval') return 'Approve';
  if (action.currentState === 'Approved') return 'Start action';
  if (action.currentState === 'In progress') return 'Mark completed';
  if (action.currentState === 'Failed') return 'Retry';
  if (action.currentState === 'Rejected') return 'Request again';
  return 'View details';
}

function secondaryActionLabel(action: InvestigationResponseAction) {
  if (action.currentState === 'Pending approval') return 'Reject';
  if (action.currentState === 'In progress') return 'Mark failed';
  if (action.currentState === 'Failed') return 'Escalate';
  if (action.currentState === 'Recommended' || action.currentState === 'Rejected' || action.currentState === 'Approved') {
    return 'Cancel action';
  }
  return 'Close';
}

function actionStateTagType(state: ResponseActionState) {
  if (state === 'Completed') return 'green';
  if (state === 'Failed' || state === 'Rejected' || state === 'Cancelled') return 'red';
  if (state === 'In progress') return 'blue';
  if (state === 'Approved') return 'teal';
  return 'cool-gray';
}
