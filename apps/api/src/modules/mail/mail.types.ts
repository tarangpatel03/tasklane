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
