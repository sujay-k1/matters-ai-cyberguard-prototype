import { Checkbox, InlineLoading, Modal, Search } from '@carbon/react';
import { useMemo, useState } from 'react';
import type { HuntResult } from '../types/investigation';
import { InlineStateNotice } from './InlineStateNotice';
import { OperationalState } from './OperationalState';

interface HuntResultsModalProps {
  open: boolean;
  results: HuntResult[];
  selectedIds: string[];
  onToggleSelected: (id: string) => void;
  onClose: () => void;
  onAttachSelected: () => void;
  loading?: boolean;
  error?: boolean;
  noResults?: boolean;
  onRetry?: () => void;
}

export function HuntResultsModal({
  open,
  results,
  selectedIds,
  onToggleSelected,
  onClose,
  onAttachSelected,
  loading = false,
  error = false,
  noResults = false,
  onRetry,
}: HuntResultsModalProps) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () =>
      results.filter((result) =>
        `${result.type} ${result.title} ${result.description} ${result.sourceSystem} ${result.entity}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [results, search],
  );

  return (
    <Modal
      open={open}
      modalHeading="Hunt results"
      primaryButtonText="Attach selected to case"
      secondaryButtonText="Close"
      primaryButtonDisabled={selectedIds.length === 0}
      onRequestClose={onClose}
      onRequestSubmit={onAttachSelected}
    >
      <div className="cg-dialog-stack">
        {loading ? <InlineLoading description="Searching related activity…" /> : null}
        {error ? (
          <InlineStateNotice
            kind="error"
            title="Unable to search related activity."
            subtitle="The hunt results could not be retrieved."
            actionLabel="Retry"
            onAction={onRetry}
          />
        ) : null}
        <Search id="hunt-result-search" labelText="Search hunt results" placeholder="Search hunt results" value={search} onChange={(event) => setSearch(event.currentTarget.value)} />
        <div className="cg-hunt-results-list">
          {!loading && !error && !results.length ? (
            <OperationalState
              kind="empty"
              compact
              title="No additional related activity was found."
              description="Try a different entity, source, or time range."
            />
          ) : !loading && !error && (noResults || !filtered.length) ? (
            <OperationalState
              kind="no-results"
              compact
              title="No hunt results match your search."
              description="Clear the search to review all retrieved results."
              primaryActionLabel="Clear search"
              onPrimaryAction={() => setSearch('')}
            />
          ) : filtered.map((result) => (
            <label key={result.id} className="cg-hunt-result-row">
              <Checkbox id={`hunt-${result.id}`} labelText="" checked={selectedIds.includes(result.id)} onChange={() => onToggleSelected(result.id)} />
              <div>
                <strong>{result.title}</strong>
                <p>{result.description}</p>
                <span>{result.sourceSystem} · {result.entity} · {result.timestamp}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </Modal>
  );
}
