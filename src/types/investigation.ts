import type { WorkItem } from './queue';

export type InvestigationTabId =
  | 'summary'
  | 'timeline'
  | 'evidence'
  | 'entities'
  | 'actions'
  | 'activity';

export type InvestigationRelevance = 'Relevant' | 'Irrelevant' | 'Needs review';
export type ResponseActionState =
  | 'Recommended'
  | 'Pending approval'
  | 'In progress'
  | 'Completed'
  | 'Failed'
  | 'Rejected';

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
  timestamp: string;
  category: string;
  systemName: string;
  title: string;
  description: string;
  relatedAlert: string;
  entity: string;
  relevance: InvestigationRelevance;
  details: string[];
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
  quickFacts: Array<{ label: string; value: string }>;
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
  selectedEvidenceId: string | null;
  selectedEntityId: string | null;
}

export interface InvestigationContext {
  item: WorkItem;
  fixture: InvestigationFixture;
  playbook: InvestigationPlaybook;
  evidenceModules: SystemEvidenceModule[];
}
