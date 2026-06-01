import { Button, Tag } from '@carbon/react';
import type { IncludedAlertItem } from '../types/investigation';
import { InvestigationDetailDialog } from './InvestigationDetailDialog';

interface AlertDetailPanelProps {
  alert: IncludedAlertItem | null;
  onClose: () => void;
  onToggleRelevance: () => void;
  onAddNote: () => void;
  onDetach: () => void;
  onMoveToCase: () => void;
}

export function AlertDetailPanel({
  alert,
  onClose,
  onToggleRelevance,
  onAddNote,
  onDetach,
  onMoveToCase,
}: AlertDetailPanelProps) {
  const open = Boolean(alert);
  if (!alert) return null;

  return (
    <InvestigationDetailDialog
      open={open}
      ariaLabel="Alert detail"
      title={alert.id}
      onClose={onClose}
      footer={
        <>
          <Button kind="ghost" size="sm" onClick={onToggleRelevance}>
            {alert.relevance === 'Relevant' ? 'Mark irrelevant' : 'Mark relevant'}
          </Button>
          <Button kind="ghost" size="sm" onClick={onDetach}>
            Detach from case
          </Button>
          <Button kind="ghost" size="sm" onClick={onMoveToCase}>
            Move to another case
          </Button>
          <Button kind="secondary" size="sm" onClick={onAddNote}>
            Add note
          </Button>
        </>
      }
    >
        <div className="cg-investigation-definition-list">
          <div><dt>Severity</dt><dd><Tag type="red">{alert.severity}</Tag></dd></div>
          <div><dt>Priority</dt><dd>{alert.priority}</dd></div>
          <div><dt>System</dt><dd>{alert.system}</dd></div>
          <div><dt>Status</dt><dd>{alert.status}</dd></div>
          <div><dt>Relevance</dt><dd>{alert.relevance}</dd></div>
          <div><dt>Events</dt><dd>{alert.linkedEventsCount}</dd></div>
        </div>
        <div className="cg-investigation-ai-insight">
          <p>{alert.linkingRationale}</p>
        </div>
    </InvestigationDetailDialog>
  );
}
