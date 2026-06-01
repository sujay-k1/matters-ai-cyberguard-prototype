import type { InvestigationPlaybook } from '../types/investigation';

export const INVESTIGATION_PLAYBOOKS: Record<string, InvestigationPlaybook> = {
  'Sensitive data exposure': {
    questionsToAnswer: [
      'Is the exposed resource still accessible?',
      'What data classes are exposed?',
      'Was the exposure indexed, downloaded, or shared further?',
    ],
    priorityEvidence: ['Access logs', 'Sharing state', 'Object permissions', 'Download activity'],
    recommendedChecks: [
      'Validate whether the exposed resource still permits public or partner access',
      'Confirm the exact records or files exposed and their sensitivity',
      'Review whether external downloads or reshares already occurred',
    ],
    likelyResponseActions: [
      'Revoke public access',
      'Notify the data owner',
      'Escalate to compliance or legal when regulated data is exposed',
    ],
    possibleFalsePositiveReasons: [
      'A controlled public sharing window was approved',
      'The object was already decommissioned or sanitized',
    ],
  },
  'Unusual data access': {
    questionsToAnswer: [
      'Was the access pattern outside the user baseline?',
      'Did the request touch unusual tables or folders?',
      'Was there a legitimate business reason for the access?',
    ],
    priorityEvidence: ['Baseline comparisons', 'Query history', 'Access logs', 'Identity posture'],
    recommendedChecks: [
      'Compare the access pattern against the actor baseline',
      'Validate the resource scope, row count, or file count accessed',
      'Confirm whether a change request or business process explains the activity',
    ],
    likelyResponseActions: ['Require analyst review', 'Reduce scope of access', 'Notify the manager or system owner'],
    possibleFalsePositiveReasons: ['Planned operational work', 'Known audit or migration activity'],
  },
  'Suspicious activity / compromise': {
    questionsToAnswer: [
      'Was the account or device compromised?',
      'Were there concurrent sign-ins or impossible travel indicators?',
      'Did suspicious actions continue after the initial alert?',
    ],
    priorityEvidence: ['Sign-in logs', 'Device posture', 'Session history', 'Identity risk signals'],
    recommendedChecks: [
      'Validate the sign-in location, device, and authentication context',
      'Review subsequent session actions for lateral or downstream risk',
      'Confirm whether MFA, password, or token reset is required',
    ],
    likelyResponseActions: ['Revoke active sessions', 'Reset credentials', 'Escalate to incident response'],
    possibleFalsePositiveReasons: ['Travel with approved VPN use', 'Shared admin workflow'],
  },
  'Risky external sharing': {
    questionsToAnswer: [
      'Did the external destination receive the shared content?',
      'Was the destination approved or unmanaged?',
      'Did the recipient reshare or download the content?',
    ],
    priorityEvidence: ['Sharing logs', 'Recipient history', 'Download events', 'Destination reputation'],
    recommendedChecks: [
      'Validate the recipient and destination ownership',
      'Inspect the shared file or folder scope and sensitivity',
      'Confirm whether the content was downloaded or reshared',
    ],
    likelyResponseActions: ['Remove the share', 'Notify the owner', 'Block future external sharing to the destination'],
    possibleFalsePositiveReasons: ['Approved customer handoff', 'Partner sharing through a sanctioned tenant'],
  },
  'Abnormal data movement / exfiltration': {
    questionsToAnswer: [
      'Did the export, file staging, and outbound transfer complete?',
      'Was the user or service account expected to move data at this volume?',
      'Did the destination receive or redistribute the data?',
    ],
    priorityEvidence: ['Query exports', 'Endpoint file artifacts', 'Proxy and egress logs', 'Destination access'],
    recommendedChecks: [
      'Validate the Snowflake export query and row count',
      'Inspect endpoint file creation and browser upload events',
      'Confirm whether the destination received or shared the exported file',
      'Review late-night sign-in activity and session context',
    ],
    likelyResponseActions: [
      'Revoke active sessions',
      'Block the upload destination',
      'Suspend export permissions',
      'Escalate to incident response',
    ],
    possibleFalsePositiveReasons: ['Approved partner transfer', 'Break-glass export for production recovery'],
  },
  'Misconfiguration / over-permission': {
    questionsToAnswer: [
      'What object or role is over-exposed?',
      'Is the current exposure intentional or inherited?',
      'What blast radius does the misconfiguration create?',
    ],
    priorityEvidence: ['Policy state', 'Permission diffs', 'Recent config changes', 'Exposure validation'],
    recommendedChecks: [
      'Validate the current resource policy and inheritance path',
      'Confirm whether the over-broad grant is actively used',
      'Review recent configuration changes and owners',
    ],
    likelyResponseActions: ['Tighten policy scope', 'Rollback the change', 'Notify the platform owner'],
    possibleFalsePositiveReasons: ['Temporary rollout window', 'Overly broad but isolated lab environment'],
  },
  'Privilege abuse / insider risk': {
    questionsToAnswer: [
      'Was elevated access used outside the normal workflow?',
      'Did privileged activity affect sensitive systems or data?',
      'Was there any downstream export or destructive action?',
    ],
    priorityEvidence: ['PAM logs', 'Command history', 'Affected system changes', 'Data access correlation'],
    recommendedChecks: [
      'Validate the privileged session justification',
      'Review privileged commands or admin actions performed',
      'Correlate privileged activity with downstream data access',
    ],
    likelyResponseActions: ['Suspend privileged access', 'Escalate to insider risk review', 'Increase monitoring'],
    possibleFalsePositiveReasons: ['Approved maintenance window', 'Emergency admin action with ticket coverage'],
  },
  'Data integrity / destructive activity': {
    questionsToAnswer: [
      'What objects were modified or deleted?',
      'Can the activity be reversed safely?',
      'Was destructive behavior preceded by suspicious access or privilege use?',
    ],
    priorityEvidence: ['Deletion logs', 'Change history', 'Backups', 'Admin workflow records'],
    recommendedChecks: [
      'Validate the exact objects changed or removed',
      'Confirm rollback or restore options before further action',
      'Review whether the behavior correlates with prior suspicious activity',
    ],
    likelyResponseActions: ['Pause destructive workflow', 'Restore from backup', 'Escalate to incident response'],
    possibleFalsePositiveReasons: ['Planned cleanup or migration', 'Authorized bulk update job'],
  },
  'Compliance / policy violation': {
    questionsToAnswer: [
      'Which policy was violated?',
      'What data or process fell out of bounds?',
      'Does the violation create immediate reporting obligations?',
    ],
    priorityEvidence: ['Policy definition', 'Affected records', 'Access history', 'Owner approvals'],
    recommendedChecks: [
      'Validate the exact policy or retention control triggered',
      'Confirm scope and duration of the violating activity',
      'Determine whether compliance escalation is required',
    ],
    likelyResponseActions: ['Notify compliance owner', 'Contain violating access', 'Document exception or remediation'],
    possibleFalsePositiveReasons: ['Known exception with incomplete tagging', 'Testing workflow misclassified as production'],
  },
  'AI data leakage / unsafe automation': {
    questionsToAnswer: [
      'Did prompts, embeddings, or tool actions expose sensitive data?',
      'Was an AI agent acting with excessive permissions?',
      'Did the AI output leave approved systems?',
    ],
    priorityEvidence: ['Prompt logs', 'Agent actions', 'Tool call history', 'Destination records'],
    recommendedChecks: [
      'Review retained prompts, indexes, and agent actions',
      'Confirm whether sensitive content was persisted or shared downstream',
      'Validate model or agent permissions against expected scope',
    ],
    likelyResponseActions: ['Pause the agent workflow', 'Restrict tool permissions', 'Escalate to AI governance'],
    possibleFalsePositiveReasons: ['Synthetic test content', 'Approved experimentation workspace'],
  },
};

export function getInvestigationPlaybook(riskType: string): InvestigationPlaybook {
  return INVESTIGATION_PLAYBOOKS[riskType] ?? INVESTIGATION_PLAYBOOKS['Suspicious activity / compromise'];
}
