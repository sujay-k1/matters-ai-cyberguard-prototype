import type { WorkItem } from '../types/queue';
import type {
  EvidenceItem,
  IncludedAlertItem,
  InvestigationActivityItem,
  InvestigationContext,
  InvestigationEntity,
  InvestigationFixture,
  InvestigationNote,
  InvestigationResponseAction,
  InvestigationTask,
  SystemEvidenceModule,
  TimelineEvent,
} from '../types/investigation';
import { getInvestigationPlaybook } from './investigationPlaybooks';

export const SYSTEM_EVIDENCE_MODULES: Record<string, SystemEvidenceModule> = {
  'Identity & access': {
    category: 'Identity & access',
    evidenceCards: ['Sign-in location', 'MFA result', 'Session risk', 'Privileged role use'],
    entityTypes: ['internal user', 'privileged user', 'service account', 'IP address'],
    baselineComparisons: ['usual login hours', 'known device', 'known IP ranges'],
    investigationChecks: ['Validate sign-in context', 'Review session reuse', 'Confirm privilege path'],
    responseCandidates: ['Reset credentials', 'Revoke sessions', 'Require re-authentication'],
  },
  'SaaS & collaboration': {
    category: 'SaaS & collaboration',
    evidenceCards: ['Share event', 'Recipient', 'Download count', 'Reshare chain'],
    entityTypes: ['external collaborator', 'SaaS workspace', 'file', 'destination'],
    baselineComparisons: ['normal sharing pattern', 'frequent recipients', 'usual workspaces'],
    investigationChecks: ['Validate recipient ownership', 'Check share scope', 'Review downstream resharing'],
    responseCandidates: ['Remove share', 'Disable external sharing', 'Notify owner'],
  },
  'Cloud platforms': {
    category: 'Cloud platforms',
    evidenceCards: ['Resource policy', 'Public path', 'IAM role', 'Exposure validation'],
    entityTypes: ['cloud resource', 'bucket', 'policy', 'IP address'],
    baselineComparisons: ['expected policy state', 'approved network scope'],
    investigationChecks: ['Validate exposure path', 'Compare policy diff', 'Confirm public reachability'],
    responseCandidates: ['Restrict network access', 'Rollback policy', 'Disable public endpoint'],
  },
  'Endpoints & devices': {
    category: 'Endpoints & devices',
    evidenceCards: ['File path', 'Process tree', 'Browser upload', 'EDR verdict'],
    entityTypes: ['device', 'file', 'internal user'],
    baselineComparisons: ['usual file staging', 'normal browser destinations'],
    investigationChecks: ['Review endpoint timeline', 'Inspect file creation', 'Validate browser upload'],
    responseCandidates: ['Isolate device', 'Collect forensic package', 'Block process'],
  },
  'Databases & warehouses': {
    category: 'Databases & warehouses',
    evidenceCards: ['Query text', 'Rows exported', 'Client IP', 'Role used'],
    entityTypes: ['database', 'table', 'service account', 'internal user'],
    baselineComparisons: ['usual export size', 'normal query families', 'typical hours'],
    investigationChecks: ['Validate query scope', 'Confirm row count', 'Compare with export baseline'],
    responseCandidates: ['Suspend export permission', 'Rotate credentials', 'Require approval for bulk exports'],
  },
  'File stores & content repositories': {
    category: 'File stores & content repositories',
    evidenceCards: ['Sharing config', 'Download activity', 'File owner', 'Folder lineage'],
    entityTypes: ['file', 'document owner', 'repository'],
    baselineComparisons: ['normal access audience', 'expected retention path'],
    investigationChecks: ['Confirm file audience', 'Review download history', 'Inspect owner actions'],
    responseCandidates: ['Remove access', 'Transfer ownership', 'Reclassify data'],
  },
  'Internal business systems': {
    category: 'Internal business systems',
    evidenceCards: ['Record scope', 'Admin action', 'Workflow step', 'Role assignment'],
    entityTypes: ['application', 'internal user', 'record'],
    baselineComparisons: ['normal workflow pattern', 'business-hours activity'],
    investigationChecks: ['Validate business reason', 'Check affected records', 'Compare to workflow baseline'],
    responseCandidates: ['Disable risky workflow', 'Restrict role', 'Notify business owner'],
  },
  'Developer systems': {
    category: 'Developer systems',
    evidenceCards: ['Repo action', 'Secret exposure', 'Pipeline run', 'Artifact download'],
    entityTypes: ['repository', 'build bot', 'developer', 'secret'],
    baselineComparisons: ['normal branch pattern', 'artifact download baseline'],
    investigationChecks: ['Inspect commit and artifact chain', 'Validate secret handling', 'Review build account use'],
    responseCandidates: ['Revoke token', 'Rotate secret', 'Pause pipeline'],
  },
  'Network / perimeter / access layer': {
    category: 'Network / perimeter / access layer',
    evidenceCards: ['Destination domain', 'Bytes transferred', 'TLS session', 'Proxy path'],
    entityTypes: ['device', 'destination', 'domain', 'IP address'],
    baselineComparisons: ['usual outbound destinations', 'typical byte volume'],
    investigationChecks: ['Validate destination reputation', 'Review transfer volume', 'Correlate DNS and proxy logs'],
    responseCandidates: ['Block destination', 'Terminate session', 'Increase egress monitoring'],
  },
  'AI & automation systems': {
    category: 'AI & automation systems',
    evidenceCards: ['Prompt log', 'Tool actions', 'Model output', 'Retention path'],
    entityTypes: ['AI agent', 'application', 'file', 'destination'],
    baselineComparisons: ['usual tool sequence', 'expected prompt classes'],
    investigationChecks: ['Review prompts and actions', 'Validate output destination', 'Compare agent baseline'],
    responseCandidates: ['Pause workflow', 'Restrict tools', 'Notify AI governance'],
  },
  'Third-party / partner channels': {
    category: 'Third-party / partner channels',
    evidenceCards: ['Tenant handoff', 'Partner identity', 'External download', 'Share lineage'],
    entityTypes: ['partner tenant', 'external collaborator', 'destination'],
    baselineComparisons: ['approved destinations', 'known partner tenants'],
    investigationChecks: ['Validate partner justification', 'Review destination controls', 'Confirm downstream access'],
    responseCandidates: ['Suspend partner share', 'Notify partner owner', 'Escalate legal review'],
  },
};

const HERO_CASE_3001_ID = 'CASE-3001';
const HERO_CASE_3002_ID = 'CASE-3002';

export function buildInvestigationContext(item: WorkItem): InvestigationContext {
  const fixture = getInvestigationFixture(item);
  return {
    item,
    fixture,
    playbook: getInvestigationPlaybook(item.risk_type),
    evidenceModules: getEvidenceModules(item),
  };
}

export function createWorkspaceStateFromFixture(fixture: InvestigationFixture) {
  return {
    hypothesis: fixture.hypothesis,
    tasks: fixture.recommendedChecks.map((task) => ({ ...task })),
    notes: fixture.notes.map((note) => ({ ...note })),
    timeline: fixture.timelineEvents.map((event) => ({ ...event, details: [...event.details] })),
    evidence: fixture.evidence.map((item) => ({ ...item, details: [...item.details] })),
    alerts: fixture.alerts.map((alert) => ({ ...alert })),
    entities: fixture.entities.map((entity) => ({
      ...entity,
      permissions: [...entity.permissions],
      relatedAssets: [...entity.relatedAssets],
      suggestedChecks: [...entity.suggestedChecks],
      responseCandidates: [...entity.responseCandidates],
      recentActivity: entity.recentActivity?.map((entry) => ({ ...entry })),
      baselineSignals: entity.baselineSignals?.map((entry) => ({ ...entry })),
      relatedAlertIds: [...(entity.relatedAlertIds ?? [])],
      relatedCaseIds: [...(entity.relatedCaseIds ?? [])],
    })),
    actions: fixture.actions.map((action) => ({ ...action })),
    activity: fixture.activity.map((entry) => ({ ...entry })),
    classification: undefined,
    classificationRecord: undefined,
    resolution: undefined,
    lastResolution: undefined,
    escalations: [],
    huntResults: fixture.huntResults?.map((result) => ({ ...result })) ?? [],
    selectedEvidenceId: null,
    selectedEntityId: null,
    selectedAlertId: null,
    selectedActionId: null,
    selectedTimelineEventId: null,
  };
}

function getInvestigationFixture(item: WorkItem): InvestigationFixture {
  if (item.id === HERO_CASE_3001_ID) {
    return case3001Fixture(item);
  }
  if (item.id === HERO_CASE_3002_ID) {
    return case3002Fixture(item);
  }
  return genericFixture(item);
}

function case3001Fixture(item: WorkItem): InvestigationFixture {
  return {
    itemId: item.id,
    summaryParagraphs: [
      'A late-night investigation sequence suggests customer billing data was exported from Snowflake, staged on a managed endpoint, and then transferred through the network toward personal cloud storage.',
      'The activity occurred inside a tight correlation window across Snowflake, browser, endpoint, and VPN telemetry, which raises the risk that multiple alerts describe the same exfiltration chain instead of isolated anomalies.',
      'Current containment remains incomplete. Analysts should validate whether the exported dataset reached the destination, whether the user session was legitimate, and whether any additional devices or actors participated.',
    ],
    quickFacts: buildQuickFacts(item),
    scopeSummary: [
      { label: 'Systems involved', value: String(item.affected_systems.length) },
    ],
    recommendedChecks: [
      { id: 'task-3001-1', title: 'Validate the Snowflake export query and row count', owner: 'Priya Sharma', completed: false },
      { id: 'task-3001-2', title: 'Inspect endpoint file creation and browser upload events', owner: 'Priya Sharma', completed: false },
      { id: 'task-3001-3', title: 'Confirm whether the destination received or shared the exported file', owner: 'Sameer Khan', completed: false },
      { id: 'task-3001-4', title: 'Review late-night sign-in activity and session context', owner: 'Kavya Nair', completed: true },
    ],
    hypothesis: 'Account misuse or compromise may have enabled a customer-data export from Snowflake, local staging on a managed endpoint, and transfer to unmanaged cloud storage.',
    openQuestions: [
      'Was the user session compromised or misused?',
      'Did the external destination receive the full exported file?',
      'Was the file downloaded or reshared after upload?',
      'Are additional users, devices, or sessions involved?',
    ],
    timelineEvents: [
      timeline('tl-1', '10:04 PM', 'Identity', 'Microsoft Entra ID', 'Unusual sign-in from unfamiliar location', 'Rohan Mehta authenticated from an unusual location shortly before the export sequence.', 'ALERT-1043', 'Rohan Mehta', 'Needs review', ['Source IP differs from baseline', 'Session continued into Snowflake and browser activity'], undefined, 'EV-3001-1'),
      timeline('tl-2', '10:09 PM', 'Snowflake', 'Snowflake', '85,000 customer billing rows exported', 'A high-volume query exported billing records into a CSV-shaped result set.', 'ALERT-1043', 'Snowflake customer billing database', 'Relevant', ['Rows exported: 85,000', 'Role used: analyst_read_export', 'Client IP mapped to VPN egress'], undefined, 'EV-3001-1'),
      timeline('tl-3', '10:13 PM', 'Endpoint', 'Managed MacBook DEV-4032', 'CSV written to local downloads folder', 'Endpoint telemetry shows a new file written and renamed twice before browser interaction.', 'ALERT-1033', 'DEV-4032', 'Relevant', ['File path: /Users/rohan/Downloads/customer_billing_export.csv', 'Browser process touched the file'], undefined, 'EV-3001-2'),
      timeline('tl-4', '10:16 PM', 'Network', 'Secure web gateway', '1.4 GB outbound transfer to personal cloud-storage domain', 'Proxy and DNS logs show a large upload to a personal cloud-storage destination.', 'ALERT-1083', 'drive-upload.personal-cloud.example', 'Relevant', ['Bytes transferred: 1.4 GB', 'TLS session matched browser upload process'], undefined, 'EV-3001-3'),
      timeline('tl-5', '10:19 PM', 'SaaS', 'Google Drive', 'File available in personal cloud account', 'Destination metadata indicates a new file object created in a personal Google Drive context.', 'ALERT-1083', 'Personal Google Drive', 'Needs review', ['Sharing status currently unknown', 'Download history not yet confirmed'], undefined, 'EV-3001-4'),
      timeline('tl-6', '10:23 PM', 'Analyst action', 'CyberGuard', 'Case assigned to Priya Sharma', 'The case was assigned for immediate investigation and containment validation.', 'CASE-3001', 'Priya Sharma', 'Relevant', ['Assignment initiated from the Work Queue']),
    ],
    alerts: [
      alert('ALERT-1043', 'Abnormal data movement detected from Snowflake', 'Critical', 'P1 · 95', 'Database activity monitoring', 'Snowflake', 3, 'New', 'High-volume export into a user-controlled workflow', 'Relevant', { parentCaseId: 'CASE-3001', linkedEvidenceIds: ['EV-3001-1'], relatedEntityIds: ['ent-3001-1', 'ent-3001-2'], detectedAt: '10:09 PM' }),
      alert('ALERT-1033', 'Abnormal data movement detected from Browser', 'Critical', 'P1 · 95', 'Endpoint DLP / EDR', 'Browser', 2, 'Triaged', 'Browser and local file telemetry match the Snowflake export sequence', 'Relevant', { parentCaseId: 'CASE-3001', linkedEvidenceIds: ['EV-3001-2'], relatedEntityIds: ['ent-3001-1', 'ent-3001-3', 'ent-3001-6'], detectedAt: '10:13 PM' }),
      alert('ALERT-1083', 'Abnormal data movement detected from VPN', 'Critical', 'P1 · 95', 'Network DLP / proxy', 'VPN', 4, 'Investigating', 'Large outbound transfer followed the endpoint staging activity', 'Relevant', { parentCaseId: 'CASE-3001', linkedEvidenceIds: ['EV-3001-3', 'EV-3001-4'], relatedEntityIds: ['ent-3001-4', 'ent-3001-5', 'ent-3001-6'], detectedAt: '10:16 PM' }),
    ],
    evidence: [
      evidence('EV-3001-1', 'Snowflake export query', '10:09 PM', 'Snowflake', 'Rohan Mehta', 'High-volume export query for customer billing data', true, 'Relevant', true, ['Query family deviates from the user baseline', 'Rows exported: 85,000', 'Client IP linked to VPN session'], { timelineEventId: 'tl-2', relatedAlertId: 'ALERT-1043', sourceContext: 'Snowflake query history' }),
      evidence('EV-3001-2', 'Endpoint file artifact', '10:13 PM', 'EDR', 'DEV-4032', 'CSV file created in downloads folder and opened by browser process', true, 'Relevant', true, ['File hash captured', 'Browser process PID correlated'], { timelineEventId: 'tl-3', relatedAlertId: 'ALERT-1033', sourceContext: 'EDR file artifact' }),
      evidence('EV-3001-3', 'Proxy egress record', '10:16 PM', 'Secure web gateway', 'drive-upload.personal-cloud.example', 'Large outbound transfer to unmanaged cloud-storage domain', true, 'Relevant', true, ['1.4 GB transfer', 'Destination previously unseen for the user'], { timelineEventId: 'tl-4', relatedAlertId: 'ALERT-1083', sourceContext: 'Proxy / egress logs' }),
      evidence('EV-3001-4', 'Destination metadata', '10:19 PM', 'Google Drive', 'Personal Google Drive', 'Uploaded file object created in personal destination account', false, 'Needs review', true, ['Sharing state not yet retrieved', 'Download history pending'], { timelineEventId: 'tl-5', relatedAlertId: 'ALERT-1083', sourceContext: 'Destination metadata' }),
    ],
    entities: [
      entity('ent-3001-1', 'Internal user', 'Rohan Mehta', 'High', 'Primary actor', 3, 5, '2m ago', 'User associated with the export and upload sequence.', 'Recent late-night sign-in and export volume exceed baseline.', ['Snowflake export role', 'Browser access'], ['DEV-4032', 'Snowflake customer billing database'], ['Confirm business reason', 'Review recent sign-in context'], ['Revoke sessions', 'Require credential reset'], {
        relatedAlertIds: ['ALERT-1043', 'ALERT-1033', 'ALERT-1083'],
        relatedCaseIds: ['CASE-3001'],
        recentActivity: [
          { id: 'ra-3001-1', timestamp: '10:04 PM', source: 'Microsoft Entra ID', title: 'Unusual sign-in', detail: 'Sign-in from unusual geography triggered the initial concern.', alertId: 'ALERT-1043', evidenceId: 'EV-3001-1' },
          { id: 'ra-3001-2', timestamp: '10:09 PM', source: 'Snowflake', title: 'High-volume export', detail: 'Large customer billing export executed with analyst_read_export role.', alertId: 'ALERT-1043', evidenceId: 'EV-3001-1' },
        ],
        baselineSignals: [
          { metric: 'Export size', baseline: '2,000 rows typical', observed: '85,000 rows', difference: '42x larger', whyItMatters: 'Large deviation suggests bulk extraction rather than routine analysis.' },
          { metric: 'Login geography', baseline: 'Bengaluru, India', observed: 'Bucharest, Romania', difference: 'New region', whyItMatters: 'May indicate compromise or proxy usage.' },
          { metric: 'Working hours', baseline: '9 AM to 7 PM', observed: '10 PM to 10:19 PM', difference: 'Off-hours activity', whyItMatters: 'Off-hours behavior increases compromise suspicion.' },
        ],
      }),
      entity('ent-3001-2', 'Database', 'Snowflake customer billing database', 'High', 'Primary source', 1, 3, '9m ago', 'Source of the exported customer billing dataset.', 'Export volume exceeds recent baseline by 18x.', ['Read export access'], ['Billing table', 'Query history'], ['Validate query text', 'Confirm exact table scope'], ['Suspend export permission']),
      entity('ent-3001-3', 'Device', 'Managed MacBook DEV-4032', 'Medium', 'Staging endpoint', 1, 2, '6m ago', 'Managed endpoint used for local staging prior to upload.', 'Browser upload pattern is unusual for the device owner.', ['Browser upload access', 'Downloads folder'], ['Local CSV artifact', 'Browser process'], ['Inspect endpoint timeline', 'Collect forensic context'], ['Isolate endpoint']),
      entity('ent-3001-4', 'Destination', 'Personal Google Drive', 'High', 'Exfiltration destination', 1, 2, '5m ago', 'Unmanaged personal destination receiving the staged export.', 'Destination has no prior sanctioned use in baseline.', ['Upload access'], ['Uploaded CSV'], ['Confirm receipt and reshare status'], ['Block destination domain']),
      entity('ent-3001-5', 'IP address', '185.244.18.77', 'Medium', 'Unusual sign-in source', 1, 1, '19m ago', 'IP observed at the start of the suspicious sign-in.', 'Source IP not seen in the user baseline during the last 30 days.', ['VPN tunnel'], ['Entra ID sign-in record'], ['Compare with prior geographies'], ['Block suspicious session']),
      entity('ent-3001-6', 'File', 'customer_billing_export.csv', 'High', 'Export artifact', 2, 3, '4m ago', 'CSV artifact created locally before upload.', 'File naming and destination pattern differ from baseline.', ['Local file write'], ['Browser upload touchpoints'], ['Confirm if file was encrypted or renamed'], ['Quarantine endpoint artifact']),
    ],
    actions: [
      response('act-3001-1', 'Revoke active sessions for Rohan Mehta', 'Rohan Mehta', 'High-confidence suspicious session activity continues to be in scope.', 'Stops continued interactive access during investigation.', 'May interrupt legitimate work.', 'Reversible', 'Manager or IAM approver', 'Completed', 'AI', '10:25 PM', { requiresApproval: false, requiredForContainment: true, containmentCategory: 'Identity containment', approvedBy: 'Priya Sharma', approvedAt: '10:25 PM' }),
      response('act-3001-2', 'Block upload destination', 'drive-upload.personal-cloud.example', 'Large outbound transfer reached an unmanaged destination.', 'Prevents further exfiltration to the observed domain.', 'Could block legitimate access to the same service.', 'Reversible', 'Network owner', 'Completed', 'Analyst', '10:27 PM', { requiresApproval: false, requiredForContainment: true, containmentCategory: 'Network containment' }),
      response('act-3001-3', 'Temporarily suspend Snowflake export permission', 'Snowflake customer billing database', 'Export role was used for a large unusual query.', 'Limits follow-on export attempts during triage.', 'Could delay reporting workflows.', 'Reversible', 'Data platform owner', 'Pending approval', 'AI', '10:28 PM', { requiresApproval: true, approverRole: 'Data platform owner', requiredForContainment: false, approvalRequestedBy: 'Priya Sharma', approvalRequestedAt: '10:28 PM' }),
      response('act-3001-4', 'Isolate managed endpoint DEV-4032', 'Managed MacBook DEV-4032', 'Endpoint staged the exported file before upload.', 'Stops further endpoint-led data movement.', 'Device user loses network access temporarily.', 'Reversible', 'SOC lead', 'Failed', 'System', '10:31 PM', { requiresApproval: false, requiredForContainment: true, containmentCategory: 'Endpoint containment', failureReason: 'EDR agent was offline when isolation was attempted.', retryCount: 1 }),
      response('act-3001-5', 'Notify customer-data owner', 'Customer billing data owner', 'Sensitive customer PII may have been exposed externally.', 'Brings the owner into the response flow quickly.', 'Minimal business impact.', 'N/A', 'None', 'Completed', 'Analyst', '10:34 PM', { requiresApproval: false, requiredForContainment: false }),
      response('act-3001-6', 'Escalate to incident response', 'Incident-response team', 'Potential ongoing exposure and cross-system evidence chain warrant escalation.', 'Transitions the case into coordinated response.', 'Higher response overhead.', 'N/A', 'Incident commander', 'Recommended', 'AI', '10:35 PM', { requiresApproval: false, requiredForContainment: false }),
    ],
    notes: [
      note('note-3001-1', 'Priya Sharma', '10:26 PM', 'Initial review supports a single exfiltration chain rather than three unrelated alerts.'),
      note('note-3001-2', 'Sameer Khan', '10:32 PM', 'Waiting on destination metadata to confirm whether the uploaded file was downloaded or shared.'),
    ],
    activity: [
      activity('hist-3001-1', '10:23 PM', 'System', 'System', 'Case created', 'Three correlated alerts merged into CASE-3001.'),
      activity('hist-3001-2', '10:23 PM', 'System', 'System', 'Alerts correlated', 'Snowflake, browser, and VPN signals grouped into a single case.'),
      activity('hist-3001-3', '10:24 PM', 'Priya Sharma', 'Analyst', 'Assignee changed', 'Case assigned to Priya Sharma.', 'Unassigned', 'Priya Sharma'),
      activity('hist-3001-4', '10:28 PM', 'AI', 'AI', 'Action recommended', 'AI recommended session revocation, destination blocking, and export control suspension.'),
    ],
    missingEvidence: ['Destination download history', 'File reshare confirmation', 'Final containment confirmation'],
    falsePositiveExplanation: 'A legitimate, approved partner transfer could explain the sequence if the destination and row count were authorized in advance.',
    suggestedNextCheck: 'Confirm whether the destination account downloaded or reshared the uploaded CSV.',
    dataOwner: 'Customer Billing Platform Owner',
    handoffTeams: ['Incident-response team', 'Compliance / legal'],
    timeSpan: '19 minutes',
    entityCount: 7,
    huntResults: [
      hunt('hunt-3001-1', 'Related sign-in', 'Repeat sign-in from same source IP', 'Second sign-in from the same source IP 14 minutes earlier.', 'Microsoft Entra ID', '185.244.18.77', '09:50 PM'),
      hunt('hunt-3001-2', 'Outbound transfer', 'Similar outbound transfer from same device', 'A smaller 120 MB transfer to the same destination family occurred the prior evening.', 'Secure web gateway', 'DEV-4032', '09:18 PM'),
      hunt('hunt-3001-3', 'OAuth activity', 'Related OAuth token refresh', 'Browser token refresh aligned with the upload session.', 'Google Workspace', 'Rohan Mehta', '10:15 PM'),
    ],
  };
}

function case3002Fixture(item: WorkItem): InvestigationFixture {
  return {
    itemId: item.id,
    summaryParagraphs: [
      'This case centers on production customer data exposed through cloud and repository systems, with AWS S3 and SharePoint showing overlapping public or broadly accessible paths.',
      'The current evidence suggests direct scope validation rather than a multi-stage attack chain. The investigation should focus on what is exposed, whether exposure persists, and whether any external access already occurred.',
    ],
    quickFacts: buildQuickFacts(item),
    scopeSummary: [
      { label: 'Systems involved', value: String(item.affected_systems.length) },
    ],
    recommendedChecks: [
      { id: 'task-3002-1', title: 'Validate whether the S3 object or bucket remains publicly reachable', owner: 'Arjun Rao', completed: false },
      { id: 'task-3002-2', title: 'Confirm the exact record count and sensitivity exposed', owner: 'Arjun Rao', completed: false },
      { id: 'task-3002-3', title: 'Review whether the exposed SharePoint path was indexed or downloaded', owner: 'Kavya Nair', completed: false },
    ],
    hypothesis: 'A cloud and repository misconfiguration exposed production customer data publicly, with partial containment already underway but full scope validation still incomplete.',
    openQuestions: [
      'Is the public path fully closed?',
      'Were any records downloaded externally?',
      'Did the exposure originate from a recent backup or sharing change?',
    ],
    timelineEvents: [
      timeline('tl-3002-1', '09:53 AM', 'Cloud', 'AWS S3', 'Public access validation succeeded', 'A validation probe confirmed that a production S3 resource was externally reachable.', 'ALERT-1019', 'AWS S3 bucket', 'Relevant', ['Object ACL and bucket policy both contributed to exposure'], undefined, 'EV-3002-1'),
      timeline('tl-3002-2', '10:01 AM', 'Repository', 'SharePoint', 'Repository link exposed broadly', 'A repository item with related customer data became accessible through a broad link.', 'ALERT-1049', 'SharePoint repository', 'Relevant', ['Broad link appears derived from an OAuth app workflow'], undefined, 'EV-3002-2'),
      timeline('tl-3002-3', '10:07 AM', 'Cloud', 'AWS S3', 'Partial containment applied', 'Public access block was applied to the most visible object path, but scope review continues.', 'CASE-3002', 'AWS S3 bucket', 'Needs review', ['Child objects still need validation'], undefined, 'EV-3002-1'),
    ],
    alerts: [
      alert('ALERT-1019', 'Sensitive data exposed through AWS S3', 'Critical', 'P1 · 92', 'CSPM / CNAPP', 'AWS S3', 2, 'Investigating', 'External validation confirmed public reachability', 'Relevant', { parentCaseId: 'CASE-3002', linkedEvidenceIds: ['EV-3002-1'], relatedEntityIds: ['ent-3002-1'], detectedAt: '09:53 AM' }),
      alert('ALERT-1049', 'Sensitive data exposed through SharePoint', 'High', 'P2 · 83', 'DLP policy', 'SharePoint', 2, 'Triaged', 'Repository share scope overlaps with the exposed cloud path', 'Needs review', { parentCaseId: 'CASE-3002', linkedEvidenceIds: ['EV-3002-2'], relatedEntityIds: ['ent-3002-2', 'ent-3002-3'], detectedAt: '10:01 AM' }),
    ],
    evidence: [
      evidence('EV-3002-1', 'Public validation result', '09:53 AM', 'CSPM / CNAPP', 'AWS S3 bucket', 'Validation probe reached the exposed object path.', true, 'Relevant', true, ['Public HEAD request returned success'], { timelineEventId: 'tl-3002-1', relatedAlertId: 'ALERT-1019', sourceContext: 'CNAPP validation output' }),
      evidence('EV-3002-2', 'Repository sharing record', '10:01 AM', 'SharePoint', 'Document owner OAuth app', 'Broad repository link exposed a related document set.', true, 'Needs review', true, ['Repository link path still under review'], { timelineEventId: 'tl-3002-2', relatedAlertId: 'ALERT-1049', sourceContext: 'Repository sharing record' }),
    ],
    entities: [
      entity('ent-3002-1', 'Cloud resource', 'AWS S3 bucket', 'High', 'Primary exposed resource', 1, 2, '16m ago', 'Production bucket involved in the public exposure path.', 'Public access differs from expected production baseline.', ['Bucket policy', 'Object ACL'], ['Customer dataset object'], ['Confirm public reachability across child objects'], ['Block public access']),
      entity('ent-3002-2', 'Repository', 'SharePoint repository', 'Medium', 'Related exposure surface', 1, 2, '19m ago', 'Repository appears linked to the same data family.', 'Broad link usage exceeds normal baseline.', ['Repository share link'], ['Customer-data document set'], ['Validate repository audience'], ['Remove broad link']),
      entity('ent-3002-3', 'Privileged admin', 'svc-backup-export', 'Medium', 'Automation actor', 1, 1, '21m ago', 'Backup/export service account associated with the exposed object path.', 'Access scope seems broader than expected.', ['Export role'], ['Backup job'], ['Review change justification'], ['Tighten service account scope']),
    ],
    actions: [
      response('act-3002-1', 'Remove public access', 'AWS S3 bucket', 'Production data remains in a public or broad access state.', 'Closes the direct exposure path.', 'Could disrupt expected download workflows.', 'Reversible', 'Cloud owner', 'Completed', 'AI', '10:09 AM', { requiresApproval: false, requiredForContainment: true, containmentCategory: 'Cloud containment' }),
      response('act-3002-2', 'Review repository sharing scope', 'SharePoint repository', 'Broad repository sharing may still expose related files.', 'Reduces follow-on exposure through linked repositories.', 'May affect collaboration links.', 'Reversible', 'Content owner', 'Approved', 'AI', '10:11 AM', { requiresApproval: true, approverRole: 'Content owner', requiredForContainment: false, approvedBy: 'Arjun Rao', approvedAt: '10:15 AM' }),
    ],
    notes: [
      note('note-3002-1', 'Arjun Rao', '10:14 AM', 'Primary goal is direct exposure validation and closure, not a full cross-system kill chain review.'),
    ],
    activity: [
      activity('hist-3002-1', '10:08 AM', 'System', 'System', 'Case created', 'Two exposure alerts correlated into CASE-3002.'),
      activity('hist-3002-2', '10:13 AM', 'Arjun Rao', 'Analyst', 'Status changed', 'Case moved into Investigating.', 'New', 'Investigating'),
    ],
    missingEvidence: ['Download history', 'Search-engine indexing confirmation'],
    falsePositiveExplanation: 'A short-lived, approved sharing window or sanitized dataset could partially explain the exposure if business approval existed.',
    suggestedNextCheck: 'Confirm whether any public downloads occurred before containment.',
    dataOwner: 'Customer Data Operations',
    handoffTeams: ['Compliance / legal'],
    timeSpan: '16 minutes',
    entityCount: 4,
    huntResults: [],
  };
}

function genericFixture(item: WorkItem): InvestigationFixture {
  const playbook = getInvestigationPlaybook(item.risk_type);
  const actor = item.primary_actor || item.actor_entity_type;
  return {
    itemId: item.id,
    summaryParagraphs: [
      item.preview.ai_summary,
      `The current investigation should validate scope across ${item.affected_systems.join(', ')} and confirm whether ${actor} requires additional containment or escalation.`,
    ],
    quickFacts: buildQuickFacts(item),
    scopeSummary: [
      { label: 'Systems involved', value: String(item.affected_systems.length) },
    ],
    recommendedChecks: playbook.recommendedChecks.slice(0, 4).map((entry, index) => ({
      id: `${item.id}-task-${index + 1}`,
      title: entry,
      owner: index === 0 ? item.assignee : 'Unassigned',
      completed: false,
    })),
    hypothesis: `${item.risk_type} may have affected ${item.key_resource.toLowerCase()} and should be validated against the current business context.`,
    openQuestions: playbook.questionsToAnswer,
    timelineEvents: [
      timeline(`${item.id}-tl-1`, item.detection_time, 'Detection', item.detection_source, item.title, item.preview.ai_summary, item.id, actor, 'Needs review', [item.preview.recommended_next_action], undefined, `${item.id}-ev-1`),
      timeline(`${item.id}-tl-2`, item.last_activity, 'Analyst action', 'CyberGuard', `Current status: ${item.status}`, `The item is currently assigned to ${item.assignee} with SLA ${item.sla}.`, item.id, item.assignee, 'Relevant', [`Containment: ${item.containment}`]),
    ],
    alerts: (item.preview.alerts ?? [{ id: item.id, title: item.title, severity: item.severity, priority: item.priority }]).map((alertItem, index) =>
      alert(alertItem.id, alertItem.title, alertItem.severity, alertItem.priority, item.detection_source, item.affected_systems[index] ?? item.affected_systems[0] ?? 'Mixed system', 1, item.status, 'Included from the current work item context', 'Needs review'),
    ),
    evidence: [
      evidence(`${item.id}-ev-1`, 'Primary detection', item.detection_time, item.detection_source, actor, item.title, true, 'Needs review', true, [item.preview.ai_summary], { timelineEventId: `${item.id}-tl-1`, relatedAlertId: item.id, sourceContext: item.detection_source }),
    ],
    entities: item.preview.actors_entities.slice(0, 3).map((entry, index) =>
      entity(`${item.id}-ent-${index + 1}`, 'Related entity', entry, 'Medium', 'Investigation context', 1, 1, item.last_activity, entry, 'Baseline comparison pending.', [], [], playbook.recommendedChecks.slice(0, 2), playbook.likelyResponseActions.slice(0, 2)),
    ),
    actions: playbook.likelyResponseActions.slice(0, 4).map((entry, index) =>
      response(`${item.id}-act-${index + 1}`, entry, actor, 'Recommended from the risk playbook.', 'Advances containment or validation.', 'Business impact depends on final scope.', 'Reversible', index === 0 ? 'Approver required' : 'None', index === 0 ? 'Recommended' : 'Pending approval', index % 2 === 0 ? 'AI' : 'Analyst', item.last_activity, { requiresApproval: index === 0, requiredForContainment: index < 2 }),
    ),
    notes: [note(`${item.id}-note-1`, item.assignee, item.last_activity, 'Investigation context generated from the selected work item.')],
    activity: [activity(`${item.id}-hist-1`, item.last_activity, 'System', 'System', 'Investigation generated', `Investigation workspace opened for ${item.id}.`)],
    missingEvidence: playbook.priorityEvidence.slice(0, 3),
    falsePositiveExplanation: playbook.possibleFalsePositiveReasons[0] ?? 'A legitimate workflow could explain the signal if the business context checks out.',
    suggestedNextCheck: playbook.recommendedChecks[0] ?? item.preview.recommended_next_action,
    dataOwner: 'Assigned data owner pending confirmation',
    handoffTeams: ['Incident-response team'],
    timeSpan: `${item.detection_time} to ${item.last_activity}`,
    entityCount: item.preview.actors_entities.length + item.preview.affected_systems_resources.length,
    huntResults: [
      hunt(`${item.id}-hunt-1`, 'Related activity', 'Related identity activity', 'Additional related telemetry surfaced from the same actor context.', item.detection_source, actor, item.last_activity),
    ],
  };
}

function buildQuickFacts(item: WorkItem) {
  const resources = item.preview.affected_systems_resources?.length
    ? item.preview.affected_systems_resources
    : [item.key_resource];
  const entities = item.preview.actors_entities?.length
    ? item.preview.actors_entities
    : [item.primary_actor === 'Multiple related entities' ? item.actor_entity_type : item.primary_actor].filter(Boolean);

  return [
    { label: `Affected systems (${item.affected_systems.length})`, value: item.affected_systems },
    { label: `Resources involved (${resources.length})`, value: resources },
    { label: `Entities involved (${entities.length})`, value: entities },
    { label: 'Primary actor', value: item.primary_actor === 'Multiple related entities' ? item.preview.actors_entities[0] ?? item.primary_actor : item.primary_actor },
    { label: 'Data sensitivity', value: item.data_sensitivity },
    { label: 'Data volume', value: item.affected_data_volume ?? item.preview.affected_data },
    ...(item.destination_exposure_target && item.destination_exposure_target !== 'Not applicable' ? [{ label: 'Exposure target', value: item.destination_exposure_target }] : []),
    { label: 'Resource criticality', value: item.resource_criticality },
  ];
}

function getEvidenceModules(item: WorkItem): SystemEvidenceModule[] {
  const categories = new Set<string>();
  for (const system of item.affected_systems) {
    if (/snowflake|database|warehouse/i.test(system)) categories.add('Databases & warehouses');
    if (/browser|endpoint|device/i.test(system)) categories.add('Endpoints & devices');
    if (/vpn|network|gateway|dns|proxy/i.test(system)) categories.add('Network / perimeter / access layer');
    if (/aws|azure|gcp|cloud/i.test(system)) categories.add('Cloud platforms');
    if (/drive|sharepoint|repository|onedrive|box/i.test(system)) categories.add('File stores & content repositories');
    if (/github|gitlab|developer/i.test(system)) categories.add('Developer systems');
    if (/okta|entra|pam|identity/i.test(system)) categories.add('Identity & access');
    if (/slack|salesforce|google drive|sharepoint|saas/i.test(system)) categories.add('SaaS & collaboration');
    if (/ai|agent|automation/i.test(system)) categories.add('AI & automation systems');
  }
  if (!categories.size) {
    categories.add('Identity & access');
  }
  return [...categories].map((category) => SYSTEM_EVIDENCE_MODULES[category]).filter(Boolean);
}

function timeline(
  id: string,
  timestamp: string,
  category: string,
  systemName: string,
  title: string,
  description: string,
  relatedAlert: string,
  entity: string,
  relevance: TimelineEvent['relevance'],
  details: string[],
  occurredAt?: string,
  evidenceId?: string,
): TimelineEvent {
  return {
    id,
    timestamp,
    occurredAt: occurredAt ?? synthesizeOccurredAt(timestamp),
    category,
    systemName,
    title,
    description,
    relatedAlert,
    entity,
    relevance,
    details,
    evidenceId,
    attached: true,
  };
}

function evidence(
  id: string,
  eventType: string,
  timestamp: string,
  sourceSystem: string,
  entity: string,
  description: string,
  rawRecordAvailable: boolean,
  verdict: EvidenceItem['verdict'],
  attached: boolean,
  details: string[],
  extras?: Partial<EvidenceItem>,
): EvidenceItem {
  return { id, eventType, timestamp, sourceSystem, entity, description, rawRecordAvailable, verdict, attached, details, ...extras };
}

function alert(
  id: string,
  title: string,
  severity: string,
  priority: string,
  detectionSource: string,
  system: string,
  linkedEventsCount: number,
  status: string,
  linkingRationale: string,
  relevance: IncludedAlertItem['relevance'],
  extras?: Partial<IncludedAlertItem>,
): IncludedAlertItem {
  return { id, title, severity, priority, detectionSource, system, linkedEventsCount, status, linkingRationale, relevance, ...extras };
}

function entity(
  id: string,
  type: string,
  displayName: string,
  riskLevel: string,
  roleInCase: string,
  relatedAlertCount: number,
  relatedEventCount: number,
  lastActivity: string,
  profileSummary: string,
  baselineComparison: string,
  permissions: string[],
  relatedAssets: string[],
  suggestedChecks: string[],
  responseCandidates: string[],
  extras?: Partial<InvestigationEntity>,
): InvestigationEntity {
  return {
    id,
    type,
    displayName,
    riskLevel,
    roleInCase,
    relatedAlertCount,
    relatedEventCount,
    lastActivity,
    profileSummary,
    baselineComparison,
    permissions,
    relatedAssets,
    suggestedChecks,
    responseCandidates,
    ...extras,
  };
}

function response(
  id: string,
  title: string,
  affectedEntity: string,
  reason: string,
  expectedEffect: string,
  businessImpact: string,
  reversibility: string,
  approvalRequirement: string,
  currentState: InvestigationResponseAction['currentState'],
  createdBy: InvestigationResponseAction['createdBy'],
  auditTimestamp: string,
  extras?: Partial<InvestigationResponseAction>,
): InvestigationResponseAction {
  return {
    id,
    title,
    affectedEntity,
    reason,
    expectedEffect,
    businessImpact,
    reversibility,
    approvalRequirement,
    currentState,
    createdBy,
    auditTimestamp,
    requiresApproval: extras?.requiresApproval ?? !/none|n\/a/i.test(approvalRequirement),
    approverRole: extras?.approverRole,
    approver: extras?.approver,
    approvalRequestedBy: extras?.approvalRequestedBy,
    approvalRequestedAt: extras?.approvalRequestedAt,
    approvedBy: extras?.approvedBy,
    approvedAt: extras?.approvedAt,
    rejectedBy: extras?.rejectedBy,
    rejectedAt: extras?.rejectedAt,
    failureReason: extras?.failureReason,
    retryCount: extras?.retryCount ?? 0,
    requiredForContainment: extras?.requiredForContainment ?? false,
    containmentCategory: extras?.containmentCategory,
    dependencies: extras?.dependencies ?? [],
    history: extras?.history ?? [],
    note: extras?.note,
  };
}

function note(id: string, author: string, timestamp: string, text: string): InvestigationNote {
  return { id, author, timestamp, text };
}

function activity(
  id: string,
  timestamp: string,
  actor: string,
  actorType: InvestigationActivityItem['actorType'],
  activityType: string,
  description: string,
  previousValue?: string,
  newValue?: string,
  comment?: string,
): InvestigationActivityItem {
  return { id, timestamp, actor, actorType, activityType, description, previousValue, newValue, comment };
}

function hunt(
  id: string,
  type: string,
  title: string,
  description: string,
  sourceSystem: string,
  entity: string,
  timestamp: string,
) {
  return {
    id,
    type,
    title,
    description,
    sourceSystem,
    entity,
    timestamp,
    attached: false,
  };
}

function synthesizeOccurredAt(timestamp: string) {
  const base = '2026-06-01';
  const normalized = timestamp.replace(/\s/g, '');
  const match = normalized.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);
  if (!match) {
    return `${base}T12:00:00.000Z`;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  const hour24 = meridiem === 'PM' ? (hours % 12) + 12 : hours % 12;
  return `${base}T${String(hour24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`;
}
