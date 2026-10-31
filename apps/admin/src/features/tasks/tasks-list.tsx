import { TaskStatus } from '@task-app/shared';
import type { CSSProperties, ReactNode } from 'react';
import type { TaskDto } from '../../api/tasks';
import { AvatarStack } from '../../components/avatar-stack';
import {
  ClockIcon,
  CloseIcon,
  EditIcon,
  EyeIcon,
  ThumbsUpIcon,
  TrashIcon,
} from '../../components/icons';
import { RowMenu, type RowMenuItem } from '../../components/row-menu';
import { Skeleton } from '../../components/skeleton';
import { PriorityTag, TaskStatusBadge } from '../../components/task-badges';
import { formatDue, isOverdue } from './task-utils';
import styles from './tasks-list.module.css';

export interface TaskActions {
  onOpen: (task: TaskDto) => void;
  onEdit: (task: TaskDto) => void;
  onApprove: (task: TaskDto) => void;
  onReject: (task: TaskDto) => void;
  onDelete: (task: TaskDto) => void;
}

interface TasksListProps extends TaskActions {
  tasks: TaskDto[];
  /** Changes when filters or the page change, so rows play their entrance again. */
  animationKey: string;
}

export function taskMenuItems(task: TaskDto, actions: TaskActions): RowMenuItem[] {
  const items: RowMenuItem[] = [
    { label: 'Open', icon: <EyeIcon size={20} />, onSelect: () => actions.onOpen(task) },
    { label: 'Edit', icon: <EditIcon size={20} />, onSelect: () => actions.onEdit(task) },
  ];
  if (task.status === TaskStatus.IN_REVIEW) {
    items.push(
      {
        label: 'Approve',
        icon: <ThumbsUpIcon size={20} />,
        onSelect: () => actions.onApprove(task),
      },
      { label: 'Reject', icon: <CloseIcon size={20} />, onSelect: () => actions.onReject(task) },
    );
  }
  items.push({
    label: 'Delete',
    icon: <TrashIcon size={20} />,
    onSelect: () => actions.onDelete(task),
    danger: true,
  });
  return items;
}

/** "Due 12 Mar 2026" with an explicit "Overdue" cue so colour is not the only signal. */
function DueText({ task }: { task: TaskDto }): ReactNode {
  if (!task.dueDate) return <span className={styles.noDue}>No due date</span>;
  const overdue = isOverdue(task);
  return (
    <span className={overdue ? styles.overdue : styles.due}>
      {overdue && <ClockIcon size={16} />}
      {overdue ? 'Overdue · ' : ''}
      {formatDue(task.dueDate)}
    </span>
  );
}

/** Table from 1024px, cards below. Both come from the same rows; CSS switches the layout. */
export function TasksList({ tasks, animationKey, ...actions }: TasksListProps): ReactNode {
  return (
    <div className={styles.scroll}>
      <div className={styles.table} role="table" aria-label="Tasks">
        <div className={styles.head} role="row">
          <span role="columnheader">Task</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Priority</span>
          <span role="columnheader">People</span>
          <span role="columnheader">Due</span>
          <span role="columnheader" className="visually-hidden">
            Actions
          </span>
        </div>
        <div className={styles.rows} key={animationKey} role="rowgroup">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={styles.row}
              role="row"
              style={{ '--i': Math.min(index, 7) } as CSSProperties}
            >
              <div className={styles.title} role="cell">
                <button type="button" className={styles.open} onClick={() => actions.onOpen(task)}>
                  {task.title}
                </button>
                <span className={styles.sub}>
                  {task.requiresReview ? 'Needs review' : 'No review needed'}
                </span>
              </div>
              <div className={styles.meta}>
                <div role="cell">
                  <TaskStatusBadge status={task.status} />
                </div>
                <div role="cell">
                  <PriorityTag priority={task.priority} />
                </div>
                <div role="cell" className={styles.people}>
                  <AvatarStack names={task.assignees.map((user) => user.name)} />
                  <span className={styles.manager}>
                    {task.manager ? task.manager.name : 'No Manager'}
                  </span>
                </div>
                <div role="cell">
                  <DueText task={task} />
                </div>
              </div>
              <div role="cell" className={styles.menu}>
                <RowMenu label={`Actions for ${task.title}`} items={taskMenuItems(task, actions)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Placeholder rows with the same shape as real rows, shown on the first load. */
export function TasksListSkeleton(): ReactNode {
  return (
    <div className={styles.scroll} aria-busy="true" aria-label="Loading tasks">
      <div className={styles.table}>
        <div className={styles.head} aria-hidden="true">
          <span>Task</span>
          <span>Status</span>
          <span>Priority</span>
          <span>People</span>
          <span>Due</span>
          <span />
        </div>
        <div className={styles.rows}>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className={styles.row}>
              <div className={styles.title}>
                <Skeleton width="70%" height={14} />
                <Skeleton width="35%" height={12} />
              </div>
              <div className={styles.meta}>
                <Skeleton width={96} height={32} />
                <Skeleton width={76} height={28} />
                <Skeleton width={110} height={32} />
                <Skeleton width={88} height={14} />
              </div>
              <div className={styles.menu} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
