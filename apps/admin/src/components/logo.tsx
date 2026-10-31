import type { ReactNode } from 'react';
import styles from './logo.module.css';

/** The Tasklane mark: three lanes filling from empty to done. */
export function LogoMark({
  size = 44,
  decorative = false,
}: {
  size?: number;
  /** Hide from screen readers when the wordmark already names the brand. */
  decorative?: boolean;
}): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Tasklane'}
      aria-hidden={decorative || undefined}
    >
      <rect x="7" y="10" width="14" height="44" rx="7" fill="#5B4FD6" opacity="0.22" />
      <rect x="25" y="10" width="14" height="44" rx="7" fill="#5B4FD6" opacity="0.22" />
      <rect x="25" y="30" width="14" height="24" rx="7" fill="#5B4FD6" opacity="0.62" />
      <rect x="43" y="10" width="14" height="44" rx="7" fill="#5B4FD6" />
      <path
        d="M46 33l3.6 3.6 5.8-7"
        fill="none"
        stroke="#fff"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LogoProps {
  markSize?: number;
  /** Shows the "Admin panel" caption under the wordmark. */
  caption?: boolean;
  /** Hides the wordmark, e.g. in the collapsed sidebar. */
  markOnly?: boolean;
}

/** Mark plus the Tasklane wordmark. */
export function Logo({ markSize = 44, caption = false, markOnly = false }: LogoProps): ReactNode {
  return (
    <div className={styles.logo}>
      <LogoMark size={markSize} decorative={!markOnly} />
      {!markOnly && (
        <div className={styles.text}>
          <span className={styles.wordmark}>Tasklane</span>
          {caption && <span className={styles.caption}>Admin panel</span>}
        </div>
      )}
    </div>
  );
}
