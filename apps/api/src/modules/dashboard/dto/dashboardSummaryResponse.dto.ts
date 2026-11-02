import { Role, TaskPriority, TaskStatus } from '@task-app/shared';

/** Every status is always present, zero when there are no tasks in it. */
export type StatusCounts = Record<TaskStatus, number>;

export interface ManagerRefDto {
  id: string;
  name: string;
}

export interface OverdueTaskDto {
  id: string;
  title: string;
  dueDate: Date;
  status: TaskStatus;
  priority: TaskPriority;
  manager: ManagerRefDto | null;
}

export interface ManagerSummaryDto {
  /** `null` is the row for tasks that have no Manager. */
  manager: (ManagerRefDto & { role: Role }) | null;
  total: number;
  byStatus: StatusCounts;
  overdue: number;
}

/** One recent status change, for the dashboard feed. `fromStatus` is null for a task's creation. */
export interface ActivityDto {
  id: string;
  taskId: string;
  taskTitle: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  actor: ManagerRefDto;
  comment: string | null;
  createdAt: Date;
}

export interface DashboardSummaryResponseDto {
  totals: { total: number; byStatus: StatusCounts };
  overdue: { count: number; tasks: OverdueTaskDto[] };
  perManager: ManagerSummaryDto[];
  recentActivity: ActivityDto[];
}
