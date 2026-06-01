export type AsyncViewStatus =
  | 'ready'
  | 'loading'
  | 'refreshing'
  | 'empty'
  | 'no-results'
  | 'unavailable'
  | 'error'
  | 'partial';

export interface AsyncViewState {
  status: AsyncViewStatus;
  title?: string;
  description?: string;
  detail?: string;
  retryLabel?: string;
  secondaryLabel?: string;
}

export type DemoUIState =
  | 'queue-loading'
  | 'queue-refreshing'
  | 'queue-empty'
  | 'queue-no-results'
  | 'queue-error'
  | 'filter-no-results'
  | 'overview-loading'
  | 'overview-empty'
  | 'overview-partial-error'
  | 'preview-loading'
  | 'preview-ai-loading'
  | 'preview-ai-error'
  | 'investigation-loading'
  | 'investigation-error'
  | 'investigation-partial'
  | 'summary-ai-loading'
  | 'summary-ai-error'
  | 'summary-empty-tasks'
  | 'timeline-loading'
  | 'timeline-empty'
  | 'timeline-no-results'
  | 'timeline-error'
  | 'evidence-loading'
  | 'evidence-empty'
  | 'evidence-error'
  | 'entities-loading'
  | 'entities-empty'
  | 'baseline-error'
  | 'actions-loading'
  | 'actions-empty'
  | 'containment-error'
  | 'activity-empty'
  | 'activity-no-results'
  | 'activity-error'
  | 'hunt-loading'
  | 'hunt-empty'
  | 'hunt-no-results'
  | 'hunt-error'
  | 'source-system-info'
  | 'source-system-error'
  | 'source-system-permission-denied'
  | 'source-system-record-unavailable'
  | 'source-system-timeout'
  | 'merge-error'
  | 'approval-submit-error'
  | 'escalation-submit-error'
  | 'resolution-submit-error';
