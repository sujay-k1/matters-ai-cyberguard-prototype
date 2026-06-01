import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ComposedModal,
  ModalBody,
  ModalHeader,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@carbon/react';
import { buildInvestigationContext } from '../data/investigationFixtures';
import { makeActivityEntry } from '../hooks/useWorkflowState';
import type {
  HuntResult,
  InvestigationActivityItem,
  InvestigationResponseAction,
  InvestigationTabId,
  InvestigationWorkspaceState,
  ResponseActionState,
} from '../types/investigation';
import type { WorkItem } from '../types/queue';
import { AlertDetailPanel } from './AlertDetailPanel';
import { EntityDetailPanel } from './EntityDetailPanel';
import { EvidenceDetailPanel } from './EvidenceDetailPanel';
import { HuntResultsModal } from './HuntResultsModal';
import { InvestigationActions } from './InvestigationActions';
import { InvestigationActivity } from './InvestigationActivity';
import { InvestigationEntities } from './InvestigationEntities';
import { InvestigationEvidence } from './InvestigationEvidence';
import { InvestigationHeader } from './InvestigationHeader';
import { InvestigationNoteModal } from './InvestigationNoteModal';
import { InvestigationRightRail } from './InvestigationRightRail';
import { InvestigationSummary } from './InvestigationSummary';
import { InvestigationTaskModal } from './InvestigationTaskModal';
import { InvestigationTimeline } from './InvestigationTimeline';
import { MoveAlertToCaseModal } from './MoveAlertToCaseModal';
import { ResponseActionDetailPanel } from './ResponseActionDetailPanel';
import { ResponseApprovalModal } from './ResponseApprovalModal';
import { ResponseFailureModal } from './ResponseFailureModal';
import { ResponseRejectModal } from './ResponseRejectModal';

interface InvestigationWorkspaceModalProps {
  open: boolean;
  item: WorkItem;
  activeTab: InvestigationTabId;
  currentAnalyst: string;
  workspace: InvestigationWorkspaceState;
  onClose: () => void;
  onTabChange: (tab: InvestigationTabId) => void;
  onAssignToMe: () => void;
  onReassign: () => void;
  onChangeStatus: () => void;
  onChangeSeverity: () => void;
  onOpenClassify: () => void;
  onOpenResolve: () => void;
  onOpenEscalate: () => void;
  onToast: (kind: 'success' | 'info' | 'warning', title: string, subtitle: string) => void;
  onWorkspaceChange: (updater: (workspace: InvestigationWorkspaceState) => InvestigationWorkspaceState, options?: { logContainmentChange?: boolean }) => void;
  onSyncTimelineAttachment: (eventId: string) => void;
  onSyncEvidenceAttachment: (evidenceId: string) => void;
  onDetachAlertFromCase: (alertId: string) => void;
  onAttachAlertToCase: (alertId: string) => void;
  onMoveAlertToCase: (alertId: string, destinationCaseId: string, reason: string) => void;
  availableCases: Array<{ id: string; title: string; status: string; alertCount: number }>;
}

const TAB_ORDER: InvestigationTabId[] = ['summary', 'timeline', 'evidence', 'entities', 'actions', 'activity'];
const TASK_OWNERS = ['Priya Sharma', 'Arjun Rao', 'Sameer Khan', 'Kavya Nair', 'Unassigned'];
const APPROVERS = ['Priya Sharma', 'Arjun Rao', 'Kavya Nair', 'Data platform owner', 'Network owner', 'SOC lead'];

export function InvestigationWorkspaceModal({
  open,
  item,
  activeTab,
  currentAnalyst,
  workspace,
  onClose,
  onTabChange,
  onAssignToMe,
  onReassign,
  onChangeStatus,
  onChangeSeverity,
  onOpenClassify,
  onOpenResolve,
  onOpenEscalate,
  onToast,
  onWorkspaceChange,
  onSyncTimelineAttachment,
  onSyncEvidenceAttachment,
  onDetachAlertFromCase,
  onAttachAlertToCase,
  onMoveAlertToCase,
  availableCases,
}: InvestigationWorkspaceModalProps) {
  const context = useMemo(() => buildInvestigationContext(item), [item]);
  const [quickNote, setQuickNote] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitleDraft, setTaskTitleDraft] = useState('');
  const [taskOwnerDraft, setTaskOwnerDraft] = useState(currentAnalyst);
  const [taskAssignModalOpen, setTaskAssignModalOpen] = useState(false);
  const [taskAssignTargetId, setTaskAssignTargetId] = useState<string | null>(null);
  const [hypothesisModalOpen, setHypothesisModalOpen] = useState(false);
  const [hypothesisDraft, setHypothesisDraft] = useState('');
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalApprover, setApprovalApprover] = useState('');
  const [approvalJustification, setApprovalJustification] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [failureModalOpen, setFailureModalOpen] = useState(false);
  const [failureReason, setFailureReason] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [moveAlertModalOpen, setMoveAlertModalOpen] = useState(false);
  const [moveAlertDestinationId, setMoveAlertDestinationId] = useState('');
  const [moveAlertReason, setMoveAlertReason] = useState('');
  const [huntOpen, setHuntOpen] = useState(false);
  const [selectedHuntIds, setSelectedHuntIds] = useState<string[]>([]);
  const [selectedEntityMode, setSelectedEntityMode] = useState<'overview' | 'activity' | 'baseline'>('overview');
  const [detachedAlertSnapshot, setDetachedAlertSnapshot] = useState<InvestigationWorkspaceState['alerts'][number] | null>(null);
  const panelsScrollRef = useRef<HTMLDivElement | null>(null);
  const isRestoringScrollRef = useRef(false);
  const tabScrollPositionsRef = useRef<Record<InvestigationTabId, number>>({
    summary: 0,
    timeline: 0,
    evidence: 0,
    entities: 0,
    actions: 0,
    activity: 0,
  });
  const previousTabRef = useRef<InvestigationTabId>(activeTab);

  useEffect(() => {
    setQuickNote('');
    setNoteDraft('');
    setTaskTitleDraft('');
    setTaskOwnerDraft(currentAnalyst);
    setTaskAssignModalOpen(false);
    setTaskAssignTargetId(null);
    setHypothesisModalOpen(false);
    setHypothesisDraft('');
    setApprovalModalOpen(false);
    setRejectModalOpen(false);
    setFailureModalOpen(false);
    setCancelModalOpen(false);
    setMoveAlertModalOpen(false);
    setMoveAlertDestinationId('');
    setMoveAlertReason('');
    setSelectedEntityMode('overview');
    setSelectedHuntIds([]);
    setDetachedAlertSnapshot(null);
    tabScrollPositionsRef.current = {
      summary: 0,
      timeline: 0,
      evidence: 0,
      entities: 0,
      actions: 0,
      activity: 0,
    };
    previousTabRef.current = activeTab;
  }, [item.id, currentAnalyst]);

  useEffect(() => {
    const container = panelsScrollRef.current;
    if (!container) return;
    previousTabRef.current = activeTab;
    isRestoringScrollRef.current = true;
    const frame = window.requestAnimationFrame(() => {
      container.scrollTo({ top: tabScrollPositionsRef.current[activeTab] ?? 0, behavior: 'auto' });
      window.requestAnimationFrame(() => {
        isRestoringScrollRef.current = false;
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab]);

  const changeTab = (nextTab: InvestigationTabId) => {
    const container = panelsScrollRef.current;
    if (container) {
      tabScrollPositionsRef.current[activeTab] = container.scrollTop;
    }
    previousTabRef.current = nextTab;
    onTabChange(nextTab);
  };

  const selectedEvidence = workspace.evidence.find((entry) => entry.id === workspace.selectedEvidenceId) ?? null;
  const selectedEntity = workspace.entities.find((entry) => entry.id === workspace.selectedEntityId) ?? null;
  const selectedAlert =
    workspace.alerts.find((entry) => entry.id === workspace.selectedAlertId) ??
    (detachedAlertSnapshot && detachedAlertSnapshot.id === workspace.selectedAlertId ? detachedAlertSnapshot : null);
  const selectedAction = workspace.actions.find((entry) => entry.id === workspace.selectedActionId) ?? null;
  const selectedTimelineEvent = workspace.timeline.find((entry) => entry.id === workspace.selectedTimelineEventId) ?? null;
  const taskAssignTarget = workspace.tasks.find((task) => task.id === taskAssignTargetId) ?? null;
  const activityFeed = useMemo(
    () => mergeActivity(workspace.activity, item.localHistory ?? []),
    [item.localHistory, workspace.activity],
  );

  const patchWorkspace = (
    updater: (current: InvestigationWorkspaceState) => InvestigationWorkspaceState,
    options?: { logContainmentChange?: boolean },
  ) => {
    onWorkspaceChange(updater, options);
  };

  const appendActivity = (entry: InvestigationActivityItem) => {
    patchWorkspace((current) => ({
      ...current,
      activity: [entry, ...current.activity],
    }));
  };

  const patchWorkspaceWithActivity = (
    updater: (current: InvestigationWorkspaceState) => InvestigationWorkspaceState,
    activityEntry: InvestigationActivityItem,
    options?: { logContainmentChange?: boolean },
  ) => {
    patchWorkspace((current) => {
      const next = updater(current);
      return {
        ...next,
        activity: [activityEntry, ...next.activity],
      };
    }, options);
  };

  const addNote = (text: string) => {
    const note = {
      id: `note-${Date.now()}`,
      author: currentAnalyst,
      timestamp: 'Just now',
      text: text.trim(),
    };
    patchWorkspaceWithActivity(
      (current) => ({
        ...current,
        notes: [note, ...current.notes],
      }),
      makeActivityEntry(currentAnalyst, 'Analyst', 'Comment added', note.text),
    );
    onToast('success', 'Note added', `Added a note to ${item.id}.`);
  };

  const handleToggleTask = (taskId: string) => {
    const task = workspace.tasks.find((entry) => entry.id === taskId);
    if (!task) return;
    patchWorkspaceWithActivity(
      (current) => ({
        ...current,
        tasks: current.tasks.map((entry) => (entry.id === taskId ? { ...entry, completed: !entry.completed } : entry)),
      }),
      makeActivityEntry(
        currentAnalyst,
        'Analyst',
        task.completed ? 'Task reopened' : 'Task completed',
        task.title,
      ),
    );
  };

  const handleSaveHypothesis = () => {
    patchWorkspaceWithActivity(
      (current) => ({
        ...current,
        hypothesis: hypothesisDraft.trim(),
      }),
      makeActivityEntry(currentAnalyst, 'Analyst', 'Hypothesis updated', hypothesisDraft.trim()),
    );
    setHypothesisModalOpen(false);
    onToast('success', 'Hypothesis saved', `Updated the current hypothesis for ${item.id}.`);
  };

  const handleAddTask = () => {
    const nextTask = {
      id: `task-${Date.now()}`,
      title: taskTitleDraft.trim(),
      owner: taskOwnerDraft,
      completed: false,
    };
    patchWorkspaceWithActivity(
      (current) => ({
        ...current,
        tasks: [nextTask, ...current.tasks],
      }),
      makeActivityEntry(currentAnalyst, 'Analyst', 'Task added', nextTask.title, { newValue: nextTask.owner }),
    );
    setTaskModalOpen(false);
    setTaskTitleDraft('');
    setTaskOwnerDraft(currentAnalyst);
    onToast('success', 'Task added', `${nextTask.title} added to the investigation plan.`);
  };

  const handleAssignTaskOwner = () => {
    if (!taskAssignTargetId || !taskOwnerDraft.trim()) return;
    const task = workspace.tasks.find((entry) => entry.id === taskAssignTargetId);
    if (!task) return;
    patchWorkspaceWithActivity(
      (current) => ({
        ...current,
        tasks: current.tasks.map((entry) => (entry.id === taskAssignTargetId ? { ...entry, owner: taskOwnerDraft } : entry)),
      }),
      makeActivityEntry(currentAnalyst, 'Analyst', 'Task owner changed', task.title, {
        previousValue: task.owner,
        newValue: taskOwnerDraft,
      }),
    );
    setTaskAssignModalOpen(false);
    setTaskAssignTargetId(null);
    onToast('success', 'Task owner updated', `${task.title} assigned to ${taskOwnerDraft}.`);
  };

  const handleSubmitNoteModal = () => {
    addNote(noteDraft);
    setNoteDraft('');
    setNoteModalOpen(false);
  };

  const handleAddQuickNote = () => {
    if (!quickNote.trim()) return;
    addNote(quickNote);
    setQuickNote('');
  };

  const updateTimelineRelevance = (eventId: string, relevance: 'Relevant' | 'Irrelevant' | 'Needs review') => {
    patchWorkspace((current) => {
      const target = current.timeline.find((event) => event.id === eventId);
      return {
        ...current,
        timeline: current.timeline.map((event) => (event.id === eventId ? { ...event, relevance } : event)),
        evidence: target?.evidenceId
          ? current.evidence.map((entry) =>
              entry.id === target.evidenceId && entry.verdict !== 'Needs review'
                ? { ...entry, verdict: relevance }
                : entry,
            )
          : current.evidence,
        activity: [
          makeActivityEntry(
            currentAnalyst,
            'Analyst',
            'Timeline relevance updated',
            `${eventId} marked ${relevance.toLowerCase()}.`,
          ),
          ...current.activity,
        ],
      };
    });
    onToast('info', 'Timeline updated', `${eventId} marked ${relevance.toLowerCase()}.`);
  };

  const toggleTimelineAttachment = (eventId: string) => {
    const event = workspace.timeline.find((entry) => entry.id === eventId);
    onSyncTimelineAttachment(eventId);
    onToast(
      'info',
      event?.attached === false ? 'Timeline event attached' : 'Timeline event detached',
      `${eventId} ${event?.attached === false ? 'attached to' : 'detached from'} case.`,
    );
  };

  const updateEvidenceVerdict = (evidenceId: string, verdict: 'Relevant' | 'Irrelevant' | 'Needs review') => {
    patchWorkspace((current) => ({
      ...current,
      evidence: current.evidence.map((entry) => (entry.id === evidenceId ? { ...entry, verdict } : entry)),
      activity: [
        makeActivityEntry(currentAnalyst, 'Analyst', 'Evidence verdict updated', `${evidenceId} marked ${verdict.toLowerCase()}.`),
        ...current.activity,
      ],
    }));
    onToast('info', 'Evidence updated', `${evidenceId} marked ${verdict.toLowerCase()}.`);
  };

  const toggleEvidenceAttached = (evidenceId: string) => {
    const evidence = workspace.evidence.find((entry) => entry.id === evidenceId);
    onSyncEvidenceAttachment(evidenceId);
    onToast(
      'info',
      evidence?.attached ? 'Evidence detached' : 'Evidence attached',
      `${evidenceId} ${evidence?.attached ? 'detached from' : 'attached to'} case.`,
    );
  };

  const updateAlertRelevance = (alertId: string, relevance: 'Relevant' | 'Irrelevant' | 'Needs review') => {
    patchWorkspace((current) => ({
      ...current,
      alerts: current.alerts.map((entry) => (entry.id === alertId ? { ...entry, relevance } : entry)),
      activity: [
        makeActivityEntry(currentAnalyst, 'Analyst', 'Alert relevance updated', `${alertId} marked ${relevance.toLowerCase()}.`),
        ...current.activity,
      ],
    }));
    onToast('info', 'Alert updated', `${alertId} marked ${relevance.toLowerCase()}.`);
  };

  const openRelatedAlertFromEvidence = (alertId: string) => {
    patchWorkspace((current) => ({ ...current, selectedEvidenceId: null }));
    window.requestAnimationFrame(() => {
      patchWorkspace((current) => ({ ...current, selectedAlertId: alertId }));
    });
  };

  const handleDetachAlert = (alertId: string) => {
    const alert = workspace.alerts.find((entry) => entry.id === alertId);
    if (!alert) return;
    onDetachAlertFromCase(alertId);
    setDetachedAlertSnapshot({
      ...alert,
      parentCaseId: null,
      status: alert.status === 'Resolved' ? 'Investigating' : alert.status,
      linkingRationale: `Detached from ${item.id} and kept open as a standalone alert.`,
    });
    patchWorkspace((current) => ({ ...current, selectedAlertId: alertId }));
    onToast('warning', 'Alert detached', `${alertId} was detached and remains open in the queue context.`);
  };

  const toggleAlertAttachment = (alert: InvestigationWorkspaceState['alerts'][number]) => {
    if (alert.parentCaseId) {
      handleDetachAlert(alert.id);
      return;
    }

    onAttachAlertToCase(alert.id);
    setDetachedAlertSnapshot(null);
    onToast('success', 'Alert attached', `${alert.id} reattached to ${item.id}.`);
  };

  const updateActionState = (actionId: string, next: ResponseActionState, note?: string, extras?: Partial<InvestigationResponseAction>) => {
    const activityEntry = makeActivityEntry(currentAnalyst, 'Analyst', 'Action state updated', `${actionId} moved to ${next}.`, {
      comment: note,
      newValue: next,
    });
    patchWorkspaceWithActivity(
      (current) => ({
        ...current,
        actions: current.actions.map((action) =>
          action.id === actionId
            ? {
                ...action,
                ...extras,
                currentState: next,
                note,
                auditTimestamp: 'Just now',
                history: [...(action.history ?? []), activityEntry],
              }
            : action,
        ),
      }),
      activityEntry,
      { logContainmentChange: true },
    );
    onToast('success', 'Action updated', `${actionId} moved to ${next}.`);
  };

  const handleActionPrimary = (action: InvestigationResponseAction) => {
    patchWorkspace((current) => ({ ...current, selectedActionId: action.id }));
    if (action.currentState === 'Recommended') {
      if (action.requiresApproval) {
        setApprovalApprover(action.approverRole ?? '');
        setApprovalJustification('');
        setApprovalModalOpen(true);
      } else {
        updateActionState(action.id, 'In progress');
      }
      return;
    }
    if (action.currentState === 'Pending approval') {
      updateActionState(action.id, 'Approved', undefined, { approvedBy: currentAnalyst, approvedAt: 'Just now' });
      return;
    }
    if (action.currentState === 'Approved') {
      updateActionState(action.id, 'In progress');
      return;
    }
    if (action.currentState === 'In progress') {
      updateActionState(action.id, 'Completed');
      return;
    }
    if (action.currentState === 'Failed') {
      updateActionState(action.id, 'In progress', undefined, { retryCount: (action.retryCount ?? 0) + 1 });
      return;
    }
    if (action.currentState === 'Rejected') {
      setApprovalApprover(action.approverRole ?? '');
      setApprovalJustification('');
      setApprovalModalOpen(true);
      return;
    }
  };

  const handleActionSecondary = (action: InvestigationResponseAction) => {
    patchWorkspace((current) => ({ ...current, selectedActionId: action.id }));
    if (action.currentState === 'Pending approval') {
      setRejectComment('');
      setRejectModalOpen(true);
      return;
    }
    if (action.currentState === 'In progress') {
      setFailureReason('');
      setFailureModalOpen(true);
      return;
    }
    if (action.currentState === 'Failed') {
      onOpenEscalate();
      return;
    }
    if (action.currentState === 'Recommended' || action.currentState === 'Rejected' || action.currentState === 'Approved') {
      setCancelReason('');
      setCancelModalOpen(true);
    }
  };

  const attachSelectedHuntResults = () => {
    const selectedResults = workspace.huntResults.filter((result) => selectedHuntIds.includes(result.id));
    if (!selectedResults.length) return;
    patchWorkspaceWithActivity(
      (current) => ({
        ...current,
        huntResults: current.huntResults.map((result) =>
          selectedHuntIds.includes(result.id) ? { ...result, attached: true } : result,
        ),
        evidence: [
          ...selectedResults.map((result) => ({
            id: `HUNT-${result.id}`,
            eventType: result.type,
            timestamp: result.timestamp,
            sourceSystem: result.sourceSystem,
            entity: result.entity,
            description: result.description,
            rawRecordAvailable: false,
            verdict: 'Needs review' as const,
            attached: true,
            details: [result.title],
          })),
          ...current.evidence,
        ],
        timeline: [
          ...selectedResults.map((result) => ({
            id: `hunt-timeline-${result.id}`,
            occurredAt: new Date('2026-06-01T22:24:00.000Z').toISOString(),
            timestamp: result.timestamp,
            category: 'Hunt result',
            systemName: result.sourceSystem,
            title: result.title,
            description: result.description,
            relatedAlert: item.id,
            entity: result.entity,
            relevance: 'Needs review' as const,
            details: [result.description],
            evidenceId: `HUNT-${result.id}`,
            attached: true,
          })),
          ...current.timeline,
        ],
      }),
      makeActivityEntry(currentAnalyst, 'Analyst', 'Hunt results attached', `${selectedResults.length} hunt results attached to ${item.id}.`),
    );
    setSelectedHuntIds([]);
    setHuntOpen(false);
    onToast('success', 'Hunt results attached', `${selectedResults.length} related findings were attached to the case.`);
  };

  const resolveSecondaryLabel = selectedAction
    ? selectedAction.currentState === 'Pending approval'
      ? 'Reject'
      : selectedAction.currentState === 'In progress'
        ? 'Mark failed'
        : selectedAction.currentState === 'Failed'
          ? 'Escalate'
          : selectedAction.currentState === 'Recommended' || selectedAction.currentState === 'Approved' || selectedAction.currentState === 'Rejected'
            ? 'Cancel action'
          : 'Close'
    : undefined;

  const resolvePrimaryLabel = selectedAction
    ? selectedAction.currentState === 'Recommended'
      ? selectedAction.requiresApproval ? 'Request approval' : 'Start action'
      : selectedAction.currentState === 'Pending approval'
        ? 'Approve'
        : selectedAction.currentState === 'Approved'
          ? 'Start action'
          : selectedAction.currentState === 'In progress'
            ? 'Mark completed'
            : selectedAction.currentState === 'Failed'
              ? 'Retry'
              : selectedAction.currentState === 'Rejected'
                ? 'Request again'
                : 'View details'
    : undefined;

  return (
    <>
      <ComposedModal
        open={open}
        size="lg"
        isFullWidth
        preventCloseOnClickOutside
        selectorsFloatingMenus={[
          '.cg-investigation-submodal',
          '.cg-investigation-detail-dialog',
          '.cg-investigation-more-actions__menu',
          '.cds--list-box__menu',
          '.cds--overflow-menu-options',
        ]}
        onClose={onClose}
        containerClassName="cg-investigation-modal__container"
        className="cg-investigation-modal"
        aria-label="Investigation workspace"
      >
        <ModalHeader
          className="cg-investigation-modal__header"
          closeModal={onClose}
          iconDescription="Close investigation workspace"
        >
          <InvestigationHeader
            item={item}
            currentAnalyst={currentAnalyst}
            onClose={onClose}
            onAssignToMe={onAssignToMe}
            onReassign={onReassign}
            onChangeStatus={onChangeStatus}
            onChangeSeverity={onChangeSeverity}
            onAddNote={() => setNoteModalOpen(true)}
            onGoToActions={() => changeTab('actions')}
            onGoToActivity={() => changeTab('activity')}
            onClassifyItem={onOpenClassify}
            onResolveItem={onOpenResolve}
          />
        </ModalHeader>
        <ModalBody hasScrollingContent className="cg-investigation-modal__body">
          <Tabs selectedIndex={TAB_ORDER.indexOf(activeTab)} onChange={({ selectedIndex }) => changeTab(TAB_ORDER[selectedIndex])}>
            <TabList aria-label="Investigation tabs">
              <Tab>Summary</Tab>
              <Tab>Timeline</Tab>
              <Tab>Alerts &amp; Evidence</Tab>
              <Tab>Entities &amp; Assets</Tab>
              <Tab>Actions</Tab>
              <Tab>Activity</Tab>
            </TabList>
            <div className="cg-investigation-modal__workspace">
              <div
                className="cg-investigation-modal__panels"
                ref={panelsScrollRef}
                onScroll={(event) => {
                  if (!isRestoringScrollRef.current) {
                    tabScrollPositionsRef.current[activeTab] = event.currentTarget.scrollTop;
                  }
                }}
              >
                <TabPanels>
                  <TabPanel>
                    <InvestigationSummary
                      context={context}
                      item={item}
                      quickNote={quickNote}
                      onQuickNoteChange={setQuickNote}
                      onAddQuickNote={handleAddQuickNote}
                      tasks={workspace.tasks}
                      onToggleTask={handleToggleTask}
                      onOpenTaskModal={() => setTaskModalOpen(true)}
                      onOpenTaskAssignModal={(taskId) => {
                        const target = workspace.tasks.find((task) => task.id === taskId);
                        setTaskAssignTargetId(taskId);
                        setTaskOwnerDraft(target?.owner ?? currentAnalyst);
                        setTaskAssignModalOpen(true);
                      }}
                      onTabChange={changeTab}
                    />
                  </TabPanel>
                  <TabPanel>
                    <InvestigationTimeline
                      events={workspace.timeline}
                      onUpdateRelevance={updateTimelineRelevance}
                      onOpenEvidence={(id) => patchWorkspace((current) => ({ ...current, selectedEvidenceId: id }))}
                      onOpenAlert={(id) => {
                        patchWorkspace((current) => ({ ...current, selectedAlertId: id }));
                      }}
                      onAttachToggle={toggleTimelineAttachment}
                      onAddNote={() => setNoteModalOpen(true)}
                      onOpenSourceSystem={(eventId) =>
                        onToast('info', 'Prototype-only integration', `Opening the source record for ${eventId} is simulated in this prototype.`)
                      }
                    />
                  </TabPanel>
                  <TabPanel>
                    <InvestigationEvidence
                      alerts={workspace.alerts}
                      evidence={workspace.evidence}
                      onOpenAlert={(id) => patchWorkspace((current) => ({ ...current, selectedAlertId: id }))}
                      onOpenEvidence={(id) => patchWorkspace((current) => ({ ...current, selectedEvidenceId: id }))}
                      onUpdateAlertRelevance={updateAlertRelevance}
                      onUpdateEvidenceVerdict={updateEvidenceVerdict}
                      onToggleEvidenceAttached={toggleEvidenceAttached}
                      onAddNote={() => setNoteModalOpen(true)}
                    />
                  </TabPanel>
                  <TabPanel>
                    <InvestigationEntities
                      entities={workspace.entities}
                      onOpenEntity={(id) => {
                        setSelectedEntityMode('overview');
                        patchWorkspace((current) => ({ ...current, selectedEntityId: id }));
                      }}
                      onGoHunt={() => setHuntOpen(true)}
                      onAddNote={() => setNoteModalOpen(true)}
                      onCompareBaseline={(id) => {
                        setSelectedEntityMode('baseline');
                        patchWorkspace((current) => ({ ...current, selectedEntityId: id }));
                      }}
                    />
                  </TabPanel>
                  <TabPanel>
                    <InvestigationActions
                      actions={workspace.actions}
                      containment={item.containment}
                      onOpenAction={(id) => patchWorkspace((current) => ({ ...current, selectedActionId: id }))}
                      onPrimaryAction={handleActionPrimary}
                      onSecondaryAction={handleActionSecondary}
                      onAddNote={() => setNoteModalOpen(true)}
                    />
                  </TabPanel>
                  <TabPanel>
                    <InvestigationActivity activity={activityFeed} />
                  </TabPanel>
                </TabPanels>
              </div>

              <InvestigationRightRail
                context={context}
                hypothesis={workspace.hypothesis}
                onOpenHypothesisModal={() => {
                  setHypothesisDraft(workspace.hypothesis);
                  setHypothesisModalOpen(true);
                }}
                onEscalate={onOpenEscalate}
              />

              {selectedAlert ? (
                <AlertDetailPanel
                  alert={selectedAlert}
                  relatedTimeline={workspace.timeline.filter((entry) => entry.relatedAlert === selectedAlert.id)}
                  relatedEvidence={workspace.evidence.filter((entry) => selectedAlert.linkedEvidenceIds?.includes(entry.id)).map((entry) => ({
                    id: entry.id,
                    eventType: entry.eventType,
                    sourceSystem: entry.sourceSystem,
                    entity: entry.entity,
                    verdict: entry.verdict,
                    attached: entry.attached,
                  }))}
                  relatedEntities={workspace.entities.filter((entry) => selectedAlert.relatedEntityIds?.includes(entry.id)).map((entry) => ({
                    id: entry.id,
                    displayName: entry.displayName,
                    type: entry.type,
                    roleInCase: entry.roleInCase,
                    riskLevel: entry.riskLevel,
                  }))}
                  onClose={() => {
                    setDetachedAlertSnapshot(null);
                    patchWorkspace((current) => ({ ...current, selectedAlertId: null }));
                  }}
                  onToggleRelevance={() =>
                    updateAlertRelevance(selectedAlert.id, selectedAlert.relevance === 'Relevant' ? 'Irrelevant' : 'Relevant')
                  }
                  onAddNote={() => setNoteModalOpen(true)}
                  onToggleAttachment={() => toggleAlertAttachment(selectedAlert)}
                  onMoveToCase={() => {
                    setMoveAlertDestinationId('');
                    setMoveAlertReason('');
                    setMoveAlertModalOpen(true);
                  }}
                  onOpenEvidence={(evidenceId) => patchWorkspace((current) => ({ ...current, selectedEvidenceId: evidenceId }))}
                  onOpenEntity={(entityId) => {
                    setSelectedEntityMode('overview');
                    patchWorkspace((current) => ({ ...current, selectedEntityId: entityId }));
                  }}
                  onOpenSourceSystem={() => onToast('info', 'Prototype-only integration', 'Opening source systems is simulated in this prototype.')}
                />
              ) : null}

              {selectedEvidence ? (
                <EvidenceDetailPanel
                  evidence={selectedEvidence}
                  onClose={() => patchWorkspace((current) => ({ ...current, selectedEvidenceId: null }))}
                  onToggleVerdict={() =>
                    updateEvidenceVerdict(
                      selectedEvidence.id,
                      selectedEvidence.verdict === 'Relevant' ? 'Irrelevant' : 'Relevant',
                    )
                  }
                  onToggleAttached={() => toggleEvidenceAttached(selectedEvidence.id)}
                  onGoHunt={() => setHuntOpen(true)}
                  onAddNote={() => setNoteModalOpen(true)}
                  onOpenRelatedAlert={(alertId) => {
                    openRelatedAlertFromEvidence(alertId);
                  }}
                  onOpenSourceSystem={() => onToast('info', 'Prototype-only integration', 'Opening source systems is simulated in this prototype.')}
                />
              ) : null}

              {selectedEntity ? (
                <EntityDetailPanel
                  entity={selectedEntity}
                  initialMode={selectedEntityMode}
                  relatedTimeline={selectedEntity.recentActivity}
                  relatedEvidence={workspace.evidence.filter((entry) => selectedEntity.relatedAssets.includes(entry.entity) || entry.entity === selectedEntity.displayName)}
                  relatedAlerts={workspace.alerts.filter((entry) => selectedEntity.relatedAlertIds?.includes(entry.id)).map((entry) => ({ id: entry.id, title: entry.title }))}
                  onOpenEvidence={(evidenceId) => patchWorkspace((current) => ({ ...current, selectedEvidenceId: evidenceId }))}
                  onClose={() => patchWorkspace((current) => ({ ...current, selectedEntityId: null }))}
                  onGoHunt={() => setHuntOpen(true)}
                  onAddNote={() => setNoteModalOpen(true)}
                />
              ) : null}

              {selectedAction ? (
                <ResponseActionDetailPanel
                  action={selectedAction}
                  primaryActionLabel={resolvePrimaryLabel}
                  secondaryActionLabel={resolveSecondaryLabel}
                  onClose={() => patchWorkspace((current) => ({ ...current, selectedActionId: null }))}
                  onPrimaryAction={() => handleActionPrimary(selectedAction)}
                  onSecondaryAction={() => handleActionSecondary(selectedAction)}
                />
              ) : null}
            </div>
          </Tabs>
        </ModalBody>
      </ComposedModal>

      <InvestigationNoteModal
        open={noteModalOpen}
        textAreaId="investigation-note-modal"
        value={noteDraft}
        onChange={setNoteDraft}
        onClose={() => setNoteModalOpen(false)}
        onSubmit={handleSubmitNoteModal}
      />

      <InvestigationNoteModal
        open={hypothesisModalOpen}
        textAreaId="investigation-hypothesis-modal"
        value={hypothesisDraft}
        title="Update hypothesis"
        primaryButtonText="Save hypothesis"
        labelText="Hypothesis"
        placeholder="Summarize the current working hypothesis for this investigation"
        onChange={setHypothesisDraft}
        onClose={() => setHypothesisModalOpen(false)}
        onSubmit={handleSaveHypothesis}
      />

      <InvestigationTaskModal
        open={taskModalOpen}
        mode="add"
        title={taskTitleDraft}
        owner={taskOwnerDraft}
        owners={TASK_OWNERS}
        onTitleChange={setTaskTitleDraft}
        onOwnerChange={setTaskOwnerDraft}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleAddTask}
      />

      <InvestigationTaskModal
        open={taskAssignModalOpen}
        mode="assign"
        title={taskAssignTarget?.title ?? ''}
        owner={taskOwnerDraft}
        owners={TASK_OWNERS}
        onTitleChange={() => {}}
        onOwnerChange={setTaskOwnerDraft}
        onClose={() => {
          setTaskAssignModalOpen(false);
          setTaskAssignTargetId(null);
        }}
        onSubmit={handleAssignTaskOwner}
      />

      <ResponseApprovalModal
        open={approvalModalOpen}
        approver={approvalApprover}
        justification={approvalJustification}
        approvers={APPROVERS}
        onApproverChange={setApprovalApprover}
        onJustificationChange={setApprovalJustification}
        onClose={() => setApprovalModalOpen(false)}
        onSubmit={() => {
          if (!selectedAction) return;
          updateActionState(selectedAction.id, 'Pending approval', approvalJustification, {
            approver: approvalApprover,
            approvalRequestedBy: currentAnalyst,
            approvalRequestedAt: 'Just now',
          });
          setApprovalModalOpen(false);
        }}
      />

      <ResponseRejectModal
        open={rejectModalOpen}
        value={rejectComment}
        onChange={setRejectComment}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={() => {
          if (!selectedAction) return;
          updateActionState(selectedAction.id, 'Rejected', rejectComment, {
            rejectedBy: currentAnalyst,
            rejectedAt: 'Just now',
          });
          setRejectModalOpen(false);
        }}
      />

      <ResponseFailureModal
        open={failureModalOpen}
        value={failureReason}
        onChange={setFailureReason}
        onClose={() => setFailureModalOpen(false)}
        onSubmit={() => {
          if (!selectedAction) return;
          updateActionState(selectedAction.id, 'Failed', failureReason, {
            failureReason,
          });
          setFailureModalOpen(false);
        }}
      />

      <ResponseRejectModal
        open={cancelModalOpen}
        value={cancelReason}
        heading="Cancel action"
        label="Reason"
        primaryButtonText="Cancel action"
        onChange={setCancelReason}
        onClose={() => setCancelModalOpen(false)}
        onSubmit={() => {
          if (!selectedAction) return;
          updateActionState(selectedAction.id, 'Cancelled', cancelReason);
          setCancelModalOpen(false);
        }}
      />

      <HuntResultsModal
        open={huntOpen}
        results={workspace.huntResults}
        selectedIds={selectedHuntIds}
        onToggleSelected={(id) =>
          setSelectedHuntIds((current) =>
            current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
          )
        }
        onClose={() => setHuntOpen(false)}
        onAttachSelected={attachSelectedHuntResults}
      />

      {selectedAlert ? (
        <MoveAlertToCaseModal
          open={moveAlertModalOpen}
          alertId={selectedAlert.id}
          currentCaseLabel={`${item.id} — ${item.title}`}
          destinationCaseId={moveAlertDestinationId}
          reason={moveAlertReason}
          destinationOptions={availableCases
            .filter((entry) => entry.id !== item.id)
            .map((entry) => ({ id: entry.id, label: `${entry.id} — ${entry.title} (${entry.status} · ${entry.alertCount} alerts)` }))}
          onDestinationChange={setMoveAlertDestinationId}
          onReasonChange={setMoveAlertReason}
          onClose={() => setMoveAlertModalOpen(false)}
          onSubmit={() => {
            onMoveAlertToCase(selectedAlert.id, moveAlertDestinationId, moveAlertReason.trim());
            setMoveAlertModalOpen(false);
            patchWorkspace((current) => ({ ...current, selectedAlertId: null }));
            onToast('success', 'Alert moved', `${selectedAlert.id} moved to ${moveAlertDestinationId}.`);
          }}
        />
      ) : null}
    </>
  );
}

function mergeActivity(
  workspaceActivity: InvestigationActivityItem[],
  localHistory: string[],
): InvestigationActivityItem[] {
  const derivedHistory = localHistory.map((entry, index) => ({
    id: `local-history-${index}-${entry}`,
    timestamp: 'Recent',
    actor: inferHistoryActor(entry),
    actorType: inferHistoryActorType(entry),
    activityType: inferHistoryType(entry),
    description: entry,
  }));

  return [...workspaceActivity, ...derivedHistory];
}

function inferHistoryActor(entry: string) {
  if (/assigned|reassigned|severity|reopened|status|classif|resolved/i.test(entry)) return 'Analyst';
  return 'System';
}

function inferHistoryActorType(entry: string): InvestigationActivityItem['actorType'] {
  if (/severity|assigned|reassigned|reopened|status|classif|resolved/i.test(entry)) return 'Analyst';
  return 'System';
}

function inferHistoryType(entry: string) {
  if (/severity/i.test(entry)) return 'Severity override';
  if (/reopen/i.test(entry)) return 'Case reopened';
  if (/classif/i.test(entry)) return 'Classification updated';
  if (/resolved/i.test(entry)) return 'Resolution updated';
  if (/assign/i.test(entry)) return 'Assignment updated';
  if (/status/i.test(entry)) return 'Status changed';
  return 'Queue update';
}
