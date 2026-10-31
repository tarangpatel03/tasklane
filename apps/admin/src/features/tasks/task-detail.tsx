import { TaskStatus } from '@task-app/shared';
import { useState, type FormEvent, type ReactNode } from 'react';
import type { TaskDto } from '../../api/tasks';
import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import { Drawer } from '../../components/drawer';
import { ClockIcon, SendIcon, StatusIcon } from '../../components/icons';
import { Skeleton } from '../../components/skeleton';
import { PriorityTag, STATUS_LABEL, TaskStatusBadge } from '../../components/task-badges';
import { TextAreaField } from '../../components/text-area-field';
import { useToast } from '../../components/toast-context';
import { formatDue, formatStamp, isOverdue } from './task-utils';
import { useAddComment, useComments, useHistory, useTask } from './use-tasks';
import styles from './task-detail.module.css';

interface TaskDetailProps {
  open: boolean;
  /** Kept while the drawer slides out so the content does not vanish mid-animation. */
  taskId: string | null;
  onClose: () => void;
  onEdit: (task: TaskDto) => void;
  onApprove: (task: TaskDto) => void;
  onReject: (task: TaskDto) => void;
  onDelete: (task: TaskDto) => void;
}

/** Read-only view of one task with its people, comments and status history, plus the Admin actions. */
export function TaskDetail({
  open,
  taskId,
  onClose,
  onEdit,
  onApprove,
  onReject,
  onDelete,
}: TaskDetailProps): ReactNode {
  const task = useTask(taskId);
  const data = task.data;

  const footer = data ? (
    <>
      <Button variant="outlined" compact onClick={() => onDelete(data)}>
        Delete
      </Button>
      <Button variant="tonal" compact onClick={() => onEdit(data)}>
        Edit
      </Button>
      {data.status === TaskStatus.IN_REVIEW && (
        <>
          <Button variant="outlined" compact onClick={() => onReject(data)}>
            Reject
          </Button>
          <Button compact onClick={() => onApprove(data)}>
            Approve
          </Button>
        </>
      )}
    </>
  ) : undefined;

  return (
    <Drawer open={open} title="Task details" onClose={onClose} footer={footer} width={640}>
      {task.isPending && taskId ? (
        <div className={styles.loading} aria-busy="true">
          <Skeleton width="70%" height={28} />
          <Skeleton width="40%" height={32} />
          <Skeleton height={80} />
        </div>
      ) : task.isError ? (
        <p className={styles.error} role="alert">
          This task could not be loaded. It may have been deleted. {task.error.message}
        </p>
      ) : data ? (
        <DetailBody task={data} />
      ) : null}
    </Drawer>
  );
}

function DetailBody({ task }: { task: TaskDto }): ReactNode {
  const overdue = isOverdue(task);

  return (
    <div className={styles.body}>
      <h3 className={styles.title}>{task.title}</h3>
      <div className={styles.badges}>
        <TaskStatusBadge status={task.status} />
        <PriorityTag priority={task.priority} />
      </div>

      <dl className={styles.facts}>
        <div>
          <dt>Due</dt>
          <dd className={overdue ? styles.overdue : undefined}>
            {task.dueDate ? (
              <>
                {overdue && <ClockIcon size={16} />}
                {overdue ? 'Overdue · ' : ''}
                {formatDue(task.dueDate)}
              </>
            ) : (
              'No due date'
            )}
          </dd>
        </div>
        <div>
          <dt>Review</dt>
          <dd>
            {task.requiresReview ? 'Manager approves the work' : 'Employees complete it themselves'}
          </dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>
            {formatStamp(task.createdAt)} by {task.creator.name}
          </dd>
        </div>
        {task.completedAt && (
          <div>
            <dt>Completed</dt>
            <dd>{formatStamp(task.completedAt)}</dd>
          </div>
        )}
      </dl>

      <section className={styles.section} aria-labelledby="people-heading">
        <h4 id="people-heading" className={styles.heading}>
          People
        </h4>
        <ul className={styles.people}>
          <li>
            {task.manager ? <Avatar name={task.manager.name} size={32} /> : null}
            <span className={styles.personName}>{task.manager?.name ?? 'No Manager'}</span>
            <span className={styles.personRole}>Manager</span>
          </li>
          {task.assignees.map((user) => (
            <li key={user.id}>
              <Avatar name={user.name} size={32} />
              <span className={styles.personName}>{user.name}</span>
              <span className={styles.personRole}>Employee</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="description-heading">
        <h4 id="description-heading" className={styles.heading}>
          Description
        </h4>
        <p className={task.description ? styles.description : styles.muted}>
          {task.description ?? 'No description.'}
        </p>
      </section>

      <Comments taskId={task.id} />
      <History taskId={task.id} />
    </div>
  );
}

function Comments({ taskId }: { taskId: string }): ReactNode {
  const toast = useToast();
  const comments = useComments(taskId);
  const add = useAddComment(taskId);
  const [text, setText] = useState('');

  function submit(event: FormEvent): void {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    add.mutate(body, {
      onSuccess: () => setText(''),
      onError: (error) => toast.show(error.message, 'error'),
    });
  }

  return (
    <section className={styles.section} aria-labelledby="comments-heading">
      <h4 id="comments-heading" className={styles.heading}>
        Comments
        {comments.data && <span className={styles.count}>{comments.data.meta.total}</span>}
      </h4>
      {comments.isPending && <Skeleton height={48} />}
      {comments.isError && <p className={styles.error}>Comments could not be loaded.</p>}
      {comments.data && comments.data.items.length === 0 && (
        <p className={styles.muted}>No comments yet.</p>
      )}
      <ul className={styles.comments}>
        {comments.data?.items.map((comment) => (
          <li key={comment.id}>
            <Avatar name={comment.author.name} size={32} />
            <div className={styles.bubble}>
              <p className={styles.meta}>
                <strong>{comment.author.name}</strong>
                <span>{formatStamp(comment.createdAt)}</span>
              </p>
              <p className={styles.text}>{comment.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <form className={styles.composer} onSubmit={submit}>
        <TextAreaField
          label="Add a comment"
          hideLabel
          placeholder="Write a comment"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={2000}
        />
        <Button type="submit" compact loading={add.isPending} disabled={!text.trim()}>
          <SendIcon size={18} />
          Send
        </Button>
      </form>
    </section>
  );
}

function History({ taskId }: { taskId: string }): ReactNode {
  const history = useHistory(taskId);

  return (
    <section className={styles.section} aria-labelledby="history-heading">
      <h4 id="history-heading" className={styles.heading}>
        Status history
      </h4>
      {history.isPending && <Skeleton height={48} />}
      {history.isError && <p className={styles.error}>History could not be loaded.</p>}
      <ol className={styles.timeline}>
        {history.data?.items.map((entry) => (
          <li key={entry.id} className={styles.step}>
            <span className={styles.dot}>
              <StatusIcon status={entry.toStatus} size={18} />
            </span>
            <div>
              <p className={styles.stepTitle}>
                {entry.fromStatus
                  ? `${STATUS_LABEL[entry.fromStatus]} → ${STATUS_LABEL[entry.toStatus]}`
                  : `Created as ${STATUS_LABEL[entry.toStatus]}`}
              </p>
              <p className={styles.meta}>
                <span>{entry.actor.name}</span>
                <span>{formatStamp(entry.createdAt)}</span>
              </p>
              {entry.comment && <p className={styles.quote}>{entry.comment}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
