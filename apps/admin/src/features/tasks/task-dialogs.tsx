import { TaskAction } from '@task-app/shared';
import { useState, type ReactNode } from 'react';
import { ApiRequestError } from '../../api/client';
import type { TaskDto } from '../../api/tasks';
import { Button } from '../../components/button';
import { Modal } from '../../components/modal';
import { TextAreaField } from '../../components/text-area-field';
import { useToast } from '../../components/toast-context';
import { useDeleteTask, useTransitionTask } from './use-tasks';
import styles from './task-dialogs.module.css';

interface TaskDialogProps {
  /** The task the dialog acts on, or null when closed. Kept while the dialog fades out. */
  task: TaskDto | null;
  open: boolean;
  onClose: () => void;
}

function messageOf(error: unknown): string {
  return error instanceof ApiRequestError
    ? error.message
    : 'Could not reach the server. Check your connection and try again.';
}

/** Rejecting needs a reason; it is stored in the history and emailed to every Employee. */
export function RejectDialog({ task, open, onClose }: TaskDialogProps): ReactNode {
  return (
    <Modal open={open} title={task ? `Reject “${task.title}”?` : 'Reject task'} onClose={onClose}>
      {task && <RejectBody key={task.id} task={task} onClose={onClose} />}
    </Modal>
  );
}

function RejectBody({ task, onClose }: { task: TaskDto; onClose: () => void }): ReactNode {
  const toast = useToast();
  const transition = useTransitionTask();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  function confirm(): void {
    const comment = reason.trim();
    if (!comment) {
      setError('Enter a reason so the Employees know what to fix.');
      return;
    }
    setError(null);
    transition.mutate(
      { id: task.id, action: TaskAction.REJECT, comment },
      {
        onSuccess: () => {
          toast.show('Task sent back to the Employees.');
          onClose();
        },
        onError: (failure) => setError(messageOf(failure)),
      },
    );
  }

  return (
    <>
      <p>The task goes back to Working and every assignee is told why.</p>
      <TextAreaField
        label="Reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        maxLength={2000}
        error={error ?? undefined}
        data-autofocus
      />
      <div className={styles.actions}>
        <Button variant="outlined" compact onClick={onClose} disabled={transition.isPending}>
          Cancel
        </Button>
        <Button variant="destructive" compact onClick={confirm} loading={transition.isPending}>
          Reject task
        </Button>
      </div>
    </>
  );
}

/** Soft delete: the task disappears from every list but its history stays in the database. */
export function DeleteDialog({
  task,
  open,
  onClose,
  onDeleted,
}: TaskDialogProps & { onDeleted: (task: TaskDto) => void }): ReactNode {
  return (
    <Modal open={open} title={task ? `Delete “${task.title}”?` : 'Delete task'} onClose={onClose}>
      {task && <DeleteBody key={task.id} task={task} onClose={onClose} onDeleted={onDeleted} />}
    </Modal>
  );
}

function DeleteBody({
  task,
  onClose,
  onDeleted,
}: {
  task: TaskDto;
  onClose: () => void;
  onDeleted: (task: TaskDto) => void;
}): ReactNode {
  const toast = useToast();
  const remove = useDeleteTask();
  const [error, setError] = useState<string | null>(null);

  function confirm(): void {
    setError(null);
    remove.mutate(task.id, {
      onSuccess: () => {
        toast.show(`Task “${task.title}” was deleted.`);
        onDeleted(task);
        onClose();
      },
      onError: (failure) => setError(messageOf(failure)),
    });
  }

  return (
    <>
      <p>Employees and the Manager will no longer see it. This cannot be undone from the panel.</p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button variant="outlined" compact onClick={onClose} disabled={remove.isPending}>
          Cancel
        </Button>
        <Button variant="destructive" compact onClick={confirm} loading={remove.isPending}>
          Delete task
        </Button>
      </div>
    </>
  );
}
