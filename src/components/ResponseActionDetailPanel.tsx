import { Button, Tag } from '@carbon/react';
import type { InvestigationResponseAction } from '../types/investigation';

interface ResponseActionDetailPanelProps {
  action: InvestigationResponseAction | null;
  primaryActionLabel?: string;
  onClose: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export function ResponseActionDetailPanel({
  action,
  primaryActionLabel,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
  secondaryActionLabel,
}: ResponseActionDetailPanelProps) {
  if (!action) return null;

  return (
    <aside className="cg-investigation-detail-panel" aria-label="Response action detail">
      <div className="cg-investigation-detail-panel__header">
        <div>
          <p className="cg-eyebrow">Response action</p>
          <h3>{action.title}</h3>
        </div>
        <Button kind="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="cg-investigation-detail-panel__body">
        <div className="cg-investigation-definition-list">
          <div><dt>State</dt><dd><Tag type="cool-gray">{action.currentState}</Tag></dd></div>
          <div><dt>Target entity</dt><dd>{action.affectedEntity}</dd></div>
          <div><dt>Approval</dt><dd>{action.approvalRequirement}</dd></div>
          <div><dt>Requester</dt><dd>{action.approvalRequestedBy ?? action.createdBy}</dd></div>
          <div><dt>Approver</dt><dd>{action.approver ?? action.approverRole ?? 'Pending'}</dd></div>
          <div><dt>Retry count</dt><dd>{action.retryCount ?? 0}</dd></div>
        </div>
        <section><h4>Rationale</h4><p>{action.reason}</p></section>
        <section><h4>Expected effect</h4><p>{action.expectedEffect}</p></section>
        <section><h4>Business impact</h4><p>{action.businessImpact}</p></section>
        {action.failureReason ? <section><h4>Failure reason</h4><p>{action.failureReason}</p></section> : null}
      </div>
      <div className="cg-investigation-detail-panel__footer">
        {secondaryActionLabel && onSecondaryAction ? (
          <Button kind="ghost" size="sm" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        ) : null}
        {primaryActionLabel ? (
          <Button kind="secondary" size="sm" onClick={onPrimaryAction}>
            {primaryActionLabel}
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
