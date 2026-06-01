import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildInvestigationContext, createWorkspaceStateFromFixture } from '../data/investigationFixtures';
import type {
  EscalationRecord,
  InvestigationActivityItem,
  InvestigationWorkspaceState,
  ResolutionRecord,
  ResponseActionState,
  TimelineEvent,
  WorkItemClassification,
  WorkflowActivityEvent,
} from '../types/investigation';
import type { WorkItem } from '../types/queue';

interface WorkflowItemState {
  workspace?: InvestigationWorkspaceState;
  manualStatusOverride?: boolean;
}

export function useWorkflowState(baseItems: WorkItem[], currentAnalyst: string) {
  const [items, setItems] = useState<WorkItem[]>(baseItems);
  const [workflowStateByItemId, setWorkflowStateByItemId] = useState<Record<string, WorkflowItemState>>({});
  const [globalActivityLog, setGlobalActivityLog] = useState<WorkflowActivityEvent[]>([]);

  useEffect(() => {
    setItems(baseItems);
  }, [baseItems]);

  const updateItem = useCallback((itemId: string, updater: (item: WorkItem) => WorkItem) => {
    setItems((current) => current.map((item) => (item.id === itemId ? updater(item) : item)));
  }, []);

  const getItemById = useCallback(
    (itemId: string) => items.find((item) => item.id === itemId) ?? null,
    [items],
  );

  const getOrCreateWorkspace = useCallback(
    (item: WorkItem) =>
      workflowStateByItemId[item.id]?.workspace ??
      createWorkspaceStateFromFixture(buildInvestigationContext(item).fixture),
    [workflowStateByItemId],
  );

  const ensureWorkspaceState = useCallback((item: WorkItem) => {
    setWorkflowStateByItemId((current) => {
      if (current[item.id]?.workspace) {
        return current;
      }
      return {
        ...current,
        [item.id]: {
          ...current[item.id],
          workspace: createWorkspaceStateFromFixture(buildInvestigationContext(item).fixture),
        },
      };
    });
  }, []);

  const appendGlobalActivity = useCallback(
    (item: WorkItem, entry: Omit<WorkflowActivityEvent, 'itemId' | 'itemTitle' | 'itemType' | 'system' | 'riskType'>) => {
      setGlobalActivityLog((current) => [
        {
          ...entry,
          itemId: item.id,
          itemTitle: item.title,
          itemType: item.item_type,
          system: item.affected_systems[0],
          riskType: item.risk_type,
        },
        ...current,
      ]);
    },
    [],
  );

  const syncItemFromWorkspace = useCallback(
    (baseItem: WorkItem, workspace: InvestigationWorkspaceState) => {
      const derivedContainment = deriveContainmentState(workspace.actions, baseItem);
      const manualStatusOverride = workflowStateByItemId[baseItem.id]?.manualStatusOverride;
      const nextStatus =
        !manualStatusOverride && baseItem.status !== 'Resolved'
          ? deriveWorkflowStatus(workspace.actions, baseItem.status)
          : baseItem.status;

      return {
        ...baseItem,
        status: nextStatus,
        containment: derivedContainment,
        classification: workspace.classification,
        resolution: workspace.resolution,
        lastResolution: workspace.lastResolution,
        reopenedCount: baseItem.reopenedCount ?? 0,
        preview: {
          ...baseItem.preview,
          identity_and_urgency: {
            ...baseItem.preview.identity_and_urgency,
            status: nextStatus,
          },
          containment_state: derivedContainment,
        },
      };
    },
    [workflowStateByItemId],
  );

  const updateWorkspaceState = useCallback(
    (
      item: WorkItem,
      updater: (workspace: InvestigationWorkspaceState) => InvestigationWorkspaceState,
      options?: { logContainmentChange?: boolean },
    ) => {
      const currentWorkspace = getOrCreateWorkspace(item);
      const nextWorkspace = updater(currentWorkspace);
      const nextItem = syncItemFromWorkspace(item, nextWorkspace);

      setWorkflowStateByItemId((current) => ({
        ...current,
        [item.id]: {
          ...current[item.id],
          workspace: nextWorkspace,
        },
      }));

      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? nextItem : entry)),
      );

      if (options?.logContainmentChange && item.containment !== nextItem.containment) {
        appendGlobalActivity(item, {
          id: `activity-${Date.now()}-${item.id}`,
          timestamp: 'Just now',
          actor: 'System',
          actorType: 'System',
          activityType: 'Containment derived',
          description: `${item.id} containment changed to ${nextItem.containment}.`,
          previousValue: item.containment,
          newValue: nextItem.containment,
          result: nextItem.containment,
        });
      }

      return nextWorkspace;
    },
    [appendGlobalActivity, getOrCreateWorkspace, syncItemFromWorkspace],
  );

  const assignItem = useCallback(
    (itemId: string, assignee: string, actor = currentAnalyst) => {
      const item = getItemById(itemId);
      if (!item) return;
      updateItem(itemId, (entry) => ({
        ...entry,
        assignee,
        preview: {
          ...entry.preview,
          identity_and_urgency: {
            ...entry.preview.identity_and_urgency,
            assignee,
          },
        },
        localHistory: [...(entry.localHistory ?? []), `Assigned to ${assignee}`],
      }));
      appendGlobalActivity(item, {
        id: `activity-${Date.now()}-${itemId}`,
        timestamp: 'Just now',
        actor,
        actorType: 'Analyst',
        activityType: 'Assignee changed',
        description: `${itemId} assigned to ${assignee}.`,
        previousValue: item.assignee,
        newValue: assignee,
        result: 'Updated',
      });
    },
    [appendGlobalActivity, currentAnalyst, getItemById, updateItem],
  );

  const changeWorkflowStatus = useCallback(
    (itemId: string, status: WorkItem['status'], comment?: string, actor = currentAnalyst) => {
      const item = getItemById(itemId);
      if (!item) return;
      setWorkflowStateByItemId((current) => ({
        ...current,
        [itemId]: {
          ...current[itemId],
          manualStatusOverride: true,
        },
      }));
      updateItem(itemId, (entry) => ({
        ...entry,
        status,
        reopenComment: comment ?? entry.reopenComment,
        preview: {
          ...entry.preview,
          identity_and_urgency: {
            ...entry.preview.identity_and_urgency,
            status,
          },
        },
        localHistory: [
          ...(entry.localHistory ?? []),
          comment ? `${entry.id} reopened as ${status}: ${comment}` : `Status changed to ${status}`,
        ],
      }));
      appendGlobalActivity(item, {
        id: `activity-${Date.now()}-${itemId}`,
        timestamp: 'Just now',
        actor,
        actorType: 'Analyst',
        activityType: comment ? 'Case reopened' : 'Status changed',
        description: `${itemId} moved to ${status}.`,
        previousValue: item.status,
        newValue: status,
        comment,
        result: 'Updated',
      });
    },
    [appendGlobalActivity, currentAnalyst, getItemById, updateItem],
  );

  const overrideSeverity = useCallback(
    (itemId: string, severity: WorkItem['severity'], comment: string, actor = currentAnalyst) => {
      const item = getItemById(itemId);
      if (!item) return;
      const previousSeverity = item.analystSeverityOverride?.previousSeverity ?? item.severity;
      updateItem(itemId, (entry) => ({
        ...entry,
        severity,
        analystSeverityOverride: {
          severity,
          comment,
          previousSeverity,
        },
        preview: {
          ...entry.preview,
          identity_and_urgency: {
            ...entry.preview.identity_and_urgency,
            severity,
          },
        },
        localHistory: [...(entry.localHistory ?? []), `Severity overridden to ${severity}: ${comment}`],
      }));
      appendGlobalActivity(item, {
        id: `activity-${Date.now()}-${itemId}`,
        timestamp: 'Just now',
        actor,
        actorType: 'Analyst',
        activityType: 'Severity override',
        description: `${itemId} severity changed to ${severity}.`,
        previousValue: item.severity,
        newValue: severity,
        comment,
        result: 'Updated',
      });
    },
    [appendGlobalActivity, currentAnalyst, getItemById, updateItem],
  );

  const classifyItem = useCallback(
    (itemId: string, classification: WorkItemClassification, comment: string) => {
      const item = getItemById(itemId);
      if (!item) return;
      updateItem(itemId, (entry) => ({
        ...entry,
        classification,
        localHistory: [...(entry.localHistory ?? []), `Classified as ${classification}: ${comment}`],
      }));
      setWorkflowStateByItemId((current) => ({
        ...current,
        [itemId]: {
          ...current[itemId],
          workspace: {
            ...getOrCreateWorkspace(item),
            classification,
          },
        },
      }));
      appendGlobalActivity(item, {
        id: `activity-${Date.now()}-${itemId}`,
        timestamp: 'Just now',
        actor: currentAnalyst,
        actorType: 'Analyst',
        activityType: 'Classification set',
        description: `${itemId} classified as ${classification}.`,
        newValue: classification,
        comment,
        result: 'Updated',
      });
    },
    [appendGlobalActivity, currentAnalyst, getItemById, getOrCreateWorkspace, updateItem],
  );

  const resolveItem = useCallback(
    (itemId: string, resolution: ResolutionRecord, comment: string) => {
      const item = getItemById(itemId);
      if (!item) return;
      const workspace = getOrCreateWorkspace(item);
      const nextWorkspace: InvestigationWorkspaceState = {
        ...workspace,
        classification: resolution.classification,
        lastResolution: workspace.resolution,
        resolution,
      };
      updateWorkspaceState(item, () => nextWorkspace);
      setWorkflowStateByItemId((current) => ({
        ...current,
        [itemId]: {
          ...current[itemId],
          manualStatusOverride: true,
          workspace: nextWorkspace,
        },
      }));
      updateItem(itemId, (entry) => ({
        ...entry,
        status: 'Resolved',
        classification: resolution.classification,
        resolution,
        lastResolution: entry.resolution,
        preview: {
          ...entry.preview,
          identity_and_urgency: {
            ...entry.preview.identity_and_urgency,
            status: 'Resolved',
          },
        },
        localHistory: [...(entry.localHistory ?? []), `Resolved: ${resolution.resolutionSummary}`],
      }));
      appendGlobalActivity(item, {
        id: `activity-${Date.now()}-${itemId}`,
        timestamp: resolution.resolvedAt,
        actor: resolution.resolvedBy,
        actorType: 'Analyst',
        activityType: resolution.resolvedWithException ? 'Resolved with exception' : 'Resolved',
        description: resolution.resolutionSummary,
        newValue: resolution.classification,
        comment,
        result: 'Resolved',
      });
    },
    [appendGlobalActivity, getItemById, getOrCreateWorkspace, updateItem, updateWorkspaceState],
  );

  const reopenItem = useCallback(
    (itemId: string, status: WorkItem['status'], comment: string) => {
      const item = getItemById(itemId);
      if (!item) return;
      changeWorkflowStatus(itemId, status, comment);
      updateItem(itemId, (entry) => ({
        ...entry,
        reopenedCount: (entry.reopenedCount ?? 0) + 1,
        lastResolution: entry.resolution ?? entry.lastResolution,
        resolution: undefined,
      }));
    },
    [changeWorkflowStatus, getItemById, updateItem],
  );

  const addEscalation = useCallback(
    (itemId: string, escalation: EscalationRecord) => {
      const item = getItemById(itemId);
      if (!item) return;
      updateWorkspaceState(item, (workspace) => ({
        ...workspace,
        escalations: [escalation, ...workspace.escalations],
      }));
      appendGlobalActivity(item, {
        id: `activity-${Date.now()}-${itemId}`,
        timestamp: escalation.createdAt,
        actor: escalation.createdBy,
        actorType: 'Analyst',
        activityType: 'Escalation created',
        description: `${itemId} escalated to ${escalation.team}.`,
        comment: escalation.note,
        result: escalation.urgency,
      });
    },
    [appendGlobalActivity, getItemById, updateWorkspaceState],
  );

  const overviewMetrics = useMemo(() => deriveOverviewMetrics(items, workflowStateByItemId), [items, workflowStateByItemId]);

  return {
    items,
    setItems,
    updateItem,
    workflowStateByItemId,
    globalActivityLog,
    getItemById,
    getOrCreateWorkspace,
    ensureWorkspaceState,
    updateWorkspaceState,
    appendGlobalActivity,
    assignItem,
    changeWorkflowStatus,
    overrideSeverity,
    classifyItem,
    resolveItem,
    reopenItem,
    addEscalation,
    overviewMetrics,
  };
}

export function deriveContainmentState(actions: InvestigationWorkspaceState['actions'], item: WorkItem) {
  const required = actions.filter((action) => action.requiredForContainment);
  if (!required.length) {
    return /not applicable/i.test(item.containment) ? 'Not applicable' : 'No immediate action';
  }
  const completedCount = required.filter((action) => action.currentState === 'Completed').length;
  const inProgress = required.some((action) => action.currentState === 'In progress');
  if (completedCount === required.length) {
    return 'Contained';
  }
  if (inProgress) {
    return 'Automated containment running';
  }
  if (completedCount > 0) {
    return 'Partially contained';
  }
  return /exposure|public/i.test(item.risk_type) ? 'Active exposure' : 'Not contained';
}

export function deriveWorkflowStatus(actions: InvestigationWorkspaceState['actions'], currentStatus: string) {
  if (currentStatus === 'Resolved') {
    return currentStatus;
  }
  if (actions.some((action) => action.currentState === 'In progress')) {
    return 'Remediating';
  }
  if (actions.some((action) => action.currentState === 'Pending approval')) {
    return 'Awaiting approval';
  }
  const required = actions.filter((action) => action.requiredForContainment);
  if (required.length > 0 && required.every((action) => action.currentState === 'Completed')) {
    return 'Monitoring';
  }
  return currentStatus;
}

function deriveOverviewMetrics(items: WorkItem[], workflowStateByItemId: Record<string, WorkflowItemState>) {
  const resolvedToday = items.filter((item) => item.status === 'Resolved').length;
  const pendingApprovals = items.filter((item) =>
    (workflowStateByItemId[item.id]?.workspace?.actions ?? []).some((action) => action.currentState === 'Pending approval'),
  ).length;
  const failedActions = items.reduce(
    (count, item) =>
      count +
      (workflowStateByItemId[item.id]?.workspace?.actions ?? []).filter((action) => action.currentState === 'Failed')
        .length,
    0,
  );
  const activeExposures = items.filter((item) => /active exposure|not contained/i.test(item.containment)).length;
  const unassignedP1 = items.filter((item) => item.assignee === 'Unassigned' && /^P1/.test(item.priority)).length;

  return {
    criticalOpenItems: items.filter((item) => item.status !== 'Resolved' && item.severity === 'Critical').length,
    slaBreached: items.filter((item) => /breached|0m|overdue/i.test(item.sla)).length,
    unassignedP1,
    activeExposures,
    pendingApprovals,
    failedActions,
    resolvedToday,
  };
}

export function makeActivityEntry(
  actor: string,
  actorType: InvestigationActivityItem['actorType'],
  activityType: string,
  description: string,
  extra?: Partial<InvestigationActivityItem>,
): InvestigationActivityItem {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: 'Just now',
    actor,
    actorType,
    activityType,
    description,
    ...extra,
  };
}

export function compareTimeRange(event: TimelineEvent, range: string) {
  if (range === 'All times') return true;
  const occurredAt = new Date(event.occurredAt).getTime();
  if (Number.isNaN(occurredAt)) return true;
  const latest = Date.now();
  const diffMinutes = (latest - occurredAt) / 60000;
  if (range === 'Latest 15 minutes') return diffMinutes <= 15;
  if (range === 'Latest 30 minutes') return diffMinutes <= 30;
  if (range === 'Latest hour') return diffMinutes <= 60;
  return true;
}
