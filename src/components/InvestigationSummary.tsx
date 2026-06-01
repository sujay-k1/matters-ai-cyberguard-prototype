import { AILabel, AILabelContent, Button, Checkbox, Tag } from '@carbon/react';
import type { InvestigationContext, InvestigationTask } from '../types/investigation';
import type { WorkItem } from '../types/queue';
import type { DraftProvenance } from '../types/ai';
import { AISuggestedTextArea } from './AISuggestedTextArea';
import { InlineStateNotice } from './InlineStateNotice';
import { OperationalState } from './OperationalState';
import { ProvenanceLabel } from './ProvenanceLabel';
import { SectionSkeleton } from './SectionSkeleton';
import { buildAISuggestion, draftSourceLabel } from '../data/aiDraftSuggestions';

interface InvestigationSummaryProps {
  context: InvestigationContext;
  item: WorkItem;
  quickNote: string;
  onQuickNoteChange: (value: string) => void;
  onAddQuickNote: () => void;
  tasks: InvestigationTask[];
  onToggleTask: (taskId: string) => void;
  onOpenTaskModal: () => void;
  onOpenTaskAssignModal: (taskId: string) => void;
  onTabChange: (tab: 'evidence') => void;
  onQuickNoteProvenanceChange?: (value: DraftProvenance) => void;
  aiSummaryState?: 'ready' | 'loading' | 'error';
  emptyTasks?: boolean;
}

export function InvestigationSummary({
  context,
  item,
  quickNote,
  onQuickNoteChange,
  onAddQuickNote,
  tasks,
  onToggleTask,
  onOpenTaskModal,
  onOpenTaskAssignModal,
  onTabChange,
  onQuickNoteProvenanceChange,
  aiSummaryState = 'ready',
  emptyTasks = false,
}: InvestigationSummaryProps) {
  const { fixture } = context;
  const natureRows = item.preview.why_prioritized.map((entry, index) => {
    const parts = entry.split(':');
    if (parts.length > 1) {
      return {
        label: parts[0].trim(),
        value: parts.slice(1).join(':').trim(),
      };
    }

    return {
      label: `Signal ${index + 1}`,
      value: entry,
    };
  });

  return (
    <div className="cg-investigation-summary">
      <div className="cg-investigation-summary__main">
        <section className="cg-preview-block cg-ai-layer cg-ai-layer--primary cg-investigation-panel cg-investigation-panel--ai">
          <div className="cg-ai-heading">
            <AILabel
              kind="inline"
              size="sm"
              textLabel="Summary"
              aria-label="AI investigation summary"
              AILabelContent={<AILabelContent>Generated from the selected work item, correlated alerts, and investigation fixtures.</AILabelContent>}
            />
          </div>
          {aiSummaryState === 'loading' ? (
            <SectionSkeleton lines={4} />
          ) : aiSummaryState === 'error' ? (
            <OperationalState
              kind="unavailable"
              compact
              title="AI summary unavailable."
              description="Review the timeline and evidence directly."
            />
          ) : (
            <div className="cg-readable-copy cg-investigation-copy">
              {fixture.summaryParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}
        </section>

        <section className="cg-preview-block cg-investigation-panel">
          <h3>{item.item_type === 'case' ? 'Nature of case' : 'Nature of alert'}</h3>
          <ProvenanceLabel provenance="AI" textLabel="Risk interpretation" compact />
          <dl className="cg-quick-facts-grid">
            {natureRows.map((row) => (
              <div key={`${row.label}-${row.value}`}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="cg-preview-block cg-investigation-panel">
          <div className="cg-investigation-pane__header cg-investigation-panel__header">
            <h3>Recommended next checks</h3>
            <Button kind="ghost" size="sm" onClick={onOpenTaskModal}>
              Add task
            </Button>
          </div>
          <ProvenanceLabel provenance="AI" textLabel="Suggested investigation checks" compact />
          <div className="cg-investigation-task-list">
            {emptyTasks ? (
              <OperationalState
                kind="empty"
                compact
                title="No investigation tasks yet."
                description="Create the first task to capture the next analyst step."
                primaryActionLabel="Add task"
                onPrimaryAction={onOpenTaskModal}
              />
            ) : tasks.map((task) => (
              <div key={task.id} className="cg-investigation-task-row">
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  labelText=""
                  onChange={() => onToggleTask(task.id)}
                />
                <div>
                  <p>{task.title}</p>
                  <p className="cg-summary-line">
                    {task.createdBy === 'AI'
                      ? 'AI suggested'
                      : task.draftProvenance
                        ? draftSourceLabel(task.draftProvenance)
                        : 'Analyst added'}
                  </p>
                  <div className="cg-investigation-task-owner">
                    <span>{task.owner}</span>
                    <Button kind="ghost" size="sm" onClick={() => onOpenTaskAssignModal(task.id)}>
                      {task.owner === 'Unassigned' ? 'Assign' : 'Reassign'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="cg-preview-block cg-investigation-panel">
          <h3>Quick note</h3>
          <div className="cg-investigation-note-inline">
            <AISuggestedTextArea
              id="investigation-quick-note"
              labelText="Quick note"
              placeholder="Capture analyst context, evidence decisions, or handoff details"
              aiSuggestion={buildAISuggestion('quick-note', { item, investigationContext: context })}
              rows={3}
              value={quickNote}
              onChange={onQuickNoteChange}
              onProvenanceChange={onQuickNoteProvenanceChange}
            />
            <div className="cg-investigation-note-inline__actions">
              <Button kind="secondary" size="sm" onClick={onAddQuickNote}>
                Add note
              </Button>
            </div>
          </div>
        </section>

        <section className="cg-preview-block cg-investigation-panel">
          <h3>Open questions</h3>
          <ProvenanceLabel provenance="AI" textLabel="Suggested open questions" compact />
          {fixture.openQuestions.length ? (
            <ul className="cg-investigation-bullets">
              {fixture.openQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          ) : (
            <OperationalState
              kind="empty"
              compact
              title="No unresolved questions are currently identified."
              description="Continue investigation as new evidence emerges."
            />
          )}
        </section>
      </div>

      <div className="cg-investigation-summary__side">
        <section className="cg-preview-block cg-investigation-panel">
          <h3>Quick facts</h3>
          <dl className="cg-quick-facts-grid">
            {fixture.quickFacts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>
                  {Array.isArray(fact.value) ? (
                    <ul className="cg-compact-list cg-compact-list--tight">
                      {fact.value.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                  ) : (
                    fact.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="cg-preview-block cg-investigation-panel">
          <div className="cg-investigation-pane__header cg-investigation-panel__header">
            <h3>{item.item_type === 'case' ? 'Case composition' : 'Correlation'}</h3>
            {item.item_type === 'case' ? (
              <Button kind="ghost" size="sm" onClick={() => onTabChange('evidence')}>
                View all alerts
              </Button>
            ) : null}
          </div>
          {item.item_type === 'case' ? (
            <>
              <p className="cg-summary-line">{item.alert_count ?? item.preview.alerts?.length ?? 0} alerts included</p>
              <ProvenanceLabel provenance="AI" textLabel="Correlation rationale" compact />
              <p className="cg-readable-copy">{item.preview.grouping_rationale}</p>
              <div className="cg-alert-rows">
                {(item.preview.alerts ?? []).map((alert) => (
                  <div key={alert.id} className="cg-alert-row">
                    <div>
                      <div className="cg-alert-row__identity">
                        <div className="cg-alert-row__identity-main">
                          <strong>{alert.id}</strong>
                          <Tag type={alert.severity === 'Critical' ? 'red' : alert.severity === 'High' ? 'magenta' : 'blue'}>
                            {alert.severity}
                          </Tag>
                        </div>
                        {alert.priority ? <span className="cg-mono">{alert.priority}</span> : null}
                      </div>
                      <p>{alert.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="cg-readable-copy">{item.preview.correlation_status || 'No related alerts identified yet.'}</p>
              <Button kind="ghost" size="sm" onClick={() => onTabChange('evidence')}>
                Review related alerts
              </Button>
            </>
          )}
        </section>

        <section className="cg-preview-block cg-investigation-panel">
          <h3>Intelligence and automation</h3>
          <div className="cg-ai-heading">
            <AILabel
              kind="inline"
              size="sm"
              textLabel="Assessment"
              aria-label="AI assessment"
              AILabelContent={<AILabelContent>Assessment reflects the seeded verdict and confidence for this item.</AILabelContent>}
            />
          </div>
          <dl className="cg-definition-list">
            <div>
              <dt>AI verdict</dt>
              <dd>{item.preview.ai_assessment.verdict}</dd>
            </div>
            <div>
              <dt>AI confidence</dt>
              <dd>{item.preview.ai_assessment.confidence}</dd>
            </div>
            <div>
              <dt>Automated investigation</dt>
              <dd>{item.preview.automated_investigation_state}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
