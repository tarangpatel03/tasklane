import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertIcon, CheckIcon, CloseIcon } from './icons';
import { ToastContext, type ToastContextValue, type ToastTone } from './toast-context';
import styles from './toast.module.css';

const AUTO_DISMISS_MS = 3200;

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

/** Hosts the toast stack; each toast closes itself after 3.2 seconds or on its close button. */
export function ToastProvider({ children }: { children: ReactNode }): ReactNode {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback<ToastContextValue['show']>(
    (message, tone = 'success') => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.tone]}`}>
            {toast.tone === 'success' ? <CheckIcon size={20} /> : <AlertIcon size={20} />}
            <span className={styles.message}>{toast.message}</span>
            <button
              type="button"
              className={styles.close}
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
