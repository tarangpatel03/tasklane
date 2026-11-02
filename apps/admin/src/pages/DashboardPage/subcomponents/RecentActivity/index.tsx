import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { Activity } from '../../../../api/dashboard.api';
import { Avatar } from '../../../../components/Avatar';
import { Skeleton } from '../../../../components/Skeleton';
import { STATUS_LABEL } from '../../../../components/TaskBadges';
import { Panel, PanelEmpty } from '../Panel';
import styles from './RecentActivity.module.css';
import { PATHS } from '../../../../app/paths';

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

/** "5 minutes ago", "yesterday"; anything under a minute is "just now". */
function timeAgo(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) return relative.format(Math.round(diff / ms), unit);
  }
  return 'just now';
}

function describe(item: Activity): string {
  return item.fromStatus
    ? `moved from ${STATUS_LABEL[item.fromStatus]} to ${STATUS_LABEL[item.toStatus]}`
    : `created this as ${STATUS_LABEL[item.toStatus]}`;
}

/** The latest status changes across all tasks; each item opens its task. */
export function RecentActivity({ items }: { items: Activity[] | null }): ReactNode {
  return (
    <Panel title="Recent activity">
      {!items && (
        <div className={styles.list} aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} height={52} />
          ))}
        </div>
      )}
      {items && items.length === 0 && <PanelEmpty>No activity yet.</PanelEmpty>}
      {items && items.length > 0 && (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id}>
              <Link to={`${PATHS.tasks}?task=${item.taskId}`} className={styles.item}>
                <Avatar name={item.actor.name} size={32} />
                <span className={styles.text}>
                  <span className={styles.sentence}>
                    <strong>{item.actor.name}</strong> {describe(item)}
                  </span>
                  <span className={styles.task}>{item.taskTitle}</span>
                  {item.comment && <span className={styles.quote}>{item.comment}</span>}
                </span>
                <time className={styles.time} dateTime={item.createdAt}>
                  {timeAgo(item.createdAt)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
