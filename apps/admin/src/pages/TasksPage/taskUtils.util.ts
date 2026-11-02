import { TaskStatus } from '@task-app/shared';
import type { TaskDto } from '../../api/tasks.api';

// en-GB gives dd/mm/yyyy regardless of the viewer's browser locale.
const dueFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const stampFormat = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatDue(iso: string): string {
  return dueFormat.format(new Date(iso));
}

export function formatStamp(iso: string): string {
  return stampFormat.format(new Date(iso));
}

/** A task is overdue once its due date has passed and it is not completed. */
export function isOverdue(task: Pick<TaskDto, 'dueDate' | 'status'>): boolean {
  return (
    task.dueDate !== null &&
    task.status !== TaskStatus.COMPLETED &&
    new Date(task.dueDate).getTime() < Date.now()
  );
}

/** `YYYY-MM-DD` in the viewer's time zone, for `<input type="date">`. */
export function toDateInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Turns typed `dd/mm/yyyy` into `YYYY-MM-DD`; null when it is not a real calendar date. */
export function parseDisplayDate(text: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Start (or end) of the picked local day as an ISO string; empty input gives undefined. */
export function fromDateInput(value: string, edge: 'start' | 'end' = 'start'): string | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const date =
    edge === 'start'
      ? new Date(year, month - 1, day)
      : new Date(year, month - 1, day, 23, 59, 59, 999);
  return date.toISOString();
}
