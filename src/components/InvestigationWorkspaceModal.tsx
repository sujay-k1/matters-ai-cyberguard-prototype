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
import { InvestigationHeader } from './InvestigationHeader';
import { InvestigationSummary } from './InvestigationSummary';
import { InvestigationTimeline } from './InvestigationTimeline';
import { InvestigationEvidence } from './InvestigationEvidence';
import { InvestigationEntities } from './InvestigationEntities';
import { InvestigationActions } from './InvestigationActions';
import { InvestigationActivity } from './InvestigationActivity';
import { InvestigationRightRail } from './InvestigationRightRail';
import { InvestigationNoteModal } from './InvestigationNoteModal';
import { InvestigationTaskModal } from './InvestigationTaskModal';
import { EntityDetailPanel } from './EntityDetailPanel';
import { EvidenceDetailPanel } from './EvidenceDetailPanel';
import { buildInvestigationContext, createWorkspaceStateFromFixture } from '../data/investigationFixtures';
import type {
  InvestigationActivityItem,
  InvestigationTabId,
  InvestigationWorkspaceState,
  ResponseActionState,
} from '../types/investigation';
import type { WorkItem } from '../types/queue';

interface InvestigationWorkspaceModalProps {
  open: boolean;
  item: WorkItem;
  activeTab: InvestigationTabId;
  currentAnalyst: string;
  onClose: () => void;
  onTabChange: (tab: InvestigationTabId) => void;
  onAssignToMe: () => void;
  onReassign: () => void;
  onChangeStatus: () => void;
  onChangeSeverity: () => void;
  onToast: (kind: 'success' | 'info' | 'warning', title: string, subtitle: string) => void;
}

const TAB_ORDER: InvestigationTabId[] = ['summary', 'timeline', 'evidence', 'entities', 'actions', 'activity'];
const TASK_OWNERS = ['Priya Sharma', 'Arjun Rao', 'Sameer Khan', 'Kavya Nair', 'Unassigned'];

export function InvestigationWorkspaceModal({
  open,
  item,
  activeTab,
  currentAnalyst,
  onClose,
  onTabChange,
  onAssignToMe,
  onReassign,
  onChangeStatus,
  onChangeSeverity,
  onToast,
}: InvestigationWorkspaceModalProps) {
  const context = useMemo(() => buildInvestigationContext(item), [item]);
  const [workspace, setWorkspace] = useState<InvestigationWorkspaceState>(() =>
    createWorkspaceStateFromFixture(context.fixture),
  );
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
    setWorkspace(createWorkspaceStateFromFixture(context.fixture));
    setQuickNote('');
    setNoteDraft('');
    setTaskTitleDraft('');
    setTaskOwnerDraft(currentAnalyst);
    setTaskAssignModalOpen(false);
    setTaskAssignTargetId(null);
    setHypothesisModalOpen(false);
    setHypothesisDraft('');
    tabScrollPositionsRef.current = {
      summary: 0,
      timeline: 0,
      evidence: 0,
      entities: 0,
      actions: 0,
      activity: 0,
    };
    previousTabRef.current = activeTab;
  }, [context.fixture, currentAnalyst]);

  useEffect(() => {
    const container = panelsScrollRef.current;
    if (!container) return;

    const previousTab = previousTabRef.current;
    tabScrollPositionsRef.current[previousTab] = container.scrollTop;
    previousTabRef.current = activeTab;

    const nextScrollTop = tabScrollPositionsRef.current[activeTab] ?? 0;
    container.scrollTo({ top: nextScrollTop, behavior: 'auto' });
  }, [activeTab]);

  const activityFeed = useMemo(
    () => mergeActivity(workspace.activity, item.localHistory ?? []),
    [item.localHistory, workspace.activity],
  );

  const selectedEvidence = workspace.evidence.find((entry) => entry.id === workspace.selectedEvidenceId) ?? null;
  const selectedEntity = workspace.entities.find((entry) => entry.id === workspace.selectedEntityId) ?? null;
  const taskAssignTarget = workspace.tasks.find((task) => task.id === taskAssignTargetId) ?? null;

  const appendActivity = (entry: InvestigationActivityItem) => {
    setWorkspace((current) => ({
      ...current,
      activity: [entry, ...current.activity],
    }));
  };

  const handleToggleTask = (taskId: string) => {
    setWorkspace((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    }));
    const task = workspace.tasks.find((entry) => entry.id === taskId);
    if (task) {
      appendActivity({
        id: `activity-${Date.now()}`,
        timestamp: 'Just now',
        actor: currentAnalyst,
        actorType: 'Analyst',
        activityType: task.completed ? 'Task reopened' : 'Task completed',
        description: `${task.title}`,
      });
    }
  };

  const handleSaveHypothesis = () => {
    setWorkspace((current) => ({
      ...current,
      hypothesis: hypothesisDraft.trim(),
    }));
    appendActivity({
      id: `activity-${Date.now()}`,
      timestamp: 'Just now',
      actor: currentAnalyst,
      actorType: 'Analyst',
      activityType: 'Hypothesis updated',
      description: hypothesisDraft.trim(),
    });
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
    setWorkspace((current) => ({
      ...current,
      tasks: [nextTask, ...current.tasks],
    }));
    appendActivity({
      id: `activity-${Date.now() + 1}`,
      timestamp: 'Just now',
      actor: currentAnalyst,
      actorType: 'Analyst',
      activityType: 'Task added',
      description: nextTask.title,
      newValue: nextTask.owner,
    });
    setTaskModalOpen(false);
    setTaskTitleDraft('');
    setTaskOwnerDraft(currentAnalyst);
    onToast('success', 'Task added', `${nextTask.title} added to the investigation plan.`);
  };

  const handleAssignTaskOwner = () => {
    if (!taskAssignTargetId || !taskOwnerDraft.trim()) return;
    const task = workspace.tasks.find((entry) => entry.id === taskAssignTargetId);
    if (!task) return;

    setWorkspace((current) => ({
      ...current,
      tasks: current.tasks.map((entry) =>
        entry.id === taskAssignTargetId ? { ...entry, owner: taskOwnerDraft } : entry,
      ),
    }));
    appendActivity({
      id: `activity-${Date.now() + 3}`,
      timestamp: 'Just now',
      actor: currentAnalyst,
      actorType: 'Analyst',
      activityType: 'Task owner changed',
      description: task.title,
      previousValue: task.owner,
      newValue: taskOwnerDraft,
    });
    setTaskAssignModalOpen(false);
    setTaskAssignTargetId(null);
    onToast('success', 'Task owner updated', `${task.title} assigned to ${taskOwnerDraft}.`);
  };

  const addNote = (text: string) => {
    const note = {
      id: `note-${Date.now()}`,
      author: currentAnalyst,
      timestamp: 'Just now',
      text: text.trim(),
    };
    setWorkspace((current) => ({
      ...current,
      notes: [note, ...current.notes],
    }));
    appendActivity({
      id: `activity-${Date.now() + 2}`,
      timestamp: 'Just now',
      actor: currentAnalyst,
      actorType: 'Analyst',
      activityType: 'Comment added',
      description: note.text,
    });
    onToast('success', 'Note added', `Added a note to ${item.id}.`);
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
    setWorkspace((current) => ({
      ...current,
      timeline: current.timeline.map((event) => (event.id === eventId ? { ...event, relevance } : event)),
    }));
    appendActivity({
      id: `activity-${Date.now()}`,
      timestamp: 'Just now',
      actor: currentAnalyst,
      actorType: 'Analyst',
      activityType: 'Timeline relevance updated',
      description: `${eventId} marked ${relevance.toLowerCase()}.`,
    });
    onToast('info', 'Timeline updated', `${eventId} marked ${relevance.toLowerCase()}.`);
  };

  const updateEvidenceVerdict = (evidenceId: string, verdict: 'Relevant' | 'Irrelevant' | 'Needs review') => {
    setWorkspace((current) => ({
      ...current,
      evidence: current.evidence.map((entry) => (entry.id === evidenceId ? { ...entry, verdict } : entry)),
    }));
    appendActivity({
      id: `activity-${Date.now()}`,
      timestamp: 'Just now',
      actor: currentAnalyst,
      actorType: 'Analyst',
      activityType: 'Evidence verdict updated',
      description: `${evidenceId} marked ${verdict.toLowerCase()}.`,
    });
    onToast('info', 'Evidence updated', `${evidenceId} marked ${verdict.toLowerCase()}.`);
  };

  const updateAlertRelevance = (alertId: string, relevance: 'Relevant' | 'Irrelevant' | 'Needs review') => {
    setWorkspace((current) => ({
      ...current,
      alerts: current.alerts.map((entry) => (entry.id === alertId ? { ...entry, relevance } : entry)),
    }));
    appendActivity({
      id: `activity-${Date.now()}`,
      timestamp: 'Just now',
      actor: currentAnalyst,
      actorType: 'Analyst',
      activityType: 'Alert relevance updated',
      description: `${alertId} marked ${relevance.toLowerCase()}.`,
    });
    onToast('info', 'Alert updated', `${alertId} marked ${relevance.toLowerCase()}.`);
  };

  const updateActionState = (actionId: string, next: ResponseActionState, note?: string) => {
    setWorkspace((current) => ({
      ...current,
      actions: current.actions.map((action) =>
        action.id === actionId ? { ...action, currentState: next, note, auditTimestamp: 'Just now' } : action,
      ),
    }));
    appendActivity({
      id: `activity-${Date.now()}`,
      timestamp: 'Just now',
      actor: currentAnalyst,
      actorType: 'Analyst',
      activityType: 'Action state updated',
      description: `${actionId} moved to ${next}.`,
      comment: note,
    });
    onToast('success', 'Action updated', `${actionId} moved to ${next}.`);
  };

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
                      onAddNote={() => setNoteModalOpen(true)}
                    />
                  </TabPanel>
                  <TabPanel>
                    <InvestigationEvidence
                      alerts={workspace.alerts}
                      evidence={workspace.evidence}
                      onOpenEvidence={(id) =>
                        setWorkspace((current) => ({
                          ...current,
                          selectedEvidenceId: id,
                        }))
                      }
                      onUpdateAlertRelevance={updateAlertRelevance}
                      onUpdateEvidenceVerdict={updateEvidenceVerdict}
                      onAddNote={() => setNoteModalOpen(true)}
                    />
                  </TabPanel>
                  <TabPanel>
                    <InvestigationEntities
                      entities={workspace.entities}
                      onOpenEntity={(id) =>
                        setWorkspace((current) => ({
                          ...current,
                          selectedEntityId: id,
                        }))
                      }
                      onAddNote={() => setNoteModalOpen(true)}
                    />
                  </TabPanel>
                  <TabPanel>
                    <InvestigationActions
                      actions={workspace.actions}
                      onUpdateActionState={updateActionState}
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
              />

              {selectedEvidence ? (
                <EvidenceDetailPanel
                  evidence={selectedEvidence}
                  onClose={() =>
                    setWorkspace((current) => ({
                      ...current,
                      selectedEvidenceId: null,
                    }))
                  }
                  onToggleVerdict={(next) => updateEvidenceVerdict(selectedEvidence.id, next)}
                  onAddNote={() => setNoteModalOpen(true)}
                />
              ) : null}

              {selectedEntity ? (
                <EntityDetailPanel
                  entity={selectedEntity}
                  onClose={() =>
                    setWorkspace((current) => ({
                      ...current,
                      selectedEntityId: null,
                    }))
                  }
                  onAddNote={() => setNoteModalOpen(true)}
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
  if (/assigned|reassigned|severity|reopened|status/i.test(entry)) return 'Analyst';
  return 'System';
}

function inferHistoryActorType(entry: string): InvestigationActivityItem['actorType'] {
  if (/severity|assigned|reassigned|reopened|status/i.test(entry)) return 'Analyst';
  return 'System';
}

function inferHistoryType(entry: string) {
  if (/severity/i.test(entry)) return 'Severity override';
  if (/reopen/i.test(entry)) return 'Case reopened';
  if (/assign/i.test(entry)) return 'Assignment updated';
  if (/status/i.test(entry)) return 'Status changed';
  return 'Queue update';
}
