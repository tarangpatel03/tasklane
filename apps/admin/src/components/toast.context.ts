import { createContext, useContext } from 'react';

export type ToastTone = 'success' | 'error';

export interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/** Shows a short message in the bottom-right corner. Must be used under `ToastProvider`. */
export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}
