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

export const MAX_ASSIGNEES = 50;

export class CreateTaskDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  requiresReview?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_ASSIGNEES)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  assigneeIds!: string[];

  /** Admin only. A Manager who creates a task always becomes its Manager. */
  @IsOptional()
  @IsUUID()
  managerId?: string;
}
