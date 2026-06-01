export type QueueTab = 'Overview' | 'Work Queue' | 'Activity Log';
export type QueueSegment = 'All' | 'Cases' | 'Alerts';
export type SortOptionId =
  | 'priority-high'
  | 'priority-low'
  | 'severity-high'
  | 'sla-urgent'
  | 'last-activity'
  | 'detection-time'
  | 'title';

export interface FilterDefinition {
  id: string;
  label: string;
  values: string[];
}

export interface FilterSection {
  section: string;
  filters: FilterDefinition[];
}

export interface PreviewPayload {
  identity_and_urgency: {
    type: string;
    id: string;
    title: string;
    severity: string;
    priority: string;
    status: string;
    assignee: string;
    sla: string;
  };
  ai_summary: string;
  why_prioritized: string[];
  affected_systems_resources: string[];
  actors_entities: string[];
  affected_data: string;
  destination_exposure_target: string;
  resource_criticality: string;
  grouping_rationale?: string;
  correlation_status?: string;
  ai_assessment: {
    verdict: string;
    confidence: string;
  };
  automated_investigation_state: string;
  containment_state: string;
  recommended_next_action: string;
  alerts?: Array<{
    id: string;
    title: string;
    severity: string;
    priority: string;
  }>;
}

export interface WorkItem {
  id: string;
  item_type: 'alert' | 'case';
  title: string;
  risk_type: string;
  affected_systems: string[];
  key_resource: string;
  primary_actor: string;
  actor_entity_type: string;
  priority: string;
  priority_score: number;
  severity: string;
  data_sensitivity: string;
  status: string;
  assignee: string;
  sla: string;
  detection_time: string;
  last_activity: string;
  containment: string;
  detection_source: string;
  resource_criticality: string;
  destination_exposure_target: string;
  policy_rule?: string;
  alert_count?: number | null;
  child_alert_ids?: string[];
  tags: string[];
  affected_data_volume?: string;
  preview: PreviewPayload;
  derivedComposition: string;
  analystSeverityOverride?: {
    severity: string;
    comment: string;
    previousSeverity: string;
  };
  classification?: import('./investigation').WorkItemClassification;
  resolution?: import('./investigation').ResolutionRecord;
  lastResolution?: import('./investigation').ResolutionRecord;
  reopenedCount?: number;
  reopenComment?: string;
  localHistory?: string[];
}

export interface ColumnDefinition {
  id: string;
  label: string;
  width: number;
  required?: boolean;
  pinned?: boolean;
  visible: boolean;
}

export interface ToastMessage {
  id: number;
  kind: 'success' | 'info' | 'warning';
  title: string;
  subtitle: string;
}
