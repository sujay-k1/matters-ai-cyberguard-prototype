import { AILabel, AILabelContent, Button } from '@carbon/react';
import type { InvestigationContext } from '../types/investigation';
import type { DraftProvenance } from '../types/ai';
import { ProvenanceLabel } from './ProvenanceLabel';
import { draftSourceLabel } from '../data/aiDraftSuggestions';

interface InvestigationRightRailProps {
  context: InvestigationContext;
  hypothesis: string;
  hypothesisProvenance?: DraftProvenance;
  onOpenHypothesisModal: () => void;
  onEscalate: () => void;
}

export function InvestigationRightRail({
  context,
  hypothesis,
  hypothesisProvenance,
  onOpenHypothesisModal,
  onEscalate,
}: InvestigationRightRailProps) {
  return (
    <aside className="cg-investigation-rail">
      <section className="cg-preview-block cg-ai-layer cg-ai-layer--secondary cg-investigation-panel cg-investigation-panel--ai-guide">
        <div className="cg-ai-heading">
          <AILabel
            kind="inline"
            size="sm"
            textLabel="Investigation guide"
            aria-label="AI investigation guide"
            AILabelContent={<AILabelContent>Suggested next checks and gaps based on the current case context.</AILabelContent>}
          />
        </div>
        <div className="cg-definition-list">
          <div>
            <dt>Current hypothesis</dt>
            <dd>
              <div className="cg-investigation-guide-hypothesis">
                <ProvenanceLabel
                  provenance={
                    hypothesisProvenance === 'AI-assisted'
                      ? 'AI-assisted'
                      : hypothesisProvenance === 'AI-assisted-edited'
                        ? 'AI-assisted-edited'
                        : 'Analyst-authored'
                  }
                  textLabel={draftSourceLabel(hypothesisProvenance)}
                  compact
                />
                <span>{hypothesis}</span>
                <Button kind="tertiary" size="sm" onClick={onOpenHypothesisModal}>
                  Update hypothesis
                </Button>
              </div>
            </dd>
          </div>
          <div>
            <dt>Suggested next check</dt>
            <dd>{context.fixture.suggestedNextCheck}</dd>
          </div>
          <div>
            <dt>Missing evidence</dt>
            <dd>{context.fixture.missingEvidence.join(', ')}</dd>
          </div>
          <div>
            <dt>Potential false positive</dt>
            <dd>{context.fixture.falsePositiveExplanation}</dd>
          </div>
        </div>
      </section>

      <section className="cg-investigation-pane cg-investigation-pane--rail-hover">
        <div className="cg-investigation-pane__header">
          <h3>Case handoff</h3>
          <Button kind="ghost" size="sm" onClick={onEscalate}>
            Escalate
          </Button>
        </div>
        <div className="cg-investigation-pane__body">
          <div className="cg-investigation-definition-list">
            <div>
              <dt>Data owner</dt>
              <dd>{context.fixture.dataOwner}</dd>
            </div>
            <div>
              <dt>Handoff teams</dt>
              <dd>{context.fixture.handoffTeams.join(', ')}</dd>
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}
