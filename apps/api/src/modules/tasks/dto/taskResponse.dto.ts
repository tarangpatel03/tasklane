import { Role, TaskPriority, TaskStatus } from '@task-app/shared';
import { Expose, Type } from 'class-transformer';

/** The only user fields a task exposes: no email, status or hashes. */
export class UserSummaryDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  role!: Role;
}

export class TaskResponseDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  description!: string | null;

  @Expose()
  priority!: TaskPriority;

  @Expose()
  status!: TaskStatus;

  @Expose()
  dueDate!: Date | null;

  @Expose()
  requiresReview!: boolean;

  @Expose()
  @Type(() => UserSummaryDto)
  manager!: UserSummaryDto | null;

  @Expose()
  @Type(() => UserSummaryDto)
  creator!: UserSummaryDto;

  @Expose()
  @Type(() => UserSummaryDto)
  assignees!: UserSummaryDto[];

  /** Who last sent the task to review. Null unless the task is In Review. */
  @Expose()
  @Type(() => UserSummaryDto)
  submittedBy!: UserSummaryDto | null;

  @Expose()
  submittedAt!: Date | null;

  @Expose()
  completedAt!: Date | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
