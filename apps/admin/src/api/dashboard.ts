import { ENDPOINTS } from '@task-app/shared';
import type { Role, TaskPriority, TaskStatus } from '@task-app/shared';
import { apiRequest } from './client';

/** Every status is always present, zero when there are no tasks in it. */
export type StatusCounts = Record<TaskStatus, number>;

export interface PersonRef {
  id: string;
  name: string;
}

export interface OverdueTask {
  id: string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  manager: PersonRef | null;
}

export interface ManagerSummary {
  /** `null` is the row for tasks that have no Manager. */
  manager: (PersonRef & { role: Role }) | null;
  total: number;
  byStatus: StatusCounts;
  overdue: number;
}

export interface Activity {
  id: string;
  taskId: string;
  taskTitle: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  actor: PersonRef;
  comment: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  totals: { total: number; byStatus: StatusCounts };
  overdue: { count: number; tasks: OverdueTask[] };
  perManager: ManagerSummary[];
  recentActivity: Activity[];
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>(ENDPOINTS.dashboard.summary);
}
