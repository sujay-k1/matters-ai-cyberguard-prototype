import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import {
  Accordion,
  AccordionItem,
  AILabel,
  AILabelContent,
  Button,
  OverflowMenu,
  OverflowMenuItem,
  Tag,
} from '@carbon/react';
import {
  Close,
  Data_1,
  FlowStreamReference,
  MachineLearning,
  Task,
  Time,
  UserAvatar,
  WarningAlt,
} from '@carbon/icons-react';
import type { WorkItem } from '../types/queue';

type DrawerSection =
  | 'scope'
  | 'composition'
  | 'correlation'
  | 'intelligence'
  | 'detection';

interface PreviewDrawerProps {
  item: WorkItem;
  currentAnalyst: string;
  onClose: () => void;
  onAssignToMe: () => void;
  onReassign: () => void;
  onChangeStatus: () => void;
  onOpenInvestigation: () => void;
  onChangeSeverity: () => void;
  onAddComment: () => void;
  onEditTags: () => void;
  onRenameCase: () => void;
  onReopenItem: () => void;
  onViewActivityLog: () => void;
  onClassifyItem: () => void;
  onReviewRelatedAlerts: () => void;
  onConsolidateHint: () => void;
}

export function PreviewDrawer({
  item,
  currentAnalyst,
  onClose,
  onAssignToMe,
  onReassign,
  onChangeStatus,
  onOpenInvestigation,
  onChangeSeverity,
  onAddComment,
  onEditTags,
  onRenameCase,
  onReopenItem,
  onViewActivityLog,
  onClassifyItem,
  onReviewRelatedAlerts,
  onConsolidateHint,
}: PreviewDrawerProps) {
  const preview = item.preview;
  const [openSections, setOpenSections] = useState<Record<DrawerSection, boolean>>({
    scope: true,
    composition: item.item_type === 'case',
    correlation: item.item_type === 'alert',
    intelligence: false,
    detection: false,
  });

  useEffect(() => {
    setOpenSections({
      scope: true,
      composition: item.item_type === 'case',
      correlation: item.item_type === 'alert',
      intelligence: false,
      detection: false,
    });
  }, [item.id, item.item_type]);

  const showAssignToMe = item.assignee !== currentAnalyst;
  const severityLabel = item.analystSeverityOverride?.severity ?? item.severity;
  const severityWasOverridden = Boolean(item.analystSeverityOverride);
  const showContainmentInHeader = shouldPromoteContainment(preview.containment_state);
  const showDestination = hasMeaningfulValue(preview.destination_exposure_target);
  const showCriticalityAboveFold = ['Crown jewel', 'Production critical', 'High'].includes(
    preview.resource_criticality || item.resource_criticality,
  );
  const quickFacts = useMemo(
    () =>
      [
        { label: 'Affected systems', value: summarizeSystems(item.affected_systems) },
        { label: 'Primary actor', value: item.primary_actor },
        {
          label: 'Affected data',
          value: [item.data_sensitivity, preview.affected_data].filter(Boolean).join(' · '),
        },
        { label: 'Last activity', value: item.last_activity },
        showDestination ? { label: 'Exposure target', value: preview.destination_exposure_target } : null,
        showCriticalityAboveFold
          ? { label: 'Resource criticality', value: preview.resource_criticality || item.resource_criticality }
          : null,
      ].filter(Boolean) as Array<{ label: string; value: string }>,
    [item, preview, showDestination, showCriticalityAboveFold],
  );

  const lowConfidenceNeedsCaution =
    preview.ai_assessment.confidence === 'Low' ||
    /failed/i.test(preview.automated_investigation_state);

  const relatedAlertSuggestion =
    item.item_type === 'alert' &&
    /review suggested related alerts|related alerts/i.test(preview.correlation_status || '');

  const actorLine =
    item.primary_actor && item.primary_actor !== 'Multiple related entities'
      ? `by ${item.primary_actor}`
      : item.item_type === 'case'
        ? 'Correlated multi-signal case'
        : item.actor_entity_type;
  const natureTitle = item.item_type === 'case' ? 'Nature of case' : 'Nature of alert';
  const natureRows = preview.why_prioritized.slice(0, 5).map((entry, index) => {
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
    <aside className="cg-preview-drawer" aria-label="Item preview" tabIndex={-1}>
      <header className="cg-preview-header">
        <div className="cg-preview-sticky-bar">
          <div className="cg-preview-sticky-meta">
            <Tag type={item.item_type === 'case' ? 'purple' : 'cyan'}>
              {item.item_type === 'case' ? 'Case' : 'Alert'}
            </Tag>
            <span className="cg-mono">{preview.identity_and_urgency.id}</span>
            <Tag type={severityTagType(severityLabel)}>{severityLabel}</Tag>
            <span className="cg-preview-priority">{item.priority}</span>
            {severityWasOverridden ? <Tag type="outline">Analyst override</Tag> : null}
          </div>
          <button
            type="button"
            className="cg-icon-action cg-preview-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            <Close size={16} />
          </button>
        </div>
      </header>

      <div className="cg-preview-body">
        <section className="cg-preview-intro">
          <div className="cg-preview-heading">
            <h2>{preview.identity_and_urgency.title}</h2>
            <p className="cg-preview-subtitle">{actorLine}</p>
          </div>

          <dl className="cg-preview-header-grid">
            <div>
              <dt>
                <Task size={14} />
                <span>Status</span>
                <Button kind="ghost" size="sm" onClick={onChangeStatus}>
                  Change
                </Button>
              </dt>
              <dd>
                <span>{item.status}</span>
              </dd>
            </div>
            <div>
              <dt>
                <UserAvatar size={14} />
                <span>Assignee</span>
                <Button kind="ghost" size="sm" onClick={showAssignToMe ? onAssignToMe : onReassign}>
                  {showAssignToMe ? 'Assign to me' : 'Reassign'}
                </Button>
              </dt>
              <dd>
                <span>{item.assignee}</span>
              </dd>
            </div>
            <div>
              <dt>
                <Time size={14} />
                <span>SLA</span>
              </dt>
              <dd>{item.sla}</dd>
            </div>
            {showContainmentInHeader ? (
              <div>
                <dt>
                  <WarningAlt size={14} />
                  <span>Containment</span>
                </dt>
                <dd>{preview.containment_state}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="cg-triage-brief">
          <PreviewBlock title="AI summary" hideTitle className="cg-ai-layer cg-ai-layer--primary">
            <div className="cg-ai-heading">
              <AILabel
                kind="inline"
                size="sm"
                textLabel="Summary"
                aria-label="AI summary details"
                AILabelContent={<AILabelContent>Generated using current alert and case context.</AILabelContent>}
              />
            </div>
            <p className="cg-readable-copy">{preview.ai_summary}</p>
          </PreviewBlock>

          <PreviewBlock title={natureTitle}>
            <dl className="cg-quick-facts-grid">
              {natureRows.map((row) => (
                <div key={`${row.label}-${row.value}`}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </PreviewBlock>

          <PreviewBlock title="Recommended next step" accent icon={<Task size={16} />}>
            <p>{preview.recommended_next_action}</p>
          </PreviewBlock>

          <PreviewBlock title="Quick facts">
            <dl className="cg-quick-facts-grid">
              {quickFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </PreviewBlock>

          {lowConfidenceNeedsCaution ? (
            <div className="cg-preview-warning cg-ai-layer cg-ai-layer--warning">
              <WarningAlt size={16} />
              <div>
                <strong>Validation required</strong>
                <p>
                  {preview.ai_assessment.confidence === 'Low'
                    ? 'AI confidence is low. Validate the signal before escalation.'
                    : 'Automated investigation needs manual validation.'}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        <Accordion align="start">
          <AccordionItem
            title="Scope and affected resources"
            open={openSections.scope}
            onHeadingClick={() => toggleSection(setOpenSections, 'scope')}
          >
            <div className="cg-preview-subgroup">
              <h4><FlowStreamReference size={14} /> Systems and resources</h4>
              <ul className="cg-entity-list">
                {preview.affected_systems_resources.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
            <div className="cg-preview-subgroup">
              <h4><UserAvatar size={14} /> Actors and entities</h4>
              <ul className="cg-entity-list">
                {preview.actors_entities.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
            <div className="cg-preview-subgroup">
              <h4><Data_1 size={14} /> Affected data</h4>
              <p>{preview.affected_data}</p>
            </div>
          </AccordionItem>

          {item.item_type === 'case' ? (
            <AccordionItem
              title="Case composition"
              open={openSections.composition}
              onHeadingClick={() => toggleSection(setOpenSections, 'composition')}
            >
              <div className="cg-preview-subgroup">
                <p className="cg-summary-line">
                  {item.alert_count ?? 0} alerts across {item.affected_systems.length} systems
                </p>
              </div>
              <div className="cg-preview-subgroup">
                <h4><MachineLearning size={14} /> Grouping rationale</h4>
                <p>{preview.grouping_rationale}</p>
              </div>
              <div className="cg-preview-subgroup">
                <h4>Included alerts</h4>
                <div className="cg-alert-rows">
                  {(preview.alerts ?? []).slice(0, 5).map((alert) => (
                    <div key={alert.id} className="cg-alert-row">
                      <Tag type={severityTagType(alert.severity)}>{alert.severity}</Tag>
                      <div>
                        <strong>{alert.id}</strong>
                        <p>{alert.title}</p>
                      </div>
                      <span>{alert.priority}</span>
                    </div>
                  ))}
                </div>
                {(preview.alerts?.length ?? 0) > 5 ? (
                  <Button kind="ghost" size="sm" onClick={onReviewRelatedAlerts}>
                    View all {preview.alerts?.length} alerts
                  </Button>
                ) : null}
              </div>
            </AccordionItem>
          ) : (
            <AccordionItem
              title="Correlation"
              open={openSections.correlation}
              onHeadingClick={() => toggleSection(setOpenSections, 'correlation')}
            >
              <p>{preview.correlation_status || 'No related alerts identified yet.'}</p>
              {relatedAlertSuggestion ? (
                <div className="cg-inline-actions">
                  <div className="cg-ai-inline-note cg-ai-layer cg-ai-layer--secondary">
                    <AILabel
                      kind="inline"
                      size="sm"
                      textLabel="Related alerts identified"
                      aria-label="AI related alerts note"
                      AILabelContent={<AILabelContent>Use this suggestion as triage guidance before consolidating alerts.</AILabelContent>}
                    />
                  </div>
                  <div>
                    <Button kind="ghost" size="sm" onClick={onReviewRelatedAlerts}>
                      Review related alerts
                    </Button>
                    <Button kind="secondary" size="sm" onClick={onConsolidateHint}>
                      Consolidate into case
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="cg-summary-line">No related alerts identified yet.</p>
              )}
            </AccordionItem>
          )}

          <AccordionItem
            title="Intelligence and automation"
            open={openSections.intelligence}
            onHeadingClick={() => toggleSection(setOpenSections, 'intelligence')}
          >
            <div className="cg-ai-heading cg-ai-heading--section cg-ai-layer cg-ai-layer--secondary">
              <AILabel
                kind="inline"
                size="sm"
                textLabel="Assessment"
                aria-label="AI assessment details"
                AILabelContent={<AILabelContent>Confidence and verdict are advisory inputs for triage.</AILabelContent>}
              />
            </div>
            <dl className="cg-definition-list cg-ai-layer cg-ai-layer--secondary cg-ai-layer--dense">
              <div>
                <dt>AI verdict</dt>
                <dd>{preview.ai_assessment.verdict}</dd>
              </div>
              <div>
                <dt>AI confidence</dt>
                <dd>{preview.ai_assessment.confidence}</dd>
              </div>
              <div>
                <dt>Automated investigation</dt>
                <dd>{preview.automated_investigation_state}</dd>
              </div>
            </dl>
          </AccordionItem>

          <AccordionItem
            title="Detection details"
            open={openSections.detection}
            onHeadingClick={() => toggleSection(setOpenSections, 'detection')}
          >
            <dl className="cg-definition-list">
              <div>
                <dt>Detection source</dt>
                <dd>{item.detection_source}</dd>
              </div>
              {hasMeaningfulValue(item.policy_rule) ? (
                <div>
                  <dt>Policy / rule</dt>
                  <dd>{item.policy_rule}</dd>
                </div>
              ) : null}
              <div>
                <dt>Detected at</dt>
                <dd>{item.detection_time}</dd>
              </div>
              <div>
                <dt>Last activity</dt>
                <dd>{item.last_activity}</dd>
              </div>
              {item.tags.length > 0 ? (
                <div className="cg-definition-tags">
                  <dt>Tags</dt>
                  <dd>
                    {item.tags.map((tag) => (
                      <Tag key={tag} type="gray">
                        {tag}
                      </Tag>
                    ))}
                  </dd>
                </div>
              ) : null}
              {!showCriticalityAboveFold && hasMeaningfulValue(item.resource_criticality) ? (
                <div>
                  <dt>Resource criticality</dt>
                  <dd>{item.resource_criticality}</dd>
                </div>
              ) : null}
              <div>
                <dt>Stable ID</dt>
                <dd><span className="cg-mono">{item.id}</span></dd>
              </div>
            </dl>
          </AccordionItem>
        </Accordion>
      </div>

      <footer className="cg-preview-footer">
        <Button size="sm" onClick={onOpenInvestigation}>
          Open investigation
        </Button>
        <div className="cg-preview-more-actions">
          <span>More actions</span>
          <OverflowMenu
            aria-label="More actions"
            size="sm"
            direction="top"
            flipped
            iconDescription="More actions"
          >
            <OverflowMenuItem itemText="Change severity" onClick={onChangeSeverity} />
            <OverflowMenuItem itemText="Add comment" onClick={onAddComment} />
            <OverflowMenuItem itemText="Edit tags" onClick={onEditTags} />
            {item.item_type === 'case' ? (
              <OverflowMenuItem itemText="Rename case" onClick={onRenameCase} />
            ) : null}
            {item.status === 'Resolved' ? (
              <OverflowMenuItem itemText="Reopen case" onClick={onReopenItem} />
            ) : null}
            <OverflowMenuItem itemText="View activity log" onClick={onViewActivityLog} />
            <OverflowMenuItem itemText="Classify item" onClick={onClassifyItem} />
          </OverflowMenu>
        </div>
      </footer>
    </aside>
  );
}

function PreviewBlock({
  title,
  accent = false,
  hideTitle = false,
  className,
  icon,
  children,
}: {
  title: string;
  accent?: boolean;
  hideTitle?: boolean;
  className?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={`cg-preview-block${accent ? ' is-accent' : ''}${className ? ` ${className}` : ''}`}>
      {!hideTitle ? (
        <h3>
          {icon ? <span className="cg-section-icon">{icon}</span> : null}
          <span>{title}</span>
        </h3>
      ) : null}
      {children}
    </section>
  );
}

function severityTagType(severity: string) {
  if (severity === 'Critical') return 'red';
  if (severity === 'High') return 'magenta';
  if (severity === 'Medium') return 'blue';
  if (severity === 'Low') return 'teal';
  return 'gray';
}

function hasMeaningfulValue(value?: string | null) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== 'not applicable' && normalized !== '—' && normalized !== 'n/a';
}

function shouldPromoteContainment(value?: string | null) {
  return [
    'not contained',
    'active exposure',
    'partially contained',
    'automated containment running',
    'manual containment required',
  ].includes((value || '').toLowerCase());
}

function summarizeSystems(systems: string[]) {
  if (systems.length <= 3) return systems.join(', ');
  return `${systems.slice(0, 3).join(', ')} +${systems.length - 3} more`;
}


function toggleSection(
  setOpenSections: Dispatch<SetStateAction<Record<DrawerSection, boolean>>>,
  key: DrawerSection,
) {
  setOpenSections((current) => ({
    ...current,
    [key]: !current[key],
  }));
}
