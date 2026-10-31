import type { ReactNode } from 'react';
import styles from './page-header.module.css';

/** Page title block; the page's single `h1`. */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }): ReactNode {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
