import { TaskStatus } from '@task-app/shared';

/** Task counts per status for the tasks the caller may see. Every status is present, even at zero. */
export type TaskSummaryDto = Record<TaskStatus, number>;
