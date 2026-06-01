import type { WorkItem } from './queue';

export type InvestigationTabId =
  | 'summary'
  | 'timeline'
  | 'evidence'
  | 'entities'
  | 'actions'
  | 'activity';

export type InvestigationRelevance = 'Relevant' | 'Irrelevant' | 'Needs review';
export type WorkItemClassification =
  | 'True positive — malicious activity'
  | 'True positive — policy violation'
  | 'Expected business activity'
  | 'False positive'
  | 'Duplicate'
  | 'Accepted risk'
  | 'Needs monitoring';
export type ResponseActionState =
  | 'Recommended'
  | 'Pending approval'
  | 'Approved'
  | 'In progress'
  | 'Completed'
  | 'Failed'
  | 'Rejected'
  | 'Cancelled';

export interface InvestigationTask {
  id: string;
  title: string;
  owner: string;
  completed: boolean;
}

export interface InvestigationNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface TimelineEvent {
  id: string;
  occurredAt: string;
  timestamp: string;
  category: string;
  systemName: string;
  title: string;
  description: string;
  relatedAlert: string;
  entity: string;
  relevance: InvestigationRelevance;
  details: string[];
  evidenceId?: string;
  attached?: boolean;
}

export interface EvidenceItem {
  id: string;
  eventType: string;
  timestamp: string;
  sourceSystem: string;
  entity: string;
  description: string;
  rawRecordAvailable: boolean;
  verdict: InvestigationRelevance;
  attached: boolean;
  timelineEventId?: string;
  relatedAlertId?: string;
  sourceContext?: string;
  details: string[];
}

export interface IncludedAlertItem {
  id: string;
  title: string;
  severity: string;
  priority: string;
  detectionSource: string;
  system: string;
  linkedEventsCount: number;
  status: string;
  linkingRationale: string;
  relevance: InvestigationRelevance;
  parentCaseId?: string | null;
  linkedEvidenceIds?: string[];
  relatedEntityIds?: string[];
  detectedAt?: string;
}

export interface InvestigationEntity {
  id: string;
  type: string;
  displayName: string;
  riskLevel: string;
  roleInCase: string;
  relatedAlertCount: number;
  relatedEventCount: number;
  lastActivity: string;
  profileSummary: string;
  baselineComparison: string;
  permissions: string[];
  relatedAssets: string[];
  suggestedChecks: string[];
  responseCandidates: string[];
  recentActivity?: Array<{
    id: string;
    timestamp: string;
    source: string;
    title: string;
    detail: string;
    evidenceId?: string;
    alertId?: string;
  }>;
  baselineSignals?: Array<{
    metric: string;
    baseline: string;
    observed: string;
    difference: string;
    whyItMatters: string;
  }>;
  relatedAlertIds?: string[];
  relatedCaseIds?: string[];
}

export interface InvestigationResponseAction {
  id: string;
  title: string;
  affectedEntity: string;
  reason: string;
  expectedEffect: string;
  businessImpact: string;
  reversibility: string;
  approvalRequirement: string;
  currentState: ResponseActionState;
  createdBy: 'AI' | 'Analyst' | 'System';
  auditTimestamp: string;
  requiresApproval: boolean;
  approverRole?: string;
  approver?: string;
  approvalRequestedBy?: string;
  approvalRequestedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  failureReason?: string;
  retryCount?: number;
  requiredForContainment: boolean;
  containmentCategory?: string;
  dependencies?: string[];
  history?: InvestigationActivityItem[];
  note?: string;
}

export interface InvestigationActivityItem {
  id: string;
  timestamp: string;
  actor: string;
  actorType: 'Analyst' | 'AI' | 'System';
  activityType: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  comment?: string;
}

export interface ResolutionRecord {
  classification: WorkItemClassification;
  resolutionSummary: string;
  rootCause: string;
  remediationSummary: string;
  residualRisk: string;
  monitoringRequired: boolean;
  notificationRecipients: string[];
  resolvedBy: string;
  resolvedAt: string;
  resolvedWithException: boolean;
  exceptionReason?: string;
  childAlertHandling: 'resolve-all' | 'detach-selected';
  detachedAlertIds?: string[];
}

export interface ClassificationRecord {
  classification: WorkItemClassification;
  comment: string;
  updatedBy: string;
  updatedAt: string;
  duplicateCaseId?: string;
  exceptionOwner?: string;
  tuningFeedbackCreated?: boolean;
}

export interface HuntResult {
  id: string;
  type: string;
  title: string;
  description: string;
  sourceSystem: string;
  entity: string;
  timestamp: string;
  attached: boolean;
}

export interface EscalationRecord {
  team: string;
  urgency: string;
  reason: string;
  note: string;
  createdBy: string;
  createdAt: string;
  taskOwner?: string;
  notifyDataOwner: boolean;
}

export interface InvestigationPlaybook {
  questionsToAnswer: string[];
  priorityEvidence: string[];
  recommendedChecks: string[];
  likelyResponseActions: string[];
  possibleFalsePositiveReasons: string[];
}

export interface SystemEvidenceModule {
  category: string;
  evidenceCards: string[];
  entityTypes: string[];
  baselineComparisons: string[];
  investigationChecks: string[];
  responseCandidates: string[];
}

export interface InvestigationFixture {
  itemId: string;
  summaryParagraphs: string[];
  quickFacts: Array<{ label: string; value: string | string[] }>;
  scopeSummary: Array<{ label: string; value: string }>;
  recommendedChecks: InvestigationTask[];
  hypothesis: string;
  openQuestions: string[];
  timelineEvents: TimelineEvent[];
  alerts: IncludedAlertItem[];
  evidence: EvidenceItem[];
  entities: InvestigationEntity[];
  actions: InvestigationResponseAction[];
  notes: InvestigationNote[];
  activity: InvestigationActivityItem[];
  missingEvidence: string[];
  falsePositiveExplanation: string;
  suggestedNextCheck: string;
  dataOwner: string;
  handoffTeams: string[];
  timeSpan: string;
  entityCount: number;
  huntResults?: HuntResult[];
}

export interface InvestigationWorkspaceState {
  hypothesis: string;
  tasks: InvestigationTask[];
  notes: InvestigationNote[];
  timeline: TimelineEvent[];
  evidence: EvidenceItem[];
  alerts: IncludedAlertItem[];
  entities: InvestigationEntity[];
  actions: InvestigationResponseAction[];
  activity: InvestigationActivityItem[];
  classification?: WorkItemClassification;
  classificationRecord?: ClassificationRecord;
  resolution?: ResolutionRecord;
  lastResolution?: ResolutionRecord;
  escalations: EscalationRecord[];
  huntResults: HuntResult[];
  selectedEvidenceId: string | null;
  selectedEntityId: string | null;
  selectedAlertId: string | null;
  selectedActionId: string | null;
  selectedTimelineEventId: string | null;
}

export interface InvestigationContext {
  item: WorkItem;
  fixture: InvestigationFixture;
  playbook: InvestigationPlaybook;
  evidenceModules: SystemEvidenceModule[];
}

export interface WorkflowActivityEvent extends InvestigationActivityItem {
  itemId: string;
  itemTitle: string;
  itemType: WorkItem['item_type'];
  affectedEntity?: string;
  result?: string;
  system?: string;
  riskType?: string;
  linkedActionId?: string;
}
