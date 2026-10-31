import { useId, type ReactNode } from 'react';
import { useDialog } from './use-dialog';
import styles from './modal.module.css';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/** Centred confirm dialog on a native dialog: scales in, closes on Esc or the scrim. */
export function Modal({ open, title, onClose, children, footer }: ModalProps): ReactNode {
  const titleId = useId();
  const { ref, visible, leaving, onCancel, onClick } = useDialog(open, onClose);
  if (!visible) return null;

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${leaving ? styles.leaving : ''}`}
      aria-labelledby={titleId}
      onCancel={onCancel}
      onClick={onClick}
    >
      <div className={styles.panel}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </dialog>
  );
}
