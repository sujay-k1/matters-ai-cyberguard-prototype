import { Button, Modal } from '@carbon/react';

type SourceSystemScenario =
  | 'source-system-info'
  | 'source-system-error'
  | 'source-system-permission-denied'
  | 'source-system-record-unavailable'
  | 'source-system-timeout';

interface SourceSystemStateModalProps {
  open: boolean;
  scenario: SourceSystemScenario;
  systemName: string;
  recordId: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function SourceSystemStateModal({
  open,
  scenario,
  systemName,
  recordId,
  onClose,
  onRetry,
}: SourceSystemStateModalProps) {
  const copyRecordId = async () => {
    try {
      await navigator.clipboard.writeText(recordId);
    } catch {
      /* noop */
    }
  };

  const content = getScenarioContent(scenario, systemName, recordId);

  return (
    <Modal
      open={open}
      className="cg-investigation-submodal"
      modalHeading={content.title}
      primaryButtonText={content.primaryLabel}
      secondaryButtonText={content.secondaryLabel ?? 'Close'}
      onRequestSubmit={content.onPrimary === 'retry' && onRetry ? onRetry : onClose}
      onRequestClose={onClose}
    >
      <div className="cg-dialog-stack">
        <p>{content.body}</p>
        {content.detail ? <p className="cg-summary-line">{content.detail}</p> : null}
        {content.tertiaryLabel ? (
          <Button kind="ghost" size="sm" onClick={copyRecordId}>
            {content.tertiaryLabel}
          </Button>
        ) : null}
      </div>
    </Modal>
  );
}

function getScenarioContent(
  scenario: SourceSystemScenario,
  systemName: string,
  recordId: string,
) {
  if (scenario === 'source-system-error') {
    return {
      title: 'Unable to open source-system record',
      body: `The ${systemName} integration is temporarily unavailable.`,
      detail: `Record ID: ${recordId}`,
      primaryLabel: 'Retry',
      secondaryLabel: 'Continue investigation',
      tertiaryLabel: 'Copy record ID',
      onPrimary: 'retry' as const,
    };
  }
  if (scenario === 'source-system-permission-denied') {
    return {
      title: 'Permission required',
      body: `You do not have permission to open this ${systemName} record.`,
      detail: `Record ID: ${recordId}`,
      primaryLabel: 'Continue investigation',
      secondaryLabel: 'Close',
      tertiaryLabel: 'Copy record ID',
      onPrimary: 'close' as const,
    };
  }
  if (scenario === 'source-system-record-unavailable') {
    return {
      title: 'Source record unavailable',
      body: 'The requested source-system record is no longer available.',
      detail: `Record ID: ${recordId}`,
      primaryLabel: 'Continue investigation',
      secondaryLabel: 'Close',
      tertiaryLabel: 'Copy record ID',
      onPrimary: 'close' as const,
    };
  }
  if (scenario === 'source-system-timeout') {
    return {
      title: 'Source system did not respond',
      body: `The ${systemName} request timed out.`,
      detail: `Record ID: ${recordId}`,
      primaryLabel: 'Retry',
      secondaryLabel: 'Continue investigation',
      tertiaryLabel: 'Copy record ID',
      onPrimary: 'retry' as const,
    };
  }
  return {
    title: 'Source-system launch simulated',
    body: `This prototype does not connect to ${systemName}. In production, this action would open the native record for ${recordId}.`,
      primaryLabel: 'Close',
      secondaryLabel: 'Close',
      tertiaryLabel: 'Copy record ID',
      onPrimary: 'close' as const,
  };
}
