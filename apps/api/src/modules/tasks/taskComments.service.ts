import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/paginationQuery.dto';
import { AuthUser } from '../../common/types/authUser.types';
import { PaginatedResult } from '../../common/types/paginatedResult.types';
import { CreateCommentDto } from './dto/createComment.dto';
import { TaskComment } from './entities/taskComment.entity';
import { TasksService } from './tasks.service';

@Injectable()
export class TaskCommentsService {
  constructor(
    @InjectRepository(TaskComment) private readonly comments: Repository<TaskComment>,
    private readonly tasks: TasksService,
  ) {}

  /** Anyone who can see the task can read its comments; others get the same 404 as for the task. */
  async list(
    actor: AuthUser,
    taskId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<TaskComment>> {
    await this.tasks.assertVisible(actor, taskId);
    const [items, total] = await this.comments.findAndCount({
      where: { taskId },
      relations: { author: true },
      order: { createdAt: 'ASC', id: 'ASC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return new PaginatedResult(items, total, query.page, query.limit);
  }

  async create(actor: AuthUser, taskId: string, dto: CreateCommentDto): Promise<TaskComment> {
    await this.tasks.assertVisible(actor, taskId);
    const saved = await this.comments.save(
      this.comments.create({ taskId, authorId: actor.id, body: dto.body }),
    );
    return this.comments.findOneOrFail({ where: { id: saved.id }, relations: { author: true } });
  }
}
