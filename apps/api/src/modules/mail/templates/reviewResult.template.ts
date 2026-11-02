import { MailContent, ReviewResultInput } from '../mail.types';
import { renderDetails, renderLayout, renderParagraph, toSingleLine } from './layout';

/** Sent to every assignee after the Manager (or Admin) approves or rejects the task. */
export function reviewResultEmail(input: ReviewResultInput): MailContent {
  const verdict = input.approved ? 'approved' : 'rejected';
  const intro = input.approved
    ? `Hi ${input.recipientName}, ${input.reviewerName} approved the task. It is now completed.`
    : `Hi ${input.recipientName}, ${input.reviewerName} rejected the task. It is back in progress.`;

  const rows: [string, string][] = [['Task', input.taskTitle]];
  if (input.comment) {
    rows.push(['Comment', input.comment]);
  }

  const html = renderLayout(
    input.approved ? 'Your task was approved' : 'Your task was rejected',
    renderParagraph(intro) + renderDetails(rows),
  );
  const text = [intro, '', ...rows.map(([label, value]) => `${label}: ${value}`)].join('\n');

  return { subject: toSingleLine(`Task ${verdict}: ${input.taskTitle}`), html, text };
}
