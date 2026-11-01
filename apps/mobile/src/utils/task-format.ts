import { Role, TaskPriority, TaskStatus } from '@task-app/shared';

export const STATUS_LABEL: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.WORKING]: 'Working',
  [TaskStatus.IN_REVIEW]: 'In Review',
  [TaskStatus.COMPLETED]: 'Completed',
};

export const STATUS_ORDER: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.WORKING,
  TaskStatus.IN_REVIEW,
  TaskStatus.COMPLETED,
];

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.HIGH]: 'High',
};

export const ROLE_LABEL: Record<Role, string> = {
  [Role.ADMIN]: 'Admin',
  [Role.MANAGER]: 'Manager',
  [Role.EMPLOYEE]: 'Employee',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Oct 30", or "Oct 30, 2025" when the year is not the current one. Hand-rolled to avoid depending on Intl. */
export function formatDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const base = `${MONTHS[date.getMonth()]} ${date.getDate()}`;
  return date.getFullYear() === now.getFullYear() ? base : `${base}, ${date.getFullYear()}`;
}

/** A task is overdue once its due date has passed and it is not completed. */
export function isOverdue(
  dueDate: string | null,
  status: TaskStatus,
  now: Date = new Date(),
): boolean {
  return (
    dueDate !== null &&
    status !== TaskStatus.COMPLETED &&
    new Date(dueDate).getTime() < now.getTime()
  );
}

/** "Due Oct 30", "Overdue · Oct 30" or "No due date". */
export function dueText(dueDate: string | null, status: TaskStatus): string {
  if (!dueDate) return 'No due date';
  return isOverdue(dueDate, status)
    ? `Overdue · ${formatDate(dueDate)}`
    : `Due ${formatDate(dueDate)}`;
}

/** "Just now", "5 min ago", "3 h ago", "Yesterday", otherwise the date. */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  if (hours < 48) return 'Yesterday';
  return formatDate(iso, now);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

/** Stable index from an id, so the same person always gets the same avatar colours. */
export function hashIndex(id: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % modulo;
}
