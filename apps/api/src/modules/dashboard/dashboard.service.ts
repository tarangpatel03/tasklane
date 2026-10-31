import { Injectable } from '@nestjs/common';
import { Role, TaskStatus, UserStatus } from '@task-app/shared';
import { DataSource, In, LessThan, Not, SelectQueryBuilder } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import {
  DashboardSummaryResponseDto,
  ManagerSummaryDto,
  OverdueTaskDto,
  StatusCounts,
} from './dto/dashboard-summary-response.dto';

const OVERDUE_LIST_SIZE = 10;

interface RawCounts {
  managerId?: string | null;
  total: string;
  todo: string;
  working: string;
  inReview: string;
  completed: string;
  overdue: string;
}

function toStatusCounts(raw: RawCounts): StatusCounts {
  return {
    [TaskStatus.TODO]: Number(raw.todo),
    [TaskStatus.WORKING]: Number(raw.working),
    [TaskStatus.IN_REVIEW]: Number(raw.inReview),
    [TaskStatus.COMPLETED]: Number(raw.completed),
  };
}

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Reads `Task` and `User` straight from the data source, like `UsersService.findOpenTasks`, because
   * importing the Tasks or Users modules here would only add dependencies for read-only counts.
   * Soft-deleted tasks are skipped by TypeORM.
   */
  async getSummary(): Promise<DashboardSummaryResponseDto> {
    const now = new Date();
    const [totalsRaw, groupsRaw, overdueTasks, overdueCount] = await Promise.all([
      this.countQuery().getRawOne<RawCounts>(),
      this.countQuery()
        .addSelect('task.managerId', 'managerId')
        .groupBy('task.managerId')
        .getRawMany<RawCounts>(),
      this.findOverdue(now),
      this.dataSource
        .getRepository(Task)
        .countBy({ status: Not(TaskStatus.COMPLETED), dueDate: LessThan(now) }),
    ]);

    return {
      totals: {
        total: Number(totalsRaw?.total ?? 0),
        byStatus: totalsRaw ? toStatusCounts(totalsRaw) : toStatusCounts(zeroCounts()),
      },
      overdue: { count: overdueCount, tasks: overdueTasks },
      perManager: await this.buildPerManager(groupsRaw),
    };
  }

  private countQuery(): SelectQueryBuilder<Task> {
    return this.dataSource
      .getRepository(Task)
      .createQueryBuilder('task')
      .select('COUNT(*)', 'total')
      .addSelect('COUNT(*) FILTER (WHERE task.status = :todo)', 'todo')
      .addSelect('COUNT(*) FILTER (WHERE task.status = :working)', 'working')
      .addSelect('COUNT(*) FILTER (WHERE task.status = :inReview)', 'inReview')
      .addSelect('COUNT(*) FILTER (WHERE task.status = :completed)', 'completed')
      .addSelect(
        'COUNT(*) FILTER (WHERE task.status != :completed AND task.dueDate < NOW())',
        'overdue',
      )
      .setParameters({
        todo: TaskStatus.TODO,
        working: TaskStatus.WORKING,
        inReview: TaskStatus.IN_REVIEW,
        completed: TaskStatus.COMPLETED,
      });
  }

  private async findOverdue(now: Date): Promise<OverdueTaskDto[]> {
    const tasks = await this.dataSource.getRepository(Task).find({
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        priority: true,
        manager: { id: true, name: true },
      },
      where: { status: Not(TaskStatus.COMPLETED), dueDate: LessThan(now) },
      relations: { manager: true },
      order: { dueDate: 'ASC', id: 'ASC' },
      take: OVERDUE_LIST_SIZE,
    });
    return tasks.flatMap((task) =>
      task.dueDate
        ? [
            {
              id: task.id,
              title: task.title,
              dueDate: task.dueDate,
              status: task.status,
              priority: task.priority,
              manager: task.manager ? { id: task.manager.id, name: task.manager.name } : null,
            },
          ]
        : [],
    );
  }

  /** Every active Manager gets a row (even with no tasks), plus any other Manager who still has tasks. */
  private async buildPerManager(groups: RawCounts[]): Promise<ManagerSummaryDto[]> {
    const groupedIds = groups.flatMap((group) => (group.managerId ? [group.managerId] : []));
    const managers = await this.dataSource.getRepository(User).find({
      select: { id: true, name: true, role: true },
      where: [
        { role: Role.MANAGER, status: Not(UserStatus.DEACTIVATED) },
        ...(groupedIds.length > 0 ? [{ id: In(groupedIds) }] : []),
      ],
      order: { name: 'ASC', id: 'ASC' },
    });
    const byManager = new Map(groups.map((group) => [group.managerId ?? null, group]));

    const rows: ManagerSummaryDto[] = managers.map((manager) => {
      const raw = byManager.get(manager.id) ?? zeroCounts();
      return {
        manager: { id: manager.id, name: manager.name, role: manager.role },
        total: Number(raw.total),
        byStatus: toStatusCounts(raw),
        overdue: Number(raw.overdue),
      };
    });
    const unassigned = byManager.get(null);
    if (unassigned) {
      rows.push({
        manager: null,
        total: Number(unassigned.total),
        byStatus: toStatusCounts(unassigned),
        overdue: Number(unassigned.overdue),
      });
    }
    return rows;
  }
}

function zeroCounts(): RawCounts {
  return { total: '0', todo: '0', working: '0', inReview: '0', completed: '0', overdue: '0' };
}
