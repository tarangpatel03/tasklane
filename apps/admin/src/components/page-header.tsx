import type { ReactNode } from 'react';
import styles from './page-header.module.css';

/** Page title block; the page's single `h1`. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  /** Optional control shown at the end of the title row, such as a refresh button. */
  action?: ReactNode;
}): ReactNode {
  return (
    <header className={styles.header}>
      <div className={styles.row}>
        <h1 className={styles.title}>{title}</h1>
        {action}
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
