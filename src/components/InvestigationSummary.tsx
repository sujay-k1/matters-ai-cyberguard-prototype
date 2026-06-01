import { AILabel, AILabelContent, Button, Checkbox, Tag, TextArea } from '@carbon/react';
import type { InvestigationContext, InvestigationTask } from '../types/investigation';
import type { WorkItem } from '../types/queue';

interface InvestigationSummaryProps {
  context: InvestigationContext;
  item: WorkItem;
  hypothesis: string;
  onHypothesisChange: (value: string) => void;
  onSaveHypothesis: () => void;
  tasks: InvestigationTask[];
  onToggleTask: (taskId: string) => void;
  onOpenTaskModal: () => void;
  onTabChange: (tab: 'evidence') => void;
}

export function InvestigationSummary({
  context,
  item,
  hypothesis,
  onHypothesisChange,
  onSaveHypothesis,
  tasks,
  onToggleTask,
  onOpenTaskModal,
  onTabChange,
}: InvestigationSummaryProps) {
  const { fixture } = context;

  return (
    <div className="cg-investigation-summary">
      <div className="cg-investigation-summary__main">
        <section className="cg-investigation-pane">
          <div className="cg-ai-heading">
            <AILabel
              kind="inline"
              size="sm"
              textLabel="Investigation summary"
              aria-label="AI investigation summary"
              AILabelContent={<AILabelContent>Generated from the selected work item, correlated alerts, and investigation fixtures.</AILabelContent>}
            />
          </div>
          <div className="cg-investigation-copy">
            {fixture.summaryParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="cg-investigation-pane">
          <h3>{item.item_type === 'case' ? 'Nature of case' : 'Nature of alert'}</h3>
          <ul className="cg-investigation-bullets">
            {item.preview.why_prioritized.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </section>

        <section className="cg-investigation-pane">
          <div className="cg-investigation-pane__header">
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
                  <span>{task.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="cg-investigation-pane">
          <div className="cg-investigation-pane__header">
            <h3>Current hypothesis</h3>
            <Button kind="secondary" size="sm" onClick={onSaveHypothesis}>
              Save
            </Button>
          </div>
          <TextArea
            id="investigation-hypothesis"
            labelText=""
            rows={4}
            value={hypothesis}
            onChange={(event) => onHypothesisChange(event.currentTarget.value)}
          />
        </section>

        <section className="cg-investigation-pane">
          <h3>Open questions</h3>
          <ul className="cg-investigation-bullets">
            {fixture.openQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="cg-investigation-summary__side">
        <section className="cg-investigation-pane">
          <h3>Quick facts</h3>
          <dl className="cg-investigation-definition-list">
            {fixture.quickFacts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="cg-investigation-pane">
          <h3>Scope summary</h3>
          <dl className="cg-investigation-definition-list">
            {fixture.scopeSummary.map((entry) => (
              <div key={entry.label}>
                <dt>{entry.label}</dt>
                <dd>{entry.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="cg-investigation-pane">
          <div className="cg-investigation-pane__header">
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
              <p>{item.preview.grouping_rationale}</p>
              <div className="cg-investigation-inline-list">
                {(item.preview.alerts ?? []).map((alert) => (
                  <div key={alert.id} className="cg-investigation-chip-row">
                    <Tag type="gray">{alert.id}</Tag>
                    <span>{alert.title}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p>{item.preview.correlation_status || 'No related alerts identified yet.'}</p>
              <Button kind="ghost" size="sm" onClick={() => onTabChange('evidence')}>
                Review related alerts
              </Button>
            </>
          )}
        </section>

        <section className="cg-investigation-pane">
          <h3>Intelligence and automation</h3>
          <dl className="cg-investigation-definition-list">
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
