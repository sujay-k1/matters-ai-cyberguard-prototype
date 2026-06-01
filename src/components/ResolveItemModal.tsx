import { Checkbox, Dropdown, Modal } from '@carbon/react';
import type { IncludedAlertItem, WorkItemClassification } from '../types/investigation';
import type { DraftProvenance } from '../types/ai';
import { AISuggestedTextArea } from './AISuggestedTextArea';

const CLASSIFICATIONS: WorkItemClassification[] = [
  'True positive — malicious activity',
  'True positive — policy violation',
  'Expected business activity',
  'False positive',
  'Duplicate',
  'Accepted risk',
  'Needs monitoring',
];

interface ResolveItemModalProps {
  open: boolean;
  itemId: string | null;
  itemType: 'case' | 'alert';
  classification: WorkItemClassification;
  resolutionSummary: string;
  rootCause: string;
  remediationSummary: string;
  residualRisk: string;
  finalComment: string;
  monitoringRequired: boolean;
  childAlertHandling: 'resolve-all' | 'detach-selected';
  detachedAlertIds: string[];
  includedAlerts: IncludedAlertItem[];
  recipients: string[];
  selectedRecipients: string[];
  warnings: string[];
  exceptionReason: string;
  suggestions?: Partial<Record<'resolutionSummary' | 'rootCause' | 'remediationSummary' | 'residualRisk' | 'finalComment' | 'exceptionReason', string>>;
  fieldProvenance?: Partial<Record<'resolutionSummary' | 'rootCause' | 'remediationSummary' | 'residualRisk' | 'finalComment' | 'exceptionReason', DraftProvenance>>;
  onClassificationChange: (value: WorkItemClassification) => void;
  onResolutionSummaryChange: (value: string) => void;
  onRootCauseChange: (value: string) => void;
  onRemediationSummaryChange: (value: string) => void;
  onResidualRiskChange: (value: string) => void;
  onFinalCommentChange: (value: string) => void;
  onMonitoringRequiredChange: (checked: boolean) => void;
  onChildAlertHandlingChange: (value: 'resolve-all' | 'detach-selected') => void;
  onToggleDetachedAlert: (alertId: string) => void;
  onToggleRecipient: (recipient: string) => void;
  onExceptionReasonChange: (value: string) => void;
  onFieldProvenanceChange?: (field: 'resolutionSummary' | 'rootCause' | 'remediationSummary' | 'residualRisk' | 'finalComment' | 'exceptionReason', provenance: DraftProvenance) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function ResolveItemModal(props: ResolveItemModalProps) {
  const {
    open,
    itemId,
    itemType,
    classification,
    resolutionSummary,
    rootCause,
    remediationSummary,
    residualRisk,
    finalComment,
    monitoringRequired,
    childAlertHandling,
    detachedAlertIds,
    includedAlerts,
    recipients,
    selectedRecipients,
    warnings,
    exceptionReason,
    suggestions,
    onClassificationChange,
    onResolutionSummaryChange,
    onRootCauseChange,
    onRemediationSummaryChange,
    onResidualRiskChange,
    onFinalCommentChange,
    onMonitoringRequiredChange,
    onChildAlertHandlingChange,
    onToggleDetachedAlert,
    onToggleRecipient,
    onExceptionReasonChange,
    onFieldProvenanceChange,
    onClose,
    onSubmit,
  } = props;

  const exceptionRequired = warnings.length > 0;
  const rootCauseOptional = classification === 'False positive' || classification === 'Duplicate';
  const remediationOptional = classification === 'False positive' || classification === 'Duplicate';
  const disabled =
    !classification ||
    !resolutionSummary.trim() ||
    !residualRisk.trim() ||
    !finalComment.trim() ||
    (!rootCauseOptional && !rootCause.trim()) ||
    (!remediationOptional && !remediationSummary.trim()) ||
    (itemType === 'case' && childAlertHandling === 'detach-selected' && detachedAlertIds.length === 0) ||
    (exceptionRequired && !exceptionReason.trim());

  return (
    <Modal
      open={open}
      className="cg-investigation-submodal"
      modalHeading={itemId ? `Resolve ${itemId}` : 'Resolve item'}
      primaryButtonText={exceptionRequired ? 'Resolve with exception' : 'Resolve item'}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={disabled}
      selectorPrimaryFocus="#resolve-summary"
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <div className="cg-dialog-stack">
        {warnings.length ? (
          <div className="cg-warning-list">
            <strong>Resolution warnings</strong>
            <ul>
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <Dropdown
          id="resolve-classification"
          titleText="Classification"
          label="Select classification"
          items={CLASSIFICATIONS.map((entry) => ({ id: entry, label: entry }))}
          selectedItem={{ id: classification, label: classification }}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => selectedItem && onClassificationChange(selectedItem.id as WorkItemClassification)}
        />
        <AISuggestedTextArea id="resolve-summary" labelText="Resolution summary" placeholder="Summarize the incident outcome and final state" aiSuggestion={suggestions?.resolutionSummary} rows={3} value={resolutionSummary} onChange={onResolutionSummaryChange} onProvenanceChange={(value) => onFieldProvenanceChange?.('resolutionSummary', value)} />
        <AISuggestedTextArea id="resolve-root-cause" labelText="Root cause" placeholder="Describe the underlying cause" aiSuggestion={suggestions?.rootCause} rows={3} value={rootCause} onChange={onRootCauseChange} onProvenanceChange={(value) => onFieldProvenanceChange?.('rootCause', value)} />
        <AISuggestedTextArea id="resolve-remediation" labelText="Remediation summary" placeholder="Describe the remediation steps completed" aiSuggestion={suggestions?.remediationSummary} rows={3} value={remediationSummary} onChange={onRemediationSummaryChange} onProvenanceChange={(value) => onFieldProvenanceChange?.('remediationSummary', value)} />
        <AISuggestedTextArea id="resolve-risk" labelText="Residual risk" placeholder="Describe any remaining risk or monitoring needs" aiSuggestion={suggestions?.residualRisk} rows={3} value={residualRisk} onChange={onResidualRiskChange} onProvenanceChange={(value) => onFieldProvenanceChange?.('residualRisk', value)} />
        <Checkbox id="resolve-monitoring" labelText="Monitoring required" checked={monitoringRequired} onChange={(_, { checked }) => onMonitoringRequiredChange(Boolean(checked))} />
        <div className="cg-checkbox-grid">
          {recipients.map((recipient) => (
            <Checkbox key={recipient} id={`recipient-${recipient}`} labelText={recipient} checked={selectedRecipients.includes(recipient)} onChange={() => onToggleRecipient(recipient)} />
          ))}
        </div>
        {itemType === 'case' ? (
          <>
            <Dropdown
              id="child-alert-handling"
              titleText="Child-alert handling"
              label="Select handling"
              items={[
                { id: 'resolve-all', label: 'Resolve all included alerts' },
                { id: 'detach-selected', label: 'Detach selected alerts and keep them open' },
              ]}
              selectedItem={{
                id: childAlertHandling,
                label: childAlertHandling === 'resolve-all' ? 'Resolve all included alerts' : 'Detach selected alerts and keep them open',
              }}
              itemToString={(item) => item?.label ?? ''}
              onChange={({ selectedItem }) => selectedItem && onChildAlertHandlingChange(selectedItem.id as 'resolve-all' | 'detach-selected')}
            />
            {childAlertHandling === 'detach-selected' ? (
              <div className="cg-checkbox-grid">
                {includedAlerts.map((alert) => (
                  <Checkbox
                    key={alert.id}
                    id={`detach-${alert.id}`}
                    labelText={`${alert.id} — ${alert.title}`}
                    checked={detachedAlertIds.includes(alert.id)}
                    onChange={() => onToggleDetachedAlert(alert.id)}
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : null}
        {exceptionRequired ? (
          <AISuggestedTextArea
            id="resolve-exception-reason"
            labelText="Exception reason"
            placeholder="Explain why resolution is proceeding with an analyst exception"
            aiSuggestion={suggestions?.exceptionReason}
            rows={3}
            value={exceptionReason}
            onChange={onExceptionReasonChange}
            onProvenanceChange={(value) => onFieldProvenanceChange?.('exceptionReason', value)}
          />
        ) : null}
        <AISuggestedTextArea id="resolve-comment" labelText="Final analyst comment" placeholder="Add the final analyst comment" aiSuggestion={suggestions?.finalComment} rows={3} value={finalComment} onChange={onFinalCommentChange} onProvenanceChange={(value) => onFieldProvenanceChange?.('finalComment', value)} />
      </div>
    </Modal>
  );
}
