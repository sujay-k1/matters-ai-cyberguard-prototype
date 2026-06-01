import { useEffect, useRef, useState } from 'react';
import { Button, Tag } from '@carbon/react';
import { Close, OverflowMenuHorizontal, Task, Time, UserAvatar, WarningAlt } from '@carbon/icons-react';
import type { WorkItem } from '../types/queue';

interface InvestigationHeaderProps {
  item: WorkItem;
  currentAnalyst: string;
  onClose: () => void;
  onAssignToMe: () => void;
  onReassign: () => void;
  onChangeStatus: () => void;
  onChangeSeverity: () => void;
  onAddNote: () => void;
  onGoToActions: () => void;
  onGoToActivity: () => void;
  onClassifyItem: () => void;
  onResolveItem: () => void;
}

export function InvestigationHeader({
  item,
  currentAnalyst,
  onClose,
  onAssignToMe,
  onReassign,
  onChangeStatus,
  onChangeSeverity,
  onAddNote,
  onGoToActions,
  onGoToActivity,
  onClassifyItem,
  onResolveItem,
}: InvestigationHeaderProps) {
  const severity = item.analystSeverityOverride?.severity ?? item.severity;
  const showAssignToMe = item.assignee !== currentAnalyst;
  const actorLine =
    item.primary_actor === 'Multiple related entities' ? 'Correlated multi-signal case' : `by ${item.primary_actor}`;
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!moreOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreOpen]);

  return (
    <div className="cg-investigation-header">
      <div className="cg-preview-sticky-bar cg-investigation-header__topbar">
        <div className="cg-preview-sticky-meta">
          <Tag type={item.item_type === 'case' ? 'purple' : 'cyan'}>
            {item.item_type === 'case' ? 'Case' : 'Alert'}
          </Tag>
          <span className="cg-mono">{item.id}</span>
          <Tag type={severityTagType(severity)}>{severity}</Tag>
          <span className="cg-preview-priority">{item.priority}</span>
          <span className="cg-investigation-header__topbar-subtitle">| {actorLine}</span>
          {item.analystSeverityOverride ? <Tag type="outline">Analyst override</Tag> : null}
        </div>
        <div className="cg-investigation-header__topbar-actions">
          <div className="cg-preview-more-actions cg-investigation-more-actions" ref={moreRef}>
            <Button kind="tertiary" size="sm" onClick={onClassifyItem}>
              Classify item
            </Button>
            <Button kind="primary" size="sm" onClick={onResolveItem}>
              {item.item_type === 'case' ? 'Resolve case' : 'Resolve alert'}
            </Button>
            <button
              type="button"
              className={`cg-icon-action cg-investigation-more-actions__trigger${moreOpen ? ' is-open' : ''}`}
              aria-label="More actions"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((open) => !open)}
            >
              <OverflowMenuHorizontal size={16} />
            </button>
            {moreOpen ? (
              <div className="cg-investigation-more-actions__menu" role="menu" aria-label="More actions menu">
                <button type="button" role="menuitem" onClick={() => { setMoreOpen(false); onGoToActions(); }}>
                  Go to Actions
                </button>
                <button type="button" role="menuitem" onClick={() => { setMoreOpen(false); onChangeSeverity(); }}>
                  Change severity
                </button>
                <button type="button" role="menuitem" onClick={() => { setMoreOpen(false); onAddNote(); }}>
                  Add comment
                </button>
                <button type="button" role="menuitem" onClick={() => { setMoreOpen(false); onGoToActivity(); }}>
                  View activity
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="cg-icon-action cg-preview-close"
            onClick={onClose}
            aria-label="Close investigation workspace"
          >
            <Close size={16} />
          </button>
        </div>
      </div>

      <div className="cg-investigation-header__identity">
        <h2>{item.title}</h2>
      </div>

      <div className="cg-investigation-header__meta">
        <dl className="cg-preview-header-grid cg-investigation-header__grid">
          <div>
            <dt>
              <Task size={14} />
              <span>Status</span>
              <Button kind="ghost" size="sm" onClick={onChangeStatus}>
                Change
              </Button>
            </dt>
            <dd>{item.status}</dd>
          </div>
          <div>
            <dt>
              <UserAvatar size={14} />
              <span>Assignee</span>
              <Button kind="ghost" size="sm" onClick={showAssignToMe ? onAssignToMe : onReassign}>
                {showAssignToMe ? 'Assign to me' : 'Reassign'}
              </Button>
            </dt>
            <dd>{item.assignee}</dd>
          </div>
          <div>
            <dt>
              <Time size={14} />
              <span>SLA</span>
            </dt>
            <dd>{item.sla}</dd>
          </div>
          <div>
            <dt>
              <WarningAlt size={14} />
              <span>Containment</span>
            </dt>
            <dd>{item.containment}</dd>
          </div>
          <div>
            <dt>
              <Time size={14} />
              <span>Time span</span>
            </dt>
            <dd>{item.detection_time} to {item.last_activity}</dd>
          </div>
          <div>
            <dt>
              <span>{item.item_type === 'case' ? 'Alert count' : 'Detection source'}</span>
            </dt>
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
