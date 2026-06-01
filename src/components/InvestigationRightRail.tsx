import { Button, Tag, TextArea } from '@carbon/react';
import type { InvestigationContext, InvestigationTask } from '../types/investigation';

interface InvestigationRightRailProps {
  context: InvestigationContext;
  hypothesis: string;
  tasks: InvestigationTask[];
  quickNote: string;
  onQuickNoteChange: (value: string) => void;
  onAddQuickNote: () => void;
  onOpenTaskModal: () => void;
}

export function InvestigationRightRail({
  context,
  hypothesis,
  tasks,
  quickNote,
  onQuickNoteChange,
  onAddQuickNote,
  onOpenTaskModal,
}: InvestigationRightRailProps) {
  const openTasks = tasks.filter((task) => !task.completed);

  return (
    <aside className="cg-investigation-rail">
      <section className="cg-investigation-pane">
        <h3>AI investigation guide</h3>
        <div className="cg-investigation-definition-list">
          <div>
            <dt>Current hypothesis</dt>
            <dd>{hypothesis}</dd>
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

      <section className="cg-investigation-pane">
        <div className="cg-investigation-pane__header">
          <h3>Tasks</h3>
          <Tag type="blue">{openTasks.length} open</Tag>
        </div>
        <div className="cg-investigation-inline-list">
          {tasks.slice(0, 3).map((task) => (
            <div key={task.id} className="cg-investigation-chip-row">
              <Tag type={task.completed ? 'green' : 'cool-gray'}>{task.completed ? 'Done' : task.owner}</Tag>
              <span>{task.title}</span>
            </div>
          ))}
        </div>
        <Button kind="ghost" size="sm" onClick={onOpenTaskModal}>
          Add task
        </Button>
      </section>

      <section className="cg-investigation-pane">
        <h3>Quick note</h3>
        <TextArea
          id="investigation-quick-note"
          labelText=""
          rows={4}
          value={quickNote}
          onChange={(event) => onQuickNoteChange(event.currentTarget.value)}
        />
        <Button kind="secondary" size="sm" onClick={onAddQuickNote}>
          Add note
        </Button>
      </section>

      <section className="cg-investigation-pane">
        <h3>Case handoff</h3>
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
        <Button kind="ghost" size="sm">
          Escalate
        </Button>
      </section>
    </aside>
  );
}
