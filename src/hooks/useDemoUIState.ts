import { useMemo } from 'react';
import type { AsyncViewState, DemoUIState } from '../types/uiState';

type SurfaceId =
  | 'queue'
  | 'filter'
  | 'overview'
  | 'preview'
  | 'preview-ai'
  | 'investigation'
  | 'summary-ai'
  | 'summary-tasks'
  | 'timeline'
  | 'evidence'
  | 'entities'
  | 'baseline'
  | 'actions'
  | 'containment'
  | 'activity'
  | 'hunt';

const SURFACE_MAP: Partial<Record<DemoUIState, Partial<Record<SurfaceId, AsyncViewState>>>> = {
  'queue-loading': { queue: { status: 'loading', title: 'Loading work items', description: 'Retrieving work items for the queue.' } },
  'queue-refreshing': { queue: { status: 'refreshing', title: 'Refreshing work items', description: 'Refreshing work items…' } },
  'queue-empty': { queue: { status: 'empty', title: 'No alerts or cases require attention.', description: 'New work items will appear here when risks are detected.' } },
  'queue-no-results': { queue: { status: 'no-results', title: 'No work items match “guest tenant”.', description: 'Try a broader search or clear the current scope.' } },
  'queue-error': { queue: { status: 'error', title: 'Unable to load work items.', description: 'The queue could not be retrieved.', retryLabel: 'Retry' } },
  'filter-no-results': { filter: { status: 'no-results', title: 'No filter families match “shadow”.', description: 'Try a broader filter search or clear the current value.' } },
  'overview-loading': { overview: { status: 'loading', title: 'Loading overview', description: 'Calculating operational metrics…' } },
  'overview-empty': { overview: { status: 'empty', title: 'No urgent items require attention.', description: 'The current environment has no open security work.' } },
  'overview-partial-error': { overview: { status: 'partial', title: 'Some Overview metrics could not be calculated.', description: 'Showing available operational data.', retryLabel: 'Retry' } },
  'preview-loading': { preview: { status: 'loading', title: 'Loading preview', description: 'Retrieving item details…' } },
  'preview-ai-loading': { 'preview-ai': { status: 'loading', title: 'Generating AI summary…', description: 'Summarizing current alert and case context.' } },
  'preview-ai-error': { 'preview-ai': { status: 'error', title: 'AI summary unavailable.', description: 'Review quick facts and evidence directly.' } },
  'investigation-loading': { investigation: { status: 'loading', title: 'Retrieving correlated evidence…', description: 'Loading the investigation workspace.' } },
  'investigation-error': { investigation: { status: 'error', title: 'Unable to load investigation workspace.', description: 'The queue item remains available for triage.', retryLabel: 'Retry', secondaryLabel: 'Return to queue' } },
  'investigation-partial': { investigation: { status: 'partial', title: 'Some telemetry sources are temporarily unavailable.', description: 'Loaded evidence remains available.', detail: 'Snowflake, Proxy logs' } },
  'summary-ai-loading': { 'summary-ai': { status: 'loading', title: 'Generating investigation summary…', description: 'Building the AI summary from the current case context.' } },
  'summary-ai-error': { 'summary-ai': { status: 'error', title: 'AI summary unavailable.', description: 'Review the timeline and evidence directly.' } },
  'summary-empty-tasks': { 'summary-tasks': { status: 'empty', title: 'No investigation tasks yet.', description: 'Create a task to track the next investigation step.' } },
  'timeline-loading': { timeline: { status: 'loading', title: 'Loading timeline', description: 'Retrieving correlated timeline events…' } },
  'timeline-empty': { timeline: { status: 'empty', title: 'No timeline events are attached to this investigation yet.', description: 'Expand the investigation scope to see normalized event history.' } },
  'timeline-no-results': { timeline: { status: 'no-results', title: 'No timeline events match the current filters.', description: 'Clear one or more timeline filters to broaden the view.' } },
  'timeline-error': { timeline: { status: 'error', title: 'Unable to retrieve timeline events.', description: 'Timeline data could not be retrieved.', retryLabel: 'Retry' } },
  'evidence-loading': { evidence: { status: 'loading', title: 'Loading evidence', description: 'Retrieving alerts and evidence items…' } },
  'evidence-empty': { evidence: { status: 'empty', title: 'No evidence items are attached yet.', description: 'Expand the investigation scope or attach hunt results.' } },
  'evidence-error': { evidence: { status: 'error', title: 'Unable to retrieve evidence items.', description: 'Loaded alerts remain available.', retryLabel: 'Retry' } },
  'entities-loading': { entities: { status: 'loading', title: 'Loading entities', description: 'Identifying people, devices, resources, and destinations…' } },
  'entities-empty': { entities: { status: 'empty', title: 'No entities or assets have been identified yet.', description: 'Expand the scope or attach additional evidence to identify related entities.' } },
  'baseline-error': { baseline: { status: 'error', title: 'Unable to calculate baseline comparison.', description: 'Review direct activity and evidence instead.' } },
  'actions-loading': { actions: { status: 'loading', title: 'Loading response actions', description: 'Calculating response recommendations and containment state…' } },
  'actions-empty': { actions: { status: 'empty', title: 'No immediate response actions are recommended.', description: 'Continue investigation or add an analyst note.' } },
  'containment-error': { containment: { status: 'error', title: 'Unable to derive containment state.', description: 'Review required action progress manually.', retryLabel: 'Retry' } },
  'activity-empty': { activity: { status: 'empty', title: 'No activity has been recorded yet.', description: 'Analyst and system activity will appear here as work progresses.' } },
  'activity-no-results': { activity: { status: 'no-results', title: 'No activity events match the current filters.', description: 'Clear one or more activity filters to broaden the results.' } },
  'activity-error': { activity: { status: 'error', title: 'Unable to retrieve activity history.', description: 'The current activity feed could not be retrieved.', retryLabel: 'Retry' } },
  'hunt-loading': { hunt: { status: 'loading', title: 'Searching related activity…', description: 'Looking for related events and evidence.' } },
  'hunt-empty': { hunt: { status: 'empty', title: 'No additional related activity was found.', description: 'Try a broader investigation path or review direct evidence.' } },
  'hunt-no-results': { hunt: { status: 'no-results', title: 'No hunt results match your search.', description: 'Clear the hunt search term to restore results.' } },
  'hunt-error': { hunt: { status: 'error', title: 'Unable to search related activity.', description: 'The hunt workflow is temporarily unavailable.', retryLabel: 'Retry' } },
};

export function useDemoUIState() {
  const state = useMemo(
    () => new URLSearchParams(window.location.search).get('state') as DemoUIState | null,
    [],
  );

  const surfaceStates = (state ? SURFACE_MAP[state] : undefined) ?? {};

  return {
    state,
    isDemoState: (name: DemoUIState) => state === name,
    getSurfaceState: (surfaceId: SurfaceId) => surfaceStates[surfaceId],
    sourceSystemScenario:
      state === 'source-system-error' ||
      state === 'source-system-permission-denied' ||
      state === 'source-system-record-unavailable' ||
      state === 'source-system-timeout' ||
      state === 'source-system-info'
        ? state
        : null,
    submissionScenario:
      state === 'merge-error' ||
      state === 'approval-submit-error' ||
      state === 'escalation-submit-error' ||
      state === 'resolution-submit-error'
        ? state
        : null,
  };
}
