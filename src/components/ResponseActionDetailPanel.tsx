import { Button, Tag } from '@carbon/react';
import type { InvestigationResponseAction } from '../types/investigation';
import { InvestigationDetailDialog } from './InvestigationDetailDialog';
import { ProvenanceLabel } from './ProvenanceLabel';

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
  const open = Boolean(action);
  if (!action) return null;

  return (
    <InvestigationDetailDialog
      open={open}
      ariaLabel="Response action detail"
      title={action.title}
      onClose={onClose}
      footer={
        <>
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
        </>
      }
    >
        <div className="cg-investigation-definition-list">
          <div><dt>State</dt><dd><Tag type="cool-gray">{action.currentState}</Tag></dd></div>
          <div><dt>Target entity</dt><dd>{action.affectedEntity}</dd></div>
          <div><dt>Approval</dt><dd>{action.approvalRequirement}</dd></div>
          <div><dt>Requester</dt><dd>{action.approvalRequestedBy ?? action.createdBy}</dd></div>
          <div><dt>Approver</dt><dd>{action.approver ?? action.approverRole ?? 'Pending'}</dd></div>
          <div><dt>Retry count</dt><dd>{action.retryCount ?? 0}</dd></div>
        </div>
        <ProvenanceLabel
          provenance={action.createdBy === 'AI' ? 'AI' : action.createdBy === 'System' ? 'System-derived' : 'Analyst-authored'}
          textLabel={action.createdBy === 'AI' ? 'Suggested response action' : action.createdBy === 'System' ? 'System action' : 'Analyst added'}
          compact
        />
        <section><h4>Rationale</h4><p>{action.reason}</p></section>
        <section><h4>Expected effect</h4><p>{action.expectedEffect}</p></section>
        <section><h4>Business impact</h4><p>{action.businessImpact}</p></section>
        {action.failureReason ? <section><h4>Failure reason</h4><p>{action.failureReason}</p></section> : null}
    </InvestigationDetailDialog>
  );
}
