import { useId, type ReactNode } from 'react';
import styles from './panel.module.css';

interface PanelProps {
  title: string;
  /** Short note next to the title, such as a count. */
  note?: string;
  action?: ReactNode;
  children: ReactNode;
}

/** White card with a heading row, used for each dashboard block. */
export function Panel({ title, note, action, children }: PanelProps): ReactNode {
  const headingId = useId();

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <header className={styles.header}>
        <h2 id={headingId} className={styles.title}>
          {title}
          {note && <span className={styles.note}>{note}</span>}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

/** Quiet one-line message for a block that has nothing to show. */
export function PanelEmpty({ children }: { children: ReactNode }): ReactNode {
  return <p className={styles.empty}>{children}</p>;
}
