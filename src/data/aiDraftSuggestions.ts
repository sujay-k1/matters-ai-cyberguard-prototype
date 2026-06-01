import { buildInvestigationContext } from './investigationFixtures';
import type { DraftProvenance } from '../types/ai';
import type {
  InvestigationContext,
  InvestigationResponseAction,
  InvestigationWorkspaceState,
  WorkItemClassification,
} from '../types/investigation';
import type { WorkItem } from '../types/queue';

export type AISuggestionField =
  | 'hypothesis'
  | 'quick-note'
  | 'general-comment'
  | 'task-title'
  | 'severity-override-reason'
  | 'reopen-reason'
  | 'merge-reopen-reason'
  | 'approval-justification'
  | 'rejection-comment'
  | 'cancellation-reason'
  | 'move-alert-reason'
  | 'classification-comment'
  | 'resolution-summary'
  | 'root-cause'
  | 'remediation-summary'
  | 'residual-risk'
  | 'resolution-final-comment'
  | 'resolution-exception-reason'
  | 'escalation-reason'
  | 'escalation-note';

export interface AISuggestionContext {
  item: WorkItem;
  investigationContext?: InvestigationContext;
  workspace?: InvestigationWorkspaceState;
  action?: InvestigationResponseAction | null;
  warnings?: string[];
  classification?: WorkItemClassification;
  selectedTeam?: string;
  destinationCaseLabel?: string;
}

export function buildAISuggestion(field: AISuggestionField, context: AISuggestionContext): string | undefined {
  const investigationContext = context.investigationContext ?? buildInvestigationContext(context.item);
  const { item, workspace, action, warnings = [], classification, selectedTeam, destinationCaseLabel } = context;
  const affectedSystems = item.affected_systems.slice(0, 3).join(', ');
  const primaryActor = item.primary_actor || 'the involved actor';
  const containment = item.containment.toLowerCase();

  if (field === 'hypothesis') {
    if (item.id === 'CASE-3001') {
      return 'Account misuse or compromise may have enabled a customer-data export from Snowflake, local staging on a managed endpoint, and transfer to unmanaged cloud storage.';
    }
    return `${item.risk_type} may have affected ${item.key_resource.toLowerCase()} and should be validated against the current business context while containment remains ${containment}.`;
  }

  if (field === 'quick-note') {
    return `Captured for follow-up: validate ${investigationContext.fixture.suggestedNextCheck.toLowerCase()} and confirm whether containment remains ${containment}.`;
  }

  if (field === 'general-comment') {
    return `Analyst note: evidence and workflow context for ${item.id} were reviewed, and the next step is to validate ${investigationContext.fixture.suggestedNextCheck.toLowerCase()}.`;
  }

  if (field === 'task-title') {
    return investigationContext.playbook.recommendedChecks[0] ?? `Validate the highest-risk activity affecting ${item.key_resource}.`;
  }

  if (field === 'severity-override-reason') {
    return `Severity is being adjusted to reflect the current evidence confidence, affected data sensitivity, and containment status for ${item.id}.`;
  }

  if (field === 'reopen-reason' || field === 'merge-reopen-reason') {
    return `New investigation context suggests ${item.id} still requires active review because open risk remains and the prior resolution no longer reflects the current evidence.`;
  }

  if (field === 'approval-justification') {
    if (action) {
      return `${action.title} should proceed because it reduces exposure risk affecting ${action.affectedEntity.toLowerCase()} and remains reversible after analyst review.`;
    }
    return `The requested action reduces continued exposure risk for ${item.id} and can be reversed after analyst review if the activity proves legitimate.`;
  }

  if (field === 'rejection-comment') {
    if (action) {
      return `Rejecting ${action.title.toLowerCase()} pending additional evidence because current context does not yet justify the operational impact.`;
    }
    return `Rejecting this action pending additional evidence and validation of the expected business impact.`;
  }

  if (field === 'cancellation-reason') {
    if (action) {
      return `Cancelling ${action.title.toLowerCase()} because the current investigation path no longer requires it and containment priorities have shifted.`;
    }
    return `Cancelling this action because current containment priorities have shifted after analyst review.`;
  }

  if (field === 'move-alert-reason') {
    return `Move this alert into ${destinationCaseLabel ?? 'the selected case'} because its evidence, actors, and timing align better with that investigation story.`;
  }

  if (field === 'classification-comment') {
    if (item.id === 'CASE-3002') {
      return 'Confirmed public exposure of production customer data through AWS S3 and a related broad SharePoint link. Evidence supports a cloud-access policy violation caused by misconfiguration rather than an approved sharing workflow.';
    }
    if (classification === 'False positive') {
      return `Current evidence suggests ${item.id} reflects expected or benign activity rather than confirmed malicious behavior.`;
    }
    return `Evidence for ${item.id} supports classification as ${classification ?? 'a confirmed security issue'} based on ${affectedSystems.toLowerCase()} and the current containment context.`;
  }

  if (field === 'resolution-summary') {
    if (item.id === 'CASE-3002') {
      return 'Production customer data was publicly reachable through an AWS S3 path and a related broadly accessible SharePoint link. Public access was removed and repository-sharing scope was reviewed.';
    }
    return `${item.title} was investigated across ${affectedSystems.toLowerCase()}, and the highest-risk exposure path was addressed while remaining follow-up items were documented.`;
  }

  if (field === 'root-cause') {
    return item.id === 'CASE-3002'
      ? 'A cloud and repository misconfiguration enabled broad public access beyond the intended sharing scope.'
      : `The current working root cause is ${item.risk_type.toLowerCase()} involving ${primaryActor.toLowerCase()} and the affected systems in this case.`;
  }

  if (field === 'remediation-summary') {
    return item.id === 'CASE-3002'
      ? 'Removed public access, reviewed repository sharing scope, and documented follow-up governance checks.'
      : `Primary containment and follow-up response actions were applied for ${item.id}, with remaining validation steps assigned to the investigation team.`;
  }

  if (field === 'residual-risk') {
    return warnings.length
      ? `Residual risk remains because ${warnings[0].toLowerCase()}`
      : `Residual risk is reduced, but continued monitoring is recommended until related systems and follow-up checks are complete.`;
  }

  if (field === 'resolution-final-comment') {
    return `Resolution reviewed by ${primaryActor} context and current containment status. Follow-up monitoring and documentation requirements have been recorded.`;
  }

  if (field === 'resolution-exception-reason') {
    return `Resolution requires analyst exception because ${warnings[0]?.toLowerCase() ?? 'one or more resolution guardrails remain open'} while the current business need favors closure with monitoring.`;
  }

  if (field === 'escalation-reason') {
    if (item.id === 'CASE-3001') {
      return 'Escalate to incident response because customer billing data may have reached unmanaged cloud storage and endpoint isolation remains incomplete.';
    }
    return `Escalate to ${selectedTeam ?? 'the selected handoff team'} because ${item.id} still carries material risk that requires cross-functional response.`;
  }

  if (field === 'escalation-note') {
    return `Please review ${item.id}, prioritize validation of ${investigationContext.fixture.suggestedNextCheck.toLowerCase()}, and coordinate any follow-up containment required by the current risk posture.`;
  }

  return undefined;
}

export function draftSourceLabel(provenance?: DraftProvenance) {
  if (!provenance) return 'Analyst-authored';
  if (provenance === 'AI-assisted') return 'AI-assisted';
  if (provenance === 'AI-assisted-edited') return 'AI-assisted · edited';
  return 'Analyst-authored';
}
