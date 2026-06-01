import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  ComboBox,
  Dropdown,
  Modal,
  Tag,
  TextArea,
  ToastNotification,
} from '@carbon/react';
import specData from './data/cyberguard_work_queue_content_spec_v1.json';
import { AppHeader } from './components/AppHeader';
import { AISuggestedTextArea } from './components/AISuggestedTextArea';
import { AlertsCaseOverview } from './components/AlertsCaseOverview';
import { BulkActionBar } from './components/BulkActionBar';
import { ClassifyItemModal } from './components/ClassifyItemModal';
import { ColumnCustomizer } from './components/ColumnCustomizer';
import { EscalateCaseModal } from './components/EscalateCaseModal';
import { FilterPanel } from './components/FilterPanel';
import { InvestigationNoteModal } from './components/InvestigationNoteModal';
import { InvestigationWorkspaceModal } from './components/InvestigationWorkspaceModal';
import { MergeReviewModal } from './components/MergeReviewModal';
import { ModuleActivityLog } from './components/ModuleActivityLog';
import { PreviewDrawer } from './components/PreviewDrawer';
import { QueuePagination } from './components/QueuePagination';
import { QueueToolbar } from './components/QueueToolbar';
import { ResolveItemModal } from './components/ResolveItemModal';
import { ShortcutGuideModal } from './components/ShortcutGuideModal';
import { WorkQueueHeader } from './components/WorkQueueHeader';
import { WorkQueueTable } from './components/WorkQueueTable';
import { useDemoUIState } from './hooks/useDemoUIState';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useWorkflowState } from './hooks/useWorkflowState';
import { buildAISuggestion } from './data/aiDraftSuggestions';
import type { DraftProvenance } from './types/ai';
import type { InvestigationTabId, WorkItemClassification, WorkflowActivityEvent } from './types/investigation';
import type { AsyncViewState } from './types/uiState';
import type {
  ColumnDefinition,
  FilterDefinition,
  FilterSection,
  QueueSegment,
  QueueTab,
  SortOptionId,
  ToastMessage,
  WorkItem,
} from './types/queue';

type QueuePreset =
  | 'critical-open'
  | 'sla-breached'
  | 'unassigned-p1'
  | 'active-exposures'
  | 'pending-approvals'
  | 'failed-actions';

const CURRENT_ANALYST = 'Priya Sharma';

const DEFAULT_COLUMNS: ColumnDefinition[] = [
  { id: 'type', label: 'Type', width: 92, required: true, pinned: true, visible: true },
  { id: 'priority', label: 'Priority', width: 110, required: true, pinned: true, visible: true },
  { id: 'severity', label: 'Severity', width: 108, required: true, pinned: true, visible: true },
  { id: 'title', label: 'Title', width: 380, required: true, pinned: true, visible: true },
  { id: 'affected_systems', label: 'Affected systems', width: 240, visible: true },
  { id: 'risk_type', label: 'Risk type', width: 220, visible: true },
  { id: 'data_sensitivity', label: 'Data sensitivity', width: 170, visible: true },
  { id: 'status', label: 'Status', width: 150, visible: true },
  { id: 'assignee', label: 'Assignee', width: 160, visible: true },
  { id: 'sla', label: 'SLA', width: 120, visible: true },
  { id: 'last_activity', label: 'Last activity', width: 130, visible: true },
  { id: 'alert_count', label: 'Alert count', width: 110, visible: true },
  { id: 'id', label: 'ID', width: 125, visible: true },
  { id: 'key_resource', label: 'Key resource', width: 280, visible: true },
  { id: 'primary_actor', label: 'Primary actor / entity', width: 180, visible: true },
  { id: 'detection_time', label: 'Detection time', width: 145, visible: true },
  { id: 'containment', label: 'Containment', width: 170, visible: true },
  { id: 'detection_source', label: 'Detection source', width: 180, visible: true },
];

const SORT_LABELS: Record<SortOptionId, string> = {
  'priority-high': 'Priority: Highest first',
  'priority-low': 'Priority: Lowest first',
  'severity-high': 'Severity: Highest first',
  'sla-urgent': 'SLA: Most urgent first',
  'last-activity': 'Last activity: Most recent first',
  'detection-time': 'Detection time: Newest first',
  title: 'Title: A–Z',
};

const bulkAssignOptions = ['Assign to me', 'Unassigned', 'Priya Sharma', 'Arjun Rao', 'Sameer Khan', 'Kavya Nair'];
const reassignOptions = ['Unassigned', 'Priya Sharma', 'Arjun Rao', 'Sameer Khan', 'Kavya Nair'];
const workflowStatusOptions = [
  'New',
  'Triaged',
  'Investigating',
  'Awaiting approval',
  'Remediating',
  'Monitoring',
  'Resolved',
 ] as const;
const severityOptions = ['Critical', 'High', 'Medium', 'Low', 'Informational'] as const;

function App() {
  const demoUI = useDemoUIState();
  const spec = specData as unknown as {
    filter_groups: FilterSection[];
    sample_work_items: { alerts: WorkItem[]; cases: WorkItem[] };
  };

  const baseItems = useMemo(() => {
    const items = [...spec.sample_work_items.cases, ...spec.sample_work_items.alerts];
    return items.map((item) => ({
      ...item,
      tags: item.tags ?? [],
      derivedComposition: deriveComposition(item),
    }));
  }, [spec]);

  const {
    items,
    setItems,
    updateItem,
    workflowStateByItemId,
    globalActivityLog,
    getItemById,
    getOrCreateWorkspace,
    ensureWorkspaceState,
    updateWorkspaceState,
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
  } = useWorkflowState(baseItems, CURRENT_ANALYST);
  const [activeTab, setActiveTab] = useState<QueueTab>('Work Queue');
  const [segment, setSegment] = useState<QueueSegment>('All');
  const [queueSearch, setQueueSearch] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [activeFilterPinned, setActiveFilterPinned] = useState(false);
  const [filterModeActive, setFilterModeActive] = useState(false);
  const [focusedFilterIndex, setFocusedFilterIndex] = useState(0);
  const [focusedValueIndex, setFocusedValueIndex] = useState(0);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortOptionId, setSortOptionId] = useState<SortOptionId>('priority-high');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [shortcutGuideOpen, setShortcutGuideOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [addTagModalOpen, setAddTagModalOpen] = useState(false);
  const [investigationInfoOpen, setInvestigationInfoOpen] = useState(false);
  const [investigationItemId, setInvestigationItemId] = useState<string | null>(null);
  const [activeInvestigationTab, setActiveInvestigationTab] = useState<InvestigationTabId>('summary');
  const [drawerAssignOpen, setDrawerAssignOpen] = useState(false);
  const [drawerStatusOpen, setDrawerStatusOpen] = useState(false);
  const [severityModalOpen, setSeverityModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [classifyModalOpen, setClassifyModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [pendingAssignee, setPendingAssignee] = useState(bulkAssignOptions[0]);
  const [pendingStatus, setPendingStatus] = useState<(typeof workflowStatusOptions)[number]>('Triaged');
  const [pendingTag, setPendingTag] = useState('Needs review');
  const [pendingSeverity, setPendingSeverity] = useState<(typeof severityOptions)[number]>('High');
  const [severityComment, setSeverityComment] = useState('');
  const [severityCommentProvenance, setSeverityCommentProvenance] = useState<DraftProvenance | undefined>();
  const [reopenComment, setReopenComment] = useState('');
  const [reopenCommentProvenance, setReopenCommentProvenance] = useState<DraftProvenance | undefined>();
  const [reopenStatus, setReopenStatus] = useState<(typeof workflowStatusOptions)[number]>('Investigating');
  const [pendingClassification, setPendingClassification] = useState<WorkItemClassification>('True positive — malicious activity');
  const [classificationComment, setClassificationComment] = useState('');
  const [classificationCommentProvenance, setClassificationCommentProvenance] = useState<DraftProvenance | undefined>();
  const [duplicateCaseId, setDuplicateCaseId] = useState('');
  const [exceptionOwner, setExceptionOwner] = useState('');
  const [createTuningFeedback, setCreateTuningFeedback] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [remediationSummary, setRemediationSummary] = useState('');
  const [residualRisk, setResidualRisk] = useState('');
  const [finalResolutionComment, setFinalResolutionComment] = useState('');
  const [resolutionFieldProvenance, setResolutionFieldProvenance] = useState<Partial<Record<'resolutionSummary' | 'rootCause' | 'remediationSummary' | 'residualRisk' | 'finalComment' | 'exceptionReason', DraftProvenance>>>({});
  const [monitoringRequired, setMonitoringRequired] = useState(true);
  const [resolutionRecipients, setResolutionRecipients] = useState<string[]>([]);
  const [childAlertHandling, setChildAlertHandling] = useState<'resolve-all' | 'detach-selected'>('resolve-all');
  const [detachedAlertIds, setDetachedAlertIds] = useState<string[]>([]);
  const [exceptionReason, setExceptionReason] = useState('');
  const [escalationTeam, setEscalationTeam] = useState('');
  const [escalationUrgency, setEscalationUrgency] = useState('High');
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationNote, setEscalationNote] = useState('');
  const [escalationReasonProvenance, setEscalationReasonProvenance] = useState<DraftProvenance | undefined>();
  const [escalationNoteProvenance, setEscalationNoteProvenance] = useState<DraftProvenance | undefined>();
  const [escalationTaskOwner, setEscalationTaskOwner] = useState('');
  const [notifyDataOwner, setNotifyDataOwner] = useState(false);
  const [mergeReopenComment, setMergeReopenComment] = useState('');
  const [mergeReopenCommentProvenance, setMergeReopenCommentProvenance] = useState<DraftProvenance | undefined>();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [destinationCaseId, setDestinationCaseId] = useState<string | null>(null);
  const [showShortcutOverlays, setShowShortcutOverlays] = useState(false);
  const [queuePreset, setQueuePreset] = useState<QueuePreset | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [itemCommentDraft, setItemCommentDraft] = useState('');
  const [itemCommentDraftProvenance, setItemCommentDraftProvenance] = useState<DraftProvenance | undefined>();
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [editableTags, setEditableTags] = useState<string[]>([]);
  const [newTagDraft, setNewTagDraft] = useState('');
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');

  const queueSearchRef = useRef<HTMLInputElement | null>(null);
  const filterSearchRef = useRef<HTMLInputElement | null>(null);
  const toolbarRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLElement | null>(null);
  const paginationRef = useRef<HTMLElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  const bulkActionsRef = useRef<HTMLElement | null>(null);

  const visibleSections = useMemo(
    () =>
      spec.filter_groups
        .map((section) => ({
          ...section,
          filters: section.filters.filter((filter) =>
            `${filter.label} ${filter.values.join(' ')}`.toLowerCase().includes(filterSearch.toLowerCase()),
          ),
        }))
        .filter((section) => section.filters.length > 0),
    [filterSearch, spec.filter_groups],
  );

  const visibleFilters = useMemo(
    () => visibleSections.flatMap((section) => section.filters),
    [visibleSections],
  );

  const filteredBySegment = useMemo(() => {
    if (segment === 'Cases') {
      return items.filter((item) => item.item_type === 'case');
    }
    if (segment === 'Alerts') {
      return items.filter((item) => item.item_type === 'alert');
    }
    return items;
  }, [items, segment]);

  const filteredItems = useMemo(() => {
    return filteredBySegment.filter(
      (item) =>
        matchesFilters(item, selectedFilters) &&
        matchesSearch(item, queueSearch) &&
        matchesQueuePreset(item, queuePreset, workflowStateByItemId),
    );
  }, [filteredBySegment, queuePreset, queueSearch, selectedFilters, workflowStateByItemId]);

  const sortedItems = useMemo(() => [...filteredItems].sort(sortItems(sortOptionId)), [filteredItems, sortOptionId]);
  const pagedItems = useMemo(() => sortedItems.slice((page - 1) * pageSize, page * pageSize), [page, pageSize, sortedItems]);

  const stats = useMemo(() => {
    const criticalCount = filteredItems.filter((item) => item.severity === 'Critical').length;
    const breachedCount = filteredItems.filter((item) => parseSla(item.sla) <= 0).length;
    const unassignedCount = filteredItems.filter((item) => item.assignee === 'Unassigned').length;
    return { criticalCount, breachedCount, unassignedCount };
  }, [filteredItems]);

  const segmentCounts = useMemo(
    () => ({
      All: items.filter((item) => matchesFilters(item, selectedFilters) && matchesSearch(item, queueSearch) && matchesQueuePreset(item, queuePreset, workflowStateByItemId)).length,
      Cases: items.filter((item) => item.item_type === 'case' && matchesFilters(item, selectedFilters) && matchesSearch(item, queueSearch) && matchesQueuePreset(item, queuePreset, workflowStateByItemId)).length,
      Alerts: items.filter((item) => item.item_type === 'alert' && matchesFilters(item, selectedFilters) && matchesSearch(item, queueSearch) && matchesQueuePreset(item, queuePreset, workflowStateByItemId)).length,
    }),
    [items, queuePreset, queueSearch, selectedFilters, workflowStateByItemId],
  );

  const previewItem = items.find((item) => item.id === previewItemId) ?? null;
  const investigationItem =
    items.find((item) => item.id === investigationItemId) ??
    previewItem ??
    null;
  const investigationWorkspace = investigationItem ? getOrCreateWorkspace(investigationItem) : null;
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const selectedCases = selectedItems.filter((item) => item.item_type === 'case');
  const classificationTargetItem = investigationItem ?? previewItem;

  const mergeSummary = useMemo(() => buildMergeSummary(selectedItems, items, destinationCaseId), [destinationCaseId, items, selectedItems]);
  const canConsolidateSelection = selectedItems.length >= 2;
  const itemsByStatus = useMemo(
    () =>
      workflowStatusOptions.reduce<Record<string, number>>((acc, status) => {
        acc[status] = items.filter((item) => item.status === status).length;
        return acc;
      }, {}),
    [items],
  );
  const topRiskTypes = useMemo(
    () =>
      Object.entries(
        items.reduce<Record<string, number>>((acc, item) => {
          acc[item.risk_type] = (acc[item.risk_type] ?? 0) + 1;
          return acc;
        }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({ label, count })),
    [items],
  );
  const topSystems = useMemo(
    () =>
      Object.entries(
        items.flatMap((item) => item.affected_systems).reduce<Record<string, number>>((acc, system) => {
          acc[system] = (acc[system] ?? 0) + 1;
          return acc;
        }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({ label, count })),
    [items],
  );
  const moduleActivityEvents = useMemo(() => {
    const workspaceEvents: WorkflowActivityEvent[] = items.flatMap((item) => {
      const workspace = workflowStateByItemId[item.id]?.workspace;
      if (!workspace) return [];
      return workspace.activity.map((entry) => ({
        ...entry,
        itemId: item.id,
        itemTitle: item.title,
        itemType: item.item_type,
        system: item.affected_systems[0],
        riskType: item.risk_type,
        result: entry.newValue ?? entry.comment ?? 'Recorded',
      }));
    });
    return [...workspaceEvents, ...globalActivityLog]
      .filter(
        (event, index, current) =>
          current.findIndex(
            (candidate) =>
              candidate.itemId === event.itemId &&
              candidate.activityType === event.activityType &&
              candidate.description === event.description &&
              candidate.timestamp === event.timestamp,
          ) === index,
      )
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [globalActivityLog, items, workflowStateByItemId]);

  const queueState = demoUI.getSurfaceState('queue');
  const filterState = demoUI.getSurfaceState('filter');
  const overviewState = demoUI.getSurfaceState('overview');
  const previewSurfaceState = demoUI.getSurfaceState('preview');
  const previewAiState = demoUI.getSurfaceState('preview-ai');
  const investigationState = demoUI.getSurfaceState('investigation');
  const summaryAiSurfaceState = demoUI.getSurfaceState('summary-ai');
  const timelineState = demoUI.getSurfaceState('timeline');
  const evidenceState = demoUI.getSurfaceState('evidence');
  const entitiesState = demoUI.getSurfaceState('entities');
  const actionsState = demoUI.getSurfaceState('actions');
  const containmentState = demoUI.getSurfaceState('containment');
  const activityState = demoUI.getSurfaceState('activity');
  const huntState = demoUI.getSurfaceState('hunt');
  const submissionScenario = demoUI.submissionScenario;

  const queueEmptyKind = resolveQueueEmptyKind({
    queueState,
    items,
    filteredBySegment,
    filteredItems,
    queueSearch,
    selectedFilters,
    queuePreset,
    segment,
  });

  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get('state');
    if (!state) {
      return;
    }

    if (state === 'queue-loading' || state === 'queue-refreshing' || state === 'queue-empty' || state === 'queue-no-results' || state === 'queue-error' || state === 'filter-no-results') {
      setActiveTab('Work Queue');
      if (state === 'queue-no-results') {
        setQueueSearch('snowflake export');
      }
      if (state === 'filter-no-results') {
        setFilterSearch('nonexistent');
      }
    } else if (state === 'overview-loading' || state === 'overview-empty' || state === 'overview-partial-error') {
      setActiveTab('Overview');
    } else if (state === 'preview-loading' || state === 'preview-ai-loading' || state === 'preview-ai-error') {
      const heroCase = items.find((item) => item.id === 'CASE-3001') ?? items[0];
      setActiveTab('Work Queue');
      setPreviewItemId(heroCase?.id ?? null);
    } else if (state === 'preview') {
      const firstCase = items.find((item) => item.item_type === 'case') ?? items[0];
      setPreviewItemId(firstCase?.id ?? null);
    } else if (state === 'alert-preview') {
      const firstAlert = items.find((item) => item.item_type === 'alert') ?? items[0];
      setPreviewItemId(firstAlert?.id ?? null);
    } else if (state === 'filter-open') {
      setActiveFilterId('data_sensitivity');
      setFilterModeActive(true);
    } else if (state === 'bulk-selected') {
      setSelectedIds(items.slice(0, 3).map((item) => item.id));
    } else if (state === 'merge-review') {
      setSelectedIds(items.filter((item) => item.item_type === 'alert').slice(0, 3).map((item) => item.id));
      setMergeReopenComment('');
      setMergeOpen(true);
    } else if (state === 'columns-open') {
      setColumnsOpen(true);
    } else if (state === 'shortcut-guide') {
      setShortcutGuideOpen(true);
    } else if (state === 'investigation-loading' || state === 'investigation-error' || state === 'investigation-partial' || state === 'summary-ai-loading' || state === 'summary-ai-error' || state === 'summary-empty-tasks' || state === 'timeline-loading' || state === 'timeline-empty' || state === 'timeline-no-results' || state === 'timeline-error' || state === 'evidence-loading' || state === 'evidence-empty' || state === 'evidence-error' || state === 'entities-loading' || state === 'entities-empty' || state === 'baseline-error' || state === 'actions-loading' || state === 'actions-empty' || state === 'containment-error' || state === 'activity-empty' || state === 'activity-no-results' || state === 'activity-error' || state === 'hunt-loading' || state === 'hunt-empty' || state === 'hunt-no-results' || state === 'hunt-error' || state === 'source-system-info' || state === 'source-system-error' || state === 'source-system-permission-denied' || state === 'source-system-record-unavailable' || state === 'source-system-timeout' || state === 'approval-submit-error') {
      const heroCase = items.find((item) => item.id === 'CASE-3001') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      if (heroCase) ensureWorkspaceState(heroCase);
      setPreviewItemId(heroCase?.id ?? null);
      setInvestigationItemId(heroCase?.id ?? null);
      setActiveInvestigationTab(
        state.startsWith('timeline') ? 'timeline'
          : state.startsWith('evidence') ? 'evidence'
          : state.startsWith('entities') || state === 'baseline-error' ? 'entities'
          : state.startsWith('actions') || state === 'containment-error' || state === 'approval-submit-error' ? 'actions'
          : state.startsWith('activity') ? 'activity'
          : 'summary',
      );
      setInvestigationInfoOpen(true);
      if (state === 'approval-submit-error' && heroCase) {
        updateWorkspaceState(heroCase, (current) => ({
          ...current,
          selectedActionId: current.actions.find((entry) => entry.currentState === 'Recommended' && entry.requiresApproval)?.id ?? current.actions[0]?.id ?? null,
        }));
      }
      if (state.startsWith('hunt-')) {
        updateWorkspaceState(heroCase!, (current) => ({ ...current, selectedEntityId: current.entities[0]?.id ?? null }));
      }
    } else if (state === 'investigation') {
      const heroCase = items.find((item) => item.id === 'CASE-3001') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      if (heroCase) ensureWorkspaceState(heroCase);
      setPreviewItemId(heroCase?.id ?? null);
      setInvestigationItemId(heroCase?.id ?? null);
      setActiveInvestigationTab('summary');
      setInvestigationInfoOpen(true);
    } else if (state === 'investigation-timeline') {
      const heroCase = items.find((item) => item.id === 'CASE-3001') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      if (heroCase) ensureWorkspaceState(heroCase);
      setPreviewItemId(heroCase?.id ?? null);
      setInvestigationItemId(heroCase?.id ?? null);
      setActiveInvestigationTab('timeline');
      setInvestigationInfoOpen(true);
    } else if (state === 'investigation-evidence') {
      const heroCase = items.find((item) => item.id === 'CASE-3001') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      if (heroCase) ensureWorkspaceState(heroCase);
      setPreviewItemId(heroCase?.id ?? null);
      setInvestigationItemId(heroCase?.id ?? null);
      setActiveInvestigationTab('evidence');
      setInvestigationInfoOpen(true);
    } else if (state === 'investigation-entities') {
      const heroCase = items.find((item) => item.id === 'CASE-3001') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      if (heroCase) ensureWorkspaceState(heroCase);
      setPreviewItemId(heroCase?.id ?? null);
      setInvestigationItemId(heroCase?.id ?? null);
      setActiveInvestigationTab('entities');
      setInvestigationInfoOpen(true);
    } else if (state === 'investigation-actions') {
      const heroCase = items.find((item) => item.id === 'CASE-3001') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      if (heroCase) ensureWorkspaceState(heroCase);
      setPreviewItemId(heroCase?.id ?? null);
      setInvestigationItemId(heroCase?.id ?? null);
      setActiveInvestigationTab('actions');
      setInvestigationInfoOpen(true);
    } else if (state === 'investigation-activity') {
      const heroCase = items.find((item) => item.id === 'CASE-3001') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      if (heroCase) ensureWorkspaceState(heroCase);
      setPreviewItemId(heroCase?.id ?? null);
      setInvestigationItemId(heroCase?.id ?? null);
      setActiveInvestigationTab('activity');
      setInvestigationInfoOpen(true);
    } else if (state === 'investigation-cloud-exposure') {
      const cloudCase = items.find((item) => item.id === 'CASE-3002') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      if (cloudCase) ensureWorkspaceState(cloudCase);
      setPreviewItemId(cloudCase?.id ?? null);
      setInvestigationItemId(cloudCase?.id ?? null);
      setActiveInvestigationTab('summary');
      setInvestigationInfoOpen(true);
    } else if (state === 'response-action' || state === 'pending-approval' || state === 'failed-action' || state === 'resolve-case' || state === 'resolve-exception' || state === 'handoff' || state === 'raw-evidence' || state === 'hunt-results' || state === 'ai-provenance-investigation' || state === 'system-derived-containment') {
      const heroCase = items.find((item) => item.id === 'CASE-3001') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      if (heroCase) ensureWorkspaceState(heroCase);
      setActiveTab('Work Queue');
      setPreviewItemId(heroCase?.id ?? null);
      setInvestigationItemId(heroCase?.id ?? null);
      setActiveInvestigationTab(
        state === 'raw-evidence' ? 'timeline'
          : state === 'response-action' || state === 'pending-approval' || state === 'failed-action' || state === 'system-derived-containment'
            ? 'actions'
            : 'summary',
      );
      setInvestigationInfoOpen(true);
      if (state === 'resolve-case') setResolveModalOpen(true);
      if (state === 'resolve-exception') {
        setResolveModalOpen(true);
        setExceptionReason('Containment requires documented analyst exception.');
      }
      if (state === 'handoff') setEscalateModalOpen(true);
      if ((state === 'response-action' || state === 'pending-approval' || state === 'failed-action') && heroCase) {
        updateWorkspaceState(heroCase, (current) => ({
          ...current,
          selectedActionId:
            state === 'pending-approval'
              ? current.actions.find((entry) => entry.currentState === 'Pending approval')?.id ?? current.actions[0]?.id ?? null
              : state === 'failed-action'
                ? current.actions.find((entry) => entry.currentState === 'Failed')?.id ?? current.actions[0]?.id ?? null
                : current.actions[0]?.id ?? null,
        }));
      }
      if (state === 'raw-evidence' && heroCase) {
        updateWorkspaceState(heroCase, (current) => ({
          ...current,
          selectedEvidenceId: current.evidence[0]?.id ?? null,
        }));
      }
    } else if (state === 'ai-provenance-preview') {
      const heroCase = items.find((item) => item.id === 'CASE-3001') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      setActiveTab('Work Queue');
      setPreviewItemId(heroCase?.id ?? null);
    } else if (state === 'ai-suggestion-resolution') {
      const cloudCase = items.find((item) => item.id === 'CASE-3002') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      if (cloudCase) ensureWorkspaceState(cloudCase);
      setActiveTab('Work Queue');
      setPreviewItemId(cloudCase?.id ?? null);
      setInvestigationItemId(cloudCase?.id ?? null);
      setResolveModalOpen(true);
    } else if (state === 'ai-suggestion-approval') {
      const heroCase = items.find((item) => item.id === 'CASE-3001') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      if (heroCase) ensureWorkspaceState(heroCase);
      setActiveTab('Work Queue');
      setPreviewItemId(heroCase?.id ?? null);
      setInvestigationItemId(heroCase?.id ?? null);
      setActiveInvestigationTab('actions');
      setInvestigationInfoOpen(true);
      if (heroCase) {
        updateWorkspaceState(heroCase, (current) => ({
          ...current,
          selectedActionId: current.actions.find((entry) => entry.currentState === 'Pending approval' || entry.requiresApproval)?.id ?? current.actions[0]?.id ?? null,
        }));
      }
    } else if (state === 'system-derived-baseline') {
      const heroCase = items.find((item) => item.id === 'CASE-3001') ?? items.find((item) => item.item_type === 'case') ?? items[0];
      if (heroCase) ensureWorkspaceState(heroCase);
      setActiveTab('Work Queue');
      setPreviewItemId(heroCase?.id ?? null);
      setInvestigationItemId(heroCase?.id ?? null);
      setActiveInvestigationTab('entities');
      setInvestigationInfoOpen(true);
      if (heroCase) {
        updateWorkspaceState(heroCase, (current) => ({
          ...current,
          selectedEntityId: current.entities[0]?.id ?? null,
        }));
      }
    } else if (state === 'classification') {
      const firstAlert = items.find((item) => item.item_type === 'alert') ?? items[0];
      setActiveTab('Work Queue');
      setPreviewItemId(firstAlert?.id ?? null);
      setClassifyModalOpen(true);
    } else if (state === 'module-activity-log') {
      setActiveTab('Activity Log');
    } else if (state === 'overview') {
      setActiveTab('Overview');
    }
  }, [ensureWorkspaceState, items]);

  useEffect(() => {
    setPage(1);
  }, [queuePreset, queueSearch, selectedFilters, segment, sortOptionId, sortedItems.length]);

  useEffect(() => {
    queueSearchRef.current = document.querySelector('#queue-search') as HTMLInputElement | null;
    filterSearchRef.current = document.querySelector('#filter-search') as HTMLInputElement | null;
    toolbarRef.current = document.querySelector('#queue-toolbar') as HTMLElement | null;
    listRef.current = document.querySelector('#queue-list') as HTMLElement | null;
    paginationRef.current = document.querySelector('#queue-pagination') as HTMLElement | null;
    previewRef.current = document.querySelector('#preview-drawer') as HTMLElement | null;
    bulkActionsRef.current = document.querySelector('#bulk-actions') as HTMLElement | null;
  });

  const addToast = (kind: ToastMessage['kind'], title: string, subtitle: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, kind, title, subtitle }]);
  };

  const openDrawerAssign = () => {
    if (!previewItem) return;
    setPendingAssignee(previewItem.assignee === CURRENT_ANALYST ? CURRENT_ANALYST : previewItem.assignee);
    setDrawerAssignOpen(true);
  };

  const openDrawerStatus = () => {
    if (!previewItem) return;
    setPendingStatus(normalizeWorkflowStatus(previewItem.status));
    setDrawerStatusOpen(true);
  };

  const openSeverityOverride = (targetItem: WorkItem | null = previewItem) => {
    if (!targetItem) return;
    setPendingSeverity((targetItem.analystSeverityOverride?.severity ?? targetItem.severity) as (typeof severityOptions)[number]);
    setSeverityComment('');
    setSeverityCommentProvenance(undefined);
    setSeverityModalOpen(true);
  };

  const openReopenModal = (nextStatus: (typeof workflowStatusOptions)[number] = 'Investigating') => {
    setReopenStatus(nextStatus);
    setReopenComment('');
    setReopenCommentProvenance(undefined);
    setReopenModalOpen(true);
  };

  const handleAssignToMe = () => {
    if (!previewItem) return;
    assignItem(previewItem.id, CURRENT_ANALYST);
    addToast('success', 'Assigned to you', `${previewItem.id} is now assigned to ${CURRENT_ANALYST}.`);
  };

  const handleApplyDrawerAssignment = () => {
    if (!previewItem) return;
    assignItem(previewItem.id, pendingAssignee);
    setDrawerAssignOpen(false);
    addToast('success', 'Assignment updated', `${previewItem.id} is now assigned to ${pendingAssignee}.`);
  };

  const applyStatusChange = (itemId: string, nextStatus: (typeof workflowStatusOptions)[number], comment?: string) => {
    changeWorkflowStatus(itemId, nextStatus, comment);
  };

  const handleApplyDrawerStatus = () => {
    if (!previewItem) return;
    if (previewItem.status === 'Resolved' && pendingStatus !== 'Resolved') {
      setDrawerStatusOpen(false);
      openReopenModal(pendingStatus);
      return;
    }
    applyStatusChange(previewItem.id, pendingStatus);
    setDrawerStatusOpen(false);
    addToast('success', 'Status updated', `${previewItem.id} moved to ${pendingStatus}.`);
  };

  const handleConfirmReopen = () => {
    if (!previewItem || !reopenComment.trim()) return;
    reopenItem(previewItem.id, reopenStatus, reopenComment.trim(), reopenCommentProvenance);
    setReopenModalOpen(false);
    addToast('success', `${previewItem.id} reopened`, `${previewItem.id} reopened as ${reopenStatus}.`);
  };

  const handleApplySeverityOverride = () => {
    if (!previewItem || !severityComment.trim()) return;
    overrideSeverity(previewItem.id, pendingSeverity, severityComment.trim(), CURRENT_ANALYST, severityCommentProvenance);
    setSeverityModalOpen(false);
    addToast('success', 'Severity override applied', `${previewItem.id} severity changed to ${pendingSeverity}.`);
  };

  const openInvestigationWorkspace = (itemId: string, tab: InvestigationTabId = 'summary') => {
    const target = getItemById(itemId);
    if (target) {
      ensureWorkspaceState(target);
    }
    setPreviewItemId(itemId);
    setInvestigationItemId(itemId);
    setActiveInvestigationTab(tab);
    setInvestigationInfoOpen(true);
  };

  const handleToggleFilterValue = (filterId: string, value: string) => {
    setSelectedFilters((current) => {
      const next = new Set(current[filterId] ?? []);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return {
        ...current,
        [filterId]: [...next],
      };
    });
  };

  const handleOpenFilter = (filterId: string, pinned: boolean) => {
    setActiveFilterId(filterId);
    setActiveFilterPinned(pinned);
    if (pinned) {
      setFilterModeActive(true);
    }
    setFocusedValueIndex(0);
  };

  const handleApplyAssignment = () => {
    const targetAssignee = pendingAssignee === 'Assign to me' ? CURRENT_ANALYST : pendingAssignee;
    selectedIds.forEach((id) => assignItem(id, targetAssignee));
    setAssignModalOpen(false);
    addToast('success', 'Assignment updated', `Assigned ${selectedIds.length} items to ${targetAssignee}.`);
  };

  const handleApplyStatus = () => {
    selectedIds.forEach((id) => changeWorkflowStatus(id, pendingStatus));
    setStatusModalOpen(false);
    addToast('success', 'Status updated', `Updated ${selectedIds.length} items to ${pendingStatus}.`);
  };

  const handleAddTag = () => {
    setItems((current) =>
      current.map((item) =>
        selectedIds.includes(item.id) && !item.tags.includes(pendingTag)
          ? { ...item, tags: [...item.tags, pendingTag] }
          : item,
      ),
    );
    setAddTagModalOpen(false);
    addToast('success', 'Tag added', `Added ${pendingTag} to ${selectedIds.length} items.`);
  };

  const handleConsolidate = () => {
    if (!mergeSummary) {
      return;
    }
    if (mergeSummary.requiresReopenComment && !mergeReopenComment.trim()) {
      addToast('warning', 'Reopen comment required', 'Explain why the resolved destination case is being reopened.');
      return;
    }
    const targetId = mergeSummary.destinationCase?.id ?? `CASE-${3000 + items.length + 1}`;
    const mergedCase: WorkItem = {
      id: targetId,
      item_type: 'case',
      title: mergeSummary.proposedTitle,
      risk_type: mergeSummary.primaryRiskType,
      affected_systems: mergeSummary.affectedSystems,
      key_resource: mergeSummary.keyResource,
      primary_actor: mergeSummary.primaryActor,
      actor_entity_type: 'Multiple entities',
      priority: `P${priorityBand(mergeSummary.recalculatedPriority)} · ${mergeSummary.recalculatedPriority}`,
      priority_score: mergeSummary.recalculatedPriority,
      severity: mergeSummary.proposedSeverity,
      data_sensitivity: mergeSummary.highestDataSensitivity,
      status: mergeSummary.proposedStatus,
      assignee: mergeSummary.destinationCase?.assignee ?? CURRENT_ANALYST,
      sla: mergeSummary.destinationCase?.sla ?? '45m left',
      detection_time: mergeSummary.destinationCase?.detection_time ?? selectedItems[0]?.detection_time ?? 'Today, 10:00',
      last_activity: 'Just now',
      containment: mergeSummary.containsNotContained ? 'Not contained' : 'Contained',
      detection_source: mergeSummary.destinationCase?.detection_source ?? 'Multiple correlated sources',
      resource_criticality: mergeSummary.highestResourceCriticality,
      destination_exposure_target: mergeSummary.destinationTargets.join('; ') || 'Not applicable',
      alert_count: mergeSummary.resultingAlertCount,
      child_alert_ids: mergeSummary.alertIds,
      tags: ['Needs review'],
      affected_data_volume: mergeSummary.affectedData,
      preview: {
        identity_and_urgency: {
          type: 'Case',
          id: targetId,
          title: mergeSummary.proposedTitle,
          severity: mergeSummary.proposedSeverity,
          priority: `P${priorityBand(mergeSummary.recalculatedPriority)} · ${mergeSummary.recalculatedPriority}`,
          status: mergeSummary.proposedStatus,
          assignee: mergeSummary.destinationCase?.assignee ?? CURRENT_ANALYST,
          sla: mergeSummary.destinationCase?.sla ?? '45m left',
        },
        ai_summary: `Consolidated ${selectedItems.length} selected work items into a single investigation case.`,
        why_prioritized: [
          `Resulting alerts: ${mergeSummary.resultingAlertCount}`,
          `Systems involved: ${mergeSummary.affectedSystems.length}`,
          `Exposure targets: ${mergeSummary.destinationTargets.join(', ') || 'Not applicable'}`,
          `Containment: ${mergeSummary.containsNotContained ? 'Not contained' : 'Contained'}`,
        ],
        affected_systems_resources: [mergeSummary.keyResource],
        actors_entities: mergeSummary.actors,
        affected_data: mergeSummary.affectedData,
        destination_exposure_target: mergeSummary.destinationTargets.join('; ') || 'Not applicable',
        resource_criticality: mergeSummary.highestResourceCriticality,
        grouping_rationale: 'Selected alerts and cases were merged in the prototype review flow.',
        ai_assessment: { verdict: 'Suspicious', confidence: 'High' },
        automated_investigation_state: 'Queued for next-phase workflow',
        containment_state: mergeSummary.containsNotContained ? 'Not contained' : 'Contained',
        recommended_next_action: 'Validate the merged evidence, assign ownership, and continue the investigation workflow.',
        alerts: mergeSummary.alertPreviewItems,
      },
      derivedComposition:
        mergeSummary.resultingAlertCount === 1
          ? 'Single-alert case'
          : mergeSummary.resultingAlertCount > 5
            ? 'Large case: 6+ alerts'
            : 'Multi-alert case: 2–5 alerts',
      reopenComment: mergeSummary.requiresReopenComment ? mergeReopenComment.trim() : undefined,
      localHistory: mergeSummary.requiresReopenComment ? [`Reopened during merge: ${mergeReopenComment.trim()}`] : [],
    };

    setItems((current) => {
      const removedIds = new Set(selectedItems.map((item) => item.id));
      const kept = current.filter((item) => !removedIds.has(item.id) || item.id === mergeSummary.destinationCase?.id);
      const withoutDestinationDuplicate = kept.filter((item) => item.id !== targetId);
      return [mergedCase, ...withoutDestinationDuplicate];
    });
    setSelectedIds([]);
    setMergeOpen(false);
    setMergeReopenComment('');
    setPreviewItemId(targetId);
    addToast('success', 'Case consolidation complete', `${mergeSummary.resultingAlertCount} alerts rolled into ${targetId}.`);
  };

  const openClassifyModal = (item: WorkItem | null) => {
    if (!item) return;
    setPendingClassification(item.classification ?? 'True positive — malicious activity');
    setClassificationComment('');
    setClassificationCommentProvenance(undefined);
    setDuplicateCaseId('');
    setExceptionOwner('');
    setCreateTuningFeedback(false);
    setClassifyModalOpen(true);
  };

  const openResolveModal = (item: WorkItem | null) => {
    if (!item) return;
    const workspace = getOrCreateWorkspace(item);
    setPendingClassification(item.classification ?? workspace.classification ?? 'True positive — malicious activity');
    setResolutionSummary(item.resolution?.resolutionSummary ?? '');
    setRootCause(item.resolution?.rootCause ?? '');
    setRemediationSummary(item.resolution?.remediationSummary ?? '');
    setResidualRisk(item.resolution?.residualRisk ?? '');
    setFinalResolutionComment('');
    setResolutionFieldProvenance({});
    setMonitoringRequired(item.resolution?.monitoringRequired ?? true);
    setResolutionRecipients(item.resolution?.notificationRecipients ?? []);
    setChildAlertHandling('resolve-all');
    setDetachedAlertIds([]);
    setExceptionReason('');
    setResolveModalOpen(true);
  };

  const openEscalateModal = () => {
    setEscalationTeam('');
    setEscalationUrgency('High');
    setEscalationReason('');
    setEscalationNote('');
    setEscalationReasonProvenance(undefined);
    setEscalationNoteProvenance(undefined);
    setEscalationTaskOwner('');
    setNotifyDataOwner(false);
    setEscalateModalOpen(true);
  };

  const handleSubmitClassification = () => {
    if (!classificationTargetItem || !classificationComment.trim()) return;
    classifyItem(classificationTargetItem.id, {
      classification: pendingClassification,
      comment: classificationComment.trim(),
      commentProvenance: classificationCommentProvenance,
      updatedBy: CURRENT_ANALYST,
      updatedAt: 'Just now',
      duplicateCaseId: pendingClassification === 'Duplicate' ? duplicateCaseId.trim() : undefined,
      exceptionOwner: pendingClassification === 'Accepted risk' ? exceptionOwner.trim() : undefined,
      tuningFeedbackCreated: pendingClassification === 'False positive' ? createTuningFeedback : undefined,
    });
    if (pendingClassification === 'False positive' && createTuningFeedback) {
      addToast('info', 'Detection feedback recorded', 'A lightweight detection-tuning feedback record was created locally.');
    }
    setClassifyModalOpen(false);
    addToast('success', 'Classification saved', `${classificationTargetItem.id} classified as ${pendingClassification}.`);
  };

  const resolutionWarnings = useMemo(() => {
    if (!classificationTargetItem) return [];
    const workspace = getOrCreateWorkspace(classificationTargetItem);
    const warnings: string[] = [];
    if ((workspace.actions ?? []).some((action) => action.requiredForContainment && action.currentState !== 'Completed')) {
      warnings.push('Required containment actions remain incomplete.');
    }
    if (classificationTargetItem.containment !== 'Contained') {
      warnings.push('Containment is not yet Contained.');
    }
    if ((workspace.actions ?? []).some((action) => action.currentState === 'Pending approval')) {
      warnings.push('Pending approvals remain open.');
    }
    if ((workspace.evidence ?? []).some((entry) => entry.verdict === 'Needs review')) {
      warnings.push('Some evidence still needs review.');
    }
    if (classificationTargetItem.item_type === 'case' && childAlertHandling === 'resolve-all' && (workspace.alerts ?? []).some((alert) => alert.relevance === 'Needs review')) {
      warnings.push('Child alerts still require analyst review.');
    }
    return warnings;
  }, [childAlertHandling, classificationTargetItem, getOrCreateWorkspace]);

  const resolvingWithException = resolutionWarnings.length > 0;

  const handleSubmitResolution = () => {
    if (!classificationTargetItem) return;
    const workspace = getOrCreateWorkspace(classificationTargetItem);
    resolveItem(classificationTargetItem.id, {
      classification: pendingClassification,
      resolutionSummary: resolutionSummary.trim(),
      rootCause: rootCause.trim(),
      remediationSummary: remediationSummary.trim(),
      residualRisk: residualRisk.trim(),
      monitoringRequired,
      notificationRecipients: resolutionRecipients,
      resolvedBy: CURRENT_ANALYST,
      resolvedAt: 'Just now',
      resolvedWithException: resolvingWithException,
      exceptionReason: resolvingWithException ? exceptionReason.trim() : undefined,
      fieldProvenance: resolutionFieldProvenance,
      childAlertHandling,
      detachedAlertIds: childAlertHandling === 'detach-selected' ? detachedAlertIds : [],
    }, finalResolutionComment.trim(), resolutionFieldProvenance.finalComment);
    if (resolvingWithException) {
      addToast('warning', 'Resolved with exception', `${classificationTargetItem.id} was resolved with an analyst exception.`);
    } else {
      addToast('success', 'Item resolved', `${classificationTargetItem.id} is now resolved.`);
    }
    setResolveModalOpen(false);
  };

  const handleSubmitEscalation = () => {
    if (!classificationTargetItem) return;
    addEscalation(classificationTargetItem.id, {
      team: escalationTeam,
      urgency: escalationUrgency,
      reason: escalationReason,
      note: escalationNote,
      createdBy: CURRENT_ANALYST,
      createdAt: 'Just now',
      taskOwner: escalationTaskOwner || undefined,
      notifyDataOwner,
      reasonProvenance: escalationReasonProvenance,
      noteProvenance: escalationNoteProvenance,
    });
    if (escalationTaskOwner) {
      updateWorkspaceState(classificationTargetItem, (current) => ({
        ...current,
        tasks: [
          {
            id: `task-${Date.now()}`,
            title: `Follow up with ${escalationTeam}`,
            owner: escalationTaskOwner,
            completed: false,
          },
          ...current.tasks,
        ],
      }));
    }
    setEscalateModalOpen(false);
    addToast('success', 'Escalation created', `${classificationTargetItem.id} handed off to ${escalationTeam}.`);
  };

  useKeyboardShortcuts({
    isFilterModeActive: filterModeActive,
    onToggleShortcutOverlays: () => setShowShortcutOverlays((current) => !current),
    onFocusQueueSearch: () => {
      queueSearchRef.current?.focus();
    },
    onFocusFilterSearch: () => {
      filterSearchRef.current?.focus();
    },
    onOpenShortcutGuide: () => setShortcutGuideOpen(true),
    onFocusFilters: () => {
      setFilterModeActive(true);
      setFocusedFilterIndex(0);
      setActiveFilterPinned(true);
      setActiveFilterId(null);
      document.querySelector<HTMLElement>('#filters-panel')?.focus();
    },
    onFocusToolbar: () => toolbarRef.current?.focus(),
    onFocusList: () => listRef.current?.focus(),
    onFocusPagination: () => paginationRef.current?.focus(),
    onFocusPreview: () => previewRef.current?.focus(),
    onFocusBulkActions: () => bulkActionsRef.current?.focus(),
    onEscape: () => {
      const activeElement = document.activeElement as HTMLElement | null;
      const isQueueSearchActive = Boolean(activeElement?.closest('.cg-toolbar .cds--search'));
      const isFilterSearchActive = Boolean(activeElement?.closest('.cg-filter-panel__header .cds--search'));
      const nestedInvestigationModalOpen = Boolean(document.querySelector('.cg-investigation-submodal'));
      if (columnsOpen) setColumnsOpen(false);
      else if (mergeOpen) setMergeOpen(false);
      else if (assignModalOpen) setAssignModalOpen(false);
      else if (statusModalOpen) setStatusModalOpen(false);
      else if (addTagModalOpen) setAddTagModalOpen(false);
      else if (drawerAssignOpen) setDrawerAssignOpen(false);
      else if (drawerStatusOpen) setDrawerStatusOpen(false);
      else if (severityModalOpen) setSeverityModalOpen(false);
      else if (reopenModalOpen) setReopenModalOpen(false);
      else if (nestedInvestigationModalOpen) return;
      else if (investigationInfoOpen) setInvestigationInfoOpen(false);
      else if (shortcutGuideOpen) setShortcutGuideOpen(false);
      else if (isQueueSearchActive) {
        (activeElement as HTMLElement | null)?.blur();
        queueSearchRef.current?.blur();
      } else if (isFilterSearchActive) {
        (activeElement as HTMLElement | null)?.blur();
        filterSearchRef.current?.blur();
        setFilterModeActive(true);
        setFocusedFilterIndex(0);
        setActiveFilterId(null);
        setActiveFilterPinned(false);
        document.querySelector<HTMLElement>('#filters-panel')?.focus();
      } else if (activeFilterId) {
        setActiveFilterId(null);
        setActiveFilterPinned(false);
      } else if (filterModeActive) {
        setFilterModeActive(false);
        setActiveFilterPinned(false);
      } else if (previewItemId) setPreviewItemId(null);
    },
    onFilterModeKey: (key, event) => {
      if (!filterModeActive) {
        return false;
      }

      const visibleFilter = visibleFilters[focusedFilterIndex];
      const activeFilter = visibleFilters.find((filter) => filter.id === activeFilterId);

      if (key === 'ArrowDown') {
        event.preventDefault();
        if (activeFilter) {
          setFocusedValueIndex((current) => Math.min(current + 1, activeFilter.values.length - 1));
        } else {
          setFocusedFilterIndex((current) => Math.min(current + 1, visibleFilters.length - 1));
        }
        return true;
      }
      if (key === 'ArrowUp') {
        event.preventDefault();
        if (activeFilter) {
          setFocusedValueIndex((current) => Math.max(current - 1, 0));
        } else {
          setFocusedFilterIndex((current) => Math.max(current - 1, 0));
        }
        return true;
      }
      if (key === 'ArrowLeft' && activeFilter) {
        event.preventDefault();
        setActiveFilterId(null);
        setActiveFilterPinned(false);
        return true;
      }
      if (key === 'Enter') {
        event.preventDefault();
        if (visibleFilter) {
          setActiveFilterId(visibleFilter.id);
          setActiveFilterPinned(true);
        }
        return true;
      }
      if (key === ' ') {
        if (activeFilter) {
          event.preventDefault();
          handleToggleFilterValue(activeFilter.id, activeFilter.values[focusedValueIndex]);
          return true;
        }
      }

      const shortcutMatchIndex = shortcutIndexFromKey(key, visibleFilters.length);
      if (shortcutMatchIndex >= 0) {
        event.preventDefault();
        setFocusedFilterIndex(shortcutMatchIndex);
        setActiveFilterId(visibleFilters[shortcutMatchIndex]?.id ?? null);
        setActiveFilterPinned(true);
        return true;
      }

      return false;
    },
  });

  return (
    <div className="cg-app">
      <AppHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <main id="main-content" className="cg-main">
        {activeTab === 'Overview' ? (
          <AlertsCaseOverview
            metrics={overviewMetrics}
            itemsByStatus={itemsByStatus}
            topRiskTypes={topRiskTypes}
            topSystems={topSystems}
            state={overviewState}
            partialSections={overviewState?.status === 'partial' ? ['metrics'] : []}
            onRetry={() => addToast('info', 'Overview refreshed', 'Retry is simulated in this prototype.')}
            onOpenWorkQueuePreset={(preset) => {
              setActiveTab('Work Queue');
              setQueueSearch('');
              setSelectedFilters({});
              setQueuePreset(preset as QueuePreset);
              setPage(1);
            }}
          />
        ) : null}

        {activeTab === 'Activity Log' ? (
          <ModuleActivityLog
            events={activityState?.status === 'empty' ? [] : moduleActivityEvents}
            loading={activityState?.status === 'loading'}
            error={activityState?.status === 'error'}
            partial={activityState?.status === 'partial'}
            noResults={activityState?.status === 'no-results'}
            onRetry={() => addToast('info', 'Activity log refreshed', 'Retry is simulated in this prototype.')}
            onOpenWorkItem={(itemId) => {
              setActiveTab('Work Queue');
              setQueuePreset(null);
              setPreviewItemId(itemId);
            }}
          />
        ) : null}

        {activeTab === 'Work Queue' ? (
          <>
            <WorkQueueHeader
              totalItems={filteredItems.length}
              criticalCount={stats.criticalCount}
              breachedCount={stats.breachedCount}
              unassignedCount={stats.unassignedCount}
              autoRefresh={autoRefresh}
              onAutoRefreshChange={setAutoRefresh}
            />
            <QueueToolbar
              segment={segment}
              counts={segmentCounts}
              searchValue={queueSearch}
              onSearchChange={setQueueSearch}
              onSegmentChange={setSegment}
              sortOptionId={sortOptionId}
              onSortChange={setSortOptionId}
              onOpenColumns={() => setColumnsOpen(true)}
            />
            <div className="cg-workspace">
              <FilterPanel
                sections={visibleSections}
                searchValue={filterSearch}
                onSearchChange={setFilterSearch}
                selectedFilters={selectedFilters}
                activeFilterId={activeFilterId}
                activeFilterPinned={activeFilterPinned}
                filterModeActive={filterModeActive}
                focusedFilterId={visibleFilters[focusedFilterIndex]?.id ?? null}
                focusedValueIndex={focusedValueIndex}
                onOpenFilter={handleOpenFilter}
                onCloseFilter={() => {
                  setActiveFilterId(null);
                  setActiveFilterPinned(false);
                }}
                onHoverExit={() => setActiveFilterId(null)}
                onToggleValue={handleToggleFilterValue}
                onRemoveValue={(filterId, value) => handleToggleFilterValue(filterId, value)}
                onClearAll={() => setSelectedFilters({})}
                shortcutLabelForIndex={shortcutLabel}
                metadataWarning={filterState?.status === 'partial' || filterState?.status === 'error'}
                onRetryMetadata={() => addToast('info', 'Filter metadata refreshed', 'Retry is simulated in this prototype.')}
              />
              <section className="cg-content-area">
                <div className="cg-content-meta">
                  <span>{SORT_LABELS[sortOptionId]}</span>
                  {queuePreset ? (
                    <span className="cg-queue-preset-indicator">
                      {formatQueuePreset(queuePreset)}
                      <Button kind="ghost" size="sm" onClick={() => setQueuePreset(null)}>
                        Clear preset
                      </Button>
                    </span>
                  ) : null}
                  {selectedIds.length > 0 ? (
                    <Tag type="blue">{selectedIds.length} selected</Tag>
                  ) : null}
                </div>
                {showShortcutOverlays ? (
                  <div className="cg-shortcut-overlays">
                    <span className="cg-overlay-hint cg-overlay-hint--toolbar">Shift+S Search</span>
                    <span className="cg-overlay-hint cg-overlay-hint--list">Shift+L List</span>
                    <span className="cg-overlay-hint cg-overlay-hint--pagination">G then P</span>
                    {previewItem ? <span className="cg-overlay-hint cg-overlay-hint--preview">Shift+P Preview</span> : null}
                    {selectedIds.length > 0 ? <span className="cg-overlay-hint cg-overlay-hint--bulk">Shift+B Bulk</span> : null}
                  </div>
                ) : null}
                <WorkQueueTable
                  items={pagedItems}
                  columns={columns}
                  selectedIds={selectedIds}
                  previewItemId={previewItemId}
                  loading={queueState?.status === 'loading'}
                  refreshing={queueState?.status === 'refreshing'}
                  error={queueState?.status === 'error'}
                  emptyKind={queueEmptyKind}
                  emptyContext={queueSearch || segment}
                  onRetry={() => addToast('info', 'Queue refreshed', 'Retry is simulated in this prototype.')}
                  onClearSearch={() => setQueueSearch('')}
                  onClearFilters={() => setSelectedFilters({})}
                  onClearPreset={() => setQueuePreset(null)}
                  onToggleSelect={(id) =>
                    setSelectedIds((current) =>
                      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
                    )
                  }
                  onToggleSelectAll={(checked) =>
                    setSelectedIds(checked ? pagedItems.map((item) => item.id) : [])
                  }
                  onOpenPreview={setPreviewItemId}
                />
                {selectedIds.length > 0 ? (
                  <div id="bulk-actions">
                    <BulkActionBar
                      selectedCount={selectedIds.length}
                      canConsolidate={canConsolidateSelection}
                      onAssign={() => setAssignModalOpen(true)}
                      onStatus={() => setStatusModalOpen(true)}
                      onConsolidate={() => {
                        setMergeReopenComment('');
                        setMergeOpen(true);
                      }}
                      onAddTag={() => setAddTagModalOpen(true)}
                      onClear={() => setSelectedIds([])}
                    />
                  </div>
                ) : null}
                {pagedItems.length > 0 && queueState?.status !== 'loading' && queueState?.status !== 'error' ? (
                  <QueuePagination
                    totalItems={sortedItems.length}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                ) : null}
              </section>
            </div>
            {previewItem ? (
              <div id="preview-drawer">
                <PreviewDrawer
                  item={previewItem}
                  currentAnalyst={CURRENT_ANALYST}
                  loading={previewSurfaceState?.status === 'loading'}
                  error={previewSurfaceState?.status === 'error'}
                  aiSummaryState={previewAiState?.status === 'loading' ? 'loading' : previewAiState?.status === 'error' ? 'error' : 'ready'}
                  onRetry={() => setPreviewItemId(null)}
                  onClose={() => setPreviewItemId(null)}
                  onAssignToMe={handleAssignToMe}
                  onReassign={openDrawerAssign}
                  onChangeStatus={openDrawerStatus}
                  onOpenInvestigation={() => openInvestigationWorkspace(previewItem.id)}
                  onChangeSeverity={openSeverityOverride}
                  onAddComment={() => {
                    setItemCommentDraft('');
                    setItemCommentDraftProvenance(undefined);
                    setCommentModalOpen(true);
                  }}
                  onEditTags={() => {
                    setEditableTags(previewItem.tags);
                    setNewTagDraft('');
                    setTagEditorOpen(true);
                  }}
                  onRenameCase={() => {
                    setRenameDraft(previewItem.title);
                    setRenameModalOpen(true);
                  }}
                  onReopenItem={() => openReopenModal('Investigating')}
                  onViewActivityLog={() => setActiveTab('Activity Log')}
                  onClassifyItem={() => openClassifyModal(previewItem)}
                  onReviewRelatedAlerts={() =>
                    openInvestigationWorkspace(previewItem.id, 'evidence')
                  }
                  onConsolidateHint={() => {
                    const related = items
                      .filter((entry) => entry.id !== previewItem.id && entry.item_type === 'alert' && entry.risk_type === previewItem.risk_type)
                      .slice(0, 2)
                      .map((entry) => entry.id);
                    setSelectedIds([previewItem.id, ...related]);
                    setMergeOpen(true);
                  }}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </main>

      <ColumnCustomizer
        open={columnsOpen}
        columns={columns}
        onClose={() => setColumnsOpen(false)}
        onApply={(nextColumns) => {
          setColumns(nextColumns);
          setColumnsOpen(false);
        }}
      />

      <ShortcutGuideModal open={shortcutGuideOpen} onClose={() => setShortcutGuideOpen(false)} />

      <MergeReviewModal
        open={mergeOpen}
        selectedItems={selectedItems}
        destinationOptions={selectedCases}
        destinationCaseId={destinationCaseId}
        proposedTitle={mergeSummary?.proposedTitle ?? 'Review selected items'}
        proposedSeverity={mergeSummary?.proposedSeverity ?? 'Medium'}
        recalculatedPriority={mergeSummary?.recalculatedPriority ?? 50}
        affectedSystems={mergeSummary?.affectedSystems ?? []}
        assignees={mergeSummary?.assignees ?? []}
        statuses={mergeSummary?.statuses ?? []}
        proposedStatus={mergeSummary?.proposedStatus ?? 'Triaged'}
        warnings={mergeSummary?.warnings ?? []}
        requiresReopenComment={mergeSummary?.requiresReopenComment ?? false}
        reopenComment={mergeReopenComment}
        onReopenCommentChange={setMergeReopenComment}
        onReopenCommentProvenanceChange={setMergeReopenCommentProvenance}
        onDestinationChange={setDestinationCaseId}
        onClose={() => {
          setMergeOpen(false);
          setMergeReopenComment('');
          setMergeReopenCommentProvenance(undefined);
        }}
        onSubmit={handleConsolidate}
      />

      <SelectionModal
        open={assignModalOpen}
        title="Assign items"
        variant="combobox"
        items={bulkAssignOptions}
        selectedItem={pendingAssignee}
        onSelect={setPendingAssignee}
        onClose={() => setAssignModalOpen(false)}
        onSubmit={handleApplyAssignment}
      />

      <SelectionModal
        open={statusModalOpen}
        title="Change status"
        variant="dropdown"
        items={[...workflowStatusOptions]}
        selectedItem={pendingStatus}
        onSelect={(value) => setPendingStatus(value as (typeof workflowStatusOptions)[number])}
        onClose={() => setStatusModalOpen(false)}
        onSubmit={handleApplyStatus}
      />

      <SelectionModal
        open={addTagModalOpen}
        title="Add tag"
        variant="dropdown"
        items={['Needs review', 'Data exfiltration', 'Public exposure', 'AI usage', 'False-positive candidate']}
        selectedItem={pendingTag}
        onSelect={setPendingTag}
        onClose={() => setAddTagModalOpen(false)}
        onSubmit={handleAddTag}
      />

      <SelectionModal
        open={drawerAssignOpen}
        title="Reassign item"
        variant="combobox"
        items={reassignOptions}
        selectedItem={pendingAssignee}
        onSelect={setPendingAssignee}
        onClose={() => setDrawerAssignOpen(false)}
        onSubmit={handleApplyDrawerAssignment}
      />

      <SelectionModal
        open={drawerStatusOpen}
        title="Change workflow status"
        variant="dropdown"
        items={[...workflowStatusOptions]}
        selectedItem={pendingStatus}
        onSelect={(value) => setPendingStatus(value as (typeof workflowStatusOptions)[number])}
        onClose={() => setDrawerStatusOpen(false)}
        onSubmit={handleApplyDrawerStatus}
      />

      <Modal
        open={severityModalOpen}
        modalHeading="Change severity"
        primaryButtonText="Apply override"
        secondaryButtonText="Cancel"
        primaryButtonDisabled={!severityComment.trim()}
        onRequestClose={() => setSeverityModalOpen(false)}
        onRequestSubmit={handleApplySeverityOverride}
      >
        <div className="cg-dialog-stack">
          <Dropdown
            id="severity-override"
            titleText="Severity"
            label="Choose a severity"
            items={severityOptions.map((entry) => ({ id: entry, label: entry }))}
            selectedItem={{ id: pendingSeverity, label: pendingSeverity }}
            itemToString={(item) => item?.label ?? ''}
            onChange={({ selectedItem: next }) => {
              if (next) {
                setPendingSeverity(next.label as (typeof severityOptions)[number]);
              }
            }}
          />
          <AISuggestedTextArea
            id="severity-comment"
            labelText="Why are you changing the severity?"
            placeholder="Explain the analyst override"
            aiSuggestion={previewItem ? buildAISuggestion('severity-override-reason', { item: previewItem }) : undefined}
            rows={4}
            value={severityComment}
            onChange={setSeverityComment}
            onProvenanceChange={setSeverityCommentProvenance}
          />
        </div>
      </Modal>

      <Modal
        open={reopenModalOpen}
        modalHeading="Reopen work item"
        primaryButtonText="Reopen"
        secondaryButtonText="Cancel"
        primaryButtonDisabled={!reopenComment.trim()}
        onRequestClose={() => setReopenModalOpen(false)}
        onRequestSubmit={handleConfirmReopen}
      >
        <div className="cg-dialog-stack">
          <p>This item will reopen as {reopenStatus}.</p>
          <AISuggestedTextArea
            id="reopen-comment"
            labelText="Why are you reopening this item?"
            placeholder="Add the required reopening comment"
            aiSuggestion={previewItem ? buildAISuggestion('reopen-reason', { item: previewItem }) : undefined}
            rows={4}
            value={reopenComment}
            onChange={setReopenComment}
            onProvenanceChange={setReopenCommentProvenance}
          />
        </div>
      </Modal>

      <InvestigationNoteModal
        open={commentModalOpen}
        value={itemCommentDraft}
        title="Add comment"
        primaryButtonText="Save comment"
        labelText="Comment"
        aiSuggestion={classificationTargetItem ? buildAISuggestion('general-comment', { item: classificationTargetItem }) : undefined}
        onChange={setItemCommentDraft}
        onDraftProvenanceChange={setItemCommentDraftProvenance}
        onClose={() => setCommentModalOpen(false)}
        onSubmit={() => {
          if (!classificationTargetItem || !itemCommentDraft.trim()) return;
          appendItemComment(classificationTargetItem.id, itemCommentDraft.trim(), CURRENT_ANALYST, itemCommentDraftProvenance);
          setCommentModalOpen(false);
          addToast('success', 'Comment saved', `Added a comment to ${classificationTargetItem.id}.`);
        }}
      />

      <Modal
        open={tagEditorOpen}
        modalHeading="Edit tags"
        primaryButtonText="Save tags"
        secondaryButtonText="Cancel"
        onRequestClose={() => setTagEditorOpen(false)}
        onRequestSubmit={() => {
          if (!classificationTargetItem) return;
          const normalized = [...new Set([...editableTags, ...(newTagDraft.trim() ? [newTagDraft.trim()] : [])])];
          updateTags(classificationTargetItem.id, normalized);
          setTagEditorOpen(false);
          addToast('success', 'Tags updated', `${classificationTargetItem.id} tags updated.`);
        }}
      >
        <div className="cg-dialog-stack">
          <div className="cg-checkbox-grid">
            {['Needs review', 'Data exfiltration', 'Public exposure', 'AI usage', 'False-positive candidate'].map((tag) => (
              <label key={tag} className="cg-tag-editor-row">
                <input
                  type="checkbox"
                  checked={editableTags.includes(tag)}
                  onChange={() =>
                    setEditableTags((current) =>
                      current.includes(tag) ? current.filter((entry) => entry !== tag) : [...current, tag],
                    )
                  }
                />
                <span>{tag}</span>
              </label>
            ))}
          </div>
          <TextArea
            id="new-tag-draft"
            labelText="Add tag"
            rows={2}
            value={newTagDraft}
            onChange={(event) => setNewTagDraft(event.currentTarget.value)}
          />
        </div>
      </Modal>

      <Modal
        open={renameModalOpen}
        modalHeading="Rename case"
        primaryButtonText="Save title"
        secondaryButtonText="Cancel"
        primaryButtonDisabled={!renameDraft.trim()}
        onRequestClose={() => setRenameModalOpen(false)}
        onRequestSubmit={() => {
          if (!classificationTargetItem || !renameDraft.trim()) return;
          renameItem(classificationTargetItem.id, renameDraft.trim());
          setRenameModalOpen(false);
          addToast('success', 'Case renamed', `${classificationTargetItem.id} renamed.`);
        }}
      >
        <TextArea
          id="rename-case-draft"
          labelText="Case title"
          rows={3}
          value={renameDraft}
          onChange={(event) => setRenameDraft(event.currentTarget.value)}
        />
      </Modal>

      <ClassifyItemModal
        open={classifyModalOpen}
        itemId={classificationTargetItem?.id ?? null}
        classification={pendingClassification}
        comment={classificationComment}
        commentSuggestion={classificationTargetItem ? buildAISuggestion('classification-comment', { item: classificationTargetItem, classification: pendingClassification, workspace: getOrCreateWorkspace(classificationTargetItem) }) : undefined}
        submitting={false}
        duplicateCaseId={duplicateCaseId}
        exceptionOwner={exceptionOwner}
        createTuningFeedback={createTuningFeedback}
        onClassificationChange={setPendingClassification}
        onCommentChange={setClassificationComment}
        onCommentProvenanceChange={setClassificationCommentProvenance}
        onDuplicateCaseIdChange={setDuplicateCaseId}
        onExceptionOwnerChange={setExceptionOwner}
        onCreateTuningFeedbackChange={setCreateTuningFeedback}
        onClose={() => setClassifyModalOpen(false)}
        onSubmit={handleSubmitClassification}
      />

      <ResolveItemModal
        open={resolveModalOpen}
        itemId={classificationTargetItem?.id ?? null}
        itemType={classificationTargetItem?.item_type ?? 'case'}
        classification={pendingClassification}
        resolutionSummary={resolutionSummary}
        rootCause={rootCause}
        remediationSummary={remediationSummary}
        residualRisk={residualRisk}
        finalComment={finalResolutionComment}
        monitoringRequired={monitoringRequired}
        childAlertHandling={childAlertHandling}
        detachedAlertIds={detachedAlertIds}
        includedAlerts={classificationTargetItem ? getOrCreateWorkspace(classificationTargetItem).alerts : []}
        recipients={['Data owner', 'Incident response', 'Compliance', 'Legal', 'Manager']}
        selectedRecipients={resolutionRecipients}
        warnings={resolutionWarnings}
        exceptionReason={exceptionReason}
        submitting={submissionScenario === 'resolution-submit-error'}
        errorMessage={submissionScenario === 'resolution-submit-error' ? 'The resolution record could not be saved. Review the entered details and retry.' : undefined}
        onRetry={handleSubmitResolution}
        suggestions={
          classificationTargetItem
            ? {
                resolutionSummary: buildAISuggestion('resolution-summary', { item: classificationTargetItem, workspace: getOrCreateWorkspace(classificationTargetItem), warnings: resolutionWarnings, classification: pendingClassification }),
                rootCause: buildAISuggestion('root-cause', { item: classificationTargetItem, workspace: getOrCreateWorkspace(classificationTargetItem), warnings: resolutionWarnings, classification: pendingClassification }),
                remediationSummary: buildAISuggestion('remediation-summary', { item: classificationTargetItem, workspace: getOrCreateWorkspace(classificationTargetItem), warnings: resolutionWarnings, classification: pendingClassification }),
                residualRisk: buildAISuggestion('residual-risk', { item: classificationTargetItem, workspace: getOrCreateWorkspace(classificationTargetItem), warnings: resolutionWarnings, classification: pendingClassification }),
                finalComment: buildAISuggestion('resolution-final-comment', { item: classificationTargetItem, workspace: getOrCreateWorkspace(classificationTargetItem), warnings: resolutionWarnings, classification: pendingClassification }),
                exceptionReason: buildAISuggestion('resolution-exception-reason', { item: classificationTargetItem, workspace: getOrCreateWorkspace(classificationTargetItem), warnings: resolutionWarnings, classification: pendingClassification }),
              }
            : undefined
        }
        onClassificationChange={setPendingClassification}
        onResolutionSummaryChange={setResolutionSummary}
        onRootCauseChange={setRootCause}
        onRemediationSummaryChange={setRemediationSummary}
        onResidualRiskChange={setResidualRisk}
        onFinalCommentChange={setFinalResolutionComment}
        onMonitoringRequiredChange={setMonitoringRequired}
        onChildAlertHandlingChange={setChildAlertHandling}
        onToggleDetachedAlert={(alertId) =>
          setDetachedAlertIds((current) =>
            current.includes(alertId) ? current.filter((entry) => entry !== alertId) : [...current, alertId],
          )
        }
        onToggleRecipient={(recipient) =>
          setResolutionRecipients((current) =>
            current.includes(recipient) ? current.filter((entry) => entry !== recipient) : [...current, recipient],
          )
        }
        onExceptionReasonChange={setExceptionReason}
        onFieldProvenanceChange={(field, provenance) => setResolutionFieldProvenance((current) => ({ ...current, [field]: provenance }))}
        onClose={() => setResolveModalOpen(false)}
        onSubmit={handleSubmitResolution}
      />

      <EscalateCaseModal
        open={escalateModalOpen}
        team={escalationTeam}
        urgency={escalationUrgency}
        reason={escalationReason}
        note={escalationNote}
        submitting={submissionScenario === 'escalation-submit-error'}
        errorMessage={submissionScenario === 'escalation-submit-error' ? 'The handoff could not be created. Preserve the current details and retry.' : undefined}
        onRetry={handleSubmitEscalation}
        reasonSuggestion={classificationTargetItem ? buildAISuggestion('escalation-reason', { item: classificationTargetItem, workspace: getOrCreateWorkspace(classificationTargetItem), selectedTeam: escalationTeam }) : undefined}
        noteSuggestion={classificationTargetItem ? buildAISuggestion('escalation-note', { item: classificationTargetItem, workspace: getOrCreateWorkspace(classificationTargetItem), selectedTeam: escalationTeam }) : undefined}
        taskOwner={escalationTaskOwner}
        notifyDataOwner={notifyDataOwner}
        teams={['Incident response', 'Data platform owner', 'Data owner', 'Compliance', 'Legal', 'HR / insider-risk team', 'Cloud platform team', 'Endpoint response team']}
        owners={['Priya Sharma', 'Arjun Rao', 'Sameer Khan', 'Kavya Nair', 'Unassigned']}
        onTeamChange={setEscalationTeam}
        onUrgencyChange={setEscalationUrgency}
        onReasonChange={setEscalationReason}
        onNoteChange={setEscalationNote}
        onReasonProvenanceChange={setEscalationReasonProvenance}
        onNoteProvenanceChange={setEscalationNoteProvenance}
        onTaskOwnerChange={setEscalationTaskOwner}
        onNotifyDataOwnerChange={setNotifyDataOwner}
        onClose={() => setEscalateModalOpen(false)}
        onSubmit={handleSubmitEscalation}
      />

      {investigationInfoOpen && investigationItem && investigationWorkspace ? (
        <InvestigationWorkspaceModal
          open={investigationInfoOpen}
          item={investigationItem}
          activeTab={activeInvestigationTab}
          currentAnalyst={CURRENT_ANALYST}
          workspace={investigationWorkspace}
          loading={investigationState?.status === 'loading'}
          error={investigationState?.status === 'error'}
          partial={investigationState?.status === 'partial'}
          summaryAIState={summaryAiSurfaceState?.status === 'loading' ? 'loading' : summaryAiSurfaceState?.status === 'error' ? 'error' : 'ready'}
          summaryEmptyTasks={demoUI.isDemoState('summary-empty-tasks')}
          timelineLoading={timelineState?.status === 'loading'}
          timelineError={timelineState?.status === 'error'}
          timelineEmpty={timelineState?.status === 'empty'}
          timelineNoResults={timelineState?.status === 'no-results'}
          evidenceLoading={evidenceState?.status === 'loading'}
          evidenceError={evidenceState?.status === 'error'}
          evidenceEmpty={evidenceState?.status === 'empty'}
          entitiesLoading={entitiesState?.status === 'loading'}
          entitiesEmpty={entitiesState?.status === 'empty' || demoUI.isDemoState('entities-empty')}
          actionsLoading={actionsState?.status === 'loading'}
          actionsEmpty={actionsState?.status === 'empty'}
          containmentError={containmentState?.status === 'error'}
          activityLoading={activityState?.status === 'loading'}
          activityError={activityState?.status === 'error'}
          activityEmpty={activityState?.status === 'empty'}
          activityNoResults={activityState?.status === 'no-results'}
          huntLoading={huntState?.status === 'loading'}
          huntError={huntState?.status === 'error'}
          huntEmpty={huntState?.status === 'empty'}
          huntNoResults={huntState?.status === 'no-results'}
          approvalSubmitError={submissionScenario === 'approval-submit-error'}
          autoOpenSourceSystemModal={Boolean(demoUI.sourceSystemScenario)}
          sourceSystemScenario={demoUI.sourceSystemScenario ?? 'source-system-info'}
          onClose={() => setInvestigationInfoOpen(false)}
          onTabChange={setActiveInvestigationTab}
          onAssignToMe={() => {
            const target = items.find((entry) => entry.id === investigationItem.id);
            if (!target) return;
            setPreviewItemId(target.id);
            setInvestigationItemId(target.id);
            assignItem(target.id, CURRENT_ANALYST);
            addToast('success', 'Assigned to you', `${target.id} is now assigned to ${CURRENT_ANALYST}.`);
          }}
          onReassign={() => {
            setPreviewItemId(investigationItem.id);
            setPendingAssignee(investigationItem.assignee);
            setDrawerAssignOpen(true);
          }}
          onChangeStatus={() => {
            setPreviewItemId(investigationItem.id);
            setPendingStatus(normalizeWorkflowStatus(investigationItem.status));
            setDrawerStatusOpen(true);
          }}
          onChangeSeverity={() => {
            setPreviewItemId(investigationItem.id);
            openSeverityOverride(investigationItem);
          }}
          onOpenClassify={() => openClassifyModal(investigationItem)}
          onOpenResolve={() => openResolveModal(investigationItem)}
          onOpenEscalate={openEscalateModal}
          onToast={addToast}
          onWorkspaceChange={(updater, options) => updateWorkspaceState(investigationItem, updater, options)}
          onSyncTimelineAttachment={(eventId) => syncTimelineAttachment(investigationItem.id, eventId)}
          onSyncEvidenceAttachment={(evidenceId) => syncEvidenceAttachment(investigationItem.id, evidenceId)}
          onDetachAlertFromCase={(alertId) => detachAlertFromCase(investigationItem.id, alertId)}
          onAttachAlertToCase={(alertId) => attachAlertToCase(investigationItem.id, alertId)}
          onMoveAlertToCase={(alertId, destinationCaseId, reason, draftProvenance) =>
            moveAlertBetweenCases(alertId, investigationItem.id, destinationCaseId, reason, CURRENT_ANALYST, draftProvenance)
          }
          availableCases={items
            .filter((entry) => entry.item_type === 'case')
            .map((entry) => ({
              id: entry.id,
              title: entry.title,
              status: entry.status,
              alertCount: entry.alert_count ?? entry.preview.alerts?.length ?? 0,
            }))}
        />
      ) : null}

      <div className="cg-toast-stack">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            kind={toast.kind}
            title={toast.title}
            subtitle={toast.subtitle}
            timeout={4000}
            onCloseButtonClick={() =>
              setToasts((current) => current.filter((entry) => entry.id !== toast.id))
            }
          />
        ))}
      </div>
    </div>
  );
}

function SelectionModal({
  open,
  title,
  variant,
  items,
  selectedItem,
  onSelect,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  variant: 'combobox' | 'dropdown';
  items: string[];
  selectedItem: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal
      open={open}
      modalHeading={title}
      primaryButtonText="Apply"
      secondaryButtonText="Cancel"
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <div className="cg-selection-modal">
        {variant === 'combobox' ? (
          <ComboBox
            id={title.toLowerCase().replaceAll(' ', '-')}
            titleText=""
            placeholder="Search or select a user"
            items={items.map((entry) => ({ id: entry, label: entry }))}
            selectedItem={{ id: selectedItem, label: selectedItem }}
            itemToString={(item) => item?.label ?? ''}
            onChange={({ selectedItem: next }) => {
              if (next) {
                onSelect(next.label);
              }
            }}
          />
        ) : (
          <Dropdown
            id={title.toLowerCase().replaceAll(' ', '-')}
            titleText=""
            label="Choose an option"
            items={items.map((entry) => ({ id: entry, label: entry }))}
            selectedItem={{ id: selectedItem, label: selectedItem }}
            itemToString={(item) => item?.label ?? ''}
            onChange={({ selectedItem: next }) => {
              if (next) {
                onSelect(next.label);
              }
            }}
          />
        )}
      </div>
    </Modal>
  );
}

function PlaceholderCard({ title, description }: { title: string; description: string }) {
  return (
    <section className="cg-placeholder-card">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

function resolveQueueEmptyKind({
  queueState,
  items,
  filteredBySegment,
  filteredItems,
  queueSearch,
  selectedFilters,
  queuePreset,
  segment,
}: {
  queueState?: AsyncViewState;
  items: WorkItem[];
  filteredBySegment: WorkItem[];
  filteredItems: WorkItem[];
  queueSearch: string;
  selectedFilters: Record<string, string[]>;
  queuePreset: QueuePreset | null;
  segment: QueueSegment;
}): 'empty' | 'search' | 'filters' | 'preset' | 'segment' | undefined {
  if (queueState?.status === 'empty') return 'empty';
  if (queueState?.status === 'no-results') return 'search';
  if (filteredItems.length > 0) return undefined;
  if (queueSearch.trim()) return 'search';
  if (Object.values(selectedFilters).some((values) => values.length > 0)) return 'filters';
  if (queuePreset) return 'preset';
  if (segment !== 'All' && filteredBySegment.length === 0) return 'segment';
  if (items.length === 0) return 'empty';
  return undefined;
}

function deriveComposition(item: WorkItem) {
  if (item.item_type === 'alert') {
    return 'Standalone alert';
  }
  if ((item.alert_count ?? 0) <= 1) {
    return 'Single-alert case';
  }
  if ((item.alert_count ?? 0) >= 6) {
    return 'Large case: 6+ alerts';
  }
  return 'Multi-alert case: 2–5 alerts';
}

function matchesSearch(item: WorkItem, query: string) {
  if (!query.trim()) return true;
  const haystack = [
    item.id,
    item.title,
    item.primary_actor,
    item.affected_systems.join(' '),
    item.key_resource,
    item.risk_type,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function matchesFilters(item: WorkItem, selectedFilters: Record<string, string[]>) {
  return Object.entries(selectedFilters).every(([filterId, values]) => {
    if (!values.length) return true;
    return values.some((value) => filterValueMatches(item, filterId, value));
  });
}

function filterValueMatches(item: WorkItem, filterId: string, value: string) {
  switch (filterId) {
    case 'priority':
      if (value.startsWith('P')) return item.priority.startsWith(value.split(' ')[0]);
      if (value === 'Unscored') return item.priority_score === 0;
      if (value === 'Score 86–100') return item.priority_score >= 86;
      if (value === 'Score 51–85') return item.priority_score >= 51 && item.priority_score <= 85;
      if (value === 'Score 16–50') return item.priority_score >= 16 && item.priority_score <= 50;
      return item.priority_score <= 15;
    case 'severity':
      return item.severity === value;
    case 'status':
      return item.status === value;
    case 'sla':
      return matchSla(item.sla, value);
    case 'assignee':
      if (value === 'Assigned to me') return item.assignee === CURRENT_ANALYST;
      if (value === 'My team') return ['Priya Sharma', 'Arjun Rao', 'Sameer Khan', 'Kavya Nair'].includes(item.assignee);
      return item.assignee === value;
    case 'systems':
      if (value === 'All systems') return true;
      return item.affected_systems.includes(value);
    case 'risk_type':
      return item.risk_type === value;
    case 'data_sensitivity':
      return item.data_sensitivity === value;
    case 'resource_criticality':
      return item.resource_criticality === value;
    case 'containment':
      return item.containment === value;
    case 'destination_exposure_target':
      return (item.destination_exposure_target || '').includes(value);
    case 'detection_time':
      return matchDetectionTime(item.detection_time, value);
    case 'last_activity':
      return matchLastActivity(item.last_activity, value);
    case 'actor_entity_type':
      return item.actor_entity_type === value;
    case 'detection_source':
      return item.detection_source.includes(value);
    case 'policy_rule':
      return item.policy_rule === value;
    case 'work_item_composition':
      if (value === 'AI-suggested grouping') return item.item_type === 'case';
      return item.derivedComposition === value;
    case 'tags':
      return item.tags.includes(value);
    default:
      return true;
  }
}

function sortItems(sortOptionId: SortOptionId) {
  const severityRank: Record<string, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
    Informational: 0,
  };
  return (left: WorkItem, right: WorkItem) => {
    switch (sortOptionId) {
      case 'priority-high':
        return right.priority_score - left.priority_score;
      case 'priority-low':
        return left.priority_score - right.priority_score;
      case 'severity-high':
        return severityRank[right.severity] - severityRank[left.severity];
      case 'sla-urgent':
        return parseSla(left.sla) - parseSla(right.sla);
      case 'last-activity':
        return parseLastActivity(left.last_activity) - parseLastActivity(right.last_activity);
      case 'detection-time':
        return parseDetectionTime(right.detection_time) - parseDetectionTime(left.detection_time);
      case 'title':
        return left.title.localeCompare(right.title);
      default:
        return 0;
    }
  };
}

function parseSla(sla: string) {
  const lower = sla.toLowerCase();
  if (lower.includes('breached')) return -10;
  const hoursMatch = lower.match(/(\d+)h/);
  const minutesMatch = lower.match(/(\d+)m/);
  return (hoursMatch ? Number(hoursMatch[1]) * 60 : 0) + (minutesMatch ? Number(minutesMatch[1]) : 0);
}

function parseLastActivity(value: string) {
  const lower = value.toLowerCase();
  const minuteMatch = lower.match(/(\d+)m/);
  const hourMatch = lower.match(/(\d+)h/);
  const dayMatch = lower.match(/(\d+)d/);
  if (minuteMatch) return Number(minuteMatch[1]);
  if (hourMatch) return Number(hourMatch[1]) * 60;
  if (dayMatch) return Number(dayMatch[1]) * 1440;
  if (lower.includes('just now')) return 0;
  return 99999;
}

function parseDetectionTime(value: string) {
  const now = new Date();
  if (value.startsWith('Today')) {
    const [, time] = value.split(',').map((entry) => entry.trim());
    return new Date(`${now.toDateString()} ${time}`).getTime();
  }
  if (value.startsWith('Yesterday')) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const [, time] = value.split(',').map((entry) => entry.trim());
    return new Date(`${yesterday.toDateString()} ${time}`).getTime();
  }
  return new Date(value).getTime() || 0;
}

function matchSla(sla: string, value: string) {
  const minutes = parseSla(sla);
  if (value === 'Breached') return minutes <= 0;
  if (value === 'Due in <15 min') return minutes > 0 && minutes < 15;
  if (value === 'Due in <1 hour') return minutes >= 15 && minutes < 60;
  if (value === 'Due in <4 hours') return minutes >= 60 && minutes < 240;
  if (value === 'Due today') return minutes >= 240 && minutes < 1440;
  if (value === 'Within SLA') return minutes >= 0;
  return !sla;
}

function matchDetectionTime(value: string, filterValue: string) {
  const delta = Date.now() - parseDetectionTime(value);
  const hours = delta / (1000 * 60 * 60);
  if (filterValue === 'Last 15 minutes') return delta <= 15 * 60 * 1000;
  if (filterValue === 'Last hour') return hours <= 1;
  if (filterValue === 'Last 4 hours') return hours <= 4;
  if (filterValue === 'Last 24 hours') return hours <= 24;
  if (filterValue === 'Last 7 days') return hours <= 24 * 7;
  if (filterValue === 'Last 30 days') return hours <= 24 * 30;
  return true;
}

function matchLastActivity(value: string, filterValue: string) {
  const minutes = parseLastActivity(value);
  if (filterValue === 'Active now (<5 min)') return minutes < 5;
  if (filterValue === 'Within 15 min') return minutes <= 15;
  if (filterValue === 'Within 1 hour') return minutes <= 60;
  if (filterValue === 'Within 4 hours') return minutes <= 240;
  if (filterValue === 'Within 24 hours') return minutes <= 1440;
  return minutes > 1440;
}

function shortcutLabel(index: number) {
  if (index < 9) return String(index + 1);
  if (index === 9) return '0';
  return String.fromCharCode(65 + index - 10);
}

function shortcutIndexFromKey(key: string, visibleCount: number) {
  const lower = key.toLowerCase();
  if (/^[1-9]$/.test(lower)) return Number(lower) - 1;
  if (lower === '0') return 9;
  const code = lower.charCodeAt(0);
  if (code >= 97 && code <= 122) {
    const index = 10 + code - 97;
    return index < visibleCount ? index : -1;
  }
  return -1;
}

function buildMergeSummary(selectedItems: WorkItem[], items: WorkItem[], destinationCaseId: string | null) {
  if (selectedItems.length < 2) {
    return null;
  }
  const destinationCase = items.find((item) => item.id === destinationCaseId && item.item_type === 'case') ?? null;
  const alerts = selectedItems.flatMap((item) =>
    item.item_type === 'alert'
      ? [item]
      : item.preview.alerts?.map((alert) => ({
          ...item,
          id: alert.id,
          title: alert.title,
          priority: alert.priority,
          severity: alert.severity,
        })) ?? [],
  );
  const affectedSystems = [...new Set(selectedItems.flatMap((item) => item.affected_systems))];
  const assignees = [...new Set(selectedItems.map((item) => item.assignee))];
  const statuses = [...new Set(selectedItems.map((item) => item.status))];
  const warnings = [];
  if (assignees.length > 1) warnings.push('Selected items have different assignees.');
  if (statuses.length > 1) warnings.push('Selected items have different workflow statuses.');
  const proposedStatus = rollupMergedStatus(selectedItems, destinationCase);
  const requiresReopenComment =
    normalizeWorkflowStatus(destinationCase?.status) === 'Resolved' &&
    selectedItems.some((item) => normalizeWorkflowStatus(item.status) !== 'Resolved');
  if (requiresReopenComment) {
    warnings.push('Open work is being merged into a resolved case. This action reopens the destination case.');
  }

  const highestSeverity = pickHighestSeverity(selectedItems.map((item) => item.severity));
  const destinationTargets = [...new Set(selectedItems.map((item) => item.destination_exposure_target).filter(Boolean))];
  const containsNotContained = selectedItems.some((item) => item.containment === 'Not contained');
  const highestDataSensitivity = pickHighestSensitivity(selectedItems.map((item) => item.data_sensitivity));
  const highestResourceCriticality = pickHighestCriticality(selectedItems.map((item) => item.resource_criticality));
  const recalculatedPriority = Math.min(
    100,
    Math.max(...selectedItems.map((item) => item.priority_score)) +
      Math.min(12, affectedSystems.length * 2) +
      (['Restricted', 'Customer PII', 'PCI', 'PHI', 'Credentials / secrets'].includes(highestDataSensitivity) ? 8 : 0) +
      (destinationTargets.some((entry) => entry.includes('Public') || entry.includes('External')) ? 8 : 0) +
      (containsNotContained ? 6 : 0),
  );

  return {
    destinationCase,
    resultingAlertCount: alerts.length,
    proposedTitle:
      destinationCase?.title ??
      `${selectedItems[0].risk_type} across ${affectedSystems.slice(0, 3).join(', ')}`,
    proposedSeverity: highestSeverity,
    recalculatedPriority,
    affectedSystems,
    assignees,
    statuses,
    proposedStatus,
    warnings,
    requiresReopenComment,
    destinationTargets,
    containsNotContained,
    highestDataSensitivity,
    highestResourceCriticality,
    keyResource: [...new Set(selectedItems.map((item) => item.key_resource))].join('; '),
    primaryActor: [...new Set(selectedItems.map((item) => item.primary_actor))].join(', '),
    affectedData: [...new Set(selectedItems.map((item) => item.affected_data_volume || item.preview.affected_data))].join('; '),
    actors: [...new Set(selectedItems.flatMap((item) => item.preview.actors_entities))],
    alertIds: alerts.map((alert) => alert.id),
    alertPreviewItems: alerts.slice(0, 8).map((alert) => ({
      id: alert.id,
      title: alert.title,
      severity: alert.severity,
      priority: alert.priority,
    })),
    primaryRiskType: selectedItems[0].risk_type,
  };
}

function pickHighestSeverity(values: string[]) {
  const ordered = ['Informational', 'Low', 'Medium', 'High', 'Critical'];
  return values.sort((left, right) => ordered.indexOf(right) - ordered.indexOf(left))[0] ?? 'Medium';
}

function pickHighestSensitivity(values: string[]) {
  const ordered = [
    'Unclassified',
    'Public',
    'Internal',
    'Confidential',
    'Financial records',
    'Employee PII',
    'Customer PII',
    'PCI',
    'PHI',
    'Credentials / secrets',
    'Restricted',
  ];
  return values.sort((left, right) => ordered.indexOf(right) - ordered.indexOf(left))[0] ?? 'Internal';
}

function pickHighestCriticality(values: string[]) {
  const ordered = ['Unclassified', 'Low', 'Medium', 'High', 'Production critical', 'Crown jewel'];
  return values.sort((left, right) => ordered.indexOf(right) - ordered.indexOf(left))[0] ?? 'Medium';
}

function priorityBand(score: number) {
  if (score >= 86) return 1;
  if (score >= 51) return 2;
  if (score >= 16) return 3;
  return 4;
}

function normalizeWorkflowStatus(status?: string | null): (typeof workflowStatusOptions)[number] {
  if (status === 'Assigned') return 'Investigating';
  if (status === 'Contained') return 'Monitoring';
  if (status && workflowStatusOptions.includes(status as (typeof workflowStatusOptions)[number])) {
    return status as (typeof workflowStatusOptions)[number];
  }
  return 'Triaged';
}

function rollupMergedStatus(
  selectedItems: WorkItem[],
  destinationCase: WorkItem | null,
): (typeof workflowStatusOptions)[number] {
  const openStatuses = selectedItems
    .map((item) => normalizeWorkflowStatus(item.status))
    .filter((status) => status !== 'Resolved');

  if (!openStatuses.length) {
    return 'Resolved';
  }

  if (selectedItems.some((item) => normalizeWorkflowStatus(item.status) === 'New')) {
    return 'Triaged';
  }

  if (normalizeWorkflowStatus(destinationCase?.status) === 'Resolved') {
    return 'Investigating';
  }

  const workflowOrder: Array<(typeof workflowStatusOptions)[number]> = [
    'New',
    'Triaged',
    'Investigating',
    'Awaiting approval',
    'Remediating',
    'Monitoring',
    'Resolved',
  ];
  const ranks = new Map(workflowOrder.map((status, index) => [status, index]));

  return openStatuses.reduce<(typeof workflowStatusOptions)[number]>((leastProgressed, status) => {
    const currentRank = ranks.get(status) ?? 99;
    const leastRank = ranks.get(leastProgressed) ?? 99;
    return currentRank < leastRank ? status : leastProgressed;
  }, openStatuses[0]);
}

function matchesQueuePreset(
  item: WorkItem,
  preset: QueuePreset | null,
  workflowStateByItemId: Record<string, { workspace?: { actions: Array<{ currentState: string }> } }>,
) {
  if (!preset) return true;
  const actions = workflowStateByItemId[item.id]?.workspace?.actions ?? [];
  if (preset === 'critical-open') return item.severity === 'Critical' && item.status !== 'Resolved';
  if (preset === 'sla-breached') return parseSla(item.sla) <= 0;
  if (preset === 'unassigned-p1') return item.assignee === 'Unassigned' && /^P1/.test(item.priority);
  if (preset === 'active-exposures') return /active exposure|not contained/i.test(item.containment);
  if (preset === 'pending-approvals') return actions.some((action) => action.currentState === 'Pending approval');
  if (preset === 'failed-actions') return actions.some((action) => action.currentState === 'Failed');
  return true;
}

function formatQueuePreset(preset: QueuePreset) {
  if (preset === 'critical-open') return 'Critical open';
  if (preset === 'sla-breached') return 'SLA breached';
  if (preset === 'unassigned-p1') return 'Unassigned P1';
  if (preset === 'active-exposures') return 'Active exposures';
  if (preset === 'pending-approvals') return 'Pending approvals';
  return 'Failed actions';
}

export default App;
