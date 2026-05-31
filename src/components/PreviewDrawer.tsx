import { Button, Tag } from '@carbon/react';
import { Close } from '@carbon/icons-react';
import type { WorkItem } from '../types/queue';

interface PreviewDrawerProps {
  item: WorkItem;
  currentAnalyst: string;
  onClose: () => void;
  onAssignToMe: () => void;
  onOpenInvestigation: () => void;
  onMoreActions: () => void;
}

export function PreviewDrawer({
  item,
  currentAnalyst,
  onClose,
  onAssignToMe,
  onOpenInvestigation,
  onMoreActions,
}: PreviewDrawerProps) {
  const preview = item.preview;
  const showAssignToMe = item.assignee !== currentAnalyst;

  return (
    <aside className="cg-preview-drawer" aria-label="Item preview" tabIndex={-1}>
      <header>
        <button
          type="button"
          className="cg-icon-action cg-preview-close"
          onClick={onClose}
          aria-label="Close preview"
        >
          <Close size={16} />
        </button>
        <div>
          <p className="cg-eyebrow">{preview.identity_and_urgency.type}</p>
          <h2>{preview.identity_and_urgency.id}</h2>
          <p>{preview.identity_and_urgency.title}</p>
        </div>
      </header>

      <section className="cg-preview-meta">
        <Tag type="red">{item.severity}</Tag>
        <Tag type="gray">{item.priority}</Tag>
        <Tag type="purple">{item.status}</Tag>
        <span className="cg-preview-assignee">
          <span>Assigned to {item.assignee}</span>
          {showAssignToMe ? (
            <Button kind="tertiary" size="sm" onClick={onAssignToMe}>
              Assign to me
            </Button>
          ) : null}
        </span>
        <span>{item.sla} SLA</span>
      </section>

      <div className="cg-preview-body">
        <PreviewSection title="AI summary">
          <p>{preview.ai_summary}</p>
        </PreviewSection>
        <PreviewSection title="Why prioritized">
          <ul>{preview.why_prioritized.map((entry) => <li key={entry}>{entry}</li>)}</ul>
        </PreviewSection>
        <PreviewSection title="Affected systems & resources">
          <ul>{preview.affected_systems_resources.map((entry) => <li key={entry}>{entry}</li>)}</ul>
        </PreviewSection>
        <PreviewSection title="Actors & entities">
          <ul>{preview.actors_entities.map((entry) => <li key={entry}>{entry}</li>)}</ul>
        </PreviewSection>
        <PreviewSection title="Affected data & volume">
          <p>{preview.affected_data}</p>
        </PreviewSection>
        <PreviewSection title="Destination / exposure target">
          <p>{preview.destination_exposure_target || 'Not applicable'}</p>
        </PreviewSection>
        <PreviewSection title="Resource criticality">
          <p>{preview.resource_criticality}</p>
        </PreviewSection>
        <PreviewSection title={item.item_type === 'case' ? 'Grouping rationale' : 'Correlation status'}>
          <p>{item.item_type === 'case' ? preview.grouping_rationale : preview.correlation_status}</p>
        </PreviewSection>
        <PreviewSection title="AI assessment">
          <p>
            {preview.ai_assessment.verdict} · Confidence {preview.ai_assessment.confidence}
          </p>
        </PreviewSection>
        <PreviewSection title="Automated investigation">
          <p>{preview.automated_investigation_state}</p>
        </PreviewSection>
        <PreviewSection title="Containment">
          <p>{preview.containment_state}</p>
        </PreviewSection>
        <PreviewSection title="Recommended next action">
          <p>{preview.recommended_next_action}</p>
        </PreviewSection>
        {preview.alerts?.length ? (
          <PreviewSection title="Included alerts">
            <ul>
              {preview.alerts.map((alert) => (
                <li key={alert.id}>
                  {alert.id} · {alert.title} · {alert.priority}
                </li>
              ))}
            </ul>
          </PreviewSection>
        ) : null}
      </div>

      <footer>
        <Button size="sm" onClick={onOpenInvestigation}>
          Open investigation
        </Button>
        <Button kind="ghost" size="sm" onClick={onMoreActions}>
          More actions
        </Button>
      </footer>
    </aside>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="cg-preview-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
