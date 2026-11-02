import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { PaginationQueryDto } from '../../common/dto/paginationQuery.dto';
import { AuthUser } from '../../common/types/authUser.types';
import { PaginatedResult } from '../../common/types/paginatedResult.types';
import { TaskHistoryResponseDto } from './dto/taskHistoryResponse.dto';
import { TaskStatusHistory } from './entities/taskStatusHistory.entity';
import { TaskHistoryService } from './taskHistory.service';
import { ROUTES } from '@task-app/shared';

function toResponse(row: TaskStatusHistory): TaskHistoryResponseDto {
  return plainToInstance(TaskHistoryResponseDto, row, { excludeExtraneousValues: true });
}

@ApiTags('Task history')
@ApiBearerAuth()
@Controller(ROUTES.taskHistory.controller)
export class TaskHistoryController {
  constructor(private readonly historyService: TaskHistoryService) {}

  @ApiOperation({ summary: "List a task's status changes, oldest first" })
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
