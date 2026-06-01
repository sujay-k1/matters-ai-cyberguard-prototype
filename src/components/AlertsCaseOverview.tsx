import { Button, Tag } from '@carbon/react';
import type { AsyncViewState } from '../types/uiState';
import { InlineStateNotice } from './InlineStateNotice';
import { OperationalState } from './OperationalState';
import { SectionSkeleton } from './SectionSkeleton';

interface AlertsCaseOverviewProps {
  metrics: {
    criticalOpenItems: number;
    slaBreached: number;
    unassignedP1: number;
    activeExposures: number;
    pendingApprovals: number;
    failedActions: number;
    resolvedToday: number;
  };
  itemsByStatus: Record<string, number>;
  topRiskTypes: Array<{ label: string; count: number }>;
  topSystems: Array<{ label: string; count: number }>;
  onOpenWorkQueuePreset: (preset: string) => void;
  state?: AsyncViewState;
  partialSections?: string[];
  onRetry?: () => void;
}

export function AlertsCaseOverview({
  metrics,
  itemsByStatus,
  topRiskTypes,
  topSystems,
  onOpenWorkQueuePreset,
  state,
  partialSections = [],
  onRetry,
}: AlertsCaseOverviewProps) {
  const tiles = [
    { label: 'Critical open items', count: metrics.criticalOpenItems, preset: 'critical-open' },
    { label: 'SLA breached', count: metrics.slaBreached, preset: 'sla-breached' },
    { label: 'Unassigned P1 items', count: metrics.unassignedP1, preset: 'unassigned-p1' },
    { label: 'Active exposures', count: metrics.activeExposures, preset: 'active-exposures' },
    { label: 'Pending approvals', count: metrics.pendingApprovals, preset: 'pending-approvals' },
    { label: 'Failed remediation actions', count: metrics.failedActions, preset: 'failed-actions' },
  ];

  if (state?.status === 'loading') {
    return (
      <section className="cg-overview">
        <SectionSkeleton heading lines={2} cardCount={6} />
        <SectionSkeleton heading lines={2} cardCount={2} />
      </section>
    );
  }

  return (
    <section className="cg-overview">
      {state?.status === 'partial' ? (
        <InlineStateNotice
          kind="warning"
          title={state.title ?? 'Some Overview metrics could not be calculated.'}
          subtitle={state.description ?? 'Showing available operational data.'}
          actionLabel={state.retryLabel}
          onAction={onRetry}
        />
      ) : null}
      {state?.status === 'empty' ? (
        <OperationalState
          kind="empty"
          title={state.title ?? 'No urgent items require attention.'}
          description={state.description ?? 'The current environment has no open security work.'}
          compact
        />
      ) : null}
      <div className="cg-overview-section">
        <div className="cg-overview-section__header">
          <h2>Immediate attention</h2>
        </div>
        <div className="cg-overview-tiles">
          {tiles.map((tile) => (
            <article key={tile.label} className="cg-overview-tile">
              <span className="cg-eyebrow">{tile.label}</span>
              <strong>{tile.count}</strong>
              <Button kind="ghost" size="sm" onClick={() => onOpenWorkQueuePreset(tile.preset)}>
                View in Work Queue
              </Button>
            </article>
          ))}
        </div>
      </div>

      <div className="cg-overview-section">
        <h2>Workflow load</h2>
        <div className="cg-overview-status-strip">
          {Object.entries(itemsByStatus).map(([status, count]) => (
            <div key={status} className="cg-overview-status-chip">
              <span>{status}</span>
              <strong>{count}</strong>
            </div>
          ))}
          <div className="cg-overview-status-chip">
            <span>Resolved today</span>
            <strong>{metrics.resolvedToday}</strong>
          </div>
        </div>
      </div>

      <div className="cg-overview-grid">
        <section className="cg-overview-section">
          <h2>Risk patterns</h2>
          <div className="cg-overview-list">
            {topRiskTypes.length ? topRiskTypes.map((entry) => (
              <div key={entry.label}><span>{entry.label}</span><Tag type="cool-gray">{entry.count}</Tag></div>
            )) : (
              <OperationalState compact kind="empty" title="Risk patterns will appear after alerts are detected." description="No risk-type rollups are available in the current scope." />
            )}
          </div>
        </section>
        <section className="cg-overview-section">
          <h2>Top affected systems</h2>
          <div className="cg-overview-list">
            {topSystems.length ? topSystems.map((entry) => (
              <div key={entry.label}><span>{entry.label}</span><Tag type="cool-gray">{entry.count}</Tag></div>
            )) : (
              <OperationalState compact kind="empty" title="No affected systems are recorded in the current scope." description="System rollups will appear when open work items contain affected systems." />
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
