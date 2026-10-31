import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiErrorDetail, Role, TaskStatus, UserStatus } from '@task-app/shared';
import { DataSource, In, Repository, SelectQueryBuilder } from 'typeorm';
import { AuthUser } from '../../common/types/auth-user';
import { PaginatedResult } from '../../common/types/paginated-result';
import { escapeLike } from '../../common/utils/escape-like';
import { UsersService } from '../users/users.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskAssignee } from './entities/task-assignee.entity';
import { TaskStatusHistory } from './entities/task-status-history.entity';
import { Task } from './entities/task.entity';

const TASK_NOT_FOUND = 'Task not found';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    private readonly users: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  /** Admin may leave the Manager out. A Manager always becomes the Manager of the task they create. */
  async create(actor: AuthUser, dto: CreateTaskDto): Promise<Task> {
    let managerId: string | null;
    if (actor.role === Role.MANAGER) {
      if (dto.managerId !== undefined && dto.managerId !== actor.id) {
        throw new ForbiddenException('Only an Admin can choose another Manager');
      }
      managerId = actor.id;
    } else {
      managerId = dto.managerId ?? null;
      await this.assertValidManager(managerId);
    }
    await this.assertValidAssignees(dto.assigneeIds);

    const taskId = await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Task);
      const task = await repository.save(
        repository.create({
          title: dto.title,
          description: dto.description,
          priority: dto.priority,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          requiresReview: dto.requiresReview,
          managerId: managerId ?? undefined,
          createdBy: actor.id,
        }),
      );
      await manager
        .getRepository(TaskAssignee)
        .insert(dto.assigneeIds.map((userId) => ({ taskId: task.id, userId })));
      await manager.getRepository(TaskStatusHistory).insert({
        taskId: task.id,
        fromStatus: null,
        toStatus: TaskStatus.TODO,
        actorId: actor.id,
        comment: null,
      });
      return task.id;
    });
    return this.loadOrFail(taskId);
  }

  async list(actor: AuthUser, query: QueryTasksDto): Promise<PaginatedResult<Task>> {
    const qb = this.scopedQuery(actor);
    if (query.status) {
      qb.andWhere('task.status = :statusFilter', { statusFilter: query.status });
    }
    if (query.priority) {
      qb.andWhere('task.priority = :priorityFilter', { priorityFilter: query.priority });
    }
    if (query.managerId) {
      qb.andWhere('task.managerId = :managerFilter', { managerFilter: query.managerId });
    }
    if (query.assigneeId) {
      qb.andWhere(
        'EXISTS (SELECT 1 FROM task_assignees filter_ta WHERE filter_ta.task_id = task.id AND filter_ta.user_id = :assigneeFilter)',
        { assigneeFilter: query.assigneeId },
      );
    }
    if (query.dueFrom) {
      qb.andWhere('task.dueDate >= :dueFrom', { dueFrom: new Date(query.dueFrom) });
    }
    if (query.dueTo) {
      qb.andWhere('task.dueDate <= :dueTo', { dueTo: new Date(query.dueTo) });
    }
    if (query.search) {
      qb.andWhere('task.title ILIKE :search', { search: `%${escapeLike(query.search)}%` });
    }

    // Page of ids first, then the relations: joining assignees in this query would break skip/take.
    const [page, total] = await qb
      .select(['task.id', 'task.createdAt'])
      .orderBy('task.createdAt', 'DESC')
      .addOrderBy('task.id', 'ASC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
    const ids = page.map((task) => task.id);
    if (ids.length === 0) {
      return new PaginatedResult([], total, query.page, query.limit);
    }
    const loaded = await this.tasks.find({
      where: { id: In(ids) },
      relations: { manager: true, creator: true, assignees: { user: true } },
    });
    const byId = new Map(loaded.map((task) => [task.id, task]));
    const items = ids.flatMap((id) => byId.get(id) ?? []);
    return new PaginatedResult(items, total, query.page, query.limit);
  }

  /** Tasks the caller may not see are reported as missing, so ids cannot be probed. */
  async getVisible(actor: AuthUser, id: string): Promise<Task> {
    await this.assertVisible(actor, id);
    return this.loadOrFail(id);
  }

  /** Admin edits any task, a Manager only tasks they manage, and only an Admin changes the Manager. */
  async update(actor: AuthUser, id: string, dto: UpdateTaskDto): Promise<Task> {
    if (actor.role !== Role.ADMIN && dto.managerId !== undefined) {
      throw new ForbiddenException('Only an Admin can change the Manager of a task');
    }

    await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Task);
      const task = await repository.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!task || (actor.role === Role.MANAGER && task.managerId !== actor.id)) {
        throw new NotFoundException(TASK_NOT_FOUND);
      }

      if (dto.title !== undefined) {
        task.title = dto.title;
      }
      if (dto.description !== undefined) {
        task.description = dto.description;
      }
      if (dto.priority !== undefined) {
        task.priority = dto.priority;
      }
      if (dto.dueDate !== undefined) {
        task.dueDate = dto.dueDate === null ? null : new Date(dto.dueDate);
      }
      if (dto.requiresReview !== undefined) {
        task.requiresReview = dto.requiresReview;
      }
      if (dto.managerId !== undefined && dto.managerId !== task.managerId) {
        await this.assertValidManager(dto.managerId);
        task.managerId = dto.managerId;
      }
      await repository.save(task);

      if (dto.assigneeIds) {
        await this.replaceAssignees(manager.getRepository(TaskAssignee), id, dto.assigneeIds);
      }
    });
    return this.loadOrFail(id);
  }

  /** Soft delete: the row stays for history, but the task disappears from every query. */
  async remove(actor: AuthUser, id: string): Promise<void> {
    await this.assertVisible(actor, id);
    await this.tasks.softDelete({ id });
  }

  /** Limits a query to the tasks the caller may see: Admin all, Manager their own, Employee assigned ones. */
  private scopedQuery(actor: AuthUser): SelectQueryBuilder<Task> {
    const qb = this.tasks.createQueryBuilder('task');
    if (actor.role === Role.MANAGER) {
      qb.andWhere('task.managerId = :actorId', { actorId: actor.id });
    } else if (actor.role === Role.EMPLOYEE) {
      qb.andWhere(
        'EXISTS (SELECT 1 FROM task_assignees scope_ta WHERE scope_ta.task_id = task.id AND scope_ta.user_id = :actorId)',
        { actorId: actor.id },
      );
    }
    return qb;
  }

  async assertVisible(actor: AuthUser, id: string): Promise<void> {
    const visible = await this.scopedQuery(actor).andWhere('task.id = :id', { id }).getExists();
    if (!visible) {
      throw new NotFoundException(TASK_NOT_FOUND);
    }
  }

  async loadOrFail(id: string): Promise<Task> {
    const task = await this.tasks.findOne({
      where: { id },
      relations: { manager: true, creator: true, assignees: { user: true } },
    });
    if (!task) {
      throw new NotFoundException(TASK_NOT_FOUND);
    }
    return task;
  }

  /** Only the difference is written, so assignees who stay keep their original `added_at`. */
  private async replaceAssignees(
    repository: Repository<TaskAssignee>,
    taskId: string,
    wanted: string[],
  ): Promise<void> {
    const current = (await repository.findBy({ taskId })).map((row) => row.userId);
    const added = wanted.filter((userId) => !current.includes(userId));
    const removed = current.filter((userId) => !wanted.includes(userId));
    await this.assertValidAssignees(added);
    if (removed.length > 0) {
      await repository.delete({ taskId, userId: In(removed) });
    }
    if (added.length > 0) {
      await repository.insert(added.map((userId) => ({ taskId, userId })));
    }
  }

  private async assertValidManager(managerId: string | null): Promise<void> {
    if (managerId === null) {
      return;
    }
    const [manager] = await this.users.findByIds([managerId]);
    if (!manager || manager.role !== Role.MANAGER || manager.status === UserStatus.DEACTIVATED) {
      throw this.invalidPeople({
        field: 'managerId',
        messages: ['Must be an existing Manager who is not deactivated'],
      });
    }
  }

  private async assertValidAssignees(assigneeIds: string[]): Promise<void> {
    if (assigneeIds.length === 0) {
      return;
    }
    const found = new Map((await this.users.findByIds(assigneeIds)).map((user) => [user.id, user]));
    const invalid = assigneeIds.filter((userId) => {
      const user = found.get(userId);
      return !user || user.role !== Role.EMPLOYEE || user.status === UserStatus.DEACTIVATED;
    });
    if (invalid.length > 0) {
      throw this.invalidPeople({
        field: 'assigneeIds',
        messages: [`Must be existing Employees who are not deactivated: ${invalid.join(', ')}`],
      });
    }
  }

  private invalidPeople(detail: ApiErrorDetail): BadRequestException {
    return new BadRequestException({ message: 'Invalid people on this task', details: [detail] });
  }
}
