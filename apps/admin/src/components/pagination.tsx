import type { ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import styles from './pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

/** First, last and the pages around the current one; gaps become an ellipsis. */
function pageItems(page: number, totalPages: number): (number | 'gap')[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const items: (number | 'gap')[] = [];
  pages.forEach((n, index) => {
    if (index > 0 && n - pages[index - 1] > 1) items.push('gap');
    items.push(n);
  });
  return items;
}

/** "Showing x-y of n" with numbered buttons (44px). */
export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onChange,
}: PaginationProps): ReactNode {
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav className={styles.bar} aria-label="Pagination">
      <p className={styles.summary}>
        Showing {from}-{to} of {total}
      </p>
      {totalPages > 1 && (
        <div className={styles.pages}>
          <button
            type="button"
            className={styles.button}
            onClick={() => onChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeftIcon size={20} />
          </button>
          {pageItems(page, totalPages).map((item, index) =>
            item === 'gap' ? (
              <span key={`gap-${index}`} className={styles.gap} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`${styles.button} ${item === page ? styles.current : ''}`}
                onClick={() => onChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            className={styles.button}
            onClick={() => onChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRightIcon size={20} />
          </button>
        </div>
      )}
    </nav>
  );
}
