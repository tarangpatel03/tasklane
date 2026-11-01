import type { Role, TaskAction, TaskPriority, TaskStatus } from '@task-app/shared';
import { apiEnvelope, apiRequest } from './client';

/** Shapes below mirror the API's response DTOs; dates arrive as ISO strings. */
export interface UserSummary {
  id: string;
  name: string;
  role: Role;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  requiresReview: boolean;
  manager: UserSummary | null;
  creator: UserSummary;
  assignees: UserSummary[];
  /** Who last sent the task to review; null unless it is In Review. */
  submittedBy: UserSummary | null;
  submittedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  body: string;
  author: UserSummary;
  createdAt: string;
}

export interface TaskHistoryEntry {
  id: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  actor: UserSummary;
  comment: string | null;
  createdAt: string;
}

export type TaskSummary = Record<TaskStatus, number>;

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
}

export const TASKS_PAGE_SIZE = 20;

/** The API's largest page; comments and history load in one request since the detail shows all of them. */
const DETAIL_PAGE_SIZE = 100;

/** Fetches one page of a paginated endpoint and keeps the paging info from `meta`. */
async function getPage<T>(path: string, page: number, limit: number): Promise<Page<T>> {
  const separator = path.includes('?') ? '&' : '?';
  const envelope = await apiEnvelope<T[]>(`${path}${separator}page=${page}&limit=${limit}`);
  return {
    items: envelope.data,
    page,
    totalPages: envelope.meta?.totalPages ?? page,
  };
}

export function fetchTasks(status: TaskStatus | null, page: number): Promise<Page<Task>> {
  return getPage<Task>(status ? `/tasks?status=${status}` : '/tasks', page, TASKS_PAGE_SIZE);
}

export function fetchTaskSummary(): Promise<TaskSummary> {
  return apiRequest<TaskSummary>('/tasks/summary');
}

export function fetchTask(id: string): Promise<Task> {
  return apiRequest<Task>(`/tasks/${id}`);
}

export function fetchComments(taskId: string): Promise<Page<TaskComment>> {
  return getPage<TaskComment>(`/tasks/${taskId}/comments`, 1, DETAIL_PAGE_SIZE);
}

export function fetchHistory(taskId: string): Promise<Page<TaskHistoryEntry>> {
  return getPage<TaskHistoryEntry>(`/tasks/${taskId}/history`, 1, DETAIL_PAGE_SIZE);
}

export function postComment(taskId: string, body: string): Promise<TaskComment> {
  return apiRequest<TaskComment>(`/tasks/${taskId}/comments`, { method: 'POST', body: { body } });
}

export function transitionTask(
  taskId: string,
  action: TaskAction,
  comment?: string,
): Promise<Task> {
  return apiRequest<Task>(`/tasks/${taskId}/transition`, {
    method: 'POST',
    body: comment === undefined ? { action } : { action, comment },
  });
}

/** Fields of the create and edit forms; `dueDate` is an ISO string, or null to clear it on edit. */
export interface TaskInput {
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  requiresReview: boolean;
  assigneeIds: string[];
}

export function createTask(input: TaskInput): Promise<Task> {
  const { description, dueDate, ...rest } = input;
  return apiRequest<Task>('/tasks', {
    method: 'POST',
    body: {
      ...rest,
      ...(description ? { description } : {}),
      ...(dueDate ? { dueDate } : {}),
    },
  });
}

/** Sends only the fields that changed. */
export function updateTask(taskId: string, changes: Partial<TaskInput>): Promise<Task> {
  return apiRequest<Task>(`/tasks/${taskId}`, { method: 'PATCH', body: changes });
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiRequest<null>(`/tasks/${taskId}`, { method: 'DELETE' });
}
