import { Checkbox, Dropdown, Modal, TextArea } from '@carbon/react';
import type { IncludedAlertItem, WorkItemClassification } from '../types/investigation';

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
      modalHeading={itemId ? `Resolve ${itemId}` : 'Resolve item'}
      primaryButtonText={exceptionRequired ? 'Resolve with exception' : 'Resolve item'}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={disabled}
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
        <TextArea id="resolve-summary" labelText="Resolution summary" rows={3} value={resolutionSummary} onChange={(event) => onResolutionSummaryChange(event.currentTarget.value)} />
        <TextArea id="resolve-root-cause" labelText="Root cause" rows={3} value={rootCause} onChange={(event) => onRootCauseChange(event.currentTarget.value)} />
        <TextArea id="resolve-remediation" labelText="Remediation summary" rows={3} value={remediationSummary} onChange={(event) => onRemediationSummaryChange(event.currentTarget.value)} />
        <TextArea id="resolve-risk" labelText="Residual risk" rows={3} value={residualRisk} onChange={(event) => onResidualRiskChange(event.currentTarget.value)} />
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
          <TextArea
            id="resolve-exception-reason"
            labelText="Exception reason"
            rows={3}
            value={exceptionReason}
            onChange={(event) => onExceptionReasonChange(event.currentTarget.value)}
          />
        ) : null}
        <TextArea id="resolve-comment" labelText="Final analyst comment" rows={3} value={finalComment} onChange={(event) => onFinalCommentChange(event.currentTarget.value)} />
      </div>
    </Modal>
  );
}
