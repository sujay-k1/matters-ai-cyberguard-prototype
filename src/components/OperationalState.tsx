import { Button } from '@carbon/react';
import { Information, WarningAlt, ErrorFilled, Search, FolderOpen } from '@carbon/icons-react';

interface OperationalStateProps {
  kind: 'empty' | 'no-results' | 'unavailable' | 'error' | 'partial';
  title: string;
  description: string;
  detail?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  compact?: boolean;
}

export function OperationalState({
  kind,
  title,
  description,
  detail,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
}: OperationalStateProps) {
  const Icon = iconForKind(kind);
  return (
    <div className={['cg-operational-state', compact ? 'is-compact' : ''].filter(Boolean).join(' ')} aria-live="polite">
      <div className="cg-operational-state__icon">
        <Icon size={compact ? 20 : 24} />
      </div>
      <div className="cg-operational-state__copy">
        <h3>{title}</h3>
        <p>{description}</p>
        {detail ? <p className="cg-summary-line">{detail}</p> : null}
        {primaryActionLabel || secondaryActionLabel ? (
          <div className="cg-operational-state__actions">
            {primaryActionLabel && onPrimaryAction ? (
              <Button kind="secondary" size="sm" onClick={onPrimaryAction}>
                {primaryActionLabel}
              </Button>
            ) : null}
            {secondaryActionLabel && onSecondaryAction ? (
              <Button kind="ghost" size="sm" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function iconForKind(kind: OperationalStateProps['kind']) {
  if (kind === 'error') return ErrorFilled;
  if (kind === 'no-results') return Search;
  if (kind === 'partial') return WarningAlt;
  if (kind === 'unavailable') return Information;
  return FolderOpen;
}
