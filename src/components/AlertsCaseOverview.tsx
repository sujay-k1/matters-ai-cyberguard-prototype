import { Button, Tag } from '@carbon/react';

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
}

export function AlertsCaseOverview({
  metrics,
  itemsByStatus,
  topRiskTypes,
  topSystems,
  onOpenWorkQueuePreset,
}: AlertsCaseOverviewProps) {
  const tiles = [
    { label: 'Critical open items', count: metrics.criticalOpenItems, preset: 'critical-open' },
    { label: 'SLA breached', count: metrics.slaBreached, preset: 'sla-breached' },
    { label: 'Unassigned P1 items', count: metrics.unassignedP1, preset: 'unassigned-p1' },
    { label: 'Active exposures', count: metrics.activeExposures, preset: 'active-exposures' },
    { label: 'Pending approvals', count: metrics.pendingApprovals, preset: 'pending-approvals' },
    { label: 'Failed remediation actions', count: metrics.failedActions, preset: 'failed-actions' },
  ];

  return (
    <section className="cg-overview">
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
            {topRiskTypes.map((entry) => (
              <div key={entry.label}><span>{entry.label}</span><Tag type="cool-gray">{entry.count}</Tag></div>
            ))}
          </div>
        </section>
        <section className="cg-overview-section">
          <h2>Top affected systems</h2>
          <div className="cg-overview-list">
            {topSystems.map((entry) => (
              <div key={entry.label}><span>{entry.label}</span><Tag type="cool-gray">{entry.count}</Tag></div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
