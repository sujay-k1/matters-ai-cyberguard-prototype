import { Tag } from '@carbon/react';
import type { InvestigationActivityItem } from '../types/investigation';
import { draftSourceLabel } from '../data/aiDraftSuggestions';
import { OperationalState } from './OperationalState';
import { SectionSkeleton } from './SectionSkeleton';

interface InvestigationActivityProps {
  activity: InvestigationActivityItem[];
  loading?: boolean;
  error?: boolean;
  noResults?: boolean;
  onRetry?: () => void;
}

export function InvestigationActivity({ activity, loading = false, error = false, noResults = false, onRetry }: InvestigationActivityProps) {
  if (loading) {
    return <SectionSkeleton heading lines={2} cardCount={4} />;
  }

  if (error) {
    return (
      <OperationalState
        kind="error"
        title="Unable to retrieve activity history."
        description="Activity history could not be loaded."
        primaryActionLabel="Retry"
        onPrimaryAction={onRetry}
      />
    );
  }

  if (!activity.length || noResults) {
    return (
      <OperationalState
        kind={noResults ? 'no-results' : 'empty'}
        title={noResults ? 'No activity events match the current filters.' : 'No analyst or system activity has been recorded yet.'}
        description={noResults ? 'Adjust the current filter context or broaden the activity scope.' : 'Activity will appear after notes, state changes, or system updates.'}
      />
    );
  }

  return (
    <div className="cg-investigation-tab-stack">
      {activity.map((entry) => (
        <article key={entry.id} className="cg-investigation-activity-item">
          <div className="cg-investigation-activity-item__header">
            <div>
              <p className="cg-eyebrow">
                {entry.timestamp} · {entry.actorType}
              </p>
              <h3>{entry.activityType}</h3>
            </div>
            <Tag type={actorTagType(entry.actorType)}>{entry.actor}</Tag>
          </div>
          <p>{entry.description}</p>
          {entry.previousValue || entry.newValue ? (
            <p className="cg-summary-line">
              {entry.previousValue ? `Previous: ${entry.previousValue}` : null}
              {entry.previousValue && entry.newValue ? ' → ' : null}
              {entry.newValue ? `New: ${entry.newValue}` : null}
            </p>
          ) : null}
          {entry.comment ? <p className="cg-summary-line">Comment: {entry.comment}</p> : null}
          {entry.draftProvenance ? <p className="cg-summary-line">Draft source: {draftSourceLabel(entry.draftProvenance)}</p> : null}
        </article>
      ))}
    </div>
  );
}

function actorTagType(actorType: InvestigationActivityItem['actorType']) {
  if (actorType === 'Analyst') return 'blue';
  if (actorType === 'AI') return 'teal';
  return 'gray';
}
