import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthUser } from '../../common/types/auth-user';
import { PaginatedResult } from '../../common/types/paginated-result';
import { TaskHistoryResponseDto } from './dto/task-history-response.dto';
import { TaskStatusHistory } from './entities/task-status-history.entity';
import { TaskHistoryService } from './task-history.service';

function toResponse(row: TaskStatusHistory): TaskHistoryResponseDto {
  return plainToInstance(TaskHistoryResponseDto, row, { excludeExtraneousValues: true });
}

@Controller('tasks/:taskId/history')
export class TaskHistoryController {
  constructor(private readonly historyService: TaskHistoryService) {}

  @Get()
  async list(
    @CurrentUser() actor: AuthUser,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<TaskHistoryResponseDto>> {
    const result = await this.historyService.list(actor, taskId, query);
    return new PaginatedResult(
      result.items.map(toResponse),
      result.total,
      result.page,
      result.limit,
    );
  }
}
