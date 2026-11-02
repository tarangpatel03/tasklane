import { TaskStatus } from '@task-app/shared';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { ManagerSummary } from '../../api/dashboard.api';
import { Avatar } from '../../components/Avatar';
import { StatusIcon } from '../../components/Icons';
import { Skeleton } from '../../components/Skeleton';
import { STATUS_LABEL } from '../../components/TaskBadges';
import { Panel, PanelEmpty } from './Panel';
import styles from './ManagerWorkload.module.css';
import { PATHS } from '../../app/paths';

const FILL: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: styles.todo,
  [TaskStatus.WORKING]: styles.working,
  [TaskStatus.IN_REVIEW]: styles.review,
  [TaskStatus.COMPLETED]: styles.done,
};

function Row({ row }: { row: ManagerSummary }): ReactNode {
  const name = row.manager?.name ?? 'No Manager';
  const summary = Object.values(TaskStatus)
    .map((status) => `${STATUS_LABEL[status]} ${row.byStatus[status]}`)
    .join(', ');

  const body = (
    <>
      <span className={styles.who}>
        {row.manager ? (
          <Avatar name={name} size={32} />
        ) : (
          <span className={styles.none} aria-hidden="true">
            ?
          </span>
        )}
        <span className={styles.name}>{name}</span>
      </span>
      <span className={styles.figures}>
        <span>{row.total === 1 ? '1 task' : `${row.total} tasks`}</span>
        {row.overdue > 0 && <span className={styles.overdue}>{row.overdue} overdue</span>}
      </span>
      <span className={styles.bar} role="img" aria-label={`${name}: ${summary}`}>
        {row.total === 0 ? (
          <span className={styles.emptyBar} />
        ) : (
          Object.values(TaskStatus).map((status) =>
            row.byStatus[status] > 0 ? (
              <span
                key={status}
                className={`${styles.segment} ${FILL[status]}`}
                style={{ flexGrow: row.byStatus[status] }}
              />
            ) : null,
          )
        )}
      </span>
    </>
  );

  return (
    <li>
      {row.manager ? (
        <Link to={`${PATHS.tasks}?managerId=${row.manager.id}`} className={styles.row}>
          {body}
        </Link>
      ) : (
        <div className={styles.row}>{body}</div>
      )}
    </li>
  );
}

/** Tasks per Manager as stacked bars by status, with a text legend so colour is never the only cue. */
export function ManagerWorkload({ rows }: { rows: ManagerSummary[] | null }): ReactNode {
  return (
    <Panel title="Tasks per Manager">
      <ul className={styles.legend} aria-hidden="true">
        {Object.values(TaskStatus).map((status) => (
          <li key={status} className={`${styles.key} ${FILL[status]}`}>
            <StatusIcon status={status} size={14} />
            {STATUS_LABEL[status]}
          </li>
        ))}
      </ul>
      {!rows && (
        <div className={styles.list} aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} height={64} />
          ))}
        </div>
      )}
      {rows && rows.length === 0 && <PanelEmpty>No Managers yet.</PanelEmpty>}
      {rows && rows.length > 0 && (
        <ul className={styles.list}>
          {rows.map((row) => (
            <Row key={row.manager?.id ?? 'none'} row={row} />
          ))}
        </ul>
      )}
    </Panel>
  );
}
