import { Button } from '@carbon/react';
import type { WorkflowActivityEvent } from '../types/investigation';
import { InvestigationDetailDialog } from './InvestigationDetailDialog';

interface ActivityEventDetailPanelProps {
  event: WorkflowActivityEvent | null;
  onClose: () => void;
  onOpenWorkItem: (itemId: string) => void;
}

export function ActivityEventDetailPanel({ event, onClose, onOpenWorkItem }: ActivityEventDetailPanelProps) {
  const open = Boolean(event);
  if (!event) return null;

  return (
    <InvestigationDetailDialog
      open={open}
      ariaLabel="Activity event detail"
      title={event.activityType}
      onClose={onClose}
      footer={
        <Button kind="secondary" size="sm" onClick={() => onOpenWorkItem(event.itemId)}>
          Open work item
        </Button>
      }
    >
        <div className="cg-investigation-definition-list">
          <div><dt>Timestamp</dt><dd>{event.timestamp}</dd></div>
          <div><dt>Actor</dt><dd>{event.actor}</dd></div>
          <div><dt>Item</dt><dd>{event.itemId}</dd></div>
          <div><dt>Result</dt><dd>{event.result ?? 'Recorded'}</dd></div>
        </div>
        <section>
          <h4>Description</h4>
          <p>{event.description}</p>
        </section>
        {event.previousValue || event.newValue ? (
          <section>
            <h4>Value transition</h4>
            <p>{event.previousValue ?? '—'} → {event.newValue ?? '—'}</p>
          </section>
        ) : null}
        {event.comment ? (
          <section>
            <h4>Comment</h4>
            <p>{event.comment}</p>
          </section>
        ) : null}
    </InvestigationDetailDialog>
  );
}
