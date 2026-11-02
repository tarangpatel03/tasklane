import { TaskStatus } from '@task-app/shared';
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';
import type { StatusCounts } from '../../api/dashboard.api';
import { StatusIcon } from '../../components/Icons';
import { Skeleton } from '../../components/Skeleton';
import { STATUS_LABEL } from '../../components/TaskBadges';
import { useCountUp } from '../../hooks/useCountUp';
import styles from './StatusTiles.module.css';
import { PATHS } from '../../app/paths';

const TONE: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: styles.todo,
  [TaskStatus.WORKING]: styles.working,
  [TaskStatus.IN_REVIEW]: styles.review,
  [TaskStatus.COMPLETED]: styles.done,
};

function Tile({
  status,
  count,
  index,
}: {
  status: TaskStatus;
  count: number;
  index: number;
}): ReactNode {
  const shown = useCountUp(count);

  return (
    <li className={styles.item} style={{ '--i': index } as CSSProperties}>
      <Link
        to={`${PATHS.tasks}?status=${status}`}
        className={`${styles.tile} ${TONE[status]}`}
        aria-label={`${STATUS_LABEL[status]}: ${count} tasks. Show them.`}
      >
        <span className={styles.label}>
          <StatusIcon status={status} size={20} />
          {STATUS_LABEL[status]}
        </span>
        <span className={styles.count} aria-hidden="true">
          {shown}
        </span>
      </Link>
    </li>
  );
}

/** One tile per status; each links to the Tasks list filtered by that status. `counts` is null while loading. */
export function StatusTiles({ counts }: { counts: StatusCounts | null }): ReactNode {
  return (
    <ul className={styles.tiles}>
      {Object.values(TaskStatus).map((status, index) =>
        counts ? (
          <Tile key={status} status={status} count={counts[status]} index={index} />
        ) : (
          <li key={status} className={styles.item}>
            <div className={`${styles.tile} ${styles.loading}`} aria-busy="true">
              <Skeleton width={90} height={16} />
              <Skeleton width={64} height={40} />
            </div>
          </li>
        ),
      )}
    </ul>
  );
}
