import { MailContent, SubmittedForReviewInput } from '../mail.types';
import { renderDetails, renderLayout, renderParagraph, toSingleLine } from './layout';

/** Sent to the task's Manager, and to its creator when that is someone else. */
export function submittedForReviewEmail(input: SubmittedForReviewInput): MailContent {
  const intro = `Hi ${input.recipientName}, ${input.submittedByName} submitted a task for review.`;
  const rows: [string, string][] = [['Task', input.taskTitle]];

  const html = renderLayout(
    'A task is ready for review',
    renderParagraph(intro) + renderDetails(rows),
  );
  const text = [intro, '', `Task: ${input.taskTitle}`].join('\n');

  return { subject: toSingleLine(`Ready for review: ${input.taskTitle}`), html, text };
}
