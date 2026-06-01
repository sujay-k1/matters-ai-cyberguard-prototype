import { Button, Tag } from '@carbon/react';
import type { EvidenceItem } from '../types/investigation';

interface EvidenceDetailPanelProps {
  evidence: EvidenceItem | null;
  onClose: () => void;
  onToggleVerdict: (next: EvidenceItem['verdict']) => void;
  onAddNote: () => void;
}

export function EvidenceDetailPanel({
  evidence,
  onClose,
  onToggleVerdict,
  onAddNote,
}: EvidenceDetailPanelProps) {
  if (!evidence) return null;

  return (
    <aside className="cg-investigation-detail-panel" aria-label="Evidence details">
      <div className="cg-investigation-detail-panel__header">
        <div>
          <p className="cg-eyebrow">Evidence detail</p>
          <h3>{evidence.id}</h3>
        </div>
        <Button kind="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="cg-investigation-detail-panel__body">
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
      </div>
      <div className="cg-investigation-detail-panel__footer">
        <Button kind="ghost" size="sm" onClick={() => onToggleVerdict('Relevant')}>
          Mark relevant
        </Button>
        <Button kind="ghost" size="sm" onClick={() => onToggleVerdict('Irrelevant')}>
          Mark irrelevant
        </Button>
        <Button kind="secondary" size="sm" onClick={onAddNote}>
          Add note
        </Button>
      </div>
    </aside>
  );
}

function verdictTagType(verdict: EvidenceItem['verdict']) {
  if (verdict === 'Relevant') return 'green';
  if (verdict === 'Irrelevant') return 'cool-gray';
  return 'blue';
}
