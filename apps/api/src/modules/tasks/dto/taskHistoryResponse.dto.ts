import { TaskStatus } from '@task-app/shared';
import { Expose, Type } from 'class-transformer';
import { UserSummaryDto } from './taskResponse.dto';

/** One status change. `fromStatus` is null for the row that records the task's creation. */
export class TaskHistoryResponseDto {
  @Expose()
  id!: string;

  @Expose()
  fromStatus!: TaskStatus | null;

  @Expose()
  toStatus!: TaskStatus;

  @Expose()
  @Type(() => UserSummaryDto)
  actor!: UserSummaryDto;

  @Expose()
  comment!: string | null;

  @Expose()
  createdAt!: Date;
}
