import { Button, Tag } from '@carbon/react';
import type { InvestigationEntity } from '../types/investigation';
import { InvestigationDetailDialog } from './InvestigationDetailDialog';

interface EntityDetailPanelProps {
  entity: InvestigationEntity | null;
  onClose: () => void;
  onGoHunt: () => void;
  onAddNote: () => void;
}

export function EntityDetailPanel({ entity, onClose, onGoHunt, onAddNote }: EntityDetailPanelProps) {
  const open = Boolean(entity);
  if (!entity) return null;

  return (
    <InvestigationDetailDialog
      open={open}
      ariaLabel="Entity details"
      title={entity.displayName}
      onClose={onClose}
      footer={
        <>
          <Button kind="ghost" size="sm">
            View all activity
          </Button>
          <Button kind="ghost" size="sm">
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
    </InvestigationDetailDialog>
  );
}

function riskTagType(riskLevel: string) {
  if (riskLevel === 'High') return 'red';
  if (riskLevel === 'Medium') return 'magenta';
  return 'gray';
}
