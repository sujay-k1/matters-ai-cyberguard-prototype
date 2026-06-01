import { Tag } from '@carbon/react';
import type { InvestigationActivityItem } from '../types/investigation';

interface InvestigationActivityProps {
  activity: InvestigationActivityItem[];
}

export function InvestigationActivity({ activity }: InvestigationActivityProps) {
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
