import type { ReactNode } from 'react';
import { Button, ComposedModal, ModalBody, ModalHeader } from '@carbon/react';
import { Close } from '@carbon/icons-react';

interface InvestigationDetailDialogProps {
  open: boolean;
  ariaLabel: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export function InvestigationDetailDialog({
  open,
  ariaLabel,
  title,
  children,
  footer,
  onClose,
}: InvestigationDetailDialogProps) {
  return (
    <ComposedModal
      open={open}
      onClose={onClose}
      containerClassName="cg-investigation-submodal__container"
      className="cg-investigation-submodal cg-investigation-detail-dialog"
      selectorsFloatingMenus={[
        '.cg-investigation-submodal',
        '.cds--list-box__menu',
        '.cds--overflow-menu-options',
      ]}
      aria-label={ariaLabel}
      size="sm"
    >
      <ModalHeader
        className="cg-investigation-detail-dialog__header"
        closeModal={() => {}}
        iconDescription="Close detail dialog"
      >
        <div className="cg-investigation-detail-dialog__header-row">
          <h3>{title}</h3>
          <Button
            kind="ghost"
            size="sm"
            hasIconOnly
            renderIcon={Close}
            iconDescription="Close detail dialog"
            aria-label="Close detail dialog"
            onClick={onClose}
          />
        </div>
      </ModalHeader>
      <ModalBody hasScrollingContent className="cg-investigation-detail-dialog__body">
        {children}
      </ModalBody>
      {footer ? <div className="cg-investigation-detail-dialog__footer">{footer}</div> : null}
    </ComposedModal>
  );
}
