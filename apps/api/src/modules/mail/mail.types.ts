import { Role, TaskPriority } from '@task-app/shared';

/** A finished email, produced by one of the template functions and passed to `MailService.send`. */
export interface MailContent {
  subject: string;
  html: string;
  text: string;
}

export interface AccountCreatedInput {
  name: string;
  setupUrl: string;
  validHours: number;
}

export interface PasswordResetInput {
  name: string;
  resetUrl: string;
  validMinutes: number;
}

export interface AddedToTaskInput {
  recipientName: string;
  taskTitle: string;
  /** Employees are added as assignees, a Manager is added as the task's reviewer. */
  recipientRole: Role.EMPLOYEE | Role.MANAGER;
  addedByName: string;
  priority: TaskPriority;
  dueDate?: Date | null;
}

export interface SubmittedForReviewInput {
  recipientName: string;
  taskTitle: string;
  submittedByName: string;
}

export interface ReviewResultInput {
  recipientName: string;
  taskTitle: string;
  approved: boolean;
  reviewerName: string;
  /** Required by the workflow when rejecting, optional when approving. */
  comment?: string | null;
}
