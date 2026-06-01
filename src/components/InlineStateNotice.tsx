import { Button, InlineNotification } from '@carbon/react';

interface InlineStateNoticeProps {
  kind?: 'error' | 'warning' | 'info' | 'success';
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  lowContrast?: boolean;
}

export function InlineStateNotice({
  kind = 'info',
  title,
  subtitle,
  actionLabel,
  onAction,
  lowContrast = true,
}: InlineStateNoticeProps) {
  return (
    <div className="cg-inline-state-notice" aria-live="polite">
      <InlineNotification
        kind={kind}
        lowContrast={lowContrast}
        hideCloseButton
        title={title}
        subtitle={subtitle}
      />
      {actionLabel && onAction ? (
        <Button kind="ghost" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
