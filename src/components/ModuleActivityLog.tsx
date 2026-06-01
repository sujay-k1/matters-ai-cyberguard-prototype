import { Dropdown, Search, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag } from '@carbon/react';
import { useMemo, useState } from 'react';
import type { WorkflowActivityEvent } from '../types/investigation';
import { ActivityEventDetailPanel } from './ActivityEventDetailPanel';

interface ModuleActivityLogProps {
  events: WorkflowActivityEvent[];
  onOpenWorkItem: (itemId: string) => void;
}

export function ModuleActivityLog({ events, onOpenWorkItem }: ModuleActivityLogProps) {
  const [searchValue, setSearchValue] = useState('');
  const [actorType, setActorType] = useState('All actor types');
  const [actionType, setActionType] = useState('All actions');
  const [itemType, setItemType] = useState('All item types');
  const [system, setSystem] = useState('All systems');
  const [result, setResult] = useState('All results');
  const [timeRange, setTimeRange] = useState('All times');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const actorTypes = ['All actor types', ...new Set(events.map((event) => event.actorType))];
  const actionTypes = ['All actions', ...new Set(events.map((event) => event.activityType))];
  const itemTypes = ['All item types', ...new Set(events.map((event) => event.itemType))];
  const systems = ['All systems', ...new Set(events.map((event) => event.system).filter(Boolean) as string[])];
  const results = ['All results', ...new Set(events.map((event) => event.result).filter(Boolean) as string[])];
  const filtered = useMemo(
    () =>
      events.filter((event) => {
        const matchesSearch = `${event.actor} ${event.activityType} ${event.itemId} ${event.itemTitle} ${event.description}`
          .toLowerCase()
          .includes(searchValue.toLowerCase());
        const matchesActorType = actorType === 'All actor types' || event.actorType === actorType;
        const matchesActionType = actionType === 'All actions' || event.activityType === actionType;
        const matchesItemType = itemType === 'All item types' || event.itemType === itemType;
        const matchesSystem = system === 'All systems' || event.system === system;
        const matchesResult = result === 'All results' || event.result === result;
        const matchesTimeRange = timeRange === 'All times' || event.timestamp === 'Just now' || event.timestamp === 'Recent';
        return matchesSearch && matchesActorType && matchesActionType && matchesItemType && matchesSystem && matchesResult && matchesTimeRange;
      }),
    [actionType, actorType, events, itemType, result, searchValue, system, timeRange],
  );
  const selectedEvent = filtered.find((event) => event.id === selectedEventId) ?? events.find((event) => event.id === selectedEventId) ?? null;

  return (
    <section className="cg-module-activity-log">
      <div className="cg-investigation-toolbar">
        <Search id="module-activity-search" labelText="Search activity" placeholder="Search activity" value={searchValue} onChange={(event) => setSearchValue(event.currentTarget.value)} />
        <Dropdown id="module-activity-actor-type" titleText="" label="Actor type" items={actorTypes.map((entry) => ({ id: entry, label: entry }))} selectedItem={{ id: actorType, label: actorType }} itemToString={(item) => item?.label ?? ''} onChange={({ selectedItem }) => setActorType(selectedItem?.label ?? 'All actor types')} />
        <Dropdown id="module-activity-action-type" titleText="" label="Action type" items={actionTypes.map((entry) => ({ id: entry, label: entry }))} selectedItem={{ id: actionType, label: actionType }} itemToString={(item) => item?.label ?? ''} onChange={({ selectedItem }) => setActionType(selectedItem?.label ?? 'All actions')} />
        <Dropdown id="module-activity-item-type" titleText="" label="Item type" items={itemTypes.map((entry) => ({ id: entry, label: entry }))} selectedItem={{ id: itemType, label: itemType }} itemToString={(item) => item?.label ?? ''} onChange={({ selectedItem }) => setItemType(selectedItem?.label ?? 'All item types')} />
        <Dropdown id="module-activity-system" titleText="" label="System" items={systems.map((entry) => ({ id: entry, label: entry }))} selectedItem={{ id: system, label: system }} itemToString={(item) => item?.label ?? ''} onChange={({ selectedItem }) => setSystem(selectedItem?.label ?? 'All systems')} />
        <Dropdown id="module-activity-result" titleText="" label="Result" items={results.map((entry) => ({ id: entry, label: entry }))} selectedItem={{ id: result, label: result }} itemToString={(item) => item?.label ?? ''} onChange={({ selectedItem }) => setResult(selectedItem?.label ?? 'All results')} />
        <Dropdown id="module-activity-time" titleText="" label="Time range" items={['All times', 'Latest activity only'].map((entry) => ({ id: entry, label: entry }))} selectedItem={{ id: timeRange, label: timeRange }} itemToString={(item) => item?.label ?? ''} onChange={({ selectedItem }) => setTimeRange(selectedItem?.label ?? 'All times')} />
      </div>
      <div className="cg-investigation-table-shell">
        <Table size="sm">
          <TableHead>
            <TableRow>
              <TableHeader>Timestamp</TableHeader>
              <TableHeader>Actor</TableHeader>
              <TableHeader>Actor type</TableHeader>
              <TableHeader>Action type</TableHeader>
              <TableHeader>Item ID</TableHeader>
              <TableHeader>Item title</TableHeader>
              <TableHeader>Previous value</TableHeader>
              <TableHeader>New value</TableHeader>
              <TableHeader>Result</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((event) => (
              <TableRow key={event.id} className="cg-investigation-table-row" onClick={() => setSelectedEventId(event.id)}>
                <TableCell>{event.timestamp}</TableCell>
                <TableCell>{event.actor}</TableCell>
                <TableCell><Tag type="cool-gray">{event.actorType}</Tag></TableCell>
                <TableCell>{event.activityType}</TableCell>
                <TableCell>{event.itemId}</TableCell>
                <TableCell>{event.itemTitle}</TableCell>
                <TableCell>{event.previousValue ?? '—'}</TableCell>
                <TableCell>{event.newValue ?? '—'}</TableCell>
                <TableCell>{event.result ?? 'Recorded'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ActivityEventDetailPanel event={selectedEvent} onClose={() => setSelectedEventId(null)} onOpenWorkItem={onOpenWorkItem} />
    </section>
  );
}
