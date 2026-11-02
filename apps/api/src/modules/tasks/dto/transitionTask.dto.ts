import { TaskAction } from '@task-app/shared';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { trim } from '../../users/dto/transforms';

export class TransitionTaskDto {
  @IsEnum(TaskAction)
  action!: TaskAction;

  /** Required for REJECT, optional for the other actions. Stored in the status history. */
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
