import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { OverdueTask } from '../../../../api/dashboard.api';
import { ClockIcon } from '../../../../components/Icons';
import { Skeleton } from '../../../../components/Skeleton';
import { PriorityTag } from '../../../../components/TaskBadges';
import { Panel, PanelEmpty } from '../Panel';
import styles from './OverdueList.module.css';
import { PATHS } from '../../../../app/paths';

const SHOWN = 5;
const DAY_MS = 86_400_000;

function lateBy(dueDate: string): string {
  const days = Math.floor((Date.now() - new Date(dueDate).getTime()) / DAY_MS);
  if (days < 1) return 'Overdue today';
  return days === 1 ? '1 day overdue' : `${days} days overdue`;
}

/** The oldest overdue tasks (due date passed, not completed); each row opens the task on the Tasks page. */
export function OverdueList({
  tasks,
  count,
}: {
  /** Null while loading. */
  tasks: OverdueTask[] | null;
  count: number;
}): ReactNode {
  const shown = tasks?.slice(0, SHOWN) ?? [];

  return (
    <Panel
      title="Overdue tasks"
      note={tasks ? String(count) : undefined}
      action={
        count > shown.length ? (
          <Link to={PATHS.tasks} className={styles.viewAll}>
            View all tasks
          </Link>
        ) : undefined
      }
    >
      {!tasks && (
        <div className={styles.list} aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} height={56} />
          ))}
        </div>
      )}
      {tasks && shown.length === 0 && <PanelEmpty>Nothing is overdue. Nice work.</PanelEmpty>}
      {shown.length > 0 && (
        <ul className={styles.list}>
          {shown.map((task) => (
            <li key={task.id}>
              <Link to={`${PATHS.tasks}?task=${task.id}`} className={styles.row}>
                <span className={styles.main}>
                  <span className={styles.name}>{task.title}</span>
                  <span className={styles.meta}>{task.manager?.name ?? 'No Manager'}</span>
                </span>
                <PriorityTag priority={task.priority} />
                <span className={styles.late}>
                  <ClockIcon size={16} />
                  {lateBy(task.dueDate)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
