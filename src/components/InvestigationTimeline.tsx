import { Accordion, AccordionItem, Button, Dropdown, Search, Tag } from '@carbon/react';
import { useMemo, useState } from 'react';
import type { TimelineEvent } from '../types/investigation';

interface InvestigationTimelineProps {
  events: TimelineEvent[];
  onUpdateRelevance: (eventId: string, relevance: TimelineEvent['relevance']) => void;
  onAddNote: () => void;
}

const activityTypeOptions = ['All activity', 'Identity', 'Snowflake', 'Endpoint', 'Network', 'Analyst action'];

export function InvestigationTimeline({
  events,
  onUpdateRelevance,
  onAddNote,
}: InvestigationTimelineProps) {
  const [searchValue, setSearchValue] = useState('');
  const [activityType, setActivityType] = useState(activityTypeOptions[0]);
  const [systemFilter, setSystemFilter] = useState('All systems');
  const [alertFilter, setAlertFilter] = useState('All alerts');
  const [entityFilter, setEntityFilter] = useState('All entities');
  const [timeRangeFilter, setTimeRangeFilter] = useState('All times');

  const systemOptions = ['All systems', ...new Set(events.map((event) => event.systemName))];
  const alertOptions = ['All alerts', ...new Set(events.map((event) => event.relatedAlert))];
  const entityOptions = ['All entities', ...new Set(events.map((event) => event.entity))];
  const timeRangeOptions = ['All times', 'Latest 15 minutes', 'Latest 30 minutes', 'Latest hour'];

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesSearch = `${event.category} ${event.systemName} ${event.title} ${event.entity}`
          .toLowerCase()
          .includes(searchValue.toLowerCase());
        const matchesType = activityType === 'All activity' || event.category === activityType;
        const matchesSystem = systemFilter === 'All systems' || event.systemName === systemFilter;
        const matchesAlert = alertFilter === 'All alerts' || event.relatedAlert === alertFilter;
        const matchesEntity = entityFilter === 'All entities' || event.entity === entityFilter;
        const matchesTime = timeRangeFilter === 'All times' || true;
        return matchesSearch && matchesType && matchesSystem && matchesAlert && matchesEntity && matchesTime;
      }),
    [activityType, alertFilter, entityFilter, events, searchValue, systemFilter, timeRangeFilter],
  );

  return (
    <div className="cg-investigation-timeline">
      <div className="cg-investigation-toolbar">
        <Search
          id="timeline-search"
          labelText="Search timeline"
          placeholder="Search timeline"
          value={searchValue}
          onChange={(event) => setSearchValue(event.currentTarget.value)}
        />
        <Dropdown
          id="timeline-activity-type"
          titleText=""
          label="Activity type"
          items={activityTypeOptions.map((entry) => ({ id: entry, label: entry }))}
          selectedItem={{ id: activityType, label: activityType }}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => setActivityType(selectedItem?.label ?? activityTypeOptions[0])}
        />
        <Dropdown
          id="timeline-system-filter"
          titleText=""
          label="System"
          items={systemOptions.map((entry) => ({ id: entry, label: entry }))}
          selectedItem={{ id: systemFilter, label: systemFilter }}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => setSystemFilter(selectedItem?.label ?? 'All systems')}
        />
        <Dropdown
          id="timeline-alert-filter"
          titleText=""
          label="Alert"
          items={alertOptions.map((entry) => ({ id: entry, label: entry }))}
          selectedItem={{ id: alertFilter, label: alertFilter }}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => setAlertFilter(selectedItem?.label ?? 'All alerts')}
        />
        <Dropdown
          id="timeline-entity-filter"
          titleText=""
          label="Entity"
          items={entityOptions.map((entry) => ({ id: entry, label: entry }))}
          selectedItem={{ id: entityFilter, label: entityFilter }}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => setEntityFilter(selectedItem?.label ?? 'All entities')}
        />
        <Dropdown
          id="timeline-time-range"
          titleText=""
          label="Time range"
          items={timeRangeOptions.map((entry) => ({ id: entry, label: entry }))}
          selectedItem={{ id: timeRangeFilter, label: timeRangeFilter }}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => setTimeRangeFilter(selectedItem?.label ?? 'All times')}
        />
      </div>

      <div className="cg-investigation-timeline-list">
        {filteredEvents.map((event) => (
          <div key={event.id} className="cg-investigation-timeline-item">
            <div className="cg-investigation-timeline-item__header">
              <div>
                <p className="cg-eyebrow">
                  {event.timestamp} · {event.category}
                </p>
                <h3>{event.title}</h3>
                <p>{event.systemName}</p>
              </div>
              <Tag type={relevanceTagType(event.relevance)}>{event.relevance}</Tag>
            </div>
            <p>{event.description}</p>
            <div className="cg-investigation-meta-row">
              <span>Related alert: {event.relatedAlert}</span>
              <span>Entity: {event.entity}</span>
            </div>
            <Accordion align="start">
              <AccordionItem title="Expand details">
                <ul className="cg-investigation-bullets">
                  {event.details.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </AccordionItem>
            </Accordion>
            <div className="cg-investigation-action-row">
              <Button kind="ghost" size="sm">
                View raw evidence
              </Button>
              <Button kind="ghost" size="sm" onClick={() => onUpdateRelevance(event.id, 'Relevant')}>
                Mark relevant
              </Button>
              <Button kind="ghost" size="sm" onClick={() => onUpdateRelevance(event.id, 'Irrelevant')}>
                Mark irrelevant
              </Button>
              <Button kind="ghost" size="sm" onClick={onAddNote}>
                Add note
              </Button>
              <Button kind="ghost" size="sm">
                Open related alert
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function relevanceTagType(relevance: TimelineEvent['relevance']) {
  if (relevance === 'Relevant') return 'green';
  if (relevance === 'Irrelevant') return 'cool-gray';
  return 'blue';
}
