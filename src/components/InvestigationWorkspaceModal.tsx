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
  const [huntOpen, setHuntOpen] = useState(false);
  const [selectedHuntIds, setSelectedHuntIds] = useState<string[]>([]);
  const panelsScrollRef = useRef<HTMLDivElement | null>(null);
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
    setSelectedHuntIds([]);
    tabScrollPositionsRef.current = {
      summary: 0,
      timeline: 0,
      evidence: 0,
      entities: 0,
      actions: 0,
      activity: 0,
    };
    previousTabRef.current = activeTab;
  }, [item.id, activeTab, currentAnalyst]);

  useEffect(() => {
    const container = panelsScrollRef.current;
    if (!container) return;
    const previousTab = previousTabRef.current;
    tabScrollPositionsRef.current[previousTab] = container.scrollTop;
    previousTabRef.current = activeTab;
    container.scrollTo({ top: tabScrollPositionsRef.current[activeTab] ?? 0, behavior: 'auto' });
  }, [activeTab]);

  const selectedEvidence = workspace.evidence.find((entry) => entry.id === workspace.selectedEvidenceId) ?? null;
  const selectedEntity = workspace.entities.find((entry) => entry.id === workspace.selectedEntityId) ?? null;
  const selectedAlert = workspace.alerts.find((entry) => entry.id === workspace.selectedAlertId) ?? null;
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

  const addNote = (text: string) => {
    const note = {
      id: `note-${Date.now()}`,
      author: currentAnalyst,
      timestamp: 'Just now',
      text: text.trim(),
    };
    patchWorkspace((current) => ({
      ...current,
      notes: [note, ...current.notes],
    }));
    appendActivity(makeActivityEntry(currentAnalyst, 'Analyst', 'Comment added', note.text));
    onToast('success', 'Note added', `Added a note to ${item.id}.`);
  };

  const handleToggleTask = (taskId: string) => {
    const task = workspace.tasks.find((entry) => entry.id === taskId);
    patchWorkspace((current) => ({
      ...current,
      tasks: current.tasks.map((entry) => (entry.id === taskId ? { ...entry, completed: !entry.completed } : entry)),
    }));
    if (task) {
      appendActivity(
        makeActivityEntry(
          currentAnalyst,
          'Analyst',
          task.completed ? 'Task reopened' : 'Task completed',
          task.title,
        ),
      );
    }
  };

  const handleSaveHypothesis = () => {
    patchWorkspace((current) => ({
      ...current,
      hypothesis: hypothesisDraft.trim(),
    }));
    appendActivity(makeActivityEntry(currentAnalyst, 'Analyst', 'Hypothesis updated', hypothesisDraft.trim()));
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
    patchWorkspace((current) => ({
      ...current,
      tasks: [nextTask, ...current.tasks],
    }));
    appendActivity(makeActivityEntry(currentAnalyst, 'Analyst', 'Task added', nextTask.title, { newValue: nextTask.owner }));
    setTaskModalOpen(false);
    setTaskTitleDraft('');
    setTaskOwnerDraft(currentAnalyst);
    onToast('success', 'Task added', `${nextTask.title} added to the investigation plan.`);
  };

  const handleAssignTaskOwner = () => {
    if (!taskAssignTargetId || !taskOwnerDraft.trim()) return;
    const task = workspace.tasks.find((entry) => entry.id === taskAssignTargetId);
    if (!task) return;
    patchWorkspace((current) => ({
      ...current,
      tasks: current.tasks.map((entry) => (entry.id === taskAssignTargetId ? { ...entry, owner: taskOwnerDraft } : entry)),
    }));
    appendActivity(
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
    patchWorkspace((current) => ({
      ...current,
      timeline: current.timeline.map((event) => (event.id === eventId ? { ...event, relevance } : event)),
    }));
    appendActivity(makeActivityEntry(currentAnalyst, 'Analyst', 'Timeline relevance updated', `${eventId} marked ${relevance.toLowerCase()}.`));
    onToast('info', 'Timeline updated', `${eventId} marked ${relevance.toLowerCase()}.`);
  };

  const toggleTimelineAttachment = (eventId: string) => {
    patchWorkspace((current) => ({
      ...current,
      timeline: current.timeline.map((event) =>
        event.id === eventId ? { ...event, attached: event.attached === false ? true : false } : event,
      ),
    }));
    appendActivity(makeActivityEntry(currentAnalyst, 'Analyst', 'Timeline attachment changed', `${eventId} attachment updated.`));
  };

  const updateEvidenceVerdict = (evidenceId: string, verdict: 'Relevant' | 'Irrelevant' | 'Needs review') => {
    patchWorkspace((current) => ({
      ...current,
      evidence: current.evidence.map((entry) => (entry.id === evidenceId ? { ...entry, verdict } : entry)),
    }));
    appendActivity(makeActivityEntry(currentAnalyst, 'Analyst', 'Evidence verdict updated', `${evidenceId} marked ${verdict.toLowerCase()}.`));
    onToast('info', 'Evidence updated', `${evidenceId} marked ${verdict.toLowerCase()}.`);
  };

  const toggleEvidenceAttached = (evidenceId: string) => {
    patchWorkspace((current) => ({
      ...current,
      evidence: current.evidence.map((entry) => (entry.id === evidenceId ? { ...entry, attached: !entry.attached } : entry)),
    }));
    appendActivity(makeActivityEntry(currentAnalyst, 'Analyst', 'Evidence attachment changed', `${evidenceId} attachment updated.`));
  };

  const updateAlertRelevance = (alertId: string, relevance: 'Relevant' | 'Irrelevant' | 'Needs review') => {
    patchWorkspace((current) => ({
      ...current,
      alerts: current.alerts.map((entry) => (entry.id === alertId ? { ...entry, relevance } : entry)),
    }));
    appendActivity(makeActivityEntry(currentAnalyst, 'Analyst', 'Alert relevance updated', `${alertId} marked ${relevance.toLowerCase()}.`));
    onToast('info', 'Alert updated', `${alertId} marked ${relevance.toLowerCase()}.`);
  };

  const handleDetachAlert = (alertId: string) => {
    const alert = workspace.alerts.find((entry) => entry.id === alertId);
    if (!alert) return;
    patchWorkspace((current) => ({
      ...current,
      alerts: current.alerts.filter((entry) => entry.id !== alertId),
      selectedAlertId: current.selectedAlertId === alertId ? null : current.selectedAlertId,
    }));
    appendActivity(makeActivityEntry(currentAnalyst, 'Analyst', 'Alert detached', `${alertId} detached from ${item.id}.`));
    onToast('warning', 'Alert detached', `${alertId} was detached and remains open in the queue context.`);
  };

  const updateActionState = (actionId: string, next: ResponseActionState, note?: string, extras?: Partial<InvestigationResponseAction>) => {
    patchWorkspace(
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
                history: [
                  ...(action.history ?? []),
                  makeActivityEntry(currentAnalyst, 'Analyst', 'Action state updated', `${action.id} moved to ${next}.`, {
                    comment: note,
                  }),
                ],
              }
            : action,
        ),
      }),
      { logContainmentChange: true },
    );
    appendActivity(makeActivityEntry(currentAnalyst, 'Analyst', 'Action state updated', `${actionId} moved to ${next}.`, { comment: note, newValue: next }));
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
    patchWorkspace((current) => ({
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
    }));
    appendActivity(makeActivityEntry(currentAnalyst, 'Analyst', 'Hunt results attached', `${selectedResults.length} hunt results attached to ${item.id}.`));
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
            onGoToActions={() => onTabChange('actions')}
            onGoToActivity={() => onTabChange('activity')}
            onClassifyItem={onOpenClassify}
            onResolveItem={onOpenResolve}
          />
        </ModalHeader>
        <ModalBody hasScrollingContent className="cg-investigation-modal__body">
          <Tabs selectedIndex={TAB_ORDER.indexOf(activeTab)} onChange={({ selectedIndex }) => onTabChange(TAB_ORDER[selectedIndex])}>
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
                  tabScrollPositionsRef.current[activeTab] = event.currentTarget.scrollTop;
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
                      onTabChange={onTabChange}
                    />
                  </TabPanel>
                  <TabPanel>
                    <InvestigationTimeline
                      events={workspace.timeline}
                      onUpdateRelevance={updateTimelineRelevance}
                      onOpenEvidence={(id) => patchWorkspace((current) => ({ ...current, selectedEvidenceId: id }))}
                      onOpenAlert={(id) => {
                        patchWorkspace((current) => ({ ...current, selectedAlertId: id }));
                        onTabChange('evidence');
                      }}
                      onAttachToggle={toggleTimelineAttachment}
                      onAddNote={() => setNoteModalOpen(true)}
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
                      onOpenEntity={(id) => patchWorkspace((current) => ({ ...current, selectedEntityId: id }))}
                      onGoHunt={() => setHuntOpen(true)}
                      onAddNote={() => setNoteModalOpen(true)}
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

              {selectedEvidence ? (
                <EvidenceDetailPanel
                  evidence={selectedEvidence}
                  onClose={() => patchWorkspace((current) => ({ ...current, selectedEvidenceId: null }))}
                  onToggleVerdict={(next) => updateEvidenceVerdict(selectedEvidence.id, next)}
                  onToggleAttached={() => toggleEvidenceAttached(selectedEvidence.id)}
                  onGoHunt={() => setHuntOpen(true)}
                  onAddNote={() => setNoteModalOpen(true)}
                />
              ) : null}

              {selectedEntity ? (
                <EntityDetailPanel
                  entity={selectedEntity}
                  onClose={() => patchWorkspace((current) => ({ ...current, selectedEntityId: null }))}
                  onGoHunt={() => setHuntOpen(true)}
                  onAddNote={() => setNoteModalOpen(true)}
                />
              ) : null}

              {selectedAlert ? (
                <AlertDetailPanel
                  alert={selectedAlert}
                  onClose={() => patchWorkspace((current) => ({ ...current, selectedAlertId: null }))}
                  onToggleRelevance={() =>
                    updateAlertRelevance(selectedAlert.id, selectedAlert.relevance === 'Relevant' ? 'Irrelevant' : 'Relevant')
                  }
                  onAddNote={() => setNoteModalOpen(true)}
                  onDetach={() => handleDetachAlert(selectedAlert.id)}
                  onMoveToCase={() => onToast('info', 'Move to case', 'Move-to-case workflow is intentionally lightweight in this prototype.')}
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
        value={noteDraft}
        onChange={setNoteDraft}
        onClose={() => setNoteModalOpen(false)}
        onSubmit={handleSubmitNoteModal}
      />

      <InvestigationNoteModal
        open={hypothesisModalOpen}
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
