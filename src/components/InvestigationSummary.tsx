import { AILabel, AILabelContent, Button, Checkbox, Tag, TextArea } from '@carbon/react';
import type { InvestigationContext, InvestigationTask } from '../types/investigation';
import type { WorkItem } from '../types/queue';

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
          <div className="cg-readable-copy cg-investigation-copy">
            {fixture.summaryParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="cg-preview-block cg-investigation-panel">
          <h3>{item.item_type === 'case' ? 'Nature of case' : 'Nature of alert'}</h3>
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
          <div className="cg-investigation-task-list">
            {tasks.map((task) => (
              <div key={task.id} className="cg-investigation-task-row">
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  labelText=""
                  onChange={() => onToggleTask(task.id)}
                />
                <div>
                  <p>{task.title}</p>
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
            <TextArea
              id="investigation-quick-note"
              labelText=""
              rows={3}
              value={quickNote}
              onChange={(event) => onQuickNoteChange(event.currentTarget.value)}
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
          <ul className="cg-investigation-bullets">
            {fixture.openQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
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
