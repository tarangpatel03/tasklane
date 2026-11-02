import { useId, type CSSProperties, type ReactNode } from 'react';
import { CloseIcon } from './Icons';
import { useDialog } from './useDialog';
import styles from './Drawer.module.css';

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Panel width in pixels from 640px up; the panel is full width below that. Defaults to 480. */
  width?: number;
}

/** Right-hand panel on a native dialog: slides in, closes on Esc, the scrim or the close button. */
export function Drawer({ open, title, onClose, children, footer, width }: DrawerProps): ReactNode {
  const titleId = useId();
  const { ref, visible, leaving, onCancel, onClick } = useDialog(open, onClose);
  if (!visible) return null;

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${leaving ? styles.leaving : ''}`}
      aria-labelledby={titleId}
      style={width ? ({ '--drawer-width': `${width}px` } as CSSProperties) : undefined}
      onCancel={onCancel}
      onClick={onClick}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close panel">
            <CloseIcon />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
