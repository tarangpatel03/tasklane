import { TaskPriority } from '@task-app/shared';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { trim } from '../../users/dto/transforms';
import { MAX_ASSIGNEES } from './createTask.dto';

/** `null` clears `description`, `dueDate` and `managerId`; `IsOptional` lets both `null` and a missing field through. */
export class UpdateTaskDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsBoolean()
  requiresReview?: boolean;

  /** Replaces the whole assignee set. */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_ASSIGNEES)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  assigneeIds?: string[];

  /** Admin only. */
  @IsOptional()
  @IsUUID()
  managerId?: string | null;
}
