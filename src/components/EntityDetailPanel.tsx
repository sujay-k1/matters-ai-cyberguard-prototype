import { Button, Tag } from '@carbon/react';
import type { InvestigationEntity } from '../types/investigation';

interface EntityDetailPanelProps {
  entity: InvestigationEntity | null;
  onClose: () => void;
  onAddNote: () => void;
}

export function EntityDetailPanel({ entity, onClose, onAddNote }: EntityDetailPanelProps) {
  if (!entity) return null;

  return (
    <aside className="cg-investigation-detail-panel" aria-label="Entity details">
      <div className="cg-investigation-detail-panel__header">
        <div>
          <p className="cg-eyebrow">Entity profile</p>
          <h3>{entity.displayName}</h3>
        </div>
        <Button kind="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="cg-investigation-detail-panel__body">
        <div className="cg-investigation-definition-list">
          <div>
            <dt>Type</dt>
            <dd>{entity.type}</dd>
          </div>
          <div>
            <dt>Risk level</dt>
            <dd>
              <Tag type={riskTagType(entity.riskLevel)}>{entity.riskLevel}</Tag>
            </dd>
          </div>
          <div>
            <dt>Role in case</dt>
            <dd>{entity.roleInCase}</dd>
          </div>
          <div>
            <dt>Last activity</dt>
            <dd>{entity.lastActivity}</dd>
          </div>
        </div>

        <section>
          <h4>Profile summary</h4>
          <p>{entity.profileSummary}</p>
        </section>
        <section>
          <h4>Baseline comparison</h4>
          <p>{entity.baselineComparison}</p>
        </section>
        <section>
          <h4>Relevant permissions</h4>
          <ul>
            {entity.permissions.length ? entity.permissions.map((entry) => <li key={entry}>{entry}</li>) : <li>No notable permissions captured</li>}
          </ul>
        </section>
        <section>
          <h4>Related assets</h4>
          <ul>
            {entity.relatedAssets.length ? entity.relatedAssets.map((entry) => <li key={entry}>{entry}</li>) : <li>No related assets captured</li>}
          </ul>
        </section>
        <section>
          <h4>Suggested investigation checks</h4>
          <ul>
            {entity.suggestedChecks.map((entry) => <li key={entry}>{entry}</li>)}
          </ul>
        </section>
        <section>
          <h4>Response candidates</h4>
          <ul>
            {entity.responseCandidates.map((entry) => <li key={entry}>{entry}</li>)}
          </ul>
        </section>
      </div>
      <div className="cg-investigation-detail-panel__footer">
        <Button kind="ghost" size="sm">
          View all activity
        </Button>
        <Button kind="ghost" size="sm">
          Compare with baseline
        </Button>
        <Button kind="secondary" size="sm" onClick={onAddNote}>
          Add note
        </Button>
      </div>
    </aside>
  );
}

function riskTagType(riskLevel: string) {
  if (riskLevel === 'High') return 'red';
  if (riskLevel === 'Medium') return 'magenta';
  return 'gray';
}
