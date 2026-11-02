import type { CSSProperties, ReactNode } from 'react';
import styles from './Skeleton.module.css';

/** Shimmering placeholder block shown while data loads. */
export function Skeleton({
  width = '100%',
  height = 16,
  circle = false,
}: {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  circle?: boolean;
}): ReactNode {
  return (
    <span
      className={`${styles.skeleton} ${circle ? styles.circle : ''}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
