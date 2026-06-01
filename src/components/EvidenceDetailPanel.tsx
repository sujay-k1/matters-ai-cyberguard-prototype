import { Button, Tag } from '@carbon/react';
import { useState } from 'react';
import type { EvidenceItem } from '../types/investigation';
import { InvestigationDetailDialog } from './InvestigationDetailDialog';

interface EvidenceDetailPanelProps {
  evidence: EvidenceItem | null;
  onClose: () => void;
  onToggleVerdict: (next: EvidenceItem['verdict']) => void;
  onToggleAttached: () => void;
  onGoHunt: () => void;
  onAddNote: () => void;
}

export function EvidenceDetailPanel({
  evidence,
  onClose,
  onToggleVerdict,
  onToggleAttached,
  onGoHunt,
  onAddNote,
}: EvidenceDetailPanelProps) {
  const [showRaw, setShowRaw] = useState(false);
  const open = Boolean(evidence);
  if (!evidence) return null;

  return (
    <InvestigationDetailDialog
      open={open}
      ariaLabel="Evidence details"
      title={evidence.id}
      onClose={onClose}
      footer={
        <>
          <Button kind="ghost" size="sm" onClick={() => onToggleVerdict('Relevant')}>
            Mark relevant
          </Button>
          <Button kind="ghost" size="sm" onClick={() => onToggleVerdict('Irrelevant')}>
            Mark irrelevant
          </Button>
          <Button kind="ghost" size="sm" onClick={onToggleAttached}>
            {evidence.attached ? 'Detach from case' : 'Attach to case'}
          </Button>
          <Button kind="ghost" size="sm" onClick={onGoHunt}>
            Go hunt
          </Button>
          <Button kind="secondary" size="sm" onClick={onAddNote}>
            Add note
          </Button>
        </>
      }
    >
        <div className="cg-investigation-definition-list">
          <div>
            <dt>Event type</dt>
            <dd>{evidence.eventType}</dd>
          </div>
          <div>
            <dt>Timestamp</dt>
            <dd>{evidence.timestamp}</dd>
          </div>
          <div>
            <dt>Source system</dt>
            <dd>{evidence.sourceSystem}</dd>
          </div>
          <div>
            <dt>Entity</dt>
            <dd>{evidence.entity}</dd>
          </div>
          <div>
            <dt>Verdict</dt>
            <dd>
              <Tag type={verdictTagType(evidence.verdict)}>{evidence.verdict}</Tag>
            </dd>
          </div>
          <div>
            <dt>Raw record</dt>
            <dd>{evidence.rawRecordAvailable ? 'Available' : 'Unavailable in prototype'}</dd>
          </div>
        </div>

        <section>
          <h4>Description</h4>
          <p>{evidence.description}</p>
        </section>
        <section>
          <h4>Detail lines</h4>
          <ul>
            {evidence.details.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </section>
        {evidence.rawRecordAvailable ? (
          <section>
            <h4>Raw event</h4>
            <Button kind="ghost" size="sm" onClick={() => setShowRaw((current) => !current)}>
              {showRaw ? 'Hide raw JSON' : 'Show raw JSON'}
            </Button>
            {showRaw ? (
              <pre className="cg-raw-json">
{JSON.stringify(
  {
    id: evidence.id,
    eventType: evidence.eventType,
    sourceSystem: evidence.sourceSystem,
    entity: evidence.entity,
    description: evidence.description,
  },
  null,
  2,
)}
              </pre>
            ) : null}
          </section>
        ) : null}
    </InvestigationDetailDialog>
  );
}

function verdictTagType(verdict: EvidenceItem['verdict']) {
  if (verdict === 'Relevant') return 'green';
  if (verdict === 'Irrelevant') return 'cool-gray';
  return 'blue';
}
