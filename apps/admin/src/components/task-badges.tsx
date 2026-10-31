import { TaskPriority, TaskStatus } from '@task-app/shared';
import type { ReactNode } from 'react';
import { PriorityIcon, StatusIcon } from './icons';
import styles from './task-badges.module.css';

export const STATUS_LABEL: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.WORKING]: 'Working',
  [TaskStatus.IN_REVIEW]: 'In Review',
  [TaskStatus.COMPLETED]: 'Completed',
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.HIGH]: 'High',
};

const STATUS_CLASS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: styles.todo,
  [TaskStatus.WORKING]: styles.working,
  [TaskStatus.IN_REVIEW]: styles.review,
  [TaskStatus.COMPLETED]: styles.done,
};

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: styles.low,
  [TaskPriority.MEDIUM]: styles.medium,
  [TaskPriority.HIGH]: styles.high,
};

const PRIORITY_LEVEL: Record<TaskPriority, 1 | 2 | 3> = {
  [TaskPriority.LOW]: 1,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.HIGH]: 3,
};

/** Task status as colour, icon and text together (32px pill). */
export function TaskStatusBadge({ status }: { status: TaskStatus }): ReactNode {
  return (
    <span className={`${styles.status} ${STATUS_CLASS[status]}`}>
      <StatusIcon status={status} size={16} />
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Task priority as colour, three-bar icon and text (28px tag). */
export function PriorityTag({ priority }: { priority: TaskPriority }): ReactNode {
  return (
    <span className={`${styles.priority} ${PRIORITY_CLASS[priority]}`}>
      <PriorityIcon level={PRIORITY_LEVEL[priority]} size={14} />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
