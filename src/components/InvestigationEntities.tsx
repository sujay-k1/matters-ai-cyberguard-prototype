import { Button, Tag } from '@carbon/react';
import { useState } from 'react';
import type { InvestigationEntity } from '../types/investigation';

interface InvestigationEntitiesProps {
  entities: InvestigationEntity[];
  onOpenEntity: (id: string) => void;
  onAddNote: () => void;
}

export function InvestigationEntities({
  entities,
  onOpenEntity,
  onAddNote,
}: InvestigationEntitiesProps) {
  const [viewMode, setViewMode] = useState<'list' | 'relationship'>('list');

  return (
    <div className="cg-investigation-tab-stack">
      <section className="cg-investigation-pane">
        <div className="cg-investigation-pane__header">
          <h3>Entities and assets</h3>
          <div className="cg-investigation-segmented">
            <button type="button" className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')}>
              List
            </button>
            <button type="button" className={viewMode === 'relationship' ? 'is-active' : ''} onClick={() => setViewMode('relationship')}>
              Relationship view
            </button>
          </div>
        </div>

        {viewMode === 'relationship' ? (
          <>
            <p className="cg-summary-line">Relationship view is summarized in this prototype to keep the workspace reliable and focused on investigation flow.</p>
            <div className="cg-investigation-relationship-summary">
              {entities.map((entity) => (
                <div key={entity.id} className="cg-investigation-chip-row">
                  <Tag type={riskTagType(entity.riskLevel)}>{entity.type}</Tag>
                  <span>{entity.displayName}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="cg-investigation-card-list">
            {entities.map((entity) => (
              <article key={entity.id} className="cg-investigation-card">
                <div className="cg-investigation-card__header">
                  <div>
                    <Tag type={riskTagType(entity.riskLevel)}>{entity.riskLevel}</Tag>
                    <h4>{entity.displayName}</h4>
                  </div>
                  <span>{entity.type}</span>
                </div>
                <div className="cg-investigation-definition-list">
                  <div>
                    <dt>Role in case</dt>
                    <dd>{entity.roleInCase}</dd>
                  </div>
                  <div>
                    <dt>Related alerts</dt>
                    <dd>{String(entity.relatedAlertCount)}</dd>
                  </div>
                  <div>
                    <dt>Related events</dt>
                    <dd>{String(entity.relatedEventCount)}</dd>
                  </div>
                  <div>
                    <dt>Last activity</dt>
                    <dd>{entity.lastActivity}</dd>
                  </div>
                </div>
                <p>{entity.profileSummary}</p>
                <div className="cg-investigation-action-row">
                  <Button kind="ghost" size="sm" onClick={() => onOpenEntity(entity.id)}>
                    Open entity details
                  </Button>
                  <Button kind="ghost" size="sm">
                    Compare with baseline
                  </Button>
                  <Button kind="ghost" size="sm">
                    Go hunt
                  </Button>
                  <Button kind="ghost" size="sm" onClick={onAddNote}>
                    Add note
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function riskTagType(riskLevel: string) {
  if (riskLevel === 'High') return 'red';
  if (riskLevel === 'Medium') return 'magenta';
  return 'gray';
}
