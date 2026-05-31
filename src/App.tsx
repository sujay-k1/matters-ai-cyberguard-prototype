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
import { BulkActionBar } from './components/BulkActionBar';
import { ColumnCustomizer } from './components/ColumnCustomizer';
import { FilterPanel } from './components/FilterPanel';
import { MergeReviewModal } from './components/MergeReviewModal';
import { PreviewDrawer } from './components/PreviewDrawer';
import { QueuePagination } from './components/QueuePagination';
import { QueueToolbar } from './components/QueueToolbar';
import { ShortcutGuideModal } from './components/ShortcutGuideModal';
import { WorkQueueHeader } from './components/WorkQueueHeader';
import { WorkQueueTable } from './components/WorkQueueTable';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
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

  const [items, setItems] = useState<WorkItem[]>(baseItems);
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
  const [drawerAssignOpen, setDrawerAssignOpen] = useState(false);
  const [drawerStatusOpen, setDrawerStatusOpen] = useState(false);
  const [severityModalOpen, setSeverityModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [pendingAssignee, setPendingAssignee] = useState(bulkAssignOptions[0]);
  const [pendingStatus, setPendingStatus] = useState<(typeof workflowStatusOptions)[number]>('Triaged');
  const [pendingTag, setPendingTag] = useState('Needs review');
  const [pendingSeverity, setPendingSeverity] = useState<(typeof severityOptions)[number]>('High');
  const [severityComment, setSeverityComment] = useState('');
  const [reopenComment, setReopenComment] = useState('');
  const [reopenStatus, setReopenStatus] = useState<(typeof workflowStatusOptions)[number]>('Investigating');
  const [mergeReopenComment, setMergeReopenComment] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [destinationCaseId, setDestinationCaseId] = useState<string | null>(null);
  const [showShortcutOverlays, setShowShortcutOverlays] = useState(false);

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
    return filteredBySegment.filter((item) => matchesFilters(item, selectedFilters) && matchesSearch(item, queueSearch));
  }, [filteredBySegment, queueSearch, selectedFilters]);

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
      All: items.filter((item) => matchesFilters(item, selectedFilters) && matchesSearch(item, queueSearch)).length,
      Cases: items.filter((item) => item.item_type === 'case' && matchesFilters(item, selectedFilters) && matchesSearch(item, queueSearch)).length,
      Alerts: items.filter((item) => item.item_type === 'alert' && matchesFilters(item, selectedFilters) && matchesSearch(item, queueSearch)).length,
    }),
    [items, queueSearch, selectedFilters],
  );

  const previewItem = items.find((item) => item.id === previewItemId) ?? null;
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const selectedCases = selectedItems.filter((item) => item.item_type === 'case');

  const mergeSummary = useMemo(() => buildMergeSummary(selectedItems, items, destinationCaseId), [destinationCaseId, items, selectedItems]);
  const canConsolidateSelection = selectedItems.length >= 2;

  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get('state');
    if (!state) {
      return;
    }

    if (state === 'preview') {
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
    }
  }, [items]);

  useEffect(() => {
    setPage(1);
  }, [queueSearch, selectedFilters, segment, sortOptionId]);

  useEffect(() => {
    setItems(baseItems);
  }, [baseItems]);

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

  const updateItem = (itemId: string, updater: (item: WorkItem) => WorkItem) => {
    setItems((current) => current.map((item) => (item.id === itemId ? updater(item) : item)));
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

  const openSeverityOverride = () => {
    if (!previewItem) return;
    setPendingSeverity((previewItem.analystSeverityOverride?.severity ?? previewItem.severity) as (typeof severityOptions)[number]);
    setSeverityComment('');
    setSeverityModalOpen(true);
  };

  const openReopenModal = (nextStatus: (typeof workflowStatusOptions)[number] = 'Investigating') => {
    setReopenStatus(nextStatus);
    setReopenComment('');
    setReopenModalOpen(true);
  };

  const handleAssignToMe = () => {
    if (!previewItem) return;
    updateItem(previewItem.id, (item) => ({
      ...item,
      assignee: CURRENT_ANALYST,
      preview: {
        ...item.preview,
        identity_and_urgency: {
          ...item.preview.identity_and_urgency,
          assignee: CURRENT_ANALYST,
        },
      },
      localHistory: [...(item.localHistory ?? []), `Assigned to ${CURRENT_ANALYST}`],
    }));
    addToast('success', 'Assigned to you', `${previewItem.id} is now assigned to ${CURRENT_ANALYST}.`);
  };

  const handleApplyDrawerAssignment = () => {
    if (!previewItem) return;
    updateItem(previewItem.id, (item) => ({
      ...item,
      assignee: pendingAssignee,
      preview: {
        ...item.preview,
        identity_and_urgency: {
          ...item.preview.identity_and_urgency,
          assignee: pendingAssignee,
        },
      },
      localHistory: [...(item.localHistory ?? []), `Reassigned to ${pendingAssignee}`],
    }));
    setDrawerAssignOpen(false);
    addToast('success', 'Assignment updated', `${previewItem.id} is now assigned to ${pendingAssignee}.`);
  };

  const applyStatusChange = (itemId: string, nextStatus: (typeof workflowStatusOptions)[number], comment?: string) => {
    updateItem(itemId, (item) => ({
      ...item,
      status: nextStatus,
      reopenComment: comment ?? item.reopenComment,
      preview: {
        ...item.preview,
        identity_and_urgency: {
          ...item.preview.identity_and_urgency,
          status: nextStatus,
        },
      },
      localHistory: [
        ...(item.localHistory ?? []),
        comment ? `${item.id} reopened as ${nextStatus}: ${comment}` : `Status changed to ${nextStatus}`,
      ],
    }));
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
    applyStatusChange(previewItem.id, reopenStatus, reopenComment.trim());
    setReopenModalOpen(false);
    addToast('success', `${previewItem.id} reopened`, `${previewItem.id} reopened as ${reopenStatus}.`);
  };

  const handleApplySeverityOverride = () => {
    if (!previewItem || !severityComment.trim()) return;
    const previousSeverity = previewItem.analystSeverityOverride?.previousSeverity ?? previewItem.severity;
    updateItem(previewItem.id, (item) => ({
      ...item,
      severity: pendingSeverity,
      analystSeverityOverride: {
        severity: pendingSeverity,
        comment: severityComment.trim(),
        previousSeverity,
      },
      preview: {
        ...item.preview,
        identity_and_urgency: {
          ...item.preview.identity_and_urgency,
          severity: pendingSeverity,
        },
      },
      localHistory: [...(item.localHistory ?? []), `Severity overridden to ${pendingSeverity}: ${severityComment.trim()}`],
    }));
    setSeverityModalOpen(false);
    addToast('success', 'Severity override applied', `${previewItem.id} severity changed to ${pendingSeverity}.`);
  };

  const notifyPlaceholderAction = (title: string, subtitle: string) => {
    addToast('info', title, subtitle);
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
    setItems((current) =>
      current.map((item) =>
        selectedIds.includes(item.id)
          ? {
              ...item,
              assignee: targetAssignee,
              preview: {
                ...item.preview,
                identity_and_urgency: {
                  ...item.preview.identity_and_urgency,
                  assignee: targetAssignee,
                },
              },
            }
          : item,
      ),
    );
    setAssignModalOpen(false);
    addToast('success', 'Assignment updated', `Assigned ${selectedIds.length} items to ${targetAssignee}.`);
  };

  const handleApplyStatus = () => {
    setItems((current) =>
      current.map((item) =>
        selectedIds.includes(item.id)
          ? {
              ...item,
              status: pendingStatus,
              preview: {
                ...item.preview,
                identity_and_urgency: {
                  ...item.preview.identity_and_urgency,
                  status: pendingStatus,
                },
              },
            }
          : item,
      ),
    );
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
      if (columnsOpen) setColumnsOpen(false);
      else if (mergeOpen) setMergeOpen(false);
      else if (assignModalOpen) setAssignModalOpen(false);
      else if (statusModalOpen) setStatusModalOpen(false);
      else if (addTagModalOpen) setAddTagModalOpen(false);
      else if (drawerAssignOpen) setDrawerAssignOpen(false);
      else if (drawerStatusOpen) setDrawerStatusOpen(false);
      else if (severityModalOpen) setSeverityModalOpen(false);
      else if (reopenModalOpen) setReopenModalOpen(false);
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
          <PlaceholderCard
            title="Overview"
            description="Overview will summarize operational activity after downstream workflows are finalized."
          />
        ) : null}

        {activeTab === 'Activity Log' ? (
          <PlaceholderCard
            title="Activity Log"
            description="Activity Log will provide an audit-grade record of analyst, AI, and system actions."
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
              />
              <section className="cg-content-area">
                <div className="cg-content-meta">
                  <span>{SORT_LABELS[sortOptionId]}</span>
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
              </section>
            </div>
            {previewItem ? (
              <div id="preview-drawer">
                <PreviewDrawer
                  item={previewItem}
                  currentAnalyst={CURRENT_ANALYST}
                  onClose={() => setPreviewItemId(null)}
                  onAssignToMe={handleAssignToMe}
                  onReassign={openDrawerAssign}
                  onChangeStatus={openDrawerStatus}
                  onOpenInvestigation={() => setInvestigationInfoOpen(true)}
                  onChangeSeverity={openSeverityOverride}
                  onAddComment={() =>
                    notifyPlaceholderAction('Comment capture', 'Comment workflows will be added in the next phase.')
                  }
                  onEditTags={() =>
                    notifyPlaceholderAction('Tag editing', 'Use the bulk Add tag flow to update tags in this prototype.')
                  }
                  onRenameCase={() =>
                    notifyPlaceholderAction('Rename case', 'Case renaming will be added in the next phase.')
                  }
                  onReopenItem={() => openReopenModal('Investigating')}
                  onViewActivityLog={() =>
                    notifyPlaceholderAction('Activity log', 'Open the Activity Log tab for the lightweight audit placeholder.')
                  }
                  onClassifyItem={() =>
                    notifyPlaceholderAction('Classification', 'Classification controls are intentionally deferred in this prototype.')
                  }
                  onReviewRelatedAlerts={() =>
                    notifyPlaceholderAction('Related alerts', 'Review related alerts in the queue before consolidating them into a case.')
                  }
                  onConsolidateHint={() =>
                    notifyPlaceholderAction('Consolidate into case', 'Select related queue items to consolidate them into a case.')
                  }
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
        onDestinationChange={setDestinationCaseId}
        onClose={() => {
          setMergeOpen(false);
          setMergeReopenComment('');
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
          <TextArea
            id="severity-comment"
            labelText="Why are you changing the severity?"
            placeholder="Explain the analyst override"
            rows={4}
            value={severityComment}
            onChange={(event) => setSeverityComment(event.currentTarget.value)}
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
          <TextArea
            id="reopen-comment"
            labelText="Why are you reopening this item?"
            placeholder="Add the required reopening comment"
            rows={4}
            value={reopenComment}
            onChange={(event) => setReopenComment(event.currentTarget.value)}
          />
        </div>
      </Modal>

      <Modal
        open={investigationInfoOpen}
        modalHeading="Investigation workflow"
        passiveModal
        onRequestClose={() => setInvestigationInfoOpen(false)}
      >
        Investigation workflow will be designed in the next phase.
      </Modal>

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

export default App;
