import { useSyncExternalStore } from 'react';

/**
 * The floating nav is the tab bar, which is drawn above every tab screen. Overlays that live inside
 * a screen (the side sheet) hide it while they are open, so their scrim covers the whole window.
 */
let hiders = 0;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

/** Hides the nav until the returned function is called. */
export function hideNav(): () => void {
  hiders += 1;
  emit();
  return () => {
    hiders -= 1;
    emit();
  };
}

export function useNavHidden(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => hiders > 0,
  );
}
