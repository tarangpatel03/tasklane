import { Role, TaskAction, TaskStatus } from '@task-app/shared';
import type { Task } from '../../../api/tasks.api';

export type Footer =
  | {
      kind: 'actions';
      actions: Array<{ action: TaskAction; label: string; variant: 'primary' | 'approve' }>;
    }
  | { kind: 'review' }
  | { kind: 'line'; text: string };

/** What the viewer can do now. Only a hint: the API still checks every transition. */
export function footerFor(task: Task, userId: string, role: Role): Footer {
  const isAssignee = task.assignees.some((person) => person.id === userId);
  const isManager = role === Role.MANAGER && task.manager?.id === userId;

  if (isAssignee && task.status === TaskStatus.TODO) {
    return {
      kind: 'actions',
      actions: [{ action: TaskAction.START, label: 'Start', variant: 'primary' }],
    };
  }
  if (isAssignee && task.status === TaskStatus.WORKING) {
    return task.requiresReview
      ? {
          kind: 'actions',
          actions: [{ action: TaskAction.SUBMIT, label: 'Submit for review', variant: 'primary' }],
        }
      : {
          kind: 'actions',
          actions: [{ action: TaskAction.COMPLETE, label: 'Complete', variant: 'approve' }],
        };
  }
  if (isManager && task.status === TaskStatus.IN_REVIEW) return { kind: 'review' };
  if (task.status === TaskStatus.COMPLETED) return { kind: 'line', text: 'Task completed' };
  if (isAssignee) return { kind: 'line', text: 'Waiting for manager review' };
  return { kind: 'line', text: 'Approve or reject when In Review' };
}
