import { TaskPriority, TaskStatus } from '@task-app/shared';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/paginationQuery.dto';
import { trim } from '../../users/dto/transforms';

export class QueryTasksDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsUUID()
  managerId?: string;

  /** Tasks due on or after this moment. */
  @IsOptional()
  @IsDateString()
  dueFrom?: string;

  /** Tasks due on or before this moment. */
  @IsOptional()
  @IsDateString()
  dueTo?: string;

  /** Matches part of the title. */
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  search?: string;
}
