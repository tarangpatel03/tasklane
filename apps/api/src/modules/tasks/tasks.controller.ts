import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@task-app/shared';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/types/auth-user';
import { PaginatedResult } from '../../common/types/paginated-result';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';

/** Flattens the assignee join rows to plain users before exposing only the allowed fields. */
function toResponse(task: Task): TaskResponseDto {
  return plainToInstance(
    TaskResponseDto,
    { ...task, assignees: task.assignees.map((row) => row.user) },
    { excludeExtraneousValues: true },
  );
}

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

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

  @Get(':id')
  async findOne(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskResponseDto> {
    return toResponse(await this.tasksService.getVisible(actor, id));
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  async create(
    @CurrentUser() actor: AuthUser,
    @Body() dto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    return toResponse(await this.tasksService.create(actor, dto));
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  async update(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return toResponse(await this.tasksService.update(actor, id, dto));
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  async remove(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<null> {
    await this.tasksService.remove(actor, id);
    return null;
  }
}
