import { AccountCreatedInput, MailContent } from '../mail.types';
import { renderLayout, renderLinkButton, renderParagraph } from './layout';

/** Invite with the one-time link to the page where the user chooses a password. */
export function accountCreatedEmail(input: AccountCreatedInput): MailContent {
  const intro = `Hi ${input.name}, an account has been created for you.`;
  const steps =
    'Open the link below in a browser and choose a password. Then log in to the mobile app with your email address and that password.';
  const validity = `The link is valid for ${input.validHours} hours and works once. If you were not expecting this email, you can ignore it.`;

  const html = renderLayout(
    'Your account is ready',
    renderParagraph(intro) +
      renderParagraph(steps) +
      renderLinkButton('Choose a password', input.setupUrl) +
      renderParagraph(validity),
  );
  const text = [intro, '', steps, '', input.setupUrl, '', validity].join('\n');

  return { subject: 'Your Task Management App account is ready', html, text };
}
