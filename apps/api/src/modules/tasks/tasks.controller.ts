import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES, Role } from '@task-app/shared';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/types/authUser.types';
import { PaginatedResult } from '../../common/types/paginatedResult.types';
import { CreateTaskDto } from './dto/createTask.dto';
import { QueryTasksDto } from './dto/queryTasks.dto';
import { TaskResponseDto } from './dto/taskResponse.dto';
import { TaskSummaryDto } from './dto/taskSummary.dto';
import { TransitionTaskDto } from './dto/transitionTask.dto';
import { UpdateTaskDto } from './dto/updateTask.dto';
import { Task } from './entities/task.entity';
import { TaskWorkflowService } from './taskWorkflow.service';
import { TasksService } from './tasks.service';

/** Flattens the assignee join rows to plain users before exposing only the allowed fields. */
function toResponse(task: Task): TaskResponseDto {
  return plainToInstance(
    TaskResponseDto,
    { ...task, assignees: task.assignees.map((row) => row.user) },
    { excludeExtraneousValues: true },
  );
}

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller(ROUTES.tasks.controller)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly workflowService: TaskWorkflowService,
  ) {}

  @ApiOperation({ summary: "List tasks in the caller's scope" })
  @Get()
  async list(
    @CurrentUser() actor: AuthUser,
    @Query() query: QueryTasksDto,
  ): Promise<PaginatedResult<TaskResponseDto>> {
    const result = await this.tasksService.list(actor, query);
    return new PaginatedResult(
      result.items.map(toResponse),
      result.total,
      result.page,
      result.limit,
    );
  }

  /** Declared before `:id`, otherwise "summary" would be parsed as a task id. */
  @ApiOperation({ summary: "Task count per status in the caller's scope" })
  @Get(ROUTES.tasks.summary)
  summary(@CurrentUser() actor: AuthUser): Promise<TaskSummaryDto> {
    return this.tasksService.summary(actor);
  }

  @ApiOperation({ summary: 'Get one task' })
  @Get(ROUTES.tasks.byId)
  async findOne(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskResponseDto> {
    return toResponse(await this.tasksService.getVisible(actor, id));
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a task (Admin, Manager)' })
  @Post()
  async create(
    @CurrentUser() actor: AuthUser,
    @Body() dto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    return toResponse(await this.tasksService.create(actor, dto));
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a task (Admin, Manager)' })
  @Patch(ROUTES.tasks.byId)
  async update(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return toResponse(await this.tasksService.update(actor, id, dto));
  }

  /** Open to every role: who may do which action is decided by the workflow service. */
  @ApiOperation({ summary: 'Move a task through the workflow' })
  @Post(ROUTES.tasks.transition)
  @HttpCode(HttpStatus.OK)
  async transition(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionTaskDto,
  ): Promise<TaskResponseDto> {
    return toResponse(await this.workflowService.transition(actor, id, dto));
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Soft-delete a task (Admin, Manager)' })
  @Delete(ROUTES.tasks.byId)
  async remove(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<null> {
    await this.tasksService.remove(actor, id);
    return null;
  }
}
