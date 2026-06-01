import { Button, Tag } from '@carbon/react';
import { useEffect, useState } from 'react';
import type { InvestigationEntity } from '../types/investigation';
import { InvestigationDetailDialog } from './InvestigationDetailDialog';

interface EntityDetailPanelProps {
  entity: InvestigationEntity | null;
  relatedTimeline?: Array<{ id: string; timestamp: string; source: string; title: string; detail: string; evidenceId?: string }>;
  relatedEvidence?: Array<{ id: string; sourceSystem: string; description: string; verdict: string }>;
  relatedAlerts?: Array<{ id: string; title: string }>;
  onOpenEvidence?: (evidenceId: string) => void;
  initialMode?: 'overview' | 'activity' | 'baseline';
  onClose: () => void;
  onGoHunt: () => void;
  onAddNote: () => void;
}

export function EntityDetailPanel({
  entity,
  relatedTimeline = [],
  relatedEvidence = [],
  relatedAlerts = [],
  onOpenEvidence,
  initialMode = 'overview',
  onClose,
  onGoHunt,
  onAddNote,
}: EntityDetailPanelProps) {
  const [mode, setMode] = useState<'overview' | 'activity' | 'baseline'>(initialMode);
  const open = Boolean(entity);
  if (!entity) return null;

  useEffect(() => {
    setMode(initialMode);
  }, [entity?.id, initialMode]);

  return (
    <InvestigationDetailDialog
      open={open}
      ariaLabel="Entity details"
      title={entity.displayName}
      onClose={onClose}
      footer={
        <>
          <Button kind="ghost" size="sm" onClick={() => setMode('activity')}>
            View all activity
          </Button>
          <Button kind="ghost" size="sm" onClick={() => setMode('baseline')}>
            Compare with baseline
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

        {mode !== 'overview' ? (
          <section>
            <Button kind="ghost" size="sm" onClick={() => setMode('overview')}>
              Back to overview
            </Button>
          </section>
        ) : null}
        {mode === 'overview' ? (
          <>
            <section>
              <h4>Profile summary</h4>
              <p>{entity.profileSummary}</p>
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
          </>
        ) : null}
        {mode === 'activity' ? (
          <>
            <section>
              <h4>Related activity</h4>
              {(entity.recentActivity ?? relatedTimeline).length ? (
                <ul>
                  {(entity.recentActivity ?? relatedTimeline).map((entry) => (
                    <li key={entry.id}>
                      <strong>{entry.timestamp} · {entry.source}</strong> — {entry.title}
                      <p>{entry.detail}</p>
                      {entry.evidenceId && onOpenEvidence ? (
                        <Button kind="ghost" size="sm" onClick={() => onOpenEvidence(entry.evidenceId!)}>
                          Open evidence
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="cg-empty-state">No related activity captured for this entity.</p>
              )}
            </section>
            <section>
              <h4>Related evidence</h4>
              {relatedEvidence.length ? (
                <ul>
                  {relatedEvidence.map((entry) => (
                    <li key={entry.id}>
                      <strong>{entry.id}</strong> — {entry.sourceSystem} — {entry.verdict}
                      <p>{entry.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="cg-empty-state">No related evidence captured for this entity.</p>
              )}
            </section>
            <section>
              <h4>Related alerts</h4>
              {relatedAlerts.length ? (
                <ul>
                  {relatedAlerts.map((entry) => <li key={entry.id}>{entry.id} — {entry.title}</li>)}
                </ul>
              ) : (
                <p className="cg-empty-state">No related alerts captured for this entity.</p>
              )}
            </section>
          </>
        ) : null}
        {mode === 'baseline' ? (
          <section>
            <h4>Baseline comparison</h4>
            <div className="cg-investigation-definition-list">
              {(entity.baselineSignals ?? []).map((entry) => (
                <div key={entry.metric}>
                  <dt>{entry.metric}</dt>
                  <dd>
                    <strong>Normal:</strong> {entry.baseline}
                    <br />
                    <strong>Observed:</strong> {entry.observed}
                    <br />
                    <strong>Difference:</strong> {entry.difference}
                    <br />
                    <strong>Why it matters:</strong> {entry.whyItMatters}
                  </dd>
                </div>
              ))}
            </div>
            {!entity.baselineSignals?.length ? <p>{entity.baselineComparison}</p> : null}
          </section>
        ) : null}
    </InvestigationDetailDialog>
  );
}

function riskTagType(riskLevel: string) {
  if (riskLevel === 'High') return 'red';
  if (riskLevel === 'Medium') return 'magenta';
  return 'gray';
}
