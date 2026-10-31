import { Role } from '@task-app/shared';
import { AddedToTaskInput, MailContent } from '../mail.types';
import { formatDate, renderDetails, renderLayout, renderParagraph, toSingleLine } from './layout';

/** Sent to a newly added Employee, or to the Manager when someone else sets or changes the task's Manager. */
export function addedToTaskEmail(input: AddedToTaskInput): MailContent {
  const isManager = input.recipientRole === Role.MANAGER;
  const intro = isManager
    ? `Hi ${input.recipientName}, ${input.addedByName} made you the Manager of a task. You will review it when it is submitted.`
    : `Hi ${input.recipientName}, ${input.addedByName} added you to a task.`;

  const rows: [string, string][] = [
    ['Task', input.taskTitle],
    ['Your role', isManager ? 'Manager' : 'Assignee'],
    ['Priority', input.priority],
  ];
  if (input.dueDate) {
    rows.push(['Due', formatDate(input.dueDate)]);
  }

  const html = renderLayout(
    isManager ? 'You are the Manager of a task' : 'You were added to a task',
    renderParagraph(intro) + renderDetails(rows),
  );
  const text = [intro, '', ...rows.map(([label, value]) => `${label}: ${value}`)].join('\n');

  return {
    subject: toSingleLine(
      `${isManager ? 'You are the Manager of' : 'You were added to'}: ${input.taskTitle}`,
    ),
    html,
    text,
  };
}
