import type { ApiMeta, Role, TaskAction, TaskPriority, TaskStatus } from '@task-app/shared';
import { apiEnvelope, apiRequest } from './client';

/** The only user fields a task exposes. */
export interface UserSummary {
  id: string;
  name: string;
  role: Role;
}

export interface TaskDto {
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
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDto {
  id: string;
  body: string;
  author: UserSummary;
  createdAt: string;
}

export interface HistoryDto {
  id: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  actor: UserSummary;
  comment: string | null;
  createdAt: string;
}

export interface ListTasksParams {
  page: number;
  limit: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  managerId?: string;
  dueFrom?: string;
  dueTo?: string;
  search?: string;
}

export interface Page<T> {
  items: T[];
  meta: ApiMeta;
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  requiresReview: boolean;
  assigneeIds: string[];
  managerId?: string;
}

/** `null` clears description, due date and Manager. */
export interface UpdateTaskBody {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  requiresReview?: boolean;
  assigneeIds?: string[];
  managerId?: string | null;
}

async function listPage<T>(path: string, page: number, limit: number): Promise<Page<T>> {
  const { data, meta } = await apiEnvelope<T[]>(path);
  return { items: data, meta: meta ?? { page, limit, total: data.length, totalPages: 1 } };
}

export function listTasks(params: ListTasksParams): Promise<Page<TaskDto>> {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  const optional: [string, string | undefined][] = [
    ['status', params.status],
    ['priority', params.priority],
    ['assigneeId', params.assigneeId],
    ['managerId', params.managerId],
    ['dueFrom', params.dueFrom],
    ['dueTo', params.dueTo],
    ['search', params.search],
  ];
  for (const [key, value] of optional) {
    if (value) query.set(key, value);
  }
  return listPage<TaskDto>(`/tasks?${query.toString()}`, params.page, params.limit);
}

export function getTask(id: string): Promise<TaskDto> {
  return apiRequest<TaskDto>(`/tasks/${id}`);
}

export function createTask(body: CreateTaskBody): Promise<TaskDto> {
  return apiRequest<TaskDto>('/tasks', { method: 'POST', body });
}

export function updateTask(id: string, body: UpdateTaskBody): Promise<TaskDto> {
  return apiRequest<TaskDto>(`/tasks/${id}`, { method: 'PATCH', body });
}

export function deleteTask(id: string): Promise<null> {
  return apiRequest<null>(`/tasks/${id}`, { method: 'DELETE' });
}

export function transitionTask(id: string, action: TaskAction, comment?: string): Promise<TaskDto> {
  return apiRequest<TaskDto>(`/tasks/${id}/transition`, {
    method: 'POST',
    body: { action, comment },
  });
}

export function listComments(taskId: string): Promise<Page<CommentDto>> {
  return listPage<CommentDto>(`/tasks/${taskId}/comments?page=1&limit=100`, 1, 100);
}

export function createComment(taskId: string, body: string): Promise<CommentDto> {
  return apiRequest<CommentDto>(`/tasks/${taskId}/comments`, { method: 'POST', body: { body } });
}

export function listHistory(taskId: string): Promise<Page<HistoryDto>> {
  return listPage<HistoryDto>(`/tasks/${taskId}/history?page=1&limit=100`, 1, 100);
}
