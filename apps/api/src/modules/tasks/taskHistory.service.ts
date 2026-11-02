import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/paginationQuery.dto';
import { AuthUser } from '../../common/types/authUser.types';
import { PaginatedResult } from '../../common/types/paginatedResult.types';
import { TaskStatusHistory } from './entities/taskStatusHistory.entity';
import { TasksService } from './tasks.service';

@Injectable()
export class TaskHistoryService {
  constructor(
    @InjectRepository(TaskStatusHistory) private readonly history: Repository<TaskStatusHistory>,
    private readonly tasks: TasksService,
  ) {}

  /** Anyone who can see the task can read its history; others get the same 404 as for the task. */
  async list(
    actor: AuthUser,
    taskId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<TaskStatusHistory>> {
    await this.tasks.assertVisible(actor, taskId);
    const [items, total] = await this.history.findAndCount({
      where: { taskId },
      relations: { actor: true },
      order: { createdAt: 'ASC', id: 'ASC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return new PaginatedResult(items, total, query.page, query.limit);
  }
}
