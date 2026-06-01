import { Button, Tag } from '@carbon/react';
import type { IncludedAlertItem } from '../types/investigation';
import { InvestigationDetailDialog } from './InvestigationDetailDialog';

interface AlertDetailPanelProps {
  alert: IncludedAlertItem | null;
  relatedTimeline?: Array<{ id: string; timestamp: string; systemName: string; title: string; entity: string; relevance: string; evidenceId?: string }>;
  relatedEvidence?: Array<{ id: string; eventType: string; sourceSystem: string; entity: string; verdict: string; attached: boolean }>;
  relatedEntities?: Array<{ id: string; displayName: string; type: string; roleInCase: string; riskLevel: string }>;
  onClose: () => void;
  onToggleRelevance: () => void;
  onAddNote: () => void;
  onDetach: () => void;
  onMoveToCase: () => void;
  onOpenEvidence?: (evidenceId: string) => void;
  onOpenEntity?: (entityId: string) => void;
  onOpenSourceSystem?: () => void;
}

export function AlertDetailPanel({
  alert,
  relatedTimeline = [],
  relatedEvidence = [],
  relatedEntities = [],
  onClose,
  onToggleRelevance,
  onAddNote,
  onDetach,
  onMoveToCase,
  onOpenEvidence,
  onOpenEntity,
  onOpenSourceSystem,
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
          <Button kind="ghost" size="sm" onClick={onOpenSourceSystem}>
            Open in source system
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
          <div><dt>Source</dt><dd>{alert.detectionSource}</dd></div>
          <div><dt>Events</dt><dd>{alert.linkedEventsCount}</dd></div>
        </div>
        <div className="cg-investigation-ai-insight">
          <p>{alert.linkingRationale}</p>
        </div>
        <section>
          <h4>Linked activity</h4>
          <ul>
            {relatedTimeline.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.timestamp} · {entry.systemName}</strong> — {entry.title}
                <p>{entry.entity} · {entry.relevance}</p>
                {entry.evidenceId && onOpenEvidence ? (
                  <Button kind="ghost" size="sm" onClick={() => onOpenEvidence(entry.evidenceId!)}>
                    Open evidence
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4>Evidence</h4>
          <ul>
            {relatedEvidence.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.id}</strong> — {entry.eventType} — {entry.sourceSystem}
                <p>{entry.entity} · {entry.verdict} · {entry.attached ? 'Attached' : 'Detached'}</p>
                {onOpenEvidence ? (
                  <Button kind="ghost" size="sm" onClick={() => onOpenEvidence(entry.id)}>
                    Open evidence
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4>Related entities</h4>
          <ul>
            {relatedEntities.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.displayName}</strong> — {entry.type} · {entry.roleInCase} · {entry.riskLevel}
                {onOpenEntity ? (
                  <Button kind="ghost" size="sm" onClick={() => onOpenEntity(entry.id)}>
                    Open entity
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
    </InvestigationDetailDialog>
  );
}
