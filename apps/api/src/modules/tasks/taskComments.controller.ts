import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { PaginationQueryDto } from '../../common/dto/paginationQuery.dto';
import { AuthUser } from '../../common/types/authUser.types';
import { PaginatedResult } from '../../common/types/paginatedResult.types';
import { CommentResponseDto } from './dto/commentResponse.dto';
import { CreateCommentDto } from './dto/createComment.dto';
import { TaskComment } from './entities/taskComment.entity';
import { TaskCommentsService } from './taskComments.service';
import { ROUTES } from '@task-app/shared';

function toResponse(comment: TaskComment): CommentResponseDto {
  return plainToInstance(CommentResponseDto, comment, { excludeExtraneousValues: true });
}

@ApiTags('Task comments')
@ApiBearerAuth()
@Controller(ROUTES.taskComments.controller)
export class TaskCommentsController {
  constructor(private readonly commentsService: TaskCommentsService) {}

  @ApiOperation({ summary: "List a task's comments, oldest first" })
  @Get()
  async list(
    @CurrentUser() actor: AuthUser,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<CommentResponseDto>> {
    const result = await this.commentsService.list(actor, taskId, query);
    return new PaginatedResult(
      result.items.map(toResponse),
      result.total,
      result.page,
      result.limit,
    );
  }

  @ApiOperation({ summary: 'Add a comment' })
  @Post()
  async create(
    @CurrentUser() actor: AuthUser,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return toResponse(await this.commentsService.create(actor, taskId, dto));
  }
}
