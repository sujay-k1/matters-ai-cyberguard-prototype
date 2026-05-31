import { Toggle } from '@carbon/react';
import { Renew } from '@carbon/icons-react';

interface WorkQueueHeaderProps {
  totalItems: number;
  criticalCount: number;
  breachedCount: number;
  unassignedCount: number;
  autoRefresh: boolean;
  onAutoRefreshChange: (value: boolean) => void;
}

export function WorkQueueHeader({
  totalItems,
  criticalCount,
  breachedCount,
  unassignedCount,
  autoRefresh,
  onAutoRefreshChange,
}: WorkQueueHeaderProps) {
  return (
    <section className="cg-page-header">
      <div>
        <h1>Work Queue</h1>
        <p>
          {totalItems} open items <span>·</span> {criticalCount} critical <span>·</span>{' '}
          {breachedCount} SLA breached <span>·</span> {unassignedCount} unassigned
        </p>
      </div>
      <div className="cg-header-meta">
        <span>Refreshed just now</span>
        <button type="button" className="cg-icon-action" aria-label="Refresh queue">
          <Renew size={16} />
        </button>
        <Toggle
          id="auto-refresh"
          labelA="Off"
          labelB="On"
          labelText="Auto-refresh"
          size="sm"
          toggled={autoRefresh}
          onToggle={onAutoRefreshChange}
        />
      </div>
    </section>
  );
}
