import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  message: string;
}

/** Geometric mark, one title and one sentence, as in the design brief. */
export function EmptyState({ title, message }: EmptyStateProps): ReactNode {
  return (
    <section className={styles.empty}>
      <div className={styles.badge} aria-hidden="true">
        <div className={styles.square}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
    </section>
  );
}
