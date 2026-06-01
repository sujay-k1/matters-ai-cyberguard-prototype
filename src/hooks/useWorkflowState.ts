import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildInvestigationContext, createWorkspaceStateFromFixture } from '../data/investigationFixtures';
import type {
  ClassificationRecord,
  EscalationRecord,
  IncludedAlertItem,
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
  const itemsRef = useRef(items);
  const workflowStateRef = useRef(workflowStateByItemId);

  useEffect(() => {
    setItems(baseItems);
  }, [baseItems]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    workflowStateRef.current = workflowStateByItemId;
  }, [workflowStateByItemId]);

  const updateItem = useCallback((itemId: string, updater: (item: WorkItem) => WorkItem) => {
    setItems((current) => current.map((item) => (item.id === itemId ? updater(item) : item)));
  }, []);

  const getItemById = useCallback(
    (itemId: string) => items.find((item) => item.id === itemId) ?? null,
    [items],
  );

  const getOrCreateWorkspace = useCallback(
    (item: WorkItem) =>
      workflowStateRef.current[item.id]?.workspace ??
      createWorkspaceStateFromFixture(buildInvestigationContext(item).fixture),
    [],
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

  const appendItemComment = useCallback(
    (itemId: string, text: string, actor = currentAnalyst) => {
      const item = getItemById(itemId);
      if (!item) return;
      updateItem(itemId, (entry) => ({
        ...entry,
        localHistory: [...(entry.localHistory ?? []), `Comment added: ${text}`],
      }));
      setWorkflowStateByItemId((current) => {
        const workspace = current[itemId]?.workspace;
        if (!workspace) return current;
        return {
          ...current,
          [itemId]: {
            ...current[itemId],
            workspace: {
              ...workspace,
              notes: [
                { id: `note-${Date.now()}`, author: actor, timestamp: 'Just now', text },
                ...workspace.notes,
              ],
              activity: [
                makeActivityEntry(actor, 'Analyst', 'Comment added', text),
                ...workspace.activity,
              ],
            },
          },
        };
      });
      appendGlobalActivity(item, {
        id: `activity-${Date.now()}-${itemId}`,
        timestamp: 'Just now',
        actor,
        actorType: 'Analyst',
        activityType: 'Comment added',
        description: text,
        result: 'Recorded',
      });
    },
    [appendGlobalActivity, currentAnalyst, getItemById, updateItem],
  );

  const syncItemFromWorkspace = useCallback(
    (
      baseItem: WorkItem,
      workspace: InvestigationWorkspaceState,
      options?: { manualStatusOverride?: boolean },
    ) => {
      const derivedContainment = deriveContainmentState(workspace.actions, baseItem);
      const manualStatusOverride = options?.manualStatusOverride ?? false;
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
    [],
  );

  const updateWorkspaceState = useCallback(
    (
      item: WorkItem,
      updater: (workspace: InvestigationWorkspaceState) => InvestigationWorkspaceState,
      options?: { logContainmentChange?: boolean },
    ) => {
      const latestItems = itemsRef.current;
      const latestWorkflowState = workflowStateRef.current;
      const latestItem = latestItems.find((entry) => entry.id === item.id) ?? item;
      const currentWorkflowEntry = latestWorkflowState[item.id];
      const currentWorkspace =
        currentWorkflowEntry?.workspace ??
        createWorkspaceStateFromFixture(buildInvestigationContext(latestItem).fixture);
      const nextWorkspace = updater(currentWorkspace);
      const nextItem = syncItemFromWorkspace(latestItem, nextWorkspace, {
        manualStatusOverride: currentWorkflowEntry?.manualStatusOverride,
      });

      setWorkflowStateByItemId((current) => ({
        ...current,
        [item.id]: {
          ...current[item.id],
          workspace: nextWorkspace,
        },
      }));
      workflowStateRef.current = {
        ...latestWorkflowState,
        [item.id]: {
          ...latestWorkflowState[item.id],
          workspace: nextWorkspace,
        },
      };

      const nextItems = latestItems.map((entry) => (entry.id === item.id ? nextItem : entry));
      setItems(nextItems);
      itemsRef.current = nextItems;

      if (options?.logContainmentChange && latestItem.containment !== nextItem.containment) {
        appendGlobalActivity(latestItem, {
          id: `activity-${Date.now()}-${item.id}`,
          timestamp: 'Just now',
          actor: 'System',
          actorType: 'System',
          activityType: 'Containment derived',
          description: `${item.id} containment changed to ${nextItem.containment}.`,
          previousValue: latestItem.containment,
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
    (itemId: string, record: ClassificationRecord) => {
      const item = getItemById(itemId);
      if (!item) return;
      updateItem(itemId, (entry) => ({
        ...entry,
        classification: record.classification,
        classificationRecord: record,
        localHistory: [...(entry.localHistory ?? []), `Classified as ${record.classification}: ${record.comment}`],
      }));
      setWorkflowStateByItemId((current) => ({
        ...current,
        [itemId]: {
          ...current[itemId],
          workspace: {
            ...getOrCreateWorkspace(item),
            classification: record.classification,
            classificationRecord: record,
          },
        },
      }));
      appendGlobalActivity(item, {
        id: `activity-${Date.now()}-${itemId}`,
        timestamp: record.updatedAt,
        actor: record.updatedBy,
        actorType: 'Analyst',
        activityType: 'Classification set',
        description: `${itemId} classified as ${record.classification}.`,
        newValue: record.classification,
        comment: record.comment,
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
      const detachedAlertIds = new Set(
        resolution.childAlertHandling === 'detach-selected' ? resolution.detachedAlertIds ?? [] : [],
      );
      const remainingAlerts =
        item.item_type === 'case'
          ? workspace.alerts.filter((alert) => !detachedAlertIds.has(alert.id))
          : workspace.alerts;
      const nextWorkspace: InvestigationWorkspaceState = {
        ...workspace,
        classification: resolution.classification,
        lastResolution: workspace.resolution,
        resolution,
        alerts:
          item.item_type === 'case'
            ? remainingAlerts.map((alert) => ({ ...alert, status: 'Resolved' }))
            : workspace.alerts,
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
        child_alert_ids: item.item_type === 'case' ? remainingAlerts.map((alert) => alert.id) : entry.child_alert_ids,
        alert_count: item.item_type === 'case' ? remainingAlerts.length : entry.alert_count,
        derivedComposition:
          item.item_type === 'case'
            ? remainingAlerts.length === 1
              ? 'Single-alert case'
              : remainingAlerts.length > 5
                ? 'Large case: 6+ alerts'
                : 'Multi-alert case: 2–5 alerts'
            : entry.derivedComposition,
        preview:
          item.item_type === 'case'
            ? {
                ...entry.preview,
                identity_and_urgency: {
                  ...entry.preview.identity_and_urgency,
                  status: 'Resolved',
                },
                alerts: remainingAlerts.map((alert) => ({
                  id: alert.id,
                  title: alert.title,
                  severity: alert.severity,
                  priority: alert.priority,
                })),
              }
            : {
                ...entry.preview,
                identity_and_urgency: {
                  ...entry.preview.identity_and_urgency,
                  status: 'Resolved',
                },
              },
        localHistory: [...(entry.localHistory ?? []), `${resolution.resolvedWithException ? 'Resolved with exception' : 'Resolved'}: ${resolution.resolutionSummary}`],
      }));
      if (item.item_type === 'case') {
        workspace.alerts.forEach((alert) => {
          if (detachedAlertIds.has(alert.id)) {
            updateItem(alert.id, (entry) => ({
              ...entry,
              item_type: 'alert',
              alert_count: null,
              child_alert_ids: undefined,
              derivedComposition: 'Standalone alert',
              status: entry.status === 'Resolved' ? 'Investigating' : entry.status,
              resolution: undefined,
              lastResolution: entry.resolution ?? entry.lastResolution,
              preview: {
                ...entry.preview,
                identity_and_urgency: {
                  ...entry.preview.identity_and_urgency,
                  type: 'Alert',
                  status: entry.status === 'Resolved' ? 'Investigating' : entry.status,
                },
                correlation_status: `Detached from ${itemId} during resolution and kept open.`,
              },
              localHistory: [...(entry.localHistory ?? []), `Detached from ${itemId} during resolution`],
            }));
            appendGlobalActivity(item, {
              id: `activity-${Date.now()}-${alert.id}`,
              timestamp: resolution.resolvedAt,
              actor: resolution.resolvedBy,
              actorType: 'Analyst',
              activityType: 'Alert detached',
              description: `${alert.id} detached from ${itemId} during resolution.`,
              result: 'Detached',
            });
            return;
          }

          updateItem(alert.id, (entry) => ({
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
            localHistory: [...(entry.localHistory ?? []), `Resolved with parent case ${itemId}`],
          }));
          appendGlobalActivity(item, {
            id: `activity-${Date.now()}-${alert.id}`,
            timestamp: resolution.resolvedAt,
            actor: resolution.resolvedBy,
            actorType: 'Analyst',
            activityType: 'Child alert resolved',
            description: `${alert.id} resolved with parent case ${itemId}.`,
            newValue: resolution.classification,
            comment,
            result: 'Resolved',
          });
        });
      }
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
      const previousResolution = item.resolution ?? workflowStateByItemId[itemId]?.workspace?.resolution;
      changeWorkflowStatus(itemId, status, comment);
      updateItem(itemId, (entry) => ({
        ...entry,
        reopenedCount: (entry.reopenedCount ?? 0) + 1,
        lastResolution: previousResolution ?? entry.lastResolution,
        resolution: undefined,
        localHistory: [...(entry.localHistory ?? []), `Reopened: ${comment}`],
      }));
      setWorkflowStateByItemId((current) => {
        const workspace = current[itemId]?.workspace;
        if (!workspace) return current;
        return {
          ...current,
          [itemId]: {
            ...current[itemId],
            workspace: {
              ...workspace,
              lastResolution: workspace.resolution ?? workspace.lastResolution,
              resolution: undefined,
              activity: [
                makeActivityEntry(currentAnalyst, 'Analyst', 'Case reopened', `${itemId} reopened as ${status}.`, {
                  comment,
                  previousValue: previousResolution?.resolutionSummary,
                  newValue: status,
                }),
                ...workspace.activity,
              ],
            },
          },
        };
      });
    },
    [changeWorkflowStatus, currentAnalyst, getItemById, updateItem, workflowStateByItemId],
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
        newValue: escalation.notifyDataOwner ? 'Data-owner notification requested' : escalation.team,
      });
    },
    [appendGlobalActivity, getItemById, updateWorkspaceState],
  );

  const updateTags = useCallback(
    (itemId: string, tags: string[], actor = currentAnalyst) => {
      const item = getItemById(itemId);
      if (!item) return;
      updateItem(itemId, (entry) => ({ ...entry, tags, localHistory: [...(entry.localHistory ?? []), `Tags updated: ${tags.join(', ') || 'None'}`] }));
      appendGlobalActivity(item, {
        id: `activity-${Date.now()}-${itemId}`,
        timestamp: 'Just now',
        actor,
        actorType: 'Analyst',
        activityType: 'Tags updated',
        description: `${itemId} tags updated.`,
        previousValue: item.tags.join(', '),
        newValue: tags.join(', '),
        result: 'Updated',
      });
    },
    [appendGlobalActivity, currentAnalyst, getItemById, updateItem],
  );

  const renameItem = useCallback(
    (itemId: string, title: string, actor = currentAnalyst) => {
      const item = getItemById(itemId);
      if (!item) return;
      updateItem(itemId, (entry) => ({
        ...entry,
        title,
        preview: {
          ...entry.preview,
          identity_and_urgency: { ...entry.preview.identity_and_urgency, title },
        },
        localHistory: [...(entry.localHistory ?? []), `Renamed to ${title}`],
      }));
      appendGlobalActivity(item, {
        id: `activity-${Date.now()}-${itemId}`,
        timestamp: 'Just now',
        actor,
        actorType: 'Analyst',
        activityType: 'Case renamed',
        description: `${itemId} renamed.`,
        previousValue: item.title,
        newValue: title,
        result: 'Updated',
      });
    },
    [appendGlobalActivity, currentAnalyst, getItemById, updateItem],
  );

  const syncTimelineAttachment = useCallback(
    (itemId: string, eventId: string, actor = currentAnalyst) => {
      const item = getItemById(itemId);
      if (!item) return;
      const workspace = getOrCreateWorkspace(item);
      const event = workspace.timeline.find((entry) => entry.id === eventId);
      if (!event) return;
      const nextAttached = event.attached === false;
      updateWorkspaceState(item, (current) => ({
        ...current,
        timeline: current.timeline.map((entry) => entry.id === eventId ? { ...entry, attached: nextAttached } : entry),
        evidence: current.evidence.map((entry) => entry.id === event.evidenceId ? { ...entry, attached: nextAttached } : entry),
        activity: [
          makeActivityEntry(actor, 'Analyst', `Timeline event ${nextAttached ? 'attached' : 'detached'}`, `${event.title}`, {
            newValue: nextAttached ? 'Attached' : 'Detached',
          }),
          ...current.activity,
        ],
      }));
      appendGlobalActivity(item, {
        id: `activity-${Date.now()}-${itemId}`,
        timestamp: 'Just now',
        actor,
        actorType: 'Analyst',
        activityType: `Timeline event ${nextAttached ? 'attached' : 'detached'}`,
        description: `${event.title}`,
        result: nextAttached ? 'Attached' : 'Detached',
      });
    },
    [appendGlobalActivity, currentAnalyst, getItemById, getOrCreateWorkspace, updateWorkspaceState],
  );

  const syncEvidenceAttachment = useCallback(
    (itemId: string, evidenceId: string, actor = currentAnalyst) => {
      const item = getItemById(itemId);
      if (!item) return;
      const workspace = getOrCreateWorkspace(item);
      const evidence = workspace.evidence.find((entry) => entry.id === evidenceId);
      if (!evidence) return;
      const nextAttached = !evidence.attached;
      updateWorkspaceState(item, (current) => ({
        ...current,
        evidence: current.evidence.map((entry) => entry.id === evidenceId ? { ...entry, attached: nextAttached } : entry),
        timeline: current.timeline.map((entry) => entry.evidenceId === evidenceId ? { ...entry, attached: nextAttached } : entry),
        activity: [
          makeActivityEntry(actor, 'Analyst', `Evidence ${nextAttached ? 'attached' : 'detached'}`, evidence.id, {
            newValue: nextAttached ? 'Attached' : 'Detached',
          }),
          ...current.activity,
        ],
      }));
      appendGlobalActivity(item, {
        id: `activity-${Date.now()}-${itemId}`,
        timestamp: 'Just now',
        actor,
        actorType: 'Analyst',
        activityType: `Evidence ${nextAttached ? 'attached' : 'detached'}`,
        description: evidence.id,
        result: nextAttached ? 'Attached' : 'Detached',
      });
    },
    [appendGlobalActivity, currentAnalyst, getItemById, getOrCreateWorkspace, updateWorkspaceState],
  );

  const detachAlertFromCase = useCallback(
    (sourceCaseId: string, alertId: string, actor = currentAnalyst) => {
      const caseItem = getItemById(sourceCaseId);
      if (!caseItem) return null;
      const workspace = getOrCreateWorkspace(caseItem);
      const alert = workspace.alerts.find((entry) => entry.id === alertId);
      if (!alert) return null;
      const standaloneAlert = restoreStandaloneAlert(caseItem, workspace, alert);
      updateWorkspaceState(caseItem, (current) => ({
        ...current,
        alerts: current.alerts.filter((entry) => entry.id !== alertId),
        selectedAlertId: current.selectedAlertId === alertId ? null : current.selectedAlertId,
        activity: [
          makeActivityEntry(actor, 'Analyst', 'Alert detached', `${alertId} detached from ${sourceCaseId}.`),
          ...current.activity,
        ],
      }));
      setItems((current) => {
        const next = current.map((entry) => entry.id === sourceCaseId ? syncCaseComposition(entry, workspace.alerts.filter((child) => child.id !== alertId), actor) : entry);
        return [standaloneAlert, ...next.filter((entry) => entry.id !== standaloneAlert.id)];
      });
      appendGlobalActivity(caseItem, {
        id: `activity-${Date.now()}-${sourceCaseId}`,
        timestamp: 'Just now',
        actor,
        actorType: 'Analyst',
        activityType: 'Alert detached',
        description: `${alertId} detached from ${sourceCaseId}.`,
        result: 'Detached',
      });
      return standaloneAlert;
    },
    [appendGlobalActivity, currentAnalyst, getItemById, getOrCreateWorkspace, updateWorkspaceState],
  );

  const attachAlertToCase = useCallback(
    (destinationCaseId: string, alertId: string, actor = currentAnalyst) => {
      const destination = getItemById(destinationCaseId);
      const standalone = getItemById(alertId);
      if (!destination || !standalone) return null;
      const destinationWorkspace = getOrCreateWorkspace(destination);
      const alertEntry = buildAlertEntryFromItem(standalone, destinationCaseId);
      updateWorkspaceState(destination, (current) => ({
        ...current,
        alerts: [alertEntry, ...current.alerts],
        activity: [
          makeActivityEntry(actor, 'Analyst', 'Alert attached', `${alertId} attached to ${destinationCaseId}.`),
          ...current.activity,
        ],
      }));
      setItems((current) =>
        current
          .filter((entry) => entry.id !== alertId)
          .map((entry) =>
            entry.id === destinationCaseId
              ? syncCaseComposition(entry, [alertEntry, ...destinationWorkspace.alerts], actor)
              : entry,
          ),
      );
      appendGlobalActivity(destination, {
        id: `activity-${Date.now()}-${alertId}`,
        timestamp: 'Just now',
        actor,
        actorType: 'Analyst',
        activityType: 'Alert attached',
        description: `${alertId} attached to ${destinationCaseId}.`,
        result: 'Attached',
      });
      return alertEntry;
    },
    [appendGlobalActivity, currentAnalyst, getItemById, getOrCreateWorkspace, updateWorkspaceState],
  );

  const moveAlertBetweenCases = useCallback(
    (alertId: string, sourceCaseId: string, destinationCaseId: string, reason: string, actor = currentAnalyst) => {
      const detached = detachAlertFromCase(sourceCaseId, alertId, actor);
      const destination = getItemById(destinationCaseId);
      if (!detached || !destination) return;
      const destinationWorkspace = getOrCreateWorkspace(destination);
      const alertEntry = buildAlertEntryFromItem(detached, destinationCaseId);
      updateWorkspaceState(destination, (current) => ({
        ...current,
        alerts: [alertEntry, ...current.alerts],
        activity: [
          makeActivityEntry(actor, 'Analyst', 'Alert moved to case', `${alertId} moved into ${destinationCaseId}.`, { comment: reason }),
          ...current.activity,
        ],
      }));
      setItems((current) => current
        .filter((entry) => entry.id !== alertId)
        .map((entry) => entry.id === destinationCaseId ? syncCaseComposition(entry, [alertEntry, ...destinationWorkspace.alerts], actor) : entry));
    },
    [currentAnalyst, detachAlertFromCase, getItemById, getOrCreateWorkspace, updateWorkspaceState],
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
    appendItemComment,
    updateTags,
    renameItem,
    classifyItem,
    resolveItem,
    reopenItem,
    addEscalation,
    syncTimelineAttachment,
    syncEvidenceAttachment,
    detachAlertFromCase,
    attachAlertToCase,
    moveAlertBetweenCases,
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

function restoreStandaloneAlert(
  caseItem: WorkItem,
  workspace: InvestigationWorkspaceState,
  alert: IncludedAlertItem,
): WorkItem {
  const linkedEvidence = workspace.evidence.filter((entry) => alert.linkedEvidenceIds?.includes(entry.id));
  const primaryEvidence = linkedEvidence[0];
  const relatedEntities = workspace.entities.filter((entry) => alert.relatedEntityIds?.includes(entry.id));
  return {
    id: alert.id,
    item_type: 'alert',
    title: alert.title,
    risk_type: caseItem.risk_type,
    affected_systems: [alert.system],
    key_resource: relatedEntities[0]?.displayName ?? caseItem.key_resource,
    primary_actor: relatedEntities[0]?.displayName ?? caseItem.primary_actor,
    actor_entity_type: relatedEntities[0]?.type ?? caseItem.actor_entity_type,
    priority: alert.priority,
    priority_score: Number(alert.priority.match(/(\d+)$/)?.[1] ?? caseItem.priority_score),
    severity: alert.severity,
    data_sensitivity: caseItem.data_sensitivity,
    status: alert.status === 'Resolved' ? 'Investigating' : alert.status,
    assignee: caseItem.assignee,
    sla: caseItem.sla,
    detection_time: alert.detectedAt ?? caseItem.detection_time,
    last_activity: 'Just now',
    containment: caseItem.containment,
    detection_source: alert.detectionSource,
    resource_criticality: caseItem.resource_criticality,
    destination_exposure_target: caseItem.destination_exposure_target,
    alert_count: null,
    child_alert_ids: undefined,
    tags: [...caseItem.tags],
    affected_data_volume: caseItem.affected_data_volume,
    preview: {
      ...caseItem.preview,
      identity_and_urgency: {
        ...caseItem.preview.identity_and_urgency,
        type: 'Alert',
        id: alert.id,
        title: alert.title,
        severity: alert.severity,
        priority: alert.priority,
        status: alert.status === 'Resolved' ? 'Investigating' : alert.status,
      },
      correlation_status: 'Detached from parent case and restored as a standalone alert.',
      alerts: undefined,
    },
    derivedComposition: 'Standalone alert',
    localHistory: [`Detached from ${caseItem.id}`],
  };
}

function syncCaseComposition(item: WorkItem, alerts: IncludedAlertItem[], actor: string): WorkItem {
  const affectedSystems = [...new Set(alerts.map((entry) => entry.system))];
  return {
    ...item,
    child_alert_ids: alerts.map((entry) => entry.id),
    alert_count: alerts.length,
    affected_systems: affectedSystems.length ? affectedSystems : item.affected_systems,
    last_activity: 'Just now',
    localHistory: [...(item.localHistory ?? []), `Case composition updated by ${actor}`],
    preview: {
      ...item.preview,
      alerts: alerts.map((entry) => ({
        id: entry.id,
        title: entry.title,
        severity: entry.severity,
        priority: entry.priority,
      })),
    },
    derivedComposition:
      alerts.length === 1 ? 'Single-alert case' : alerts.length > 5 ? 'Large case: 6+ alerts' : 'Multi-alert case: 2–5 alerts',
  };
}

function buildAlertEntryFromItem(item: WorkItem, parentCaseId: string): IncludedAlertItem {
  return {
    id: item.id,
    title: item.title,
    severity: item.severity,
    priority: item.priority,
    detectionSource: item.detection_source,
    system: item.affected_systems[0] ?? item.detection_source,
    linkedEventsCount: 1,
    status: item.status,
    linkingRationale: `Manually moved into ${parentCaseId}.`,
    relevance: 'Needs review',
    parentCaseId,
    linkedEvidenceIds: [`${item.id}-ev-1`],
    relatedEntityIds: [],
    detectedAt: item.detection_time,
  };
}
