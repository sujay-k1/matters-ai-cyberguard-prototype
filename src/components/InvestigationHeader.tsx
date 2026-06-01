import { Button, Tag } from '@carbon/react';
import type { WorkItem } from '../types/queue';

interface InvestigationHeaderProps {
  item: WorkItem;
  currentAnalyst: string;
  onAssignToMe: () => void;
  onReassign: () => void;
  onChangeStatus: () => void;
  onChangeSeverity: () => void;
}

export function InvestigationHeader({
  item,
  currentAnalyst,
  onAssignToMe,
  onReassign,
  onChangeStatus,
  onChangeSeverity,
}: InvestigationHeaderProps) {
  const severity = item.analystSeverityOverride?.severity ?? item.severity;
  const showAssignToMe = item.assignee !== currentAnalyst;

  return (
    <div className="cg-investigation-header">
      <div className="cg-investigation-header__identity">
        <p className="cg-eyebrow">
          {item.item_type.toUpperCase()} · {item.id}
        </p>
        <h2>{item.title}</h2>
        <p className="cg-preview-subtitle">
          {item.primary_actor === 'Multiple related entities' ? 'Correlated multi-signal case' : `by ${item.primary_actor}`}
        </p>
      </div>

      <div className="cg-investigation-header__meta">
        <div className="cg-investigation-header__badges">
          <Tag type={severityTagType(severity)}>{severity}</Tag>
          <Tag type="gray">{item.priority}</Tag>
          {item.analystSeverityOverride ? <Tag type="outline">Analyst override</Tag> : null}
          <Button kind="ghost" size="sm" onClick={onChangeSeverity}>
            Edit severity
          </Button>
        </div>
        <dl className="cg-investigation-header__grid">
          <div>
            <dt>Status</dt>
            <dd>
              <span>{item.status}</span>
              <Button kind="ghost" size="sm" onClick={onChangeStatus}>
                Change
              </Button>
            </dd>
          </div>
          <div>
            <dt>Assignee</dt>
            <dd>
              <span>{item.assignee}</span>
              <Button kind="ghost" size="sm" onClick={showAssignToMe ? onAssignToMe : onReassign}>
                {showAssignToMe ? 'Assign to me' : 'Reassign'}
              </Button>
            </dd>
          </div>
          <div>
            <dt>SLA</dt>
            <dd>{item.sla}</dd>
          </div>
          <div>
            <dt>Containment</dt>
            <dd>{item.containment}</dd>
          </div>
          <div>
            <dt>Last activity</dt>
            <dd>{item.last_activity}</dd>
          </div>
          <div>
            <dt>{item.item_type === 'case' ? 'Alert count' : 'Detection source'}</dt>
            <dd>{item.item_type === 'case' ? String(item.alert_count ?? item.preview.alerts?.length ?? 0) : item.detection_source}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function severityTagType(severity: string) {
  if (severity === 'Critical') return 'red';
  if (severity === 'High') return 'magenta';
  if (severity === 'Medium') return 'blue';
  if (severity === 'Low') return 'teal';
  return 'gray';
}
